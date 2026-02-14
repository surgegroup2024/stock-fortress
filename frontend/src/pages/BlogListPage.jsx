import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { T, CSS } from "../theme";

const VERDICT_COLORS = {
    BUY: { bg: "#059669", text: "#FFF" },
    WATCH: { bg: "#D97706", text: "#FFF" },
    AVOID: { bg: "#DC2626", text: "#FFF" },
};

export default function BlogListPage() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parseInt(searchParams.get("page") || "1", 10);
    const verdict = searchParams.get("verdict") || "";

    useEffect(() => {
        setLoading(true);
        let url = `/api/blog?page=${page}&limit=12`;
        if (verdict) url += `&verdict=${verdict}`;
        fetch(url)
            .then(r => r.json())
            .then(data => {
                setPosts(data.posts || []);
                setTotal(data.total || 0);
                setPages(data.pages || 1);
            })
            .catch(() => setPosts([]))
            .finally(() => setLoading(false));
    }, [page, verdict]);

    const setFilter = (v) => {
        const params = new URLSearchParams();
        if (v) params.set("verdict", v);
        setSearchParams(params);
    };

    const formatDate = (iso) => {
        const d = new Date(iso);
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
    };

    return (
        <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Space Grotesk',sans-serif" }}>
            <style>{CSS}</style>
            <Helmet>
                <title>Stock Research Blog — Stock Fortress</title>
                <meta name="description" content="AI-powered stock analysis articles. Deep research on trending tickers, earnings breakdowns, and investment insights." />
                <link rel="canonical" href="https://stockfortress.app/blog" />
            </Helmet>

            {/* Header */}
            <div style={{
                background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
                padding: "40px 24px 48px",
                textAlign: "center",
                borderBottom: `1px solid ${T.border}40`
            }}>
                <Link to="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: `linear-gradient(135deg,${T.accent},#00C49A)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 16, fontWeight: 800, color: "#0F172A", fontFamily: "'IBM Plex Mono',monospace" }}>SF</span>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: "#FFF" }}>Stock Fortress</span>
                </Link>
                <h1 style={{ fontSize: "clamp(28px, 5vw, 42px)", fontWeight: 800, color: "#FFF", lineHeight: 1.15, marginBottom: 12, letterSpacing: -1 }}>
                    Research <span style={{ background: `linear-gradient(135deg,${T.accent},${T.blue})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Blog</span>
                </h1>
                <p style={{ fontSize: 16, color: "#94A3B8", maxWidth: 500, margin: "0 auto 28px" }}>
                    AI-generated stock analysis articles. Updated daily.
                </p>

                {/* Filters */}
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                    {["", "BUY", "WATCH", "AVOID"].map(v => (
                        <button key={v} onClick={() => setFilter(v)} style={{
                            padding: "8px 18px", borderRadius: 20, border: `1px solid ${verdict === v ? T.accent : "#334155"}`,
                            background: verdict === v ? `${T.accent}20` : "transparent",
                            color: verdict === v ? T.accent : "#94A3B8",
                            fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif",
                            transition: "all .2s"
                        }}>
                            {v || "All"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Posts Grid */}
            <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 24px 80px" }}>
                {loading ? (
                    <div style={{ textAlign: "center", padding: 80 }}>
                        <div style={{ width: 48, height: 48, borderRadius: 12, background: `linear-gradient(135deg,${T.accent},#00C49A)`, display: "inline-flex", alignItems: "center", justifyContent: "center", animation: "pu 1.5s ease infinite" }}>
                            <span style={{ fontSize: 20, fontWeight: 800, color: T.bg, fontFamily: "'IBM Plex Mono',monospace" }}>SF</span>
                        </div>
                        <div style={{ fontSize: 14, color: T.textDim, marginTop: 16 }}>Loading articles...</div>
                    </div>
                ) : posts.length === 0 ? (
                    <div style={{ textAlign: "center", padding: 80 }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📝</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginBottom: 8 }}>No articles yet</div>
                        <div style={{ fontSize: 14, color: T.textSec, marginBottom: 24 }}>Blog posts are auto-generated when users run stock analyses.</div>
                        <Link to="/" style={{
                            display: "inline-block", padding: "12px 28px", borderRadius: 12,
                            background: `linear-gradient(135deg,${T.accent},#059669)`, color: "#FFF",
                            fontSize: 14, fontWeight: 700, textDecoration: "none"
                        }}>Run Your First Analysis →</Link>
                    </div>
                ) : (
                    <>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
                            {posts.map(post => {
                                const vc = VERDICT_COLORS[post.verdict] || VERDICT_COLORS.WATCH;
                                return (
                                    <Link to={`/blog/${post.slug}`} key={post.id} style={{
                                        textDecoration: "none",
                                        background: T.card, borderRadius: 18, border: `1px solid ${T.border}`,
                                        overflow: "hidden", transition: "all .3s cubic-bezier(.25,.8,.25,1)",
                                        display: "flex", flexDirection: "column"
                                    }}
                                        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-6px)"; e.currentTarget.style.boxShadow = "0 20px 40px -10px rgba(0,0,0,0.15)"; }}
                                        onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                                    >
                                        {/* Card Top */}
                                        <div style={{ padding: "20px 20px 0" }}>
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <span style={{
                                                        padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 700,
                                                        fontFamily: "'IBM Plex Mono',monospace", background: `${T.accent}15`, color: T.accent
                                                    }}>{post.ticker}</span>
                                                    {post.verdict && (
                                                        <span style={{
                                                            padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
                                                            background: vc.bg, color: vc.text, textTransform: "uppercase"
                                                        }}>{post.verdict}</span>
                                                    )}
                                                </div>
                                                <span style={{ fontSize: 11, color: T.textDim }}>{post.views || 0} views</span>
                                            </div>
                                            <h2 style={{ fontSize: 17, fontWeight: 700, color: T.text, lineHeight: 1.35, marginBottom: 10, minHeight: 46 }}>
                                                {post.title}
                                            </h2>
                                        </div>

                                        {/* Card Body */}
                                        <div style={{ padding: "0 20px 20px", flex: 1, display: "flex", flexDirection: "column" }}>
                                            <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.55, flex: 1, marginBottom: 16 }}>
                                                {post.excerpt}
                                            </p>
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                <span style={{ fontSize: 12, color: T.textDim }}>{formatDate(post.created_at)}</span>
                                                <span style={{ fontSize: 12, fontWeight: 600, color: T.accent }}>Read →</span>
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Pagination */}
                        {pages > 1 && (
                            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 48 }}>
                                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                                    <button key={p} onClick={() => { const params = new URLSearchParams(searchParams); params.set("page", String(p)); setSearchParams(params); }}
                                        style={{
                                            width: 40, height: 40, borderRadius: 10,
                                            border: `1px solid ${p === page ? T.accent : T.border}`,
                                            background: p === page ? `${T.accent}15` : "transparent",
                                            color: p === page ? T.accent : T.textSec,
                                            fontSize: 14, fontWeight: 600, cursor: "pointer"
                                        }}>{p}</button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
