import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { T, STEPS, TOTAL_STEPS, CSS } from "../theme";
import { NavBtn } from "../components/atoms";
import { Landing, S1, S2, S2A, S3, S4, S5, S6, S7, Gut } from "../components/steps";
import AnalysisSnapshot from "../components/AnalysisSnapshot";
import WizardProgressBar from "../components/WizardProgressBar";
import VerdictTeaser from "../components/VerdictTeaser";
import { DEMOS } from "../data/demos";
import { useAuth } from "../components/AuthProvider";
import { supabase } from "../lib/supabase";

// ─── PLAN LIMITS ───
const PLAN_LIMITS = { free: 3, pro: 30, premium: Infinity };
const ANON_LIMIT = 1;

const LOADING_MESSAGES = [
    "Initializing market data scan...",
    "Analyzing business model and competitive moat...",
    "Crunching financial statements & ratios...",
    "Reviewing latest earnings call transcripts...",
    "Evaluating bull and bear cases...",
    "Assessing regulatory and macro risks...",
    "Calculating valuation models (DCF & P/E)...",
    "Finalizing investment verdict..."
];

function getAnonState() {
    const key = `sf_anon_${new Date().getFullYear()}_${new Date().getMonth()}`;
    const used = parseInt(localStorage.getItem(key) || "0", 10);
    const last = localStorage.getItem("sf_anon_last_ticker");
    return { used, last };
}

function bumpAnonState(ticker) {
    const key = `sf_anon_${new Date().getFullYear()}_${new Date().getMonth()}`;
    const { used } = getAnonState();
    localStorage.setItem(key, String(used + 1));
    localStorage.setItem("sf_anon_last_ticker", ticker);
}

// ─── PAYWALL COMPONENT ───
function Paywall({ user, used, limit, navigate }) {
    return (
        <div className="layout-container" style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Space Grotesk',sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
            <style>{CSS}</style>
            <Helmet><title>Upgrade — Stock Fortress</title></Helmet>
            <div style={{ textAlign: "center", animation: "fi .5s ease both", maxWidth: 340 }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg,${T.accent},#00C49A)`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                    <span style={{ fontSize: 28 }}>🔒</span>
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: T.text, marginBottom: 8 }}>Report Limit Reached</div>
                <div style={{ fontSize: 14, color: T.textSec, marginBottom: 6, lineHeight: 1.5 }}>
                    You've used <strong style={{ color: T.text }}>{used}/{limit}</strong> reports this month.
                </div>
                {!user ? (
                    <>
                        <div style={{ fontSize: 13, color: T.textDim, marginBottom: 24 }}>Sign up for a free account to get 3 reports/month.</div>
                        <Link to="/signup" style={{ display: "inline-block", padding: "12px 28px", borderRadius: 12, background: `linear-gradient(135deg,${T.accent},#059669)`, color: "#FFF", fontSize: 14, fontWeight: 700, textDecoration: "none", marginBottom: 10 }}>Create Free Account →</Link>
                        <div style={{ fontSize: 12, color: T.textDim }}>Already have an account? <Link to="/login" style={{ color: T.accent }}>Log in</Link></div>
                    </>
                ) : (
                    <>
                        <div style={{ fontSize: 13, color: T.textDim, marginBottom: 20, lineHeight: 1.5 }}>
                            Upgrade to <strong style={{ color: T.accent }}>Pro</strong> for 30 reports/month,<br />
                            or <strong style={{ color: T.blue }}>Premium</strong> for unlimited.
                        </div>
                        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 16 }}>
                            <div style={{ background: T.card, border: `2px solid ${T.accent}`, borderRadius: 14, padding: "16px 20px", textAlign: "center", minWidth: 130 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: T.accent, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Pro</div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: T.text }}>$7.99<span style={{ fontSize: 12, color: T.textDim }}>/mo</span></div>
                                <div style={{ fontSize: 11, color: T.textSec, marginTop: 4 }}>30 reports/mo</div>
                            </div>
                            <div style={{ background: T.card, border: `2px solid ${T.blue}`, borderRadius: 14, padding: "16px 20px", textAlign: "center", minWidth: 130 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: T.blue, textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Premium</div>
                                <div style={{ fontSize: 22, fontWeight: 800, color: T.text }}>$14.99<span style={{ fontSize: 12, color: T.textDim }}>/mo</span></div>
                                <div style={{ fontSize: 11, color: T.textSec, marginTop: 4 }}>Unlimited</div>
                            </div>
                        </div>
                        <div style={{ fontSize: 12, color: T.textDim }}>Stripe billing coming soon. Contact us for early access.</div>
                    </>
                )}
                <button onClick={() => navigate("/")} style={{ marginTop: 20, padding: "10px 20px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.textSec, fontSize: 12, cursor: "pointer" }}>← Back to Home</button>
            </div>
        </div>
    );
}

export default function ReportPage() {
    const { ticker: paramTicker } = useParams();
    const navigate = useNavigate();
    const { user, subscription } = useAuth();
    const [step, setStep] = useState(0);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saved, setSaved] = useState(false);
    const [watched, setWatched] = useState(false);
    const [saving, setSaving] = useState(false);
    const [paywalled, setPaywalled] = useState(false);
    const [viewMode, setViewMode] = useState("steps"); // steps, snapshot
    const [usageInfo, setUsageInfo] = useState({ used: 0, limit: 3 });
    const [msgIndex, setMsgIndex] = useState(0);
    // ─── NEW: Navigation state for debounce & transitions ───
    const [isNavigating, setIsNavigating] = useState(false);
    const [direction, setDirection] = useState("next"); // "next" or "prev"
    const [animKey, setAnimKey] = useState(0); // force re-render for animation
    const ref = useRef(null);
    const ticker = (paramTicker || "").toUpperCase().trim();

    useEffect(() => {
        if (!loading) return;
        const interval = setInterval(() => {
            setMsgIndex(prev => (prev + 1) % LOADING_MESSAGES.length);
        }, 3500);
        return () => clearInterval(interval);
    }, [loading]);

    const addToWatchlist = async () => {
        if (!user || saving) return;
        setSaving(true);
        const verdict = data?.step_7_verdict?.action || null;
        const { error } = await supabase.from("watchlist_items").upsert({
            user_id: user.id,
            ticker,
            last_verdict: verdict,
        }, { onConflict: "user_id,ticker" });
        if (!error) {
            setWatched(true);
            if (window.posthog) window.posthog.capture('watchlist_add', { ticker, verdict });
        }
        else alert("Watchlist failed: " + error.message);
        setSaving(false);
    };

    useEffect(() => {
        if (!ticker) { navigate("/"); return; }
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            setMsgIndex(0);
            setError("");

            // ── CHECK RATE LIMIT ──
            if (user) {
                const plan = subscription?.plan_name || "free";
                const limit = subscription?.reports_limit || PLAN_LIMITS[plan] || 3;

                // Use monthly cycle from subscription if available, else calc from 1st
                let startPeriod = new Date();
                if (subscription?.current_period_start) {
                    startPeriod = new Date(subscription.current_period_start);
                } else {
                    startPeriod.setDate(1);
                    startPeriod.setHours(0, 0, 0, 0);
                }

                const { count } = await supabase
                    .from("reports")
                    .select("id", { count: "exact", head: true })
                    .eq("user_id", user.id)
                    .gte("generated_at", startPeriod.toISOString());

                const used = count || 0;
                if (!cancelled) setUsageInfo({ used, limit });

                if (used >= limit) {
                    if (!cancelled) {
                        setPaywalled(true);
                        setLoading(false);
                        if (window.posthog) window.posthog.capture('paywall_shown', { used, limit });
                    }
                    return;
                }
            } else {
                // Anonymous user — localStorage counter
                const { used, last } = getAnonState();
                if (!cancelled) setUsageInfo({ used, limit: ANON_LIMIT });

                // Allow re-viewing the LAST ticker they spent a credit on
                const isRevisit = last === ticker;

                if (used >= ANON_LIMIT && !isRevisit) {
                    if (!cancelled) { setPaywalled(true); setLoading(false); }
                    return;
                }
            }

            // ── GENERATE REPORT ──
            try {
                const res = await fetch(`/api/report/${ticker}`);
                if (!res.ok) throw new Error(`API error: ${res.status}`);
                const json = await res.json();
                if (!cancelled) {
                    setData(json.report);
                    setStep(0);

                    // Track in PostHog
                    if (window.posthog) {
                        window.posthog.capture('report_generated', { ticker, user_id: user?.id, plan: user ? 'user' : 'anon' });
                    }

                    if (user && !json.cached) {
                        supabase.from("reports").insert({
                            user_id: user.id,
                            ticker,
                            report_data: json.report,
                            gemini_model: "gemini-2.5-flash",
                        }).then(() => setSaved(true));
                    } else if (user && json.cached) {
                        // Check if already saved
                        const { data: existing } = await supabase
                            .from("reports")
                            .select("id")
                            .eq("user_id", user.id)
                            .eq("ticker", ticker)
                            .limit(1);
                        if (existing?.length) {
                            setSaved(true);
                            setViewMode("snapshot");
                        }
                    }

                    // Bump anonymous counter
                    if (!user) {
                        const { last } = getAnonState();
                        if (last !== ticker) {
                            bumpAnonState(ticker);
                        }
                    }
                }
            } catch {
                const d = DEMOS[ticker];
                if (d && !cancelled) {
                    setData(d);
                    setStep(0);
                    setError("Using demo data (backend unavailable)");
                } else if (!cancelled) {
                    setError(`No data for ${ticker}. Backend may be offline.`);
                }
            } finally { if (!cancelled) setLoading(false); }
        };
        load();
        return () => { cancelled = true; };
    }, [ticker, navigate, user, subscription]);

    // Scroll to top on step change
    useEffect(() => { ref.current?.scrollTo({ top: 0, behavior: "smooth" }) }, [step]);

    // ─── DEBOUNCED NAVIGATION (fixes rage-click issue) ───
    const handleNext = useCallback(() => {
        if (isNavigating || step >= STEPS.length - 1) return;
        setIsNavigating(true);
        setDirection("next");
        setStep(s => s + 1);
        setAnimKey(k => k + 1);
        // Track step progression in PostHog
        if (window.posthog) {
            window.posthog.capture('wizard_step_next', { ticker, from_step: step, to_step: step + 1 });
        }
        setTimeout(() => setIsNavigating(false), 300);
    }, [isNavigating, step, ticker]);

    const handleBack = useCallback(() => {
        if (isNavigating) return;
        setIsNavigating(true);
        setDirection("prev");
        if (step > 0) {
            setStep(s => s - 1);
            setAnimKey(k => k + 1);
            if (window.posthog) {
                window.posthog.capture('wizard_step_back', { ticker, from_step: step, to_step: step - 1 });
            }
        } else {
            navigate("/");
        }
        setTimeout(() => setIsNavigating(false), 300);
    }, [isNavigating, step, navigate, ticker]);

    // ─── KEYBOARD NAVIGATION (desktop) ───
    useEffect(() => {
        if (viewMode !== "steps" || !data) return;
        const handleKey = (e) => {
            if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
            if (e.key === "ArrowRight") handleNext();
            if (e.key === "ArrowLeft") handleBack();
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [viewMode, data, handleNext, handleBack]);

    const VIEWS = data ? {
        landing: <Landing d={data} onStart={handleNext} />,
        s1: <S1 d={data} onNext={handleNext} />, s2: <S2 d={data} />, s2a: <S2A d={data} />,
        s3: <S3 d={data} />, s4: <S4 d={data} />, s5: <S5 d={data} />,
        s6: <S6 d={data} />, s7: <S7 d={data} />, gut: <Gut d={data} />,
    } : {};

    // SEO meta
    const metaTitle = data
        ? `${ticker} Stock Analysis — Stock Fortress Report`
        : `${ticker} — Stock Fortress`;
    const metaDesc = data
        ? `${data.meta.company_name} (${ticker}) — ${data.step_7_verdict?.action || "Analysis"}. AI-powered 7-step pre-trade research checklist.`
        : `AI-powered stock analysis for ${ticker}. Research before you trade.`;

    // ── PAYWALL ──
    if (paywalled) {
        return <Paywall user={user} used={usageInfo.used} limit={usageInfo.limit} navigate={navigate} />;
    }

    if (loading) {
        return (
            <div className="layout-container" style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Space Grotesk',sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
                <style>{CSS}</style>
                <Helmet><title>{metaTitle}</title><meta name="description" content={metaDesc} /></Helmet>
                <div style={{ animation: "fi .6s ease both", textAlign: "center" }}>
                    <div style={{ width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg,${T.accent},#00C49A)`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 20, boxShadow: `0 0 40px ${T.accentDim}`, animation: "pu 1.5s ease infinite" }}>
                        <span style={{ fontSize: 28, fontWeight: 800, color: T.bg, fontFamily: "'IBM Plex Mono',monospace" }}>SF</span>
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>Analyzing {ticker}...</div>
                    <div key={msgIndex} style={{ fontSize: 13, color: T.textDim, lineHeight: 1.6, minHeight: 42, animation: "fi .5s ease both" }}>
                        {LOADING_MESSAGES[msgIndex]}
                    </div>
                    <div style={{ marginTop: 24, width: 220, height: 4, background: T.surface, borderRadius: 2, overflow: "hidden", margin: "24px auto 0" }}>
                        <div style={{ width: "40%", height: "100%", background: `linear-gradient(90deg,${T.accent},${T.blue})`, borderRadius: 2, animation: "shimmer 2s linear infinite", backgroundSize: "200% 100%" }} />
                    </div>
                </div>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="layout-container" style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Space Grotesk',sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
                <style>{CSS}</style>
                <Helmet><title>Error — Stock Fortress</title></Helmet>
                <div style={{ textAlign: "center", animation: "fi .5s ease both" }}>
                    <div style={{ fontSize: 44, marginBottom: 16 }}>⚠️</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: T.text, marginBottom: 8 }}>{error}</div>
                    <button onClick={() => navigate("/")} style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${T.accent},#059669)`, color: "#FFF", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }}>← Back to Home</button>
                </div>
            </div>
        );
    }

    const cur = STEPS[step];

    // Determine nav button labels
    const isVerdictStep = step === 8; // S7 — The Verdict
    const isLastStep = step >= STEPS.length - 1;
    const isFirstResearchStep = step === 1;

    let nextLabel = "Next Step →";
    if (isVerdictStep && !isLastStep) nextLabel = "Continue →";
    if (step === STEPS.length - 2) nextLabel = "Final Step →";
    if (isLastStep) nextLabel = "New Research ↗";

    // Special: on step 7 (S6 Valuation), tease the verdict
    if (step === 7) nextLabel = "See Your Verdict ✅";

    return (
        <div className="layout-container" style={{ height: "100dvh", background: T.bg, fontFamily: "'Space Grotesk',sans-serif", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
            <style>{CSS}</style>
            <Helmet>
                <title>{metaTitle}</title>
                <meta name="description" content={metaDesc} />
                <link rel="canonical" href={`https://stockfortress.app/report/${ticker}`} />
            </Helmet>

            {/* ─── HEADER ─── */}
            <div style={{ padding: "10px 16px", borderBottom: `1px solid ${T.border}22`, background: `${T.bg}EE`, backdropFilter: "blur(12px)", zIndex: 10, flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer" }} onClick={() => navigate("/")}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: T.accent, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: 1 }}>SF</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Stock Fortress</span>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {user && data && saved && (
                            <span style={{ fontSize: 11, color: T.accent, fontWeight: 600 }}>✓ Saved</span>
                        )}
                        {user && data && !watched && (
                            <button onClick={addToWatchlist} disabled={saving} style={{ padding: "5px 10px", borderRadius: 7, border: `1px solid ${T.blue}40`, background: `${T.blue}12`, color: T.blue, fontSize: 11, fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: "'Space Grotesk',sans-serif" }}>
                                {saving ? "..." : "👀 Watch"}
                            </button>
                        )}
                        {user && data && watched && (
                            <span style={{ fontSize: 11, color: T.blue, fontWeight: 600 }}>✓ Watching</span>
                        )}
                        {!user && data && (
                            <button onClick={() => navigate("/signup")} style={{ padding: "5px 10px", borderRadius: 7, border: `1px solid ${T.accent}40`, background: `${T.accent}12`, color: T.accent, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }}>
                                Sign up to save
                            </button>
                        )}
                        <button onClick={() => navigate("/")} style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.card, color: T.textSec, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
                            New ↗
                        </button>
                    </div>
                </div>
            </div>

            {/* ─── WIZARD PROGRESS BAR (replaces old thin bar) ─── */}
            {viewMode === "steps" && (
                <WizardProgressBar currentStep={step} />
            )}

            {/* ─── VERDICT TEASER ─── */}
            {viewMode === "steps" && data && (
                <VerdictTeaser currentStep={step} ticker={ticker} />
            )}

            {/* ─── CONTENT with slide transitions ─── */}
            <div ref={ref} style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "14px 14px 96px 14px" }}>
                {error && <div style={{ padding: "8px 12px", borderRadius: 8, background: `${T.warn}18`, border: `1px solid ${T.warn}40`, fontSize: 11, color: T.warn, textAlign: "center", marginBottom: 10 }}>{error}</div>}

                {/* Email Capture Banner */}
                {data && step === 0 && viewMode === "steps" && (
                    <div style={{ background: '#111B2E', border: '1px solid #00E5B0', borderRadius: 8, padding: 16, margin: '0 auto 16px', maxWidth: 600, textAlign: 'center' }}>
                        <p style={{ color: '#fff', margin: '0 0 8px', fontSize: 14, fontWeight: 600 }}>📊 Get the top 3 researched stocks every week</p>
                        <form action="https://buttondown.com/api/emails/embed-subscribe/stockfortress" method="post" target="_blank" style={{ display: 'flex', justifyContent: 'center' }}>
                            <input type="email" name="email" placeholder="your@email.com"
                                style={{ padding: '8px 12px', borderRadius: 4, border: '1px solid #333', background: '#0A1628', color: '#fff', width: 200, fontSize: 13 }} />
                            <button type="submit"
                                style={{ padding: '8px 16px', borderRadius: 4, border: 'none', background: '#00E5B0', color: '#0A1628', fontWeight: 'bold', cursor: 'pointer', marginLeft: 4, fontSize: 13 }}>
                                Subscribe
                            </button>
                        </form>
                    </div>
                )}

                {viewMode === "snapshot" ? (
                    <AnalysisSnapshot data={data} onViewFull={() => { setViewMode("steps"); setStep(1); }} />
                ) : (
                    /* Animated step wrapper */
                    <div
                        key={animKey}
                        className={step === 0 ? "" : (direction === "next" ? "step-slide-next" : "step-slide-prev")}
                        style={{ willChange: "transform, opacity" }}
                    >
                        {VIEWS[cur.k]}
                    </div>
                )}
            </div>

            {/* ─── NAVIGATION BAR (sticky bottom) ─── */}
            {viewMode === "steps" && step > 0 && (
                <div style={{
                    position: "absolute", bottom: 0, left: 0, right: 0,
                    padding: "10px 14px",
                    paddingTop: 28,
                    background: `linear-gradient(transparent, ${T.bg} 30%)`,
                    display: "flex", gap: 10, zIndex: 10,
                }}>
                    {/* Hide Back on step 1 (first research step) */}
                    {!isFirstResearchStep && (
                        <NavBtn
                            onClick={handleBack}
                            disabled={isNavigating}
                            isLoading={false}
                        >
                            ← Back
                        </NavBtn>
                    )}

                    {isLastStep ? (
                        <NavBtn
                            onClick={() => navigate("/")}
                            primary
                            disabled={isNavigating}
                        >
                            New Research ↗
                        </NavBtn>
                    ) : (
                        <NavBtn
                            onClick={handleNext}
                            primary
                            disabled={isNavigating}
                        >
                            {nextLabel}
                        </NavBtn>
                    )}
                </div>
            )}
        </div >
    );
}
