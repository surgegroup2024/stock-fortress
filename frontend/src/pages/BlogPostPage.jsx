import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { T, CSS } from "../theme";

const VERDICT_COLORS = {
    BUY: { bg: "#059669", text: "#FFF", label: "BUY — Bullish" },
    WATCH: { bg: "#D97706", text: "#FFF", label: "WATCH — Neutral" },
    AVOID: { bg: "#DC2626", text: "#FFF", label: "AVOID — Bearish" },
};

// Simple markdown-to-JSX renderer for blog content
function renderMarkdown(md) {
    if (!md) return null;
    const lines = md.split("\n");
    const elements = [];
    let inList = false;
    let listItems = [];

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} style={{ paddingLeft: 20, marginBottom: 16 }}>
                    {listItems.map((item, i) => (
                        <li key={i} style={{ fontSize: 15, color: T.textSec, lineHeight: 1.7, marginBottom: 6 }}>
                            {renderInline(item)}
                        </li>
                    ))}
                </ul>
            );
            listItems = [];
        }
        inList = false;
    };

    const renderInline = (text) => {
        // Bold
        text = text.replace(/\*\*(.+?)\*\*/g, "⟪b⟫$1⟪/b⟫");
        // Italic
        text = text.replace(/\*(.+?)\*/g, "⟪i⟫$1⟪/i⟫");

        const parts = text.split(/(⟪\/?[bi]⟫)/);
        const result = [];
        let bold = false, italic = false;
        for (const part of parts) {
            if (part === "⟪b⟫") { bold = true; continue; }
            if (part === "⟪/b⟫") { bold = false; continue; }
            if (part === "⟪i⟫") { italic = true; continue; }
            if (part === "⟪/i⟫") { italic = false; continue; }
            if (part) {
                result.push(
                    <span key={result.length} style={{ fontWeight: bold ? 700 : 400, fontStyle: italic ? "italic" : "normal" }}>
                        {part}
                    </span>
                );
            }
        }
        return result;
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // Heading 2
        if (line.startsWith("## ")) {
            flushList();
            elements.push(
                <h2 key={`h2-${i}`} style={{ fontSize: 22, fontWeight: 800, color: T.text, marginTop: 32, marginBottom: 12, letterSpacing: -0.5 }}>
                    {line.slice(3)}
                </h2>
            );
            continue;
        }

        // Heading 3
        if (line.startsWith("### ")) {
            flushList();
            elements.push(
                <h3 key={`h3-${i}`} style={{ fontSize: 18, fontWeight: 700, color: T.text, marginTop: 24, marginBottom: 8 }}>
                    {line.slice(4)}
                </h3>
            );
            continue;
        }

        // List items
        if (line.match(/^[-*] /)) {
            inList = true;
            listItems.push(line.slice(2));
            continue;
        }

        // Empty line
        if (line.trim() === "") {
            flushList();
            continue;
        }

        // Paragraph
        flushList();
        elements.push(
            <p key={`p-${i}`} style={{ fontSize: 15, color: T.textSec, lineHeight: 1.75, marginBottom: 16 }}>
                {renderInline(line)}
            </p>
        );
    }
    flushList();
    return elements;
}

export default function BlogPostPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [ticker, setTicker] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/blog/${slug}`)
            .then(r => {
                if (!r.ok) throw new Error("Not found");
                return r.json();
            })
            .then(data => {
                setPost(data);
                setTicker(data.ticker || "");
            })
            .catch(() => setError("Article not found"))
            .finally(() => setLoading(false));
    }, [slug]);

    const formatDate = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
    };

    const shareUrl = typeof window !== "undefined" ? window.location.href : "";

    const copyLink = () => {
        navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Space Grotesk',sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <style>{CSS}</style>
                <div style={{ textAlign: "center", animation: "fi .5s ease both" }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg,${T.accent},#00C49A)`, display: "inline-flex", alignItems: "center", justifyContent: "center", animation: "pu 1.5s ease infinite" }}>
                        <span style={{ fontSize: 20, fontWeight: 800, color: T.bg, fontFamily: "'IBM Plex Mono',monospace" }}>SF</span>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !post) {
        return (
            <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Space Grotesk',sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24 }}>
                <style>{CSS}</style>
                <Helmet><title>Not Found — Stock Fortress</title></Helmet>
                <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>Article Not Found</div>
                <button onClick={() => navigate("/blog")} style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${T.accent},#059669)`, color: "#FFF", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif" }}>← Back to Blog</button>
            </div>
        );
    }

    const vc = VERDICT_COLORS[post.verdict] || VERDICT_COLORS.WATCH;

    return (
        <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Space Grotesk',sans-serif" }}>
            <style>{CSS}</style>
            <Helmet>
                <title>{post.title} — Stock Fortress Research</title>
                <meta name="description" content={post.excerpt} />
                <link rel="canonical" href={`https://stockfortress.app/blog/${slug}`} />
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={post.excerpt} />
                <meta property="og:type" content="article" />
                <meta name="twitter:card" content="summary_large_image" />
            </Helmet>

            {/* Top Nav */}
            <nav style={{
                maxWidth: 720, margin: "0 auto", padding: "16px 24px",
                display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
                <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${T.accent},#00C49A)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 14, fontWeight: 800, color: "#0F172A", fontFamily: "'IBM Plex Mono',monospace" }}>SF</span>
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Stock Fortress</span>
                </Link>
                <Link to="/blog" style={{ fontSize: 13, fontWeight: 600, color: T.textSec, textDecoration: "none" }}>← All Articles</Link>
            </nav>

            {/* Article */}
            <article style={{ maxWidth: 720, margin: "0 auto", padding: "20px 24px 80px" }}>
                {/* Header */}
                <div style={{ marginBottom: 32, animation: "fi .6s ease both" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
                        <span style={{
                            padding: "5px 14px", borderRadius: 8, fontSize: 13, fontWeight: 700,
                            fontFamily: "'IBM Plex Mono',monospace", background: `${T.accent}12`, color: T.accent, letterSpacing: 0.5
                        }}>{post.ticker}</span>
                        {post.verdict && (
                            <span style={{
                                padding: "5px 14px", borderRadius: 8, fontSize: 12, fontWeight: 700,
                                background: vc.bg, color: vc.text, letterSpacing: 0.5
                            }}>{vc.label}</span>
                        )}
                    </div>

                    <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: T.text, lineHeight: 1.2, marginBottom: 16, letterSpacing: -0.8 }}>
                        {post.title}
                    </h1>

                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 14, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#FFF", fontFamily: "'IBM Plex Mono',monospace" }}>SF</span>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{post.author_name}</span>
                        </div>
                        <span style={{ fontSize: 12, color: T.textDim }}>{formatDate(post.created_at)}</span>
                        <span style={{ fontSize: 12, color: T.textDim }}>{post.views || 0} views</span>
                    </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: T.border, marginBottom: 32 }} />

                {/* Teaser Content */}
                <div style={{ animation: "fi .6s ease .1s both" }}>
                    {renderMarkdown(post.content)}
                </div>

                {/* ── PREMIUM CONTENT GATE ── */}
                <div style={{ position: "relative", marginTop: 8 }}>
                    {/* Blurred/Faded placeholder text */}
                    <div style={{
                        filter: "blur(5px)", WebkitFilter: "blur(5px)", userSelect: "none", pointerEvents: "none",
                        color: T.textDim, fontSize: 14, lineHeight: 1.8, padding: "20px 0"
                    }}>
                        <p>Detailed financial analysis reveals that the company's revenue growth trajectory has maintained strong momentum with key metrics indicating...</p>
                        <p>The DCF valuation model suggests a fair value range between $XXX and $XXX based on conservative growth assumptions and a WACC of...</p>
                        <p>Risk assessment scoring indicates moderate volatility with primary risks concentrated in competitive positioning and regulatory changes...</p>
                        <p>Earnings guidance for the upcoming quarter suggests management confidence with revenue expected to reach...</p>
                    </div>

                    {/* Gradient Overlay */}
                    <div style={{
                        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
                        background: `linear-gradient(180deg, ${T.bg}00 0%, ${T.bg}CC 25%, ${T.bg} 50%)`,
                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end",
                        paddingBottom: 20
                    }} />
                </div>

                {/* Unlock CTA Box */}
                <div style={{
                    marginTop: 0, padding: "36px 28px", borderRadius: 18,
                    background: "linear-gradient(135deg, #0F172A, #1E293B)",
                    border: `1px solid ${T.accent}30`, textAlign: "center",
                    position: "relative", zIndex: 2
                }}>
                    <div style={{
                        width: 56, height: 56, borderRadius: 14,
                        background: `linear-gradient(135deg,${T.accent},#00C49A)`,
                        display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16
                    }}>
                        <span style={{ fontSize: 24 }}>🔓</span>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#FFF", marginBottom: 8 }}>
                        Unlock the Full Report
                    </div>
                    <div style={{ fontSize: 14, color: "#94A3B8", marginBottom: 20, lineHeight: 1.6 }}>
                        This article is a preview. Get the complete <strong style={{ color: "#FFF" }}>7-step institutional analysis</strong> including:
                    </div>

                    <div style={{
                        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, maxWidth: 400, margin: "0 auto 24px",
                        textAlign: "left"
                    }}>
                        {["📊 Detailed Financials", "🎯 Valuation Model", "⚠️ Risk Matrix", "💰 Earnings Deep-Dive",
                            "📈 Technical Signals", "🏁 Actionable Verdict"].map((item, i) => (
                                <div key={i} style={{ fontSize: 13, color: "#CBD5E1", display: "flex", alignItems: "center", gap: 6 }}>
                                    {item}
                                </div>
                            ))}
                    </div>

                    <Link to={`/report/${post.ticker}`} style={{
                        display: "inline-block", padding: "16px 36px", borderRadius: 14,
                        background: `linear-gradient(135deg,${T.accent},#059669)`, color: "#FFF",
                        fontSize: 16, fontWeight: 700, textDecoration: "none",
                        boxShadow: `0 12px 35px -10px ${T.accent}60`,
                        transition: "transform .2s ease, box-shadow .2s ease"
                    }}
                        onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = `0 16px 40px -8px ${T.accent}80`; }}
                        onMouseLeave={e => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = `0 12px 35px -10px ${T.accent}60`; }}
                    >
                        Analyze {post.ticker} — Full Report →
                    </Link>
                    <div style={{ fontSize: 12, color: "#64748B", marginTop: 12 }}>
                        Free preview • Sign up for unlimited reports
                    </div>
                </div>

                {/* Disclaimer */}
                <div style={{
                    marginTop: 32, padding: 20, borderRadius: 12, background: `${T.warn}08`,
                    border: `1px solid ${T.warn}20`, fontSize: 12, color: T.textDim, lineHeight: 1.6
                }}>
                    <strong style={{ color: T.warn }}>⚠️ Disclaimer:</strong> This article is AI-generated research and does not constitute financial advice.
                    Always do your own due diligence before making investment decisions.
                </div>

                {/* Tags */}
                {post.tags?.length > 0 && (
                    <div style={{ marginTop: 24, display: "flex", gap: 8, flexWrap: "wrap" }}>
                        {post.tags.map((tag, i) => (
                            <span key={i} style={{
                                padding: "5px 12px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                                background: T.surface, color: T.textSec, border: `1px solid ${T.border}`
                            }}>#{tag}</span>
                        ))}
                    </div>
                )}

                {/* Share */}
                <div style={{ marginTop: 32, display: "flex", gap: 10, flexWrap: "wrap" }}>
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(shareUrl)}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{
                            padding: "10px 20px", borderRadius: 10, background: "#1DA1F2", color: "#FFF",
                            fontSize: 13, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6
                        }}>
                        𝕏 Share
                    </a>
                    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{
                            padding: "10px 20px", borderRadius: 10, background: "#0077B5", color: "#FFF",
                            fontSize: 13, fontWeight: 600, textDecoration: "none"
                        }}>
                        LinkedIn
                    </a>
                    <button onClick={copyLink} style={{
                        padding: "10px 20px", borderRadius: 10, border: `1px solid ${T.border}`,
                        background: "transparent", color: T.textSec, fontSize: 13, fontWeight: 600, cursor: "pointer",
                        fontFamily: "'Space Grotesk',sans-serif"
                    }}>
                        {copied ? "✓ Copied!" : "🔗 Copy Link"}
                    </button>
                </div>
            </article>
        </div>
    );
}
