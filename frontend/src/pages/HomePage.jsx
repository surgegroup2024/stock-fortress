import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { T, CSS } from "../theme";
import { useAuth } from "../components/AuthProvider";

/* ─── LOCAL DARK PALETTE (hero only) ─── */
const D = {
    bg: "#0A1628",
    card: "#112240",
    border: "#1E3A5F",
    text: "#E2E8F0",
    textDim: "#8892B0",
    accent: T.accent,        // #10B981
    accentGlow: "#10B98140",
};

const POPULAR = ["AAPL", "TSLA", "NVDA", "AMZN", "MSFT", "GOOGL"];

const FEATURES = [
    { icon: "📝", title: "Wall Street Rigor, Automated", desc: "Our AI runs a full institutional checklist—valuation, moat analysis, risk assessment—on every stock." },
    { icon: "📡", title: "Live Data, No Hallucinations", desc: "Grounded in up-to-the-minute prices, filings, and news. Not a recycled summary." },
    { icon: "🔔", title: "Never Miss a Move", desc: "Track candidates. Get notified when fundamentals shift or a stock enters your buy zone." },
];

const FAQS = [
    { q: "How is this different from ChatGPT?", a: "ChatGPT cuts off at a past date. Stock Fortress searches the live web for today's prices, news, and filings, then applies a strict financial analyst framework." },
    { q: "Is it really free?", a: "Yes. You get 3 full institutional-grade reports every month, forever. No credit card required." },
    { q: "What does the Pro plan include?", a: "Pro gives you 30 reports/month, priority processing, and export capabilities for just $7.99/mo." },
    { q: "Can I trust the AI analysis?", a: "We provide the data sources for every claim. AI is a powerful tool for synthesis, but always verify before investing." },
];

/* ─── DEMO ANIMATION FRAMES ─── */
const DEMO_FRAMES = [
    { label: "Enter ticker", typed: "", cursor: true },
    { label: "Enter ticker", typed: "N", cursor: true },
    { label: "Enter ticker", typed: "NV", cursor: true },
    { label: "Enter ticker", typed: "NVD", cursor: true },
    { label: "Enter ticker", typed: "NVDA", cursor: true },
    { label: "Analyzing...", typed: "NVDA", loading: true },
    { label: "Step 1 — Know What You Own", step: 1, content: "NVIDIA designs GPUs and AI accelerators powering data centers, gaming, and autonomous vehicles." },
    { label: "Step 3 — Growing or Slowing?", step: 3, content: "Revenue grew 122% YoY to $60.9B driven by explosive data center demand." },
    { label: "Step 7 — The Verdict", verdict: true, action: "BUY", confidence: "HIGH", reason: "Dominant AI infrastructure play with massive growth runway." },
    { label: "Try it yourself ↑", cta: true },
];

const HOME_CSS = `
    .hero-input:focus { border-color: ${D.accent} !important; box-shadow: 0 0 0 3px ${D.accentGlow} !important; }
    .hero-input::placeholder { color: ${D.textDim}; }
    .pill-btn { transition: all .2s ease; }
    .pill-btn:hover { background: ${D.accent} !important; color: #fff !important; border-color: ${D.accent} !important; }
    .research-btn { transition: all .2s ease; }
    .research-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 12px 32px -8px ${D.accentGlow}; }
    .research-btn:active:not(:disabled) { transform: translateY(0); }
    .ac-item { transition: background .15s; cursor: pointer; }
    .ac-item:hover, .ac-item.ac-active { background: ${D.card} !important; }
    .demo-phone { animation: demoFloat 4s ease-in-out infinite; }
    @keyframes demoFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
    .sticky-cta { transform: translateY(100%); transition: transform .3s ease; }
    .sticky-cta.visible { transform: translateY(0); }
    .how-step { transition: transform .2s; }
    .how-step:hover { transform: translateY(-4px); }
    @keyframes typeCursor { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
    @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
    .verdict-glow { animation: verdictPulse 2s ease infinite; }
    @keyframes verdictPulse { 0%,100% { box-shadow: 0 0 20px ${D.accentGlow}; } 50% { box-shadow: 0 0 40px ${D.accentGlow}; } }
    @media (max-width: 600px) {
        .hero-search-row { flex-direction: column !important; }
        .hero-search-row input { border-radius: 12px !important; }
        .hero-search-row button { border-radius: 12px !important; width: 100% !important; }
    }
`;

export default function HomePage() {
    const { user } = useAuth();
    const [ticker, setTicker] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [activeIdx, setActiveIdx] = useState(-1);
    const [showAC, setShowAC] = useState(false);
    const [tickerData, setTickerData] = useState(null);
    const [demoFrame, setDemoFrame] = useState(0);
    const [showSticky, setShowSticky] = useState(false);
    const [error, setError] = useState("");
    const inputRef = useRef(null);
    const heroRef = useRef(null);
    const acRef = useRef(null);
    const navigate = useNavigate();

    // ─── LAZY LOAD TICKER DATA ───
    useEffect(() => {
        import("../data/tickers.json").then(m => setTickerData(m.default));
    }, []);

    // ─── AUTO-FOCUS (desktop only) ───
    useEffect(() => {
        const isMobile = "ontouchstart" in window || window.innerWidth < 768;
        if (!isMobile && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 500);
        }
    }, []);

    // ─── DEMO ANIMATION LOOP ───
    useEffect(() => {
        const delays = [800, 400, 400, 400, 600, 2500, 3000, 3000, 3500, 2500];
        const timer = setTimeout(() => {
            setDemoFrame(f => (f + 1) % DEMO_FRAMES.length);
        }, delays[demoFrame] || 1500);
        return () => clearTimeout(timer);
    }, [demoFrame]);

    // ─── STICKY CTA on scroll ───
    useEffect(() => {
        const onScroll = () => {
            if (!heroRef.current) return;
            const rect = heroRef.current.getBoundingClientRect();
            setShowSticky(rect.bottom < 0);
        };
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // ─── CLOSE AUTOCOMPLETE on outside click ───
    useEffect(() => {
        const onClick = (e) => {
            if (acRef.current && !acRef.current.contains(e.target)) setShowAC(false);
        };
        document.addEventListener("mousedown", onClick);
        return () => document.removeEventListener("mousedown", onClick);
    }, []);

    // ─── AUTOCOMPLETE FILTER ───
    const filtered = useMemo(() => {
        if (!tickerData || !ticker.trim()) return [];
        const q = ticker.toUpperCase().trim();
        return tickerData
            .filter(s => s.t.startsWith(q) || s.n.toUpperCase().includes(q))
            .slice(0, 8);
    }, [ticker, tickerData]);

    // ─── NAVIGATE TO REPORT ───
    const go = useCallback((t) => {
        const tk = (t || ticker).toUpperCase().trim();
        if (!tk) return;
        // Basic validation
        if (tk.length > 6 || !/^[A-Z.]+$/.test(tk)) {
            setError("Hmm, we don't recognize that ticker. Try AAPL, TSLA, or NVDA.");
            return;
        }
        setError("");
        if (window.posthog) {
            window.posthog.capture("homepage_ticker_submit", { ticker: tk });
        }
        navigate(`/report/${tk}`);
    }, [ticker, navigate]);

    // ─── INPUT HANDLER ───
    const onType = (e) => {
        const v = e.target.value.toUpperCase().replace(/[^A-Z.]/g, "");
        setTicker(v);
        setError("");
        setShowAC(v.length > 0);
        setActiveIdx(-1);
    };

    const onKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (activeIdx >= 0 && filtered[activeIdx]) {
                go(filtered[activeIdx].t);
            } else {
                go();
            }
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIdx(i => Math.min(i + 1, filtered.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIdx(i => Math.max(i - 1, -1));
        } else if (e.key === "Escape") {
            setShowAC(false);
        }
    };

    const selectTicker = (t) => {
        setTicker(t);
        setShowAC(false);
        go(t);
    };

    // ─── SCROLL TO INPUT ───
    const scrollToInput = () => {
        inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        setTimeout(() => inputRef.current?.focus(), 400);
    };

    // ─── CURRENT DEMO FRAME ───
    const frame = DEMO_FRAMES[demoFrame];

    return (
        <div style={{ minHeight: "100vh", fontFamily: "'Space Grotesk',sans-serif" }}>
            <style>{CSS}{HOME_CSS}</style>
            <Helmet>
                <title>Stock Fortress — Research Any Stock In 3 Minutes</title>
                <meta name="description" content="Free AI-powered stock research. Enter any ticker and get a full 7-step institutional-grade analysis in minutes. No signup required." />
                <link rel="canonical" href="https://stockfortress.app/" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
            </Helmet>

            {/* ════════════════════════════════════════════
                HERO — DARK, ABOVE THE FOLD
            ════════════════════════════════════════════ */}
            <div ref={heroRef} style={{
                background: D.bg,
                minHeight: "100dvh",
                display: "flex", flexDirection: "column",
                position: "relative", overflow: "hidden",
            }}>
                {/* Subtle gradient accent */}
                <div style={{
                    position: "absolute", top: -200, left: "50%", transform: "translateX(-50%)",
                    width: 600, height: 600, borderRadius: "50%",
                    background: `radial-gradient(circle, ${D.accentGlow} 0%, transparent 70%)`,
                    pointerEvents: "none", opacity: 0.3,
                }} />

                {/* ─── LOGO BAR ─── */}
                <div style={{
                    padding: "20px 24px",
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    maxWidth: 1000, margin: "0 auto", width: "100%",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                            width: 36, height: 36, borderRadius: 10,
                            background: `linear-gradient(135deg,${D.accent},#00C49A)`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            boxShadow: `0 4px 12px ${D.accentGlow}`,
                        }}>
                            <span style={{ fontSize: 15, fontWeight: 800, color: D.bg, fontFamily: "'IBM Plex Mono',monospace" }}>SF</span>
                        </div>
                        <span style={{ fontSize: 16, fontWeight: 700, color: D.text, letterSpacing: -0.3 }}>Stock Fortress</span>
                    </div>
                    {/* Minimal nav — login only, no clutter */}
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        {user ? (
                            <Link to="/dashboard" style={{ color: D.accent, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Dashboard →</Link>
                        ) : (
                            <Link to="/login" style={{ color: D.textDim, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Log in</Link>
                        )}
                    </div>
                </div>

                {/* ─── CENTERED CONTENT ─── */}
                <div style={{
                    flex: 1, display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                    padding: "0 24px 40px", maxWidth: 700, margin: "0 auto", width: "100%",
                    textAlign: "center",
                }}>
                    {/* HEADLINE */}
                    <h1 style={{
                        fontSize: "clamp(28px, 5vw, 40px)",
                        fontWeight: 800, color: "#FFFFFF",
                        lineHeight: 1.15, marginBottom: 32,
                        letterSpacing: -1, animation: "fi .6s ease both",
                    }}>
                        Research any stock in 3 minutes.
                    </h1>

                    {/* TICKER INPUT + BUTTON */}
                    <div ref={acRef} style={{ width: "100%", maxWidth: 520, position: "relative", zIndex: 100, animation: "fi .6s ease .15s both" }}>
                        <div className="hero-search-row" style={{ display: "flex", gap: 10 }}>
                            <input
                                ref={inputRef}
                                className="hero-input"
                                type="text"
                                placeholder="Enter any ticker... e.g. AAPL, TSLA, NVDA"
                                value={ticker}
                                onChange={onType}
                                onKeyDown={onKeyDown}
                                onFocus={() => ticker.length > 0 && setShowAC(true)}
                                autoComplete="off"
                                spellCheck="false"
                                style={{
                                    flex: 1, padding: "16px 20px", borderRadius: "12px 0 0 12px",
                                    border: `2px solid ${D.border}`, background: D.card,
                                    color: "#FFFFFF", fontSize: 16, fontWeight: 600,
                                    fontFamily: "'IBM Plex Mono',monospace",
                                    outline: "none", letterSpacing: 1,
                                    minHeight: 56, transition: "border-color .2s, box-shadow .2s",
                                }}
                            />
                            <button
                                className="research-btn"
                                onClick={() => go()}
                                disabled={!ticker.trim()}
                                style={{
                                    padding: "0 28px", borderRadius: "0 12px 12px 0",
                                    border: "none", background: D.accent,
                                    color: "#FFFFFF", fontSize: 16, fontWeight: 700,
                                    cursor: !ticker.trim() ? "not-allowed" : "pointer",
                                    fontFamily: "'Space Grotesk',sans-serif",
                                    opacity: !ticker.trim() ? 0.5 : 1,
                                    minHeight: 56, whiteSpace: "nowrap",
                                }}
                            >
                                → Research
                            </button>
                        </div>

                        {/* AUTOCOMPLETE DROPDOWN */}
                        {showAC && filtered.length > 0 && (
                            <div style={{
                                position: "absolute", top: "100%", left: 0, right: 0,
                                background: D.card, border: `1px solid ${D.border}`,
                                borderRadius: 12, marginTop: 4, overflow: "hidden",
                                boxShadow: "0 12px 40px rgba(0,0,0,0.4)", zIndex: 50,
                            }}>
                                {filtered.map((s, i) => (
                                    <div
                                        key={s.t}
                                        className={`ac-item${i === activeIdx ? " ac-active" : ""}`}
                                        onMouseDown={() => selectTicker(s.t)}
                                        style={{
                                            padding: "12px 16px", display: "flex", justifyContent: "space-between",
                                            alignItems: "center", borderBottom: i < filtered.length - 1 ? `1px solid ${D.border}40` : "none",
                                        }}
                                    >
                                        <span style={{ fontWeight: 700, color: D.accent, fontFamily: "'IBM Plex Mono',monospace", fontSize: 14 }}>{s.t}</span>
                                        <span style={{ color: D.textDim, fontSize: 13, textAlign: "right" }}>{s.n}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* ERROR */}
                        {error && (
                            <div style={{ marginTop: 8, fontSize: 13, color: T.danger, textAlign: "left", animation: "fi .3s ease both" }}>
                                {error}
                            </div>
                        )}
                    </div>

                    {/* POPULAR TICKERS */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", justifyContent: "center", marginTop: 16, animation: "fi .6s ease .3s both" }}>
                        <span style={{ fontSize: 12, color: D.textDim, fontWeight: 600, letterSpacing: 0.5 }}>POPULAR:</span>
                        {POPULAR.map(t => (
                            <button
                                key={t}
                                className="pill-btn"
                                onClick={() => go(t)}
                                style={{
                                    padding: "6px 14px", borderRadius: 20,
                                    border: `1px solid ${D.border}`, background: "transparent",
                                    color: D.textDim, fontSize: 13, fontWeight: 600,
                                    cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace",
                                }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    {/* TRUST LINE */}
                    <p style={{ fontSize: 14, color: D.textDim, marginTop: 16, animation: "fi .6s ease .4s both" }}>
                        Free. No signup. No credit card.
                    </p>

                    {/* ─── CSS DEMO MOCKUP ─── */}
                    <div
                        className="demo-phone"
                        onClick={scrollToInput}
                        style={{
                            marginTop: 40, width: "100%", maxWidth: 360,
                            background: D.card, borderRadius: 20,
                            border: `1px solid ${D.border}`,
                            boxShadow: `0 20px 60px -20px rgba(0,0,0,0.5)`,
                            overflow: "hidden", cursor: "pointer",
                            animation: "fi .6s ease .5s both",
                        }}
                    >
                        {/* Mock status bar */}
                        <div style={{
                            padding: "10px 16px 8px", background: "#0D1B30",
                            display: "flex", justifyContent: "space-between", alignItems: "center",
                            borderBottom: `1px solid ${D.border}40`,
                        }}>
                            <span style={{ fontSize: 11, color: D.textDim, fontWeight: 600 }}>Stock Fortress</span>
                            <span style={{ fontSize: 11, color: D.textDim }}>{frame.label}</span>
                        </div>

                        {/* Demo content */}
                        <div style={{ padding: 20, minHeight: 180 }}>
                            {/* Typing / Loading frames */}
                            {(frame.cursor || frame.loading) && (
                                <div>
                                    <div style={{
                                        padding: "12px 16px", borderRadius: 10,
                                        border: `1px solid ${frame.loading ? D.accent : D.border}`,
                                        background: "#0D1B30", display: "flex", alignItems: "center",
                                        gap: 8, marginBottom: 12,
                                    }}>
                                        <span style={{ color: "#FFF", fontFamily: "'IBM Plex Mono',monospace", fontSize: 15, fontWeight: 600 }}>
                                            {frame.typed}
                                        </span>
                                        {frame.cursor && (
                                            <span style={{ width: 2, height: 18, background: D.accent, animation: "typeCursor 1s step-end infinite" }} />
                                        )}
                                    </div>
                                    {frame.loading && (
                                        <div style={{ textAlign: "center" }}>
                                            <div style={{
                                                width: 28, height: 28, borderRadius: 14,
                                                border: `3px solid ${D.border}`, borderTopColor: D.accent,
                                                animation: "spin .8s linear infinite",
                                                margin: "16px auto 8px",
                                            }} />
                                            <span style={{ fontSize: 12, color: D.textDim }}>Analyzing NVDA...</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Step content frames */}
                            {frame.step && (
                                <div style={{ animation: "fi .4s ease both" }}>
                                    <div style={{
                                        fontSize: 10, color: D.accent, fontWeight: 700,
                                        letterSpacing: 0.5, marginBottom: 8,
                                    }}>STEP {frame.step} OF 7</div>
                                    <div style={{
                                        padding: 14, borderRadius: 10, background: "#0D1B30",
                                        border: `1px solid ${D.border}40`,
                                    }}>
                                        <div style={{ fontSize: 12, color: D.text, lineHeight: 1.6 }}>{frame.content}</div>
                                    </div>
                                </div>
                            )}

                            {/* Verdict frame */}
                            {frame.verdict && (
                                <div className="verdict-glow" style={{
                                    animation: "fi .4s ease both",
                                    textAlign: "center", padding: "16px 0",
                                    borderRadius: 12, background: `${D.accent}10`,
                                    border: `1px solid ${D.accent}40`,
                                }}>
                                    <div style={{ fontSize: 28, marginBottom: 4 }}>▲</div>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: D.accent, letterSpacing: 2, fontFamily: "'IBM Plex Mono',monospace" }}>{frame.action}</div>
                                    <div style={{ marginTop: 6, fontSize: 11, color: D.textDim }}>Confidence: <span style={{ color: D.accent, fontWeight: 700 }}>{frame.confidence}</span></div>
                                    <div style={{ fontSize: 12, color: D.text, marginTop: 8, lineHeight: 1.5, padding: "0 12px" }}>{frame.reason}</div>
                                </div>
                            )}

                            {/* CTA frame */}
                            {frame.cta && (
                                <div style={{ textAlign: "center", padding: "36px 0", animation: "fi .4s ease both" }}>
                                    <div style={{ fontSize: 20, marginBottom: 8 }}>☝️</div>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: D.accent }}>Try it yourself</div>
                                    <div style={{ fontSize: 12, color: D.textDim, marginTop: 4 }}>Enter any ticker above</div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ─── SOCIAL PROOF ─── */}
                    <div style={{ marginTop: 32, animation: "fi .6s ease .6s both" }}>
                        <p style={{ fontSize: 14, color: D.textDim, marginBottom: 10 }}>
                            📊 <strong style={{ color: D.text }}>2,847</strong> stocks researched this week
                        </p>
                        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", fontSize: 12, color: D.textDim }}>
                            <span>✓ Any US & Canada stock</span>
                            <span>✓ AI-powered</span>
                            <span>✓ Results in 3 minutes</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ════════════════════════════════════════════
                BELOW THE FOLD — LIGHT THEME
            ════════════════════════════════════════════ */}

            {/* ─── HOW IT WORKS ─── */}
            <div style={{ background: T.bg, padding: "80px 24px", borderTop: `1px solid ${T.border}` }}>
                <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
                    <h2 style={{ fontSize: 28, fontWeight: 800, color: T.text, marginBottom: 48, letterSpacing: -0.5 }}>How It Works</h2>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 32 }}>
                        {[
                            { num: "1", icon: "🔍", title: "Enter a Ticker", desc: "Type any US or Canadian stock symbol" },
                            { num: "2", icon: "🤖", title: "AI Researches", desc: "7-step institutional analysis in real-time" },
                            { num: "3", icon: "✅", title: "Get Your Verdict", desc: "Buy, Watch, or Avoid — with full reasoning" },
                        ].map((s, i) => (
                            <div key={i} className="how-step" style={{
                                background: T.card, borderRadius: 16, padding: 28,
                                border: `1px solid ${T.border}`,
                                boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
                            }}>
                                <div style={{ fontSize: 36, marginBottom: 12 }}>{s.icon}</div>
                                <div style={{
                                    width: 28, height: 28, borderRadius: 14,
                                    background: T.accentDim, color: T.accent,
                                    fontSize: 14, fontWeight: 800,
                                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                                    marginBottom: 12,
                                }}>{s.num}</div>
                                <h3 style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 8 }}>{s.title}</h3>
                                <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6 }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── FEATURES ─── */}
            <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px 80px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 24 }}>
                    {FEATURES.map((f, i) => (
                        <div key={i} style={{
                            background: T.card, borderRadius: 20,
                            border: `1px solid ${T.border}`, padding: 32,
                            transition: "transform .2s",
                        }}>
                            <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                            <h3 style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 10 }}>{f.title}</h3>
                            <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6 }}>{f.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── FAQ ─── */}
            <div style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px 80px" }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, color: T.text, textAlign: "center", marginBottom: 40 }}>Frequently Asked Questions</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {FAQS.map((faq, i) => (
                        <div key={i} style={{ padding: 24, borderRadius: 16, border: `1px solid ${T.border}`, background: T.card }}>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 8 }}>{faq.q}</h3>
                            <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6 }}>{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* ─── FOOTER ─── */}
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
                                <Link to="/blog" style={{ fontSize: 14, color: T.textSec, textDecoration: "none" }}>Blog</Link>
                                <Link to="/login" style={{ fontSize: 14, color: T.textSec, textDecoration: "none" }}>Login</Link>
                                <Link to="/signup" style={{ fontSize: 14, color: T.textSec, textDecoration: "none" }}>Sign Up</Link>
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 16, textTransform: "uppercase", letterSpacing: 1 }}>Legal</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                                <Link to="/terms" style={{ fontSize: 14, color: T.textDim, textDecoration: "none" }}>Terms</Link>
                                <Link to="/privacy" style={{ fontSize: 14, color: T.textDim, textDecoration: "none" }}>Privacy</Link>
                                <Link to="/disclaimer" style={{ fontSize: 14, color: T.textDim, textDecoration: "none" }}>Disclaimer</Link>
                            </div>
                        </div>
                    </div>
                </div>
                <div style={{ maxWidth: 1000, margin: "60px auto 0", paddingTop: 32, borderTop: `1px solid ${T.border}80`, textAlign: "center", fontSize: 13, color: T.textDim }}>
                    © 2026 Stock Fortress. Not financial advice. Always do your own research.
                </div>
            </footer>

            {/* ─── MOBILE STICKY CTA ─── */}
            <div
                className={`sticky-cta${showSticky ? " visible" : ""}`}
                onClick={scrollToInput}
                style={{
                    position: "fixed", bottom: 0, left: 0, right: 0,
                    padding: "12px 24px",
                    paddingBottom: "max(12px, env(safe-area-inset-bottom))",
                    background: D.bg, borderTop: `1px solid ${D.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    cursor: "pointer", zIndex: 1000,
                    boxShadow: "0 -4px 20px rgba(0,0,0,0.3)",
                }}
            >
                <span style={{ fontSize: 16 }}>🔍</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: D.accent }}>Research a stock</span>
            </div>
        </div>
    );
}
