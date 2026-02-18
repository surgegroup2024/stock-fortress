import { useState, useEffect, useRef, useCallback } from "react";
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
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [page, setPage] = useState(1);
    const [searchParams, setSearchParams] = useSearchParams();
    const observer = useRef();

    const verdict = searchParams.get("verdict") || "";
    const LIMIT = 9; // Number of posts per load

    // Reset when filter changes
    useEffect(() => {
        setPosts([]);
        setPage(1);
        setHasMore(true);
    }, [verdict]);

    // Fetch posts
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                let url = `/api/blog?page=${page}&limit=${LIMIT}`;
                if (verdict) url += `&verdict=${verdict}`;

                const res = await fetch(url);
                const data = await res.json();

                setPosts(prev => {
                    // Prevent duplicates if strict mode causes double-fetch
                    const newPosts = data.posts || [];
                    const existingIds = new Set(prev.map(p => p.id));
                    const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id));
                    return page === 1 ? newPosts : [...prev, ...uniqueNewPosts];
                });

                setHasMore((data.posts || []).length === LIMIT);
            } catch (err) {
                console.error("Failed to fetch posts", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, [page, verdict]);

    const lastPostElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                setPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore]);

    const setFilter = (v) => {
        const params = new URLSearchParams();
        if (v) params.set("verdict", v);
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: "smooth" });
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
                {posts.length === 0 && !loading ? (
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
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 24 }}>
                        {posts.map((post, index) => {
                            const vc = VERDICT_COLORS[post.verdict] || VERDICT_COLORS.WATCH;
                            const isLastPost = index === posts.length - 1;

                            return (
                                <Link
                                    ref={isLastPost ? lastPostElementRef : null}
                                    to={`/blog/${post.slug}`}
                                    key={post.id}
                                    style={{
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
                )}

                {loading && (
                    <div style={{ textAlign: "center", padding: 40, width: "100%" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: `linear-gradient(135deg,${T.accent},#00C49A)`, display: "inline-flex", alignItems: "center", justifyContent: "center", animation: "pu 1.5s ease infinite", margin: "0 auto" }}>
                            <span style={{ fontSize: 14, fontWeight: 800, color: T.bg, fontFamily: "'IBM Plex Mono',monospace" }}>SF</span>
                        </div>
                    </div>
                )}
                {!hasMore && posts.length > 0 && (
                    <div style={{ textAlign: "center", padding: 40, color: T.textDim, fontSize: 14 }}>
                        You've reached the end.
                    </div>
                )}
            </div>
        </div>
    );
}
