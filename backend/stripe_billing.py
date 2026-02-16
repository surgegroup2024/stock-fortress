"""
Stock Fortress — Stripe Billing Module
Ported from be-creator Node.js implementation to Python/FastAPI.
Handles: checkout sessions, plan changes, webhooks, sync, and portal.
"""

import os
import json
import stripe
from datetime import datetime
from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel
from typing import Optional
from supabase import create_client

# ── Init ──
STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
CLIENT_URL = os.environ.get("CLIENT_URL", "http://localhost:5173")

stripe.api_key = STRIPE_SECRET_KEY
stripe_enabled = bool(STRIPE_SECRET_KEY)

supabase = None
if SUPABASE_URL and SUPABASE_SERVICE_KEY:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    print("✅ Supabase (service role) initialized for billing")

if stripe_enabled:
    print("✅ Stripe initialized")
else:
    print("⚠️  Stripe not configured (set STRIPE_SECRET_KEY)")

# ── Plan Config ──
PLAN_PRICES = {
    "pro": {
        "monthly": os.environ.get("STRIPE_PRO_MONTHLY", "price_pro_monthly"),
        "yearly": os.environ.get("STRIPE_PRO_YEARLY", "price_pro_yearly"),
    },
    "premium": {
        "monthly": os.environ.get("STRIPE_PREMIUM_MONTHLY", "price_premium_monthly"),
        "yearly": os.environ.get("STRIPE_PREMIUM_YEARLY", "price_premium_yearly"),
    },
}

PLAN_REPORTS = {
    "free": 3,
    "pro": 30,
    "premium": 999999,  # unlimited
}

# ── Router ──
router = APIRouter(prefix="/api/billing", tags=["billing"])


# ── Request Models ──
class CheckoutRequest(BaseModel):
    userId: str
    plan: str
    billingCycle: str = "monthly"
    email: Optional[str] = None
    successUrl: Optional[str] = None
    cancelUrl: Optional[str] = None


class SyncRequest(BaseModel):
    sessionId: str


class ChangePlanRequest(BaseModel):
    userId: str
    plan: str
    billingCycle: str = "monthly"


class FreeSubscriptionRequest(BaseModel):
    userId: str


# ── Helpers ──
def require_stripe():
    if not stripe_enabled:
        raise HTTPException(status_code=503, detail="Stripe is not configured")


def require_supabase():
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not configured")


async def upsert_subscription_from_session(session):
    """Create/update subscription in Supabase from a Stripe checkout session."""
    require_supabase()

    user_id = session.get("metadata", {}).get("user_id")
    plan = session.get("metadata", {}).get("plan")
    billing_cycle = session.get("metadata", {}).get("billing_cycle")

    if not user_id or not plan or not billing_cycle:
        raise ValueError("Missing required session metadata")

    sub_id = session.get("subscription")
    if isinstance(sub_id, dict):
        sub_id = sub_id.get("id")

    if not sub_id:
        raise ValueError("Missing subscription id on session")

    # Retrieve full subscription details from Stripe
    subscription = stripe.Subscription.retrieve(sub_id)

    supabase.table("subscriptions").upsert({
        "user_id": user_id,
        "stripe_customer_id": session.get("customer"),
        "stripe_subscription_id": subscription.id,
        "plan_name": plan,
        "billing_cycle": billing_cycle,
        "status": "active",
        "reports_limit": PLAN_REPORTS.get(plan, 3),
        "current_period_start": datetime.fromtimestamp(subscription.get("current_period_start") or int(datetime.now().timestamp())).isoformat(),
        "current_period_end": datetime.fromtimestamp(subscription.get("current_period_end") or int(datetime.now().timestamp())).isoformat(),
        "cancel_at_period_end": subscription.get("cancel_at_period_end", False),
    }, on_conflict="user_id").execute()


# ── Endpoints ──

@router.post("/create-checkout")
async def create_checkout(req: CheckoutRequest):
    """Create a Stripe Checkout session for Pro or Premium plan."""
    require_stripe()
    require_supabase()

    plan_key = req.plan.lower()
    price_id = PLAN_PRICES.get(plan_key, {}).get(req.billingCycle)

    if not price_id:
        raise HTTPException(status_code=400, detail="Invalid plan or billing cycle")

    # Get or create Stripe customer
    existing = supabase.table("subscriptions").select("stripe_customer_id").eq("user_id", req.userId).execute()
    customer_id = None
    if existing.data and existing.data[0].get("stripe_customer_id"):
        customer_id = existing.data[0]["stripe_customer_id"]
        try:
            customer = stripe.Customer.retrieve(customer_id)
            if hasattr(customer, "deleted") and customer.deleted:
                raise stripe.error.InvalidRequestError("Customer deleted", "id")
        except stripe.error.InvalidRequestError:
            # Customer ID exists in DB but not in Stripe (or deleted) -> Create new one
            print(f"⚠️ Configure customer {customer_id} missing in Stripe. Creating new one.")
            customer = stripe.Customer.create(
                email=req.email,
                metadata={"supabase_user_id": req.userId}
            )
            customer_id = customer.id
            # Update DB with new customer ID
            supabase.table("subscriptions").update({"stripe_customer_id": customer_id}).eq("user_id", req.userId).execute()
    else:
        customer = stripe.Customer.create(
            email=req.email,
            metadata={"supabase_user_id": req.userId}
        )
        customer_id = customer.id

    # Build URLs
    success_url = req.successUrl or f"{CLIENT_URL}/dashboard?stripe_success=1&session_id={{CHECKOUT_SESSION_ID}}"
    cancel_url = req.cancelUrl or f"{CLIENT_URL}/dashboard?stripe_cancel=1"

    session = stripe.checkout.Session.create(
        customer=customer_id,
        mode="subscription",
        payment_method_types=["card"],
        line_items=[{"price": price_id, "quantity": 1}],
        success_url=success_url,
        cancel_url=cancel_url,
        metadata={
            "user_id": req.userId,
            "plan": plan_key,
            "billing_cycle": req.billingCycle,
        }
    )

    return {"url": session.url}


@router.post("/sync-checkout")
async def sync_checkout(req: SyncRequest):
    """Sync a completed checkout session to Supabase."""
    require_stripe()

    session = stripe.checkout.Session.retrieve(
        req.sessionId,
        expand=["subscription"]
    )

    if not session:
        raise HTTPException(status_code=404, detail="Checkout session not found")

    await upsert_subscription_from_session(session)
    return {"success": True}


@router.post("/change-plan")
async def change_plan(req: ChangePlanRequest):
    """Upgrade/downgrade an existing Stripe subscription."""
    require_stripe()
    require_supabase()

    plan_key = req.plan.lower()
    cycle_key = req.billingCycle.lower()
    price_id = PLAN_PRICES.get(plan_key, {}).get(cycle_key)

    if not price_id:
        raise HTTPException(status_code=400, detail="Invalid plan or billing cycle")

    existing = supabase.table("subscriptions").select("*").eq("user_id", req.userId).execute()

    if not existing.data:
        raise HTTPException(status_code=404, detail="Subscription not found")

    sub = existing.data[0]
    if not sub.get("stripe_subscription_id"):
        raise HTTPException(status_code=400, detail="No Stripe subscription to change")

    # Get current subscription from Stripe
    stripe_sub = stripe.Subscription.retrieve(
        sub["stripe_subscription_id"],
        expand=["items.data.price"]
    )

    sub_item = stripe_sub["items"]["data"][0]

    # Update subscription in Stripe
    updated = stripe.Subscription.modify(
        stripe_sub.id,
        cancel_at_period_end=False,
        proration_behavior="create_prorations",
        items=[{"id": sub_item.id, "price": price_id}],
        metadata={
            "user_id": req.userId,
            "plan": plan_key,
            "billing_cycle": cycle_key,
        }
    )

    # Update Supabase
    supabase.table("subscriptions").update({
        "plan_name": plan_key,
        "billing_cycle": cycle_key,
        "status": updated.status or "active",
        "reports_limit": PLAN_REPORTS.get(plan_key, 3),
        "current_period_start": datetime.fromtimestamp(updated.current_period_start).isoformat(),
        "current_period_end": datetime.fromtimestamp(updated.current_period_end).isoformat(),
        "cancel_at_period_end": updated.cancel_at_period_end,
    }).eq("user_id", req.userId).execute()

    return {"success": True}


@router.post("/create-free")
async def create_free(req: FreeSubscriptionRequest):
    """Downgrade to free plan — cancel Stripe subscription if exists."""
    require_supabase()

    existing = supabase.table("subscriptions").select("*").eq("user_id", req.userId).execute()

    if existing.data:
        sub = existing.data[0]
        # Cancel Stripe subscription if it exists
        if sub.get("stripe_subscription_id") and stripe_enabled:
            try:
                stripe.Subscription.cancel(sub["stripe_subscription_id"])
            except Exception as e:
                print(f"⚠️ Error canceling Stripe sub: {e}")

    # Upsert free subscription
    supabase.table("subscriptions").upsert({
        "user_id": req.userId,
        "plan_name": "free",
        "billing_cycle": "monthly",
        "status": "active",
        "reports_limit": 3,
        "stripe_subscription_id": None,
        "cancel_at_period_end": False,
    }, on_conflict="user_id").execute()

    return {"success": True}


@router.post("/webhook")
async def stripe_webhook(request: Request):
    """Handle Stripe webhook events."""
    require_stripe()
    require_supabase()

    payload = await request.body()

    if STRIPE_WEBHOOK_SECRET:
        sig = request.headers.get("stripe-signature")
        try:
            event = stripe.Webhook.construct_event(payload, sig, STRIPE_WEBHOOK_SECRET)
        except stripe.error.SignatureVerificationError:
            raise HTTPException(status_code=400, detail="Invalid signature")
    else:
        event = json.loads(payload)

    event_type = event.get("type", "")
    data_object = event.get("data", {}).get("object", {})

    print(f"📨 Stripe webhook: {event_type}")

    try:
        if event_type == "checkout.session.completed":
            await upsert_subscription_from_session(data_object)

        elif event_type == "customer.subscription.updated":
            await _handle_subscription_update(data_object)

        elif event_type == "customer.subscription.deleted":
            await _handle_subscription_deleted(data_object)

        elif event_type == "invoice.payment_succeeded":
            await _handle_payment_succeeded(data_object)

        elif event_type == "invoice.payment_failed":
            await _handle_payment_failed(data_object)

        else:
            print(f"  Unhandled event: {event_type}")

    except Exception as e:
        print(f"❌ Webhook handler error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    return {"received": True}


# ── Webhook Handlers ──

async def _handle_subscription_update(subscription):
    sub_id = subscription.get("id")
    existing = supabase.table("subscriptions").select("user_id").eq("stripe_subscription_id", sub_id).execute()
    if not existing.data:
        return

    supabase.table("subscriptions").update({
        "status": subscription.get("status"),
        "current_period_start": datetime.fromtimestamp(subscription["current_period_start"]).isoformat(),
        "current_period_end": datetime.fromtimestamp(subscription["current_period_end"]).isoformat(),
        "cancel_at_period_end": subscription.get("cancel_at_period_end", False),
    }).eq("stripe_subscription_id", sub_id).execute()


async def _handle_subscription_deleted(subscription):
    sub_id = subscription.get("id")
    supabase.table("subscriptions").delete().eq("stripe_subscription_id", sub_id).execute()
    print(f"✓ Subscription {sub_id} deleted from Supabase")


async def _handle_payment_succeeded(invoice):
    sub_id = invoice.get("subscription")
    if not sub_id:
        return

    subscription = stripe.Subscription.retrieve(sub_id)
    existing = supabase.table("subscriptions").select("plan_name").eq("stripe_subscription_id", sub_id).execute()
    if not existing.data:
        return

    plan = existing.data[0].get("plan_name", "free")
    supabase.table("subscriptions").update({
        "status": "active",
        "reports_limit": PLAN_REPORTS.get(plan, 3),
        "current_period_start": datetime.fromtimestamp(subscription.current_period_start).isoformat(),
        "current_period_end": datetime.fromtimestamp(subscription.current_period_end).isoformat(),
    }).eq("stripe_subscription_id", sub_id).execute()


async def _handle_payment_failed(invoice):
    sub_id = invoice.get("subscription")
    if not sub_id:
        return
    supabase.table("subscriptions").update({
        "status": "past_due"
    }).eq("stripe_subscription_id", sub_id).execute()


# ── User Subscription Info ──

@router.get("/subscription/{user_id}")
async def get_subscription(user_id: str):
    """Get user's current subscription info."""
    require_supabase()

    result = supabase.table("subscriptions").select("*").eq("user_id", user_id).execute()

    if not result.data:
        return {
            "plan_name": "free",
            "status": "active",
            "reports_limit": 3,
            "billing_cycle": "monthly",
        }

    return result.data[0]
