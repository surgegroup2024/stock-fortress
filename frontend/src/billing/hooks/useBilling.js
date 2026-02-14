import { useCallback, useState } from 'react';
import { changePlan, createCheckoutSession, createFreeSubscription } from '../api/billingApi';
import { ENABLED_PAID_PLAN_KEYS, getPlanKey } from '../config/billingPlans';

const REQUEST_TIMEOUT_MS = 15000;

export function useBilling({
    user,
    subscription,
    currentPlan,
    currentBillingCycle,
    refreshSubscription,
    showToast
}) {
    const [isProcessing, setIsProcessing] = useState(false);

    const confirmDowngradeToFree = useCallback(() => {
        return Promise.resolve(
            window.confirm(
                'Switch to Free plan?\n\nThis will cancel your paid subscription and reset your monthly reports to 3.'
            )
        );
    }, []);

    const handleSelectPlan = useCallback(async (plan, billingCycle) => {
        if (!user) {
            showToast?.('Please sign in to manage your plan', 'error');
            return;
        }

        const selectedPlanKey = getPlanKey(plan);
        const currentPlanKey = String(currentPlan || '').toLowerCase();
        const selectedCycleKey = String(billingCycle || 'monthly').toLowerCase();

        const isSamePlan = selectedPlanKey === currentPlanKey;
        const isSameCycle = plan?.isFree
            ? true
            : String(currentBillingCycle || 'monthly').toLowerCase() === selectedCycleKey;

        if (isSamePlan && isSameCycle) {
            return;
        }

        if (plan?.isFree) {
            const isPaidPlan = currentPlanKey !== 'free';
            if (isPaidPlan) {
                const confirmed = await confirmDowngradeToFree();
                if (!confirmed) return;
            }
        }

        setIsProcessing(true);

        try {
            if (plan?.isFree) {
                showToast?.('Switching to Free plan…', 'info');

                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

                await createFreeSubscription({ userId: user.id }, { signal: controller.signal });
                clearTimeout(timeoutId);

                await refreshSubscription?.();
                showToast?.('Switched to Free plan', 'success');
                return;
            }

            if (!ENABLED_PAID_PLAN_KEYS.includes(selectedPlanKey)) {
                showToast?.('This plan is not available yet', 'info');
                return;
            }

            const isCurrentlyPaid = currentPlanKey !== 'free';
            const hasStripeSubscription = !!subscription?.stripe_subscription_id;

            if (isCurrentlyPaid && hasStripeSubscription) {
                showToast?.('Updating your plan…', 'info');

                await changePlan({
                    userId: user.id,
                    plan: plan.name,
                    billingCycle: selectedCycleKey
                });

                await refreshSubscription?.();
                showToast?.('Plan updated successfully', 'success');
                return;
            }

            // New checkout
            const successUrl = `${window.location.origin}/dashboard?stripe_success=1&session_id={CHECKOUT_SESSION_ID}`;
            const cancelUrl = `${window.location.origin}/dashboard?stripe_cancel=1`;

            const data = await createCheckoutSession({
                userId: user.id,
                plan: plan.name,
                billingCycle: selectedCycleKey,
                email: user.email,
                successUrl,
                cancelUrl
            });

            if (!data?.url) {
                throw new Error('Stripe Checkout URL not returned');
            }

            window.location.href = data.url;
        } catch (error) {
            const message = error?.name === 'AbortError'
                ? 'Request timed out. Please try again.'
                : (error?.message || 'Failed to switch plan');

            showToast?.(message, 'error');
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    }, [
        user,
        subscription,
        currentPlan,
        currentBillingCycle,
        refreshSubscription,
        showToast,
        confirmDowngradeToFree
    ]);

    return {
        isProcessing,
        handleSelectPlan
    };
}
