import { useNavigate } from "react-router-dom";
import { T, CSS } from "../theme";
import { useAuth } from "../components/AuthProvider";
import { useBilling } from "../billing";

export default function PricingPage() {
    const { user } = useAuth();
    const { handleSelectPlan, isProcessing } = useBilling({ user });
    const navigate = useNavigate();

    const plans = [
        {
            name: "Free",
            price: "$0",
            period: "/mo",
            desc: "For getting started",
            features: ["3 AI reports/month", "7-step analysis", "Watchlist", "Data caching"],
            btn_text: "Current Plan",
            action: () => handleSelectPlan({ name: "Free", isFree: true }),
            color: T.textSec,
            bg: T.surface
        },
        {
            name: "Pro",
            price: "$7.99",
            period: "/mo",
            desc: "For active investors",
            features: ["30 AI reports/month", "Everything in Free", "Priority generation", "Email alerts", "Export PDF"],
            btn_text: "Upgrade to Pro",
            action: () => handleSelectPlan({ name: "Pro" }),
            color: T.accent,
            bg: `${T.accent}15`,
            border: T.accent
        },
        {
            name: "Premium",
            price: "$14.99",
            period: "/mo",
            desc: "For power users",
            features: ["Unlimited reports", "Everything in Pro", "Bulk analysis", "API access (beta)", "Priority support"],
            btn_text: "Go Unlimited",
            action: () => handleSelectPlan({ name: "Premium" }),
            color: T.blue,
            bg: `${T.blue}15`,
            border: T.blue
        }
    ];

    return (
        <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Space Grotesk',sans-serif", color: T.text, padding: "20px" }}>
            <style>{CSS}</style>

            <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", maxWidth: 1000, margin: "0 auto 60px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }} onClick={() => navigate("/")}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${T.accent},#00C49A)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: T.bg, fontFamily: "'IBM Plex Mono',monospace" }}>SF</span>
                    </div>
                    <span style={{ fontWeight: 700 }}>Stock Fortress</span>
                </div>
                {user ? (
                    <button onClick={() => navigate("/dashboard")} style={{ padding: "8px 16px", borderRadius: 8, background: T.surface, border: `1px solid ${T.border}`, color: T.text, fontWeight: 600, cursor: "pointer" }}>Dashboard</button>
                ) : (
                    <button onClick={() => navigate("/login")} style={{ padding: "8px 16px", borderRadius: 8, background: T.accent, border: "none", color: "#000", fontWeight: 700, cursor: "pointer" }}>Sign In</button>
                )}
            </nav>

            <div style={{ maxWidth: 1000, margin: "0 auto" }}>
                <div style={{ textAlign: "center", marginBottom: 60 }}>
                    <h1 style={{ fontSize: 42, fontWeight: 700, marginBottom: 16, background: `linear-gradient(135deg,${T.text},${T.textSec})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        Invest with confidence.
                    </h1>
                    <p style={{ fontSize: 18, color: T.textSec, maxWidth: 600, margin: "0 auto", lineHeight: 1.6 }}>
                        Unlock comprehensive AI stock analysis. Stop guessing and start knowing.
                    </p>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
                    {plans.map((p) => (
                        <div key={p.name} style={{
                            background: p.bg || T.card,
                            border: `1px solid ${p.border || T.border}`,
                            borderRadius: 20,
                            padding: 32,
                            display: "flex",
                            flexDirection: "column",
                            position: "relative"
                        }}>
                            <div style={{ fontSize: 13, textTransform: "uppercase", fontWeight: 700, color: p.color, marginBottom: 8 }}>{p.name}</div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                                <span style={{ fontSize: 42, fontWeight: 800, color: T.text }}>{p.price}</span>
                                <span style={{ fontSize: 16, color: T.textSec }}>{p.period}</span>
                            </div>
                            <p style={{ fontSize: 15, color: T.textSec, marginBottom: 32 }}>{p.desc}</p>

                            <button
                                onClick={p.action}
                                disabled={isProcessing}
                                style={{
                                    width: "100%",
                                    padding: "16px",
                                    borderRadius: 12,
                                    background: p.border ? p.border : T.surface,
                                    color: p.border ? "#000" : T.text,
                                    border: p.border ? "none" : `1px solid ${T.border}`,
                                    fontWeight: 700,
                                    cursor: isProcessing ? "not-allowed" : "pointer",
                                    marginBottom: 32,
                                    transition: "opacity .2s",
                                    opacity: isProcessing ? 0.7 : 1
                                }}
                            >
                                {p.btn_text}
                            </button>

                            <div style={{ flex: 1 }}>
                                {p.features.map((f, i) => (
                                    <div key={i} style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
                                        <div style={{ width: 18, height: 18, borderRadius: 9, background: `${p.color}30`, display: "flex", alignItems: "center", justifyContent: "center", color: p.color, fontSize: 11 }}>✓</div>
                                        <span style={{ fontSize: 15, color: T.textDim }}>{f}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
