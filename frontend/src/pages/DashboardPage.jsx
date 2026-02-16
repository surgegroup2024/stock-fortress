import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthProvider";
import { T, CSS, STEPS } from "../theme";
import { Badge, Card, MetricRow } from "../components/atoms";
import { Helmet } from "react-helmet-async";
import { supabase } from "../lib/supabase";
import Watchlist from "../components/Watchlist";

function ReportsTab({ user }) {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        supabase
            .from("reports")
            .select("id, ticker, generated_at, report_data")
            .eq("user_id", user.id)
            .order("generated_at", { ascending: false })
            .then(({ data }) => {
                setReports(data || []);
                setLoading(false);
            });
    }, [user]);

    if (loading) return <div style={{ padding: 20, color: T.textDim, fontSize: 13 }}>Loading reports...</div>;

    if (reports.length === 0) {
        return (
            <div style={{ textAlign: "center", padding: "40px 20px", background: T.card, borderRadius: 16, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📂</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>No saved reports yet</div>
                <div style={{ fontSize: 13, color: T.textSec, marginBottom: 20 }}>Analyze a stock to save your first report.</div>
                <button onClick={() => navigate("/")} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: `linear-gradient(135deg,${T.accent},#059669)`, color: "#FFF", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>Analyze New Stock</button>
            </div>
        );
    }

    return (
        <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
            {reports.map((r) => {
                const d = r.report_data?.step_7_verdict;
                const verdict = d?.action || "ANALYZED";
                const color = verdict === "BUY" ? T.accent : verdict === "AVOID" ? T.danger : T.blue;
                return (
                    <div key={r.id} onClick={() => navigate(`/report/${r.ticker}`)} style={{ background: T.card, padding: 16, borderRadius: 12, border: `1px solid ${T.border}`, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }} className="clickable">
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 700, color: T.text, fontFamily: "'IBM Plex Mono',monospace" }}>{r.ticker}</div>
                            <div style={{ fontSize: 11, color: T.textDim, marginTop: 4 }}>{new Date(r.generated_at).toLocaleDateString()}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                            <Badge color={color}>{verdict}</Badge>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function WatchlistTab({ user }) {
    return <Watchlist user={user} />;
}


function SettingsTab({ user, signOut }) {
    const { subscription } = useAuth();
    const [used, setUsed] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        // Count reports this month
        const startPeriod = new Date();
        if (subscription?.current_period_start) {
            startPeriod.setTime(new Date(subscription.current_period_start).getTime());
        } else {
            startPeriod.setDate(1);
            startPeriod.setHours(0, 0, 0, 0);
        }

        supabase
            .from("reports")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .gte("generated_at", startPeriod.toISOString())
            .then(({ count }) => setUsed(count || 0));
    }, [user, subscription]);

    const plan = subscription?.plan_name || "free";
    const limit = subscription?.reports_limit || 3;
    const isUnlimited = limit > 1000;
    const pct = isUnlimited ? 0 : Math.min((used / limit) * 100, 100);
    const barColor = pct >= 100 ? T.danger : pct >= 66 ? T.warn : T.accent;
    const planLabel = plan.toUpperCase() + " PLAN";
    const planColor = plan === "premium" ? T.blue : plan === "pro" ? T.accent : T.blue;

    return (
        <div>
            <Card>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4 }}>Account</div>
                <div style={{ fontSize: 13, color: T.textSec, marginBottom: 12 }}>{user.email}</div>
                <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                    <Badge color={planColor}>{planLabel}</Badge>
                    {subscription?.cancel_at_period_end && <Badge color={T.warn}>Cancels at period end</Badge>}
                </div>
                <div style={{ fontSize: 12, color: T.textSec, marginBottom: 6 }}>Reports this period</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ flex: 1, height: 6, background: T.surface, borderRadius: 3, overflow: "hidden" }}>
                        <div style={{ width: isUnlimited ? "100%" : `${pct}%`, height: "100%", background: isUnlimited ? T.accent : barColor, borderRadius: 3, transition: "width .4s ease" }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: pct >= 100 && !isUnlimited ? T.danger : T.text, fontFamily: "'IBM Plex Mono',monospace" }}>
                        {isUnlimited ? `${used} / ∞` : `${used}/${limit}`}
                    </span>
                </div>
            </Card>

            {plan === "free" && (
                <Card style={{ marginTop: 12, background: `${T.accent}08`, border: `1px solid ${T.accent}30` }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 8 }}>⚡ Upgrade for more reports</div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <div style={{ flex: 1, padding: "10px", borderRadius: 10, border: `2px solid ${T.accent}`, textAlign: "center", cursor: "pointer", background: T.card }} onClick={() => navigate("/pricing")}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, textTransform: "uppercase" }}>Pro</div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>$7.99<span style={{ fontSize: 10, color: T.textDim }}>/mo</span></div>
                            <div style={{ fontSize: 10, color: T.textSec }}>30 reports</div>
                        </div>
                        <div style={{ flex: 1, padding: "10px", borderRadius: 10, border: `2px solid ${T.blue}`, textAlign: "center", cursor: "pointer", background: T.card }} onClick={() => navigate("/pricing")}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: T.blue, textTransform: "uppercase" }}>Premium</div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: T.text }}>$14.99<span style={{ fontSize: 10, color: T.textDim }}>/mo</span></div>
                            <div style={{ fontSize: 10, color: T.textSec }}>Unlimited</div>
                        </div>
                    </div>
                </Card>
            )}

            <div style={{ marginTop: 12 }}>
                <button onClick={signOut} style={{ width: "100%", padding: "12px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.surface, color: T.text, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Log Out</button>
            </div>

            <div style={{ marginTop: 24, padding: "16px", background: T.card, borderRadius: 12, border: `1px solid ${T.border}` }}>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: T.text, margin: "0 0 8px 0" }}>Manage Subscription</h4>
                <p style={{ fontSize: 13, color: T.textSec, margin: "0 0 12px 0" }}>
                    Need to change your plan or update payment details?
                </p>
                <div style={{ fontSize: 13, color: T.textDim }}>
                    Customer portal coming soon. Contact support@stockfortress.com for assistance.
                </div>
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const { user, loading, signOut } = useAuth();
    const navigate = useNavigate();
    const [tab, setTab] = useState("reports"); // reports, watchlist, settings
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        if (!loading && !user) navigate("/login");
    }, [user, loading, navigate]);

    // Handle Stripe Success
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const success = query.get("stripe_success");
        const sessionId = query.get("session_id");

        if (success && sessionId && !syncing) {
            setSyncing(true);
            // Call sync endpoint
            fetch("/api/billing/sync-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId })
            })
                .then(res => res.json())
                .then(() => {
                    // Clear URL params
                    window.history.replaceState({}, document.title, window.location.pathname);
                    // Reload to refresh auth/subscription state
                    window.location.reload();
                })
                .catch(err => {
                    console.error("Sync failed", err);
                    setSyncing(false);
                    alert("Subscription sync failed. Please contact support.");
                });
        }
    }, [syncing]);

    if (loading || !user) return null;

    if (syncing) {
        return (
            <div className="layout-container" style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Space Grotesk',sans-serif" }}>
                <div style={{ fontSize: 40, marginBottom: 20, animation: "spin 1s linear infinite" }}>🔄</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.text }}>Finalizing your upgrade...</div>
                <div style={{ fontSize: 14, color: T.textDim, marginTop: 8 }}>Please wait a moment while we confirm your payment.</div>
            </div>
        );
    }

    return (
        <div className="layout-container" style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Space Grotesk',sans-serif", display: "flex", flexDirection: "column" }}>
            <style>{CSS}</style>
            <Helmet><title>Dashboard — Stock Fortress</title></Helmet>

            {/* Header */}
            <div style={{ padding: "16px", borderBottom: `1px solid ${T.border}22`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${T.accent},#00C49A)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: T.bg, fontFamily: "'IBM Plex Mono',monospace" }}>SF</span>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Dashboard</span>
                </div>
                <button onClick={() => navigate("/")} style={{ padding: "6px 12px", borderRadius: 8, background: T.accent, color: "#FFF", fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer" }}>+ New</button>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex", padding: "12px 16px", gap: 16, borderBottom: `1px solid ${T.border}22` }}>
                {[{ id: "reports", l: "My Reports" }, { id: "watchlist", l: "Watchlist" }, { id: "settings", l: "Settings" }].map(t => (
                    <div key={t.id} onClick={() => setTab(t.id)} style={{ fontSize: 13, fontWeight: 600, color: tab === t.id ? T.text : T.textDim, cursor: "pointer", paddingBottom: 6, borderBottom: tab === t.id ? `2px solid ${T.accent}` : "2px solid transparent", transition: "all .2s" }}>
                        {t.l}
                    </div>
                ))}
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: 16, background: T.bg }}>
                {tab === "reports" && <ReportsTab user={user} />}
                {tab === "watchlist" && <WatchlistTab user={user} />}
                {tab === "settings" && <SettingsTab user={user} signOut={signOut} />}
            </div>
        </div>
    );
}
