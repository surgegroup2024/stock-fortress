import { useState, useEffect } from "react";
import { T } from "../theme";
import { supabase } from "../lib/supabase";

export default function Watchlist({ user }) {
    const [tickers, setTickers] = useState([]);
    const [prices, setPrices] = useState({});
    const [loading, setLoading] = useState(true);
    const [newTicker, setNewTicker] = useState("");

    useEffect(() => {
        if (user) fetchWatchlist();
    }, [user]);

    useEffect(() => {
        if (tickers.length === 0) return;
        fetchPrices(tickers);
        const interval = setInterval(() => fetchPrices(tickers), 30000);
        return () => clearInterval(interval);
    }, [tickers]);

    const fetchWatchlist = async () => {
        const { data } = await supabase.from("watchlists").select("ticker").eq("user_id", user.id);
        if (data) {
            const list = data.map(d => d.ticker);
            setTickers(list);
            fetchPrices(list);
        }
        setLoading(false);
    };

    const fetchPrices = async (list) => {
        if (!list.length) return;
        try {
            const res = await fetch(`/api/market-data/bulk?tickers=${list.join(",")}`);
            if (res.ok) setPrices(await res.json());
        } catch (e) { console.error(e); }
    };

    const addTicker = async () => {
        const t = newTicker.toUpperCase().trim();
        if (!t || tickers.includes(t)) return;
        setTickers(prev => [t, ...prev]);
        setNewTicker("");
        await supabase.from("watchlists").insert({ user_id: user.id, ticker: t });
        fetchPrices([t, ...tickers]);
    };

    const removeTicker = async (t) => {
        setTickers(prev => prev.filter(x => x !== t));
        await supabase.from("watchlists").delete().match({ user_id: user.id, ticker: t });
    };

    if (loading) return <div style={{ padding: 20 }}>Loading...</div>;

    return (
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: T.text }}>Watchlist</h3>
                <div style={{ display: "flex", gap: 8 }}>
                    <input
                        value={newTicker}
                        onChange={e => setNewTicker(e.target.value)}
                        placeholder="ADD TICKER"
                        style={{ padding: "8px", borderRadius: 8, border: `1px solid ${T.border}`, background: T.surface, color: T.text, width: 100, fontSize: 13, outline: "none" }}
                        onKeyDown={e => e.key === "Enter" && addTicker()}
                    />
                    <button onClick={addTicker} style={{ padding: "8px 12px", borderRadius: 8, background: T.accent, color: "#fff", border: "none", cursor: "pointer", fontWeight: 700 }}>+</button>
                </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {tickers.map(t => {
                    const d = prices[t] || {};
                    const isUp = (d.change || 0) >= 0;
                    return (
                        <div key={t} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", borderRadius: 10, background: T.surface, border: `1px solid ${T.border}80` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <span style={{ fontWeight: 700, fontFamily: "'IBM Plex Mono'", color: T.text }}>{t}</span>
                                <button onClick={() => removeTicker(t)} style={{ border: "none", background: "none", color: T.textDim, cursor: "pointer", fontSize: 16 }}>×</button>
                            </div>
                            <div style={{ textAlign: "right" }}>
                                <div style={{ fontWeight: 600, color: T.text }}>${d.price?.toFixed(2) || "..."}</div>
                                <div style={{ fontSize: 11, fontWeight: 600, color: isUp ? "#059669" : "#DC2626" }}>
                                    {isUp ? "+" : ""}{d.change?.toFixed(2)} ({d.percent?.toFixed(2)}%)
                                </div>
                            </div>
                        </div>
                    );
                })}
                {tickers.length === 0 && <div style={{ textAlign: "center", color: T.textSec, fontSize: 13 }}>Watchlist empty.</div>}
            </div>
        </div>
    );
}
