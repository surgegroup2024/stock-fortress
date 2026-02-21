import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { T, CSS } from "../theme";

const VERDICT_COLORS = {
    BUY: { bg: "#059669", text: "#FFF", label: "BUY — Bullish" },
    WATCH: { bg: "#D97706", text: "#FFF", label: "WATCH — Neutral" },
    AVOID: { bg: "#DC2626", text: "#FFF", label: "AVOID — Bearish" },
};

const SITE_URL = "https://stockfortress.com";
const CURRENT_YEAR = new Date().getFullYear();

// ─── SEO HELPERS ───
function getSeoTitle(post) {
    const company = post.company_name || post.ticker;
    const verdict = post.verdict || "Watch";
    const verdictText = verdict === "BUY" ? "Buy or Wait" : verdict === "AVOID" ? "Buy or Avoid" : "Buy, Watch, or Avoid";
    return `${company} (${post.ticker}) Stock Analysis ${CURRENT_YEAR}: ${verdictText}? | Stock Fortress`;
}

function getMetaDescription(post) {
    const company = post.company_name || post.ticker;
    const verdict = post.verdict || "Watch";
    const date = new Date(post.created_at || Date.now());
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const year = date.getFullYear();
    return `AI-powered 7-step analysis of ${company} (${post.ticker}). Financial health, valuation, risks, and verdict: ${verdict}. Updated ${month} ${year}. Free stock research.`;
}

function getCanonicalUrl(post) {
    return `${SITE_URL}/blog/${post.ticker.toLowerCase()}-stock-analysis`;
}

function getArticleJsonLd(post) {
    const company = post.company_name || post.ticker;
    const created = post.created_at || new Date().toISOString();
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": getSeoTitle(post).replace(" | Stock Fortress", ""),
        "description": getMetaDescription(post),
        "datePublished": created,
        "dateModified": post.updated_at || created,
        "author": {
            "@type": "Organization",
            "name": "Stock Fortress",
            "url": SITE_URL,
        },
        "publisher": {
            "@type": "Organization",
            "name": "Stock Fortress",
            "logo": {
                "@type": "ImageObject",
                "url": `${SITE_URL}/icon-512.png`,
            },
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": getCanonicalUrl(post),
        },
        "about": {
            "@type": "FinancialProduct",
            "name": `${company} (${post.ticker})`,
            "tickerSymbol": post.ticker,
        },
    };
}

function getBreadcrumbJsonLd(post) {
    const company = post.company_name || post.ticker;
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": `${SITE_URL}/` },
            { "@type": "ListItem", "position": 2, "name": "Research Blog", "item": `${SITE_URL}/blog` },
            { "@type": "ListItem", "position": 3, "name": `${company} (${post.ticker}) Analysis` },
        ],
    };
}


// ─── MARKDOWN RENDERER ───
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
        text = text.replace(/\*\*(.+?)\*\*/g, "⟪b⟫$1⟪/b⟫");
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

        if (line.startsWith("## ")) {
            flushList();
            elements.push(
                <h2 key={`h2-${i}`} style={{ fontSize: 22, fontWeight: 800, color: T.text, marginTop: 32, marginBottom: 12, letterSpacing: -0.5 }}>
                    {line.slice(3)}
                </h2>
            );
            continue;
        }

        if (line.startsWith("### ")) {
            flushList();
            elements.push(
                <h3 key={`h3-${i}`} style={{ fontSize: 18, fontWeight: 700, color: T.text, marginTop: 24, marginBottom: 8 }}>
                    {line.slice(4)}
                </h3>
            );
            continue;
        }

        if (line.match(/^[-*] /)) {
            inList = true;
            listItems.push(line.slice(2));
            continue;
        }

        if (line.trim() === "") {
            flushList();
            continue;
        }

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


// ─── CTA BOX COMPONENT ───
function CtaBox({ ticker }) {
    return (
        <div style={{
            margin: "32px 0", padding: "28px", borderRadius: 16,
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
            border: `1px solid ${T.accent}30`, textAlign: "center",
        }}>
            <div style={{ fontSize: 20, marginBottom: 8 }}>📊</div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#FFF", marginBottom: 8 }}>
                Research {ticker} Yourself
            </h3>
            <p style={{ fontSize: 14, color: "#94A3B8", marginBottom: 16, lineHeight: 1.5 }}>
                Want the full interactive report? Run your own 7-step analysis.
            </p>
            <Link to={`/report/${ticker}`} style={{
                display: "inline-block", padding: "14px 32px", borderRadius: 12,
                background: `linear-gradient(135deg,${T.accent},#059669)`, color: "#FFF",
                fontSize: 15, fontWeight: 700, textDecoration: "none",
                boxShadow: `0 8px 25px -6px ${T.accent}50`,
                transition: "transform .2s ease",
            }}
                onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
                onMouseLeave={e => e.target.style.transform = "translateY(0)"}
            >
                Research {ticker} Now — Free →
            </Link>
        </div>
    );
}


// ─── RELATED POSTS COMPONENT ───
function RelatedPosts({ posts }) {
    if (!posts || posts.length === 0) return null;
    const vc = (v) => VERDICT_COLORS[v] || VERDICT_COLORS.WATCH;
    return (
        <div style={{
            marginTop: 40, padding: "28px", borderRadius: 16,
            background: T.card, border: `1px solid ${T.border}`,
        }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 16 }}>
                Related Stock Analysis
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {posts.map((p, i) => (
                    <Link key={i} to={`/blog/${p.slug}`} style={{
                        textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "12px 16px", borderRadius: 10, background: T.surface, border: `1px solid ${T.border}`,
                        transition: "all .2s",
                    }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.transform = "translateX(4px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateX(0)"; }}
                    >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{
                                padding: "3px 8px", borderRadius: 5, fontSize: 12, fontWeight: 700,
                                fontFamily: "'IBM Plex Mono',monospace", background: `${T.accent}15`, color: T.accent,
                            }}>{p.ticker}</span>
                            <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
                                {p.company_name || p.ticker} Stock Analysis
                            </span>
                        </div>
                        {p.verdict && (
                            <span style={{
                                padding: "3px 8px", borderRadius: 5, fontSize: 11, fontWeight: 700,
                                background: vc(p.verdict).bg, color: vc(p.verdict).text,
                            }}>{p.verdict}</span>
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );
}


// ─── MAIN PAGE COMPONENT ───
export default function BlogPostPage() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);
    const [relatedPosts, setRelatedPosts] = useState([]);

    useEffect(() => {
        setLoading(true);
        fetch(`/api/blog/${slug}`)
            .then(r => {
                if (!r.ok) throw new Error("Not found");
                return r.json();
            })
            .then(data => {
                setPost(data);
                // Fetch related posts
                fetch(`/api/blog/${slug}/related`)
                    .then(r => r.json())
                    .then(d => setRelatedPosts(d.posts || []))
                    .catch(() => { });
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
    const seoTitle = getSeoTitle(post);
    const metaDesc = getMetaDescription(post);
    const canonicalUrl = getCanonicalUrl(post);
    const companyName = post.company_name || post.ticker;

    return (
        <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Space Grotesk',sans-serif" }}>
            <style>{CSS}</style>
            <Helmet>
                {/* SEO Title (Task 2) */}
                <title>{seoTitle}</title>

                {/* Meta Description (Task 3) */}
                <meta name="description" content={metaDesc} />

                {/* Canonical URL (Task 4) */}
                <link rel="canonical" href={canonicalUrl} />

                {/* Open Graph (Task 5) */}
                <meta property="og:type" content="article" />
                <meta property="og:title" content={seoTitle.replace(" | Stock Fortress", "")} />
                <meta property="og:description" content={metaDesc} />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:image" content={`${SITE_URL}/icon-512.png`} />
                <meta property="og:site_name" content="Stock Fortress" />

                {/* Twitter Card (Task 5) */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={seoTitle.replace(" | Stock Fortress", "")} />
                <meta name="twitter:description" content={metaDesc} />
                <meta name="twitter:image" content={`${SITE_URL}/icon-512.png`} />

                {/* Structured Data — Article (Task 6) */}
                <script type="application/ld+json">
                    {JSON.stringify(getArticleJsonLd(post))}
                </script>

                {/* Structured Data — Breadcrumb (Task 8) */}
                <script type="application/ld+json">
                    {JSON.stringify(getBreadcrumbJsonLd(post))}
                </script>
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

            {/* Breadcrumb Navigation (Task 8) */}
            <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px 8px" }}>
                <nav aria-label="breadcrumb" style={{ fontSize: 13, color: T.textDim }}>
                    <Link to="/" style={{ color: T.textSec, textDecoration: "none" }}>Home</Link>
                    <span style={{ margin: "0 6px", color: T.textDim }}>›</span>
                    <Link to="/blog" style={{ color: T.textSec, textDecoration: "none" }}>Research Blog</Link>
                    <span style={{ margin: "0 6px", color: T.textDim }}>›</span>
                    <span style={{ color: T.text }}>{companyName} ({post.ticker}) Analysis</span>
                </nav>
            </div>

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

                    {/* H1 — Creative title (Task 7: only one H1 per page) */}
                    <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 800, color: T.text, lineHeight: 1.2, marginBottom: 16, letterSpacing: -0.8 }}>
                        {post.title}
                    </h1>

                    {/* Published info with verdict (Task 7) */}
                    <p style={{ fontSize: 13, color: T.textDim, lineHeight: 1.6, marginBottom: 0 }}>
                        Published {formatDate(post.created_at)} · AI-Generated Analysis · Verdict: <strong style={{ color: vc.bg }}>{post.verdict || "WATCH"}</strong>
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 28, height: 28, borderRadius: 14, background: T.accent, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#FFF", fontFamily: "'IBM Plex Mono',monospace" }}>SF</span>
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{post.author_name}</span>
                        </div>
                        <span style={{ fontSize: 12, color: T.textDim }}>{post.views || 0} views</span>
                    </div>
                </div>

                {/* Divider */}
                <div style={{ height: 1, background: T.border, marginBottom: 32 }} />

                {/* Teaser Content — truncated to ~150 words */}
                <div style={{ animation: "fi .6s ease .1s both" }}>
                    {renderMarkdown((() => {
                        const words = (post.content || "").split(/\s+/);
                        if (words.length <= 150) return post.content;
                        return words.slice(0, 150).join(" ") + "...";
                    })())}
                </div>

                {/* CTA Box — Early Hook (Task 8) */}
                <CtaBox ticker={post.ticker} />

                {/* ── PREMIUM CONTENT GATE ── */}
                <div style={{ position: "relative", marginTop: 8 }}>
                    <div style={{
                        filter: "blur(5px)", WebkitFilter: "blur(5px)", userSelect: "none", pointerEvents: "none",
                        color: T.textDim, fontSize: 14, lineHeight: 1.8, padding: "20px 0"
                    }}>
                        <p>Detailed financial analysis reveals that the company's revenue growth trajectory has maintained strong momentum with key metrics indicating...</p>
                        <p>The DCF valuation model suggests a fair value range between $XXX and $XXX based on conservative growth assumptions and a WACC of...</p>
                        <p>Risk assessment scoring indicates moderate volatility with primary risks concentrated in competitive positioning and regulatory changes...</p>
                        <p>Earnings guidance for the upcoming quarter suggests management confidence with revenue expected to reach...</p>
                    </div>
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
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(seoTitle)}&url=${encodeURIComponent(canonicalUrl)}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{
                            padding: "10px 20px", borderRadius: 10, background: "#1DA1F2", color: "#FFF",
                            fontSize: 13, fontWeight: 600, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6
                        }}>
                        𝕏 Share
                    </a>
                    <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(canonicalUrl)}`}
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

                {/* Related Posts (Task 8) */}
                <RelatedPosts posts={relatedPosts} />
            </article>
        </div>
    );
}
