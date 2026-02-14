import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { T, CSS } from "../theme";
import { useAuth } from "../components/AuthProvider";

const FEATURES = [
    { icon: "🤖", title: "AI-Powered Analysis", desc: "Gemini analyzes real-time financial data, earnings, and news using Google Search grounding." },
    { icon: "📋", title: "7-Step Checklist", desc: "A structured pre-trade process: business, financials, story, risks, competition, valuation, verdict." },
    { icon: "⚡", title: "30-Second Reports", desc: "Enter any ticker and get a comprehensive research report in under 30 seconds." },
    { icon: "🛡️", title: "Investor Protection", desc: "Forces you to understand what you own before risking capital. No hype, no FOMO." },
];

const TRENDING = ["HIMS", "AAPL", "TSLA", "NVDA", "AMZN", "MSFT"];

export default function HomePage() {
    const { user } = useAuth();
    const [ticker, setTicker] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const go = (t) => {
        const tk = (t || ticker).toUpperCase().trim();
        if (!tk) return;
        navigate(`/report/${tk}`);
    };

    return (
        <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Space Grotesk',sans-serif" }}>
            <style>{CSS}</style>
            <Helmet>
                <title>Stock Fortress — AI-Powered Stock Research Before You Trade</title>
                <meta name="description" content="Free 7-step pre-trade checklist powered by AI. Research any stock in 30 seconds. Know what you own before you risk capital." />
                <link rel="canonical" href="https://stockfortress.app/" />
            </Helmet>

            {/* Nav */}
            <nav style={{ maxWidth: 900, margin: "0 auto", padding: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${T.accent},#00C49A)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: T.bg, fontFamily: "'IBM Plex Mono',monospace" }}>SF</span>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Stock Fortress</span>
                </div>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    {user ? (
                        <Link to="/dashboard" style={{ padding: "8px 16px", borderRadius: 8, background: T.surface, color: T.text, fontSize: 13, fontWeight: 600, textDecoration: "none", border: `1px solid ${T.border}` }}>
                            Go to Dashboard →
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" style={{ color: T.textSec, fontSize: 13, fontWeight: 500, textDecoration: "none" }}>Log in</Link>
                            <Link to="/signup" style={{ padding: "8px 16px", borderRadius: 8, background: T.text, color: T.bg, fontSize: 13, fontWeight: 700, textDecoration: "none" }}>Get Started</Link>
                        </>
                    )}
                </div>
            </nav>

            {/* Hero */}
            <div style={{ maxWidth: 600, margin: "0 auto", padding: "60px 24px 48px", textAlign: "center" }}>
                <div style={{ animation: "fi .6s ease both" }}>
                    <div style={{ display: "inline-block", padding: "6px 16px", borderRadius: 20, background: `${T.accent}12`, border: `1px solid ${T.accent}30`, fontSize: 12, fontWeight: 600, color: T.accent, letterSpacing: .5, marginBottom: 20 }}>
                        🏯 AI-Powered Stock Research
                    </div>
                    <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 800, color: T.text, lineHeight: 1.2, marginBottom: 16, letterSpacing: -.5 }}>
                        Research before<br />you <span style={{ background: `linear-gradient(135deg,${T.accent},${T.blue})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>trade</span>.
                    </h1>
                    <p style={{ fontSize: 16, color: T.textSec, lineHeight: 1.7, marginBottom: 36, maxWidth: 440, margin: "0 auto 36px" }}>
                        A 7-step pre-trade checklist that forces you to understand the business, financials, risks, and valuation — <strong style={{ color: T.text }}>before you risk real money</strong>.
                    </p>
                </div>

                {/* Search */}
                <div style={{ display: "flex", gap: 8, maxWidth: 400, margin: "0 auto 20px", animation: "fi .6s ease .2s both" }}>
                    <input
                        type="text"
                        placeholder="Enter ticker (e.g. AAPL)"
                        value={ticker}
                        onChange={e => setTicker(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === "Enter" && go()}
                        style={{ flex: 1, padding: "14px 16px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, color: T.text, fontSize: 15, fontWeight: 600, fontFamily: "'IBM Plex Mono',monospace", outline: "none", letterSpacing: 1 }}
                    />
                    <button
                        onClick={() => go()}
                        disabled={!ticker.trim()}
                        style={{
                            padding: "14px 28px", borderRadius: 12, border: "none",
                            background: `linear-gradient(135deg,${T.accent},#059669)`, color: "#FFF",
                            fontSize: 14, fontWeight: 700, cursor: !ticker.trim() ? "not-allowed" : "pointer",
                            fontFamily: "'Space Grotesk',sans-serif", opacity: !ticker.trim() ? .4 : 1,
                            boxShadow: `0 4px 20px ${T.accent}40`,
                        }}
                    >
                        Analyze →
                    </button>
                </div>

                {/* Trending */}
                <div style={{ animation: "fi .6s ease .4s both" }}>
                    <div style={{ fontSize: 11, color: T.textDim, letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>Trending</div>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                        {TRENDING.map(t => (
                            <button key={t} onClick={() => go(t)}
                                style={{ padding: "8px 16px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.card, color: T.text, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace", transition: "all .2s", letterSpacing: .5 }}
                                className="clickable"
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Features */}
            <div id="features" style={{ maxWidth: 800, margin: "0 auto", padding: "48px 24px" }}>
                <div style={{ textAlign: "center", marginBottom: 36 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: T.text, marginBottom: 8 }}>How it works</h2>
                    <p style={{ fontSize: 14, color: T.textSec }}>Structured research that protects you from bad decisions</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
                    {FEATURES.map((f, i) => (
                        <div key={i} style={{ background: T.card, borderRadius: 14, border: `1px solid ${T.border}`, padding: "24px 20px", animation: `fi .4s ease ${.1 * i}s both`, boxShadow: "0 2px 10px rgba(0,0,0,.03)" }}>
                            <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 8 }}>{f.title}</div>
                            <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.6 }}>{f.desc}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* The 7 Steps */}
            <div style={{ maxWidth: 600, margin: "0 auto", padding: "48px 24px" }}>
                <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: T.text, marginBottom: 8 }}>The 7-Step Checklist</h2>
                    <p style={{ fontSize: 14, color: T.textSec }}>Every report walks you through these steps — no shortcuts</p>
                </div>
                {[
                    { n: 1, i: "🏢", l: "Know What You Own", d: "Understand the business in plain English" },
                    { n: 2, i: "📊", l: "Check The Financials", d: "Revenue, margins, cash flow, red & green flags" },
                    { n: 3, i: "📖", l: "Understand The Story", d: "Bull, base & bear cases with macro context" },
                    { n: 4, i: "⚠️", l: "Know The Risks", d: "Risk severity, ownership signals, concentration" },
                    { n: 5, i: "⚔️", l: "Check Competition", d: "Competitors, moat strength, and defensibility" },
                    { n: 6, i: "💰", l: "Valuation Reality Check", d: "P/E, DCF, price targets — is it actually cheap?" },
                    { n: 7, i: "🎯", l: "The Verdict", d: "BUY, WATCH, or AVOID with confidence level" },
                ].map((s, i) => (
                    <div key={i} style={{ display: "flex", gap: 16, alignItems: "flex-start", padding: "14px 0", borderBottom: i < 6 ? `1px solid ${T.border}22` : "none", animation: `fi .35s ease ${.06 * i}s both` }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 10,
                            background: `${T.accent}12`, border: `1px solid ${T.accent}30`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 20, flexShrink: 0
                        }}>{s.i}</div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}><span style={{ color: T.accent, fontFamily: "'IBM Plex Mono',monospace", marginRight: 6 }}>{s.n}.</span>{s.l}</div>
                            <div style={{ fontSize: 12, color: T.textSec, marginTop: 3, lineHeight: 1.5 }}>{s.d}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pricing */}
            <div id="pricing" style={{ maxWidth: 700, margin: "0 auto", padding: "48px 24px" }}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <h2 style={{ fontSize: 24, fontWeight: 700, color: T.text, marginBottom: 8 }}>Simple pricing</h2>
                    <p style={{ fontSize: 14, color: T.textSec }}>Start free, upgrade when you're ready</p>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                    {[
                        { name: "Free", price: "$0", period: "forever", reports: "3 reports/mo", features: ["AI-powered analysis", "7-step checklist", "Demo tickers"], cta: "Get Started", primary: false },
                        { name: "Pro", price: "$7.99", period: "/month", reports: "30 reports/mo", features: ["Everything in Free", "Any ticker", "Saved reports", "Watchlist alerts"], cta: "Coming Soon", primary: true },
                        { name: "Premium", price: "$14.99", period: "/month", reports: "Unlimited", features: ["Everything in Pro", "Priority analysis", "Export reports", "API access"], cta: "Coming Soon", primary: false },
                    ].map((p, i) => (
                        <div key={i} style={{
                            background: T.card, borderRadius: 16,
                            border: p.primary ? `2px solid ${T.accent}` : `1px solid ${T.border}`,
                            padding: "28px 22px", textAlign: "center",
                            boxShadow: p.primary ? `0 8px 30px ${T.accentDim}` : "0 2px 10px rgba(0,0,0,.03)",
                            position: "relative",
                        }}>
                            {p.primary && <div style={{ position: "absolute", top: -10, left: "50%", transform: "translateX(-50%)", padding: "3px 14px", borderRadius: 12, background: T.accent, color: "#FFF", fontSize: 10, fontWeight: 700, letterSpacing: .5 }}>POPULAR</div>}
                            <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 4 }}>{p.name}</div>
                            <div style={{ marginBottom: 4 }}>
                                <span style={{ fontSize: 30, fontWeight: 800, color: T.text }}>{p.price}</span>
                                <span style={{ fontSize: 13, color: T.textDim }}>{p.period}</span>
                            </div>
                            <div style={{ fontSize: 12, color: T.accent, fontWeight: 600, marginBottom: 16 }}>{p.reports}</div>
                            <div style={{ textAlign: "left", marginBottom: 20 }}>
                                {p.features.map((f, j) => (
                                    <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", fontSize: 12, color: T.textSec }}>
                                        <span style={{ color: T.accent, fontSize: 10 }}>✓</span>{f}
                                    </div>
                                ))}
                            </div>
                            <button style={{
                                width: "100%", padding: "11px", borderRadius: 10, border: p.primary ? "none" : `1px solid ${T.border}`,
                                background: p.primary ? `linear-gradient(135deg,${T.accent},#059669)` : "transparent",
                                color: p.primary ? "#FFF" : T.textSec, fontSize: 13, fontWeight: 700, cursor: "pointer",
                                fontFamily: "'Space Grotesk',sans-serif",
                            }}>{p.cta}</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA */}
            <div style={{ maxWidth: 500, margin: "0 auto", padding: "48px 24px 32px", textAlign: "center" }}>
                <div style={{ background: `linear-gradient(135deg,${T.accent}08,${T.blue}08)`, borderRadius: 20, border: `1px solid ${T.accent}28`, padding: "36px 28px" }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: T.text, marginBottom: 10 }}>Ready to research?</div>
                    <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6, marginBottom: 20 }}>Enter any ticker and get a comprehensive AI-powered research report in seconds.</p>
                    <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ padding: "14px 36px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${T.accent},#059669)`, color: "#FFF", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif", boxShadow: `0 4px 20px ${T.accent}40` }}>
                        Start Free →
                    </button>
                </div>
            </div>

            {/* Footer */}
            <footer style={{ maxWidth: 900, margin: "0 auto", padding: "24px", borderTop: `1px solid ${T.border}22`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 800, color: T.accent, fontFamily: "'IBM Plex Mono',monospace" }}>SF</span>
                    <span style={{ fontSize: 12, color: T.textDim }}>Stock Fortress © 2026</span>
                </div>
                <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.5 }}>
                    Research before you trade. Always.
                </div>
            </footer>
        </div>
    );
}
