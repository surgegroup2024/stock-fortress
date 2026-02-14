import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { T, CSS } from "../theme";
import { useAuth } from "../components/AuthProvider";

const FEATURES = [
    { icon: "📝", title: "Wall Street Rigor, Automated", desc: "We don't just summarize news. Our AI runs a full institutional checklist—from valuation to moat analysis—on every stock." },
    { icon: "📡", title: "Live Data, No Hallucinations", desc: "Powered by Gemini 1.5 and Google Search, our reports are grounded in up-to-the-minute financial data and latest filings." },
    { icon: "🔔", title: "Never Miss a Move", desc: "Track your portfolio candidates. Get notified when fundamentals shift or when a stock enters your buy zone." },
];

const FAQS = [
    { q: "How is this different from ChatGPT?", a: "ChatGPT cuts off at a past date. Stock Fortress searches the live web for today's prices, news, and filings, then applies a strict financial analyst framework." },
    { q: "Is it really free?", a: "Yes. You get 3 full institutional-grade reports every month, forever. No credit card required." },
    { q: "What does the Pro plan include?", a: "Pro gives you 30 reports/month, priority processing, and export capabilities for just $7.99/mo." },
    { q: "Can I trust the AI analysis?", a: "We provide the data sources for every claim. AI is a powerful tool for synthesis, but always verify before investing." },
    { q: "Do you offer refunds?", a: "Cancel anytime. If you're not satisfied with your first month of Pro, just email us for a full refund." },
    { q: "Which markets do you cover?", a: "Currently optimized for US stocks (NYSE/NASDAQ). International support coming soon." },
    { q: "Can I export the reports?", a: "Yes, Pro and Premium members can export reports to PDF (coming soon) or copy formatted markdown." },
    { q: "Who built Stock Fortress?", a: "Built by ex-quant developers to democratize access to high-quality financial research." },
];

const TRENDING = ["HIMS", "AAPL", "TSLA", "NVDA", "AMZN", "MSFT"];

export default function HomePage() {
    const { user } = useAuth();
    const [ticker, setTicker] = useState("");
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const navigate = useNavigate();

    const go = (t) => {
        const tk = (t || ticker).toUpperCase().trim();
        if (!tk) return;
        navigate(`/report/${tk}`);
    };

    return (
        <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Space Grotesk',sans-serif" }}>
            <style>{CSS}
                {`
                    .pricing-card { transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); }
                    .pricing-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px -10px rgba(0,0,0,0.3); }

                    /* Responsive Nav */
                    .desktop-links { display: flex; }
                    .mobile-menu-btn { display: none; }
                    
                    @media (max-width: 768px) {
                        .desktop-links { display: none !important; }
                        .mobile-menu-btn { display: flex !important; }
                    }
                `}
            </style>
            <Helmet>
                <title>Stock Fortress — Institutional-Grade Stock Research In Seconds</title>
                <meta name="description" content="Stop guessing. Get deep, 7-step AI analysis on any ticker, grounded in real-time market data." />
                <link rel="canonical" href="https://stockfortress.app/" />
            </Helmet>

            {/* Nav */}
            <nav style={{
                maxWidth: 1000, margin: "0 auto", padding: "20px 24px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                position: "sticky", top: 0, zIndex: 100,
                background: "rgba(15, 23, 42, 0.8)", backdropFilter: "blur(12px)",
                borderBottom: `1px solid ${T.border}40`,
                transition: "all 0.3s ease"
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 12, background: `linear-gradient(135deg,${T.accent},#00C49A)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 4px 12px ${T.accent}30` }}>
                        <span style={{ fontSize: 18, fontWeight: 800, color: T.bg, fontFamily: "'IBM Plex Mono',monospace" }}>SF</span>
                    </div>
                    <span style={{ fontSize: 18, fontWeight: 700, color: "#FFF", letterSpacing: -0.5 }}>Stock Fortress</span>
                </div>
                <div className="desktop-links" style={{ gap: 16, alignItems: "center" }}>
                    <Link to="/pricing" style={{ color: "#FFF", fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Pricing</Link>
                    {user ? (
                        <Link to="/dashboard" style={{ padding: "10px 20px", borderRadius: 10, background: T.surface, color: T.text, fontSize: 14, fontWeight: 700, textDecoration: "none", border: `1px solid ${T.border}` }}>
                            Dashboard →
                        </Link>
                    ) : (
                        <>
                            <Link to="/login" style={{ color: T.textSec, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Login</Link>
                            <Link to="/signup" style={{ padding: "10px 20px", borderRadius: 10, background: T.text, color: T.bg, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Sign Up</Link>
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ cursor: "pointer", fontSize: 24, color: "#FFF" }}>
                    {mobileMenuOpen ? "✕" : "☰"}
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            {mobileMenuOpen && (
                <div style={{
                    position: "fixed", top: 80, left: 0, right: 0, bottom: 0,
                    background: T.bg, zIndex: 99, padding: 24,
                    display: "flex", flexDirection: "column", gap: 24,
                    animation: "fi .3s ease both"
                }}>
                    <Link to="/pricing" style={{ fontSize: 18, fontWeight: 700, color: T.text, textDecoration: "none" }}>Pricing</Link>
                    {user ? (
                        <Link to="/dashboard" style={{ fontSize: 18, fontWeight: 700, color: T.accent, textDecoration: "none" }}>Go to Dashboard</Link>
                    ) : (
                        <>
                            <Link to="/login" style={{ fontSize: 18, fontWeight: 700, color: T.text, textDecoration: "none" }}>Login</Link>
                            <Link to="/signup" style={{ fontSize: 18, fontWeight: 700, color: T.accent, textDecoration: "none" }}>Sign Up Free</Link>
                        </>
                    )}
                </div>
            )}

            {/* Hero */}
            <div style={{ maxWidth: 800, margin: "0 auto", padding: "80px 24px 60px", textAlign: "center" }}>
                <div>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 16px", borderRadius: 100, background: `${T.accent}10`, border: `1px solid ${T.accent}25`, marginBottom: 24, animation: "fi .6s ease both" }}>
                        <span style={{ width: 8, height: 8, borderRadius: 4, background: T.accent }}></span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: T.accent, letterSpacing: 0.5 }}>AI-POWERED ANALYSIS</span>
                    </div>
                    <h1 style={{ fontSize: "clamp(36px, 6vw, 56px)", fontWeight: 800, color: T.text, lineHeight: 1.1, marginBottom: 20, letterSpacing: -1.5, animation: "fi .8s ease .1s both" }}>
                        Institutional-Grade Stock<br />
                        Research <span style={{ background: `linear-gradient(135deg,${T.accent},${T.blue})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>In Seconds</span>
                    </h1>
                    <p style={{ fontSize: 18, color: T.textSec, lineHeight: 1.6, marginBottom: 40, maxWidth: 540, margin: "0 auto 48px", animation: "fi .8s ease .2s both" }}>
                        Stop guessing. Get deep, 7-step AI analysis on any ticker, grounded in real-time market data.
                    </p>
                </div>

                {/* Search */}
                <div style={{ display: "flex", gap: 10, maxWidth: 460, margin: "0 auto 32px", animation: "fi .8s ease .3s both", position: "relative" }}>
                    <input
                        type="text"
                        placeholder="ENTER TICKER (e.g. NVDA)"
                        value={ticker}
                        onChange={e => setTicker(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === "Enter" && go()}
                        style={{ flex: 1, padding: "16px 20px", borderRadius: 14, border: `2px solid ${T.border}`, background: T.surface, color: T.text, fontSize: 16, fontWeight: 700, fontFamily: "'IBM Plex Mono',monospace", outline: "none", letterSpacing: 1, transition: "border-color .2s" }}
                        onFocus={e => e.target.style.borderColor = T.accent}
                        onBlur={e => e.target.style.borderColor = T.border}
                    />
                    <button
                        onClick={() => go()}
                        disabled={!ticker.trim()}
                        style={{
                            padding: "0 32px", borderRadius: 14, border: "none",
                            background: `linear-gradient(135deg,${T.accent},#059669)`, color: "#FFF",
                            fontSize: 16, fontWeight: 700, cursor: !ticker.trim() ? "not-allowed" : "pointer",
                            fontFamily: "'Space Grotesk',sans-serif", opacity: !ticker.trim() ? .6 : 1,
                            boxShadow: `0 10px 30px -10px ${T.accent}60`, transition: "transform .2s"
                        }}
                        onMouseEnter={e => !(!ticker.trim()) && (e.target.style.transform = "translateY(-2px)")}
                        onMouseLeave={e => e.target.style.transform = "translateY(0)"}
                    >
                        Get Report
                    </button>
                </div>

                {/* Trending */}
                <div style={{ animation: "fi .6s ease .4s both", display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
                    <div style={{ fontSize: 13, color: T.textDim, fontWeight: 600 }}>TRENDING:</div>
                    {TRENDING.map(t => (
                        <button key={t} onClick={() => go(t)}
                            style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.textSec, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace", transition: "all .2s" }}
                            onMouseEnter={e => { e.target.style.borderColor = T.accent; e.target.style.color = T.accent; }}
                            onMouseLeave={e => { e.target.style.borderColor = T.border; e.target.style.color = T.textSec; }}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Social Proof */}
            <div style={{ background: T.surface, padding: "60px 24px", borderTop: `1px solid ${T.border}`, borderBottom: `1px solid ${T.border}` }}>
                <div style={{ maxWidth: 1000, margin: "0 auto", textAlign: "center" }}>
                    <h2 style={{ fontSize: 14, fontWeight: 700, color: T.textSec, letterSpacing: 1, textTransform: "uppercase", marginBottom: 32 }}>Trusted by Smart Investors</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32, alignItems: "center" }}>
                        <div style={{ textAlign: "left" }}>
                            <div style={{ fontSize: 48, fontWeight: 800, color: T.text, lineHeight: 1 }}>10k+</div>
                            <div style={{ fontSize: 14, color: T.textSec, marginTop: 4 }}>Reports Generated</div>
                        </div>
                        <div style={{ textAlign: "left" }}>
                            <div style={{ fontSize: 48, fontWeight: 800, color: T.text, lineHeight: 1 }}>$50M+</div>
                            <div style={{ fontSize: 14, color: T.textSec, marginTop: 4 }}>Assets Analyzed</div>
                        </div>
                        <div style={{ background: T.card, padding: 24, borderRadius: 16, border: `1px solid ${T.border}`, textAlign: "left", boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}>
                            <div style={{ fontSize: 16, lineHeight: 1.6, color: T.text, marginBottom: 16, fontStyle: "italic" }}>
                                "Stock Fortress does 2 hours of research in 30 seconds. It saves me from bad trades and finds the gems I would have missed."
                            </div>
                            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                                <div style={{ width: 32, height: 32, borderRadius: 16, background: T.accent, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12 }}>MT</div>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text }}>Michael T.</div>
                                    <div style={{ fontSize: 11, color: T.textDim }}>Individual Investor</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div style={{ maxWidth: 1000, margin: "0 auto", padding: "80px 24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
                    {FEATURES.map((f, i) => (
                        <div key={i} style={{ background: T.card, borderRadius: 20, border: `1px solid ${T.border}`, padding: "32px", transition: "transform .2s" }}>
                            <div style={{ fontSize: 40, marginBottom: 20 }}>{f.icon}</div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 12 }}>{f.title}</h3>
                            <p style={{ fontSize: 15, color: T.textSec, lineHeight: 1.6 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* FAQ */}
            <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px 80px" }}>
                <h2 style={{ fontSize: 32, fontWeight: 800, color: T.text, textAlign: "center", marginBottom: 48 }}>Frequently Asked Questions</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {FAQS.map((faq, i) => (
                        <div key={i} style={{ padding: 24, borderRadius: 16, border: `1px solid ${T.border}`, background: T.card }}>
                            <h3 style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 8 }}>{faq.q}</h3>
                            <p style={{ fontSize: 15, color: T.textSec, lineHeight: 1.6 }}>{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <footer style={{ borderTop: `1px solid ${T.border}`, padding: "60px 24px", background: T.surface }}>
                <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 40 }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 6, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ fontSize: 14, fontWeight: 800, color: "#fff", fontFamily: "'IBM Plex Mono',monospace" }}>SF</span>
                            </div>
                            <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Stock Fortress</span>
                        </div>
                        <p style={{ fontSize: 14, color: T.textSec, maxWidth: 260, lineHeight: 1.6 }}>
                            Democratizing institutional-grade financial research for everyone.
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: 48, flexWrap: "wrap" }}>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>Product</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                <Link to="/pricing" style={{ fontSize: 14, color: T.textSec, textDecoration: "none" }}>Pricing</Link>
                                <Link to="/login" style={{ fontSize: 14, color: T.textSec, textDecoration: "none" }}>Login</Link>
                                <Link to="/signup" style={{ fontSize: 14, color: T.textSec, textDecoration: "none" }}>Sign Up</Link>
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>Legal</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                <span style={{ fontSize: 14, color: T.textDim, cursor: "not-allowed" }}>Terms</span>
                                <span style={{ fontSize: 14, color: T.textDim, cursor: "not-allowed" }}>Privacy</span>
                                <span style={{ fontSize: 14, color: T.textDim, cursor: "not-allowed" }}>Disclaimer</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ maxWidth: 1000, margin: "60px auto 0", paddingTop: 32, borderTop: `1px solid ${T.border}80`, textAlign: "center", fontSize: 13, color: T.textDim }}>
                    © 2026 Stock Fortress. Not financial advice. Always do your own research.
                </div>
            </footer>
        </div>
    );
}
