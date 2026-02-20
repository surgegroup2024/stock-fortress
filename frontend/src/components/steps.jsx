import { useState } from "react";
import { T, SEVERITY, MOAT, GRADE, ACTION } from "../theme";
import { Badge, Card, MetricRow, Flags, SectionLabel } from "./atoms";

// ─── SCANNABLE CONTENT HELPERS ───

/** Key Takeaway card — highlighted box at top of each step */
export const KeyTakeaway = ({ text }) => {
    if (!text) return null;
    return (
        <div style={{
            background: `linear-gradient(135deg, ${T.accent}10, ${T.blue}08)`,
            border: `1px solid ${T.accent}30`,
            borderRadius: 12,
            padding: "12px 14px",
            marginBottom: 14,
        }}>
            <div style={{
                fontSize: 10, fontWeight: 800, color: T.accent,
                letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4,
                display: "flex", alignItems: "center", gap: 5,
            }}>
                📊 KEY TAKEAWAY
            </div>
            <div style={{ fontSize: 13, fontWeight: 600, color: T.text, lineHeight: 1.5 }}>
                {text}
            </div>
        </div>
    );
};

/** Collapsible content — shows first N items, rest behind "Show more" */
export const CollapsibleContent = ({ children, maxItems = 4 }) => {
    const [expanded, setExpanded] = useState(false);
    const items = Array.isArray(children) ? children : [children];
    if (items.length <= maxItems) return <>{items}</>;

    return (
        <>
            {expanded ? items : items.slice(0, maxItems)}
            <button
                className="show-more-btn"
                onClick={() => setExpanded(!expanded)}
            >
                {expanded ? "Show less ▲" : `Show more (${items.length - maxItems} more) ▼`}
            </button>
        </>
    );
};

/** "So what?" one-liner at bottom of a step */
export const SoWhat = ({ text }) => {
    if (!text) return null;
    return (
        <div style={{
            fontSize: 12, fontStyle: "italic", color: T.textDim,
            lineHeight: 1.6, padding: "8px 0 2px",
            borderTop: `1px solid ${T.border}22`, marginTop: 10,
        }}>
            <span style={{ fontWeight: 600, fontStyle: "normal", color: T.textSec }}>So what? </span>
            {text}
        </div>
    );
};

// ─── STEP VIEWS ───

export const SmartText = ({ text }) => {
    if (!text) return null;
    // Regex matches: Money, Percent, "up/down X%", Sentiment words, YoY/QX, AI terms, Growth/Risk words
    const regex = /(\$[\d\.,]+(?:\s?[BM]illion)?|\d+(?:\.\d+)?%|YoY|Q[1-4]|FY\d{4}|202[4-9]|bullish|bearish|outperform|underperform|up\s+\d+(?:%|bps)|down\s+\d+(?:%|bps)|AI|GenAI|Gemini|GPT|LLM|growth|growing|record|strong|robust|beat|surge|soar|decline|drop|weak|miss|headwind|risk|uncertainty|iPhone|Mac|iPad|Services|Wearables|Vision\s?Pro)/gi;
    const parts = text.split(regex);

    return (
        <span>
            {parts.map((part, i) => {
                if (!part) return null;
                const lower = part.toLowerCase();
                // Categories
                const isMoney = part.match(/^\$/);
                const isPct = part.match(/%$/);
                const isTrend = lower.match(/^(up |down )/); // Space mandated by regex
                const isTime = lower.match(/^(yoy|q\d|fy|202)/);
                const isPos = lower.match(/^(bullish|outperform|growth|growing|record|strong|robust|beat|surge|soar|ai|genai|gemini|gpt|llm)/);
                const isNeg = lower.match(/^(bearish|underperform|decline|drop|weak|miss|headwind|risk|uncertainty)/);
                const isProd = lower.match(/^(iphone|mac|ipad|services|wearables|vision)/);

                let style = {};
                if (isMoney) style = { fontWeight: 700, color: T.text, background: `${T.accent}12`, padding: "0 4px", borderRadius: 4 };
                else if (isPct) style = { fontWeight: 700, color: T.blue };
                else if (isTrend && lower.startsWith("up")) style = { fontWeight: 700, color: T.accent };
                else if (isTrend && lower.startsWith("down")) style = { fontWeight: 700, color: T.danger };
                else if (isTime) style = { fontWeight: 600, color: T.textSec, fontStyle: "italic" };
                else if (isPos) style = { fontWeight: 700, color: T.accent };
                else if (isNeg) style = { fontWeight: 700, color: T.danger };
                else if (isProd) style = { fontWeight: 700, color: T.text, borderBottom: `2px solid ${T.blue}40` };
                else style = { color: T.textSec };

                // Only apply style if it matches one of our categories
                if (Object.keys(style).length > 1 || style.color !== T.textSec) {
                    return <span key={i} style={style}>{part}</span>;
                }
                return <span key={i}>{part}</span>;
            })}
        </span>
    );
};



export const AnalystConsensus = ({ text }) => {
    if (!text) return null;

    // Extract consensus: "Consensus is 'Moderate Buy'" or similar
    const consensusMatch = text.match(/Consensus is ['"]([^'"]+)['"]/i);
    const consensus = consensusMatch ? consensusMatch[1] : null;

    // Extract counts: "17 Buys, 9 Holds, 1 Sell"
    const countsMatch = text.match(/(\d+)\s+Buys?,\s+(\d+)\s+Holds?,\s+(\d+)\s+Sells?/i);

    if (!consensus || !countsMatch) {
        // Fallback to SmartText if we can't parse structure
        return <div style={{ fontSize: 13, color: T.textSec }}><SmartText text={text} /></div>;
    }

    const buys = parseInt(countsMatch[1]);
    const holds = parseInt(countsMatch[2]);
    const sells = parseInt(countsMatch[3]);
    const total = buys + holds + sells;

    // Calculate percentages
    const buyPct = (buys / total) * 100;
    const holdPct = (holds / total) * 100;
    const sellPct = (sells / total) * 100;

    return (
        <div style={{ marginTop: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{consensus}</div>
                <div style={{ fontSize: 11, color: T.textDim }}>{total} Analysts</div>
            </div>
            {/* Bar */}
            <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: T.surface, marginBottom: 8 }}>
                {buys > 0 && <div style={{ width: `${buyPct}%`, background: T.accent }} />}
                {holds > 0 && <div style={{ width: `${holdPct}%`, background: T.warn }} />}
                {sells > 0 && <div style={{ width: `${sellPct}%`, background: T.danger }} />}
            </div>
            {/* Legend */}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textSec, fontWeight: 500 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: T.accent }} /> {buys} Buy</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: T.warn }} /> {holds} Hold</div>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: T.danger }} /> {sells} Sell</div>
            </div>
            {text.split("Analyst consensus")[0].length > 10 && (
                <div style={{ fontSize: 12, color: T.textDim, marginTop: 12, lineHeight: 1.5, fontStyle: "italic" }}>
                    <SmartText text={text.split("Analyst consensus")[0]} />
                </div>
            )}
        </div>
    );
};

export const PeerComparison = ({ text }) => {
    if (!text) return null;
    // Extract matches: "Microsoft 25.1", "Alphabet 28.9"
    const matches = [...text.matchAll(/([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\s*:?\s*(\d{1,3}\.\d)/g)];

    if (matches.length === 0) return <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}><SmartText text={text} /></div>;

    const peers = matches.map(m => ({ name: m[1], val: parseFloat(m[2]) }));
    const maxVal = Math.max(...peers.map(p => p.val)) * 1.1;

    return (
        <div style={{ marginTop: 10 }}>
            {peers.map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 8, fontSize: 13 }}>
                    <div style={{ width: 80, fontWeight: 600, color: T.textSec }}>{p.name}</div>
                    <div style={{ flex: 1, background: T.surface, height: 24, borderRadius: 4, position: "relative" }}>
                        <div style={{ width: `${(p.val / maxVal) * 100}%`, height: "100%", background: i % 2 === 0 ? T.blue : T.accent, borderRadius: 4, opacity: 0.8 }} />
                        <span style={{ position: "absolute", left: 8, top: 4, fontSize: 11, fontWeight: 700, color: T.text, mixBlendMode: "difference" }}>{p.val}</span>
                    </div>
                </div>
            ))}
            <div style={{ fontSize: 11, color: T.textDim, marginTop: 10, fontStyle: "italic" }}>
                Original: {text.split("(")[0]}
            </div>
        </div>
    );
};

// Helper for extracting main number from string "32.36 (Price...)"
export const BigMetric = ({ label, raw, hl }) => {
    const num = raw?.match(/^([\d\.]+)/)?.[1] || "—";
    const sub = raw?.replace(num, "").replace(/^\s*\(|\)\s*$/g, "") || "";
    return (
        <div style={{ background: T.surface, padding: "12px", borderRadius: 12, border: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 10, color: T.textDim, fontWeight: 700, textTransform: "uppercase" }}>{label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: hl || T.text, marginTop: 4, fontFamily: "'IBM Plex Mono',monospace" }}>{num}</div>
            {sub && <div style={{ fontSize: 10, color: T.textDim, marginTop: 4, lineHeight: 1.2, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{sub}</div>}
        </div>
    )

};

export const ContextBadge = ({ text }) => {
    if (!text) return null;
    const match = text.match(/(upside|downside|overvalued|undervalued)\s*(?:of|by)?\s*~?(\d+%?)/i);
    if (!match) return null;
    const type = match[1].toLowerCase();
    const val = match[2];
    const isBad = type.includes("down") || type.includes("over");
    return (
        <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: isBad ? `${T.danger}10` : `${T.accent}10`, borderRadius: 8, border: `1px solid ${isBad ? T.danger : T.accent}30` }}>
            <div style={{ fontSize: 18 }}>{isBad ? "⚠️" : "🚀"}</div>
            <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, textTransform: "uppercase" }}>Model Signal</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: isBad ? T.danger : T.accent }}>Potential {type} of {val}</div>
            </div>
        </div>
    )
};

export const SentimentRow = ({ text }) => {
    if (!text) return null;
    const lower = text.toLowerCase();
    const isPos = lower.match(/(growth|grow|driven by|led by|record|strong|solid|increase|up\s)/);
    const isNeg = lower.match(/(decline|offset by|decrease|weak|down\s|fail|drop)/);
    const color = isNeg ? T.danger : isPos ? T.accent : T.blue;
    const icon = isNeg ? "📉" : isPos ? "📈" : "📊";

    return (
        <div style={{ marginBottom: 8, display: "flex", gap: 10, padding: "8px 10px", background: `${color}08`, borderRadius: 8, borderLeft: `3px solid ${color}` }}>
            <div style={{ fontSize: 14, marginTop: 2 }}>{icon}</div>
            <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.6 }}>
                <SmartText text={text} />
            </div>
        </div>
    )
};



export const DCFCard = ({ text }) => {
    if (!text) return null;
    // Extract Implied Price/Value (Robust + Suffix)
    // Only match full-word suffixes (Trillion/Billion/Million) to avoid grabbing stray letters
    const priceMatch = text.match(/(?:Implied Share Price|Intrinsic Value|Fair Value|Implied Value).*?\$([\d\.,]+)\s*(Trillion|Billion|Million)?/i);
    const rawVal = priceMatch ? priceMatch[1].replace(/\.$/, '') : null; // strip trailing dot
    const suffix = priceMatch ? priceMatch[2] : null;
    const isTotalVal = suffix && /^(Trillion|Billion|Million)$/i.test(suffix);
    const label = isTotalVal ? "Implied Market Cap" : "Intrinsic Share Price";
    const displayVal = rawVal ? `${rawVal}${suffix ? " " + suffix : ""}` : null;

    // Extract Assumptions (Robust)
    const growthMatch = text.match(/(?:growth|cagr).*?(\d{1,2}(?:\.\d+)?)%/i);
    const termMatch = text.match(/(?:terminal).*?(\d{1,2}(?:\.\d+)?)%/i);
    const discMatch = text.match(/(?:discount).*?(\d{1,2}(?:\.\d+)?)%/i);

    const growth = growthMatch ? growthMatch[1] : "?";
    const term = termMatch ? termMatch[1] : "?";
    const discount = discMatch ? discMatch[1] : "?";

    return (
        <div style={{ padding: "8px 0" }}>
            {displayVal && (
                <div style={{ textAlign: "center", marginBottom: 20, background: `linear-gradient(135deg,${T.accent}12,${T.blue}12)`, padding: "20px", borderRadius: 16, border: `1px solid ${T.accent}30` }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 8 }}>{label}</div>
                    <div style={{ fontSize: 42, fontWeight: 700, color: T.text, fontFamily: "'IBM Plex Mono',monospace" }}>${displayVal}</div>
                    <div style={{ fontSize: 12, color: T.textSec, marginTop: 6 }}>Estimated Fair Value</div>
                </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 16 }}>
                {[
                    { l: "Growth Rate", v: growth + "%" },
                    { l: "Terminal Rate", v: term + "%" },
                    { l: "Discount Rate", v: discount + "%" }
                ].map((item, i) => (
                    <div key={i} style={{ background: T.surface, padding: "10px 8px", borderRadius: 10, textAlign: "center", border: `1px solid ${T.border}` }}>
                        <div style={{ fontSize: 9, color: T.textDim, fontWeight: 700, textTransform: "uppercase" }}>{item.l}</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: T.blue, marginTop: 4, fontFamily: "'IBM Plex Mono',monospace" }}>{item.v}</div>
                    </div>
                ))}
            </div>

            <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.7, padding: "12px", background: T.bg2, borderRadius: 10, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: T.textDim, marginBottom: 6, textTransform: "uppercase" }}>Methodology & Details</div>
                <SmartText text={text} />
            </div>
        </div>
    );
};

function MetaGrid({ m }) {
    const beta = parseFloat(m.beta) || 0;
    const betaColor = beta > 1.2 ? T.danger : beta < 0.8 ? T.accent : T.warn;
    const betaLabel = beta > 1.2 ? "Hi Vol" : beta < 0.8 ? "Stable" : "Market";

    return (
        <Card delay={.2}>
            {/* P/E Row */}
            <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                <div style={{ flex: 1, background: T.surface, padding: "12px 10px", borderRadius: 12, border: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: 9, color: T.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Trailing P/E</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: T.text, marginTop: 4, fontFamily: "'IBM Plex Mono',monospace" }}>{m.trailing_pe || "—"}</div>
                </div>
                <div style={{ flex: 1, background: T.surface, padding: "12px 10px", borderRadius: 12, border: `1px solid ${T.border}` }}>
                    <div style={{ fontSize: 9, color: T.textDim, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>Forward P/E</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: T.blue, marginTop: 4, fontFamily: "'IBM Plex Mono',monospace" }}>{m.forward_pe || "—"}</div>
                </div>
            </div>

            {/* Metrics Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div style={{ background: T.bg2, padding: "10px 12px", borderRadius: 10, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ fontSize: 9, color: T.textDim, fontWeight: 700, textTransform: "uppercase" }}>Beta</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: T.text, fontFamily: "'IBM Plex Mono',monospace" }}>{m.beta}</span>
                        <Badge color={betaColor} style={{ fontSize: 9, padding: "2px 6px" }}>{betaLabel}</Badge>
                    </div>
                </div>
                <div style={{ background: T.bg2, padding: "10px 12px", borderRadius: 10, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                    <div style={{ fontSize: 9, color: T.textDim, fontWeight: 700, textTransform: "uppercase" }}>Avg Volume</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginTop: 4, fontFamily: "'IBM Plex Mono',monospace" }}>{m.avg_volume}</div>
                </div>
            </div>

            {/* Date Footer */}
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: 9, color: T.textDim, fontWeight: 700 }}>REPORT DATE</div>
                <div style={{ fontSize: 11, color: T.text, fontWeight: 600 }}>{m.report_date}</div>
            </div>
            {m.data_freshness_note && <div style={{ fontSize: 10, color: T.textDim, marginTop: 4, fontStyle: "italic", textAlign: "right" }}>{m.data_freshness_note}</div>}
        </Card>
    )
}

export function Landing({ d, onStart }) {
    const m = d.meta;
    const p = parseFloat(m.current_price.replace("$", ""));
    const [lo, hi] = m.fifty_two_week_range.split(" - ").map(s => parseFloat(s.replace("$", "")));
    const pct = ((p - lo) / (hi - lo)) * 100;
    const down = hi > 0 ? Math.round((1 - p / hi) * 100) : 0;
    return (<div style={{ animation: "fi .5s ease both" }}>
        <div style={{ textAlign: "center", marginBottom: 28, paddingTop: 16 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 3.5, color: T.accent, textTransform: "uppercase", marginBottom: 10 }}>Stock Fortress Research</div>
            <div style={{ display: "inline-block", background: `linear-gradient(135deg,${T.accentDim},${T.blueDim})`, borderRadius: 14, padding: "10px 32px", border: `1px solid ${T.accent}30`, marginBottom: 14 }}>
                <div style={{ fontSize: 44, fontWeight: 700, color: T.text, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: -1 }}>{m.ticker}</div>
            </div>
            <div style={{ color: T.textSec, fontSize: 14, marginBottom: 3 }}>{m.company_name}</div>
            <div style={{ color: T.textDim, fontSize: 12 }}>{m.sector}</div>
        </div>
        <Card delay={.1} glow>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
                <div>
                    <div style={{ fontSize: 34, fontWeight: 700, color: T.text, fontFamily: "'IBM Plex Mono',monospace" }}>{m.current_price}</div>
                    {down > 10 && <div style={{ fontSize: 11, color: T.danger, marginTop: 2 }}>▼ {down}% from 52w high</div>}
                </div>
                <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 11, color: T.textDim }}>Mkt Cap</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: T.text, fontFamily: "'IBM Plex Mono',monospace" }}>{m.market_cap}</div>
                </div>
            </div>
            <div style={{ marginBottom: 6 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textDim, marginBottom: 5 }}><span>${lo}</span><span style={{ color: T.textDim, fontSize: 9 }}>52W RANGE</span><span>${hi}</span></div>
                <div style={{ height: 5, background: T.surface, borderRadius: 3, position: "relative" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, height: "100%", width: `${pct}%`, background: `linear-gradient(90deg,${T.danger},${T.warn})`, borderRadius: 3 }} />
                    <div style={{ position: "absolute", top: -3, left: `${pct}%`, width: 11, height: 11, borderRadius: "50%", background: pct < 30 ? T.danger : pct < 70 ? T.warn : T.accent, border: `2px solid ${T.bg}`, transform: "translateX(-50%)", boxShadow: `0 0 6px ${T.danger}55` }} />
                </div>
            </div>
        </Card>
        <MetaGrid m={m} />
        <Card delay={.3} style={{ background: `linear-gradient(135deg,${T.accent}06,${T.blue}06)`, border: `1px solid ${T.accent}28` }}>
            <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.accent, letterSpacing: 1.5, marginBottom: 6, textTransform: "uppercase" }}>Before You Trade</div>
                <div style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6 }}>Complete the <strong style={{ color: T.text }}>7-Step Research Checklist</strong></div>
                <div style={{ fontSize: 11, color: T.textDim, marginTop: 3 }}>~3 min · No shortcuts</div>
            </div>
        </Card>
        <button onClick={onStart} style={{ width: "100%", padding: "15px", borderRadius: 13, border: "none", background: `linear-gradient(135deg,${T.accent},#059669)`, color: "#FFFFFF", fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif", letterSpacing: .5, boxShadow: `0 4px 20px ${T.accent}40`, marginTop: 6 }}>START RESEARCH →</button>
    </div>);
}

export function S1({ d, onNext }) {
    const s = d.step_1_know_what_you_own;
    return (<div>
        <KeyTakeaway text={s.one_liner} />
        <Card delay={.1}><SectionLabel color={T.accent}>In Plain English</SectionLabel>
            <div style={{ fontSize: 16, color: T.text, lineHeight: 1.7, fontWeight: 500 }}>"{s.one_liner}"</div></Card>
        <Card delay={.2}><SectionLabel>How They Make Money</SectionLabel>
            <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>{s.how_it_makes_money}</div></Card>
        <Card delay={.3}><SectionLabel>Key Products</SectionLabel>
            <CollapsibleContent maxItems={4}>
                {s.key_products_or_services.map((p, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 0", borderBottom: i < s.key_products_or_services.length - 1 ? `1px solid ${T.border}22` : "none", animation: `fi .3s ease ${.08 * i}s both` }}>
                    <span style={{ color: T.accent, fontSize: 7 }}>●</span><span style={{ color: T.textSec, fontSize: 13 }}>{p}</span></div>))}
            </CollapsibleContent></Card>
        <Card delay={.4}><MetricRow label="Target Customer" value={s.customer_type} />
            <div style={{ marginTop: 10, textAlign: "center" }}><span style={{ fontSize: 11, color: T.textDim }}>Could you explain this to a friend?</span>
                <div style={{ marginTop: 5, cursor: "pointer" }} onClick={onNext} className="clickable">
                    <Badge color={s.pass_fail === "YES" ? T.accent : T.danger}>{s.pass_fail} ➔</Badge>
                </div>
            </div>
            <SoWhat text={`You should be able to explain what ${d.meta?.company_name || 'this company'} does in one sentence before investing.`} />
        </Card>
    </div>);
}

export function RevenueBreakdown({ items }) {
    if (!items || !items.length) return null;
    const colors = [T.accent, T.blue, T.warn, T.danger, T.text];
    // Handle string case (legacy reports)
    if (typeof items === "string") return <Card delay={.25}><SectionLabel color={T.blue}>📊 Revenue</SectionLabel><div style={{ fontSize: 13, color: T.textSec }}>{items}</div></Card>;

    return (
        <Card delay={.25}>
            <SectionLabel color={T.blue}>📊 Revenue Breakdown</SectionLabel>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {items.map((item, i) => (
                    <div key={i} style={{ animation: `fi .4s ease ${.1 * i}s both` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: T.textSec, marginBottom: 5 }}>
                            <span style={{ fontWeight: 500 }}>{item.segment}</span>
                            <span style={{ fontWeight: 700, color: T.text, fontFamily: "'IBM Plex Mono',monospace" }}>{item.percentage}%</span>
                        </div>
                        <div style={{ height: 8, background: T.surface, borderRadius: 4, overflow: "hidden" }}>
                            <div style={{
                                width: `${item.percentage}%`,
                                height: "100%",
                                background: colors[i % colors.length],
                                borderRadius: 4,
                                transition: "width 1s ease-out"
                            }} />
                        </div>
                        {item.revenue && <div style={{ fontSize: 11, color: T.textDim, marginTop: 3, textAlign: "right" }}>{item.revenue}</div>}
                    </div>
                ))}
            </div>
        </Card>
    );
}

export function FinancialGrid({ s }) {
    const parseNum = (str) => {
        if (!str) return 0;
        const match = str.match(/(-?[\d\.]+)/);
        return match ? parseFloat(match[1]) : 0;
    };
    const growth = parseNum(s.revenue_growth_yoy);
    const margin = parseNum(s.gross_margin);
    const growthColor = growth >= 0 ? T.accent : T.danger;

    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {/* REVENUE GROWTH */}
            <div style={{ background: `${growthColor}10`, padding: "12px 14px", borderRadius: 12, border: `1px solid ${growthColor}30` }}>
                <div style={{ fontSize: 10, color: T.textDim, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>YoY Growth</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: growthColor, marginTop: 4, fontFamily: "'IBM Plex Mono',monospace" }}>
                    {s.revenue_growth_yoy || "—"}
                </div>
            </div>

            {/* GROSS MARGIN */}
            <div style={{ background: T.surface, padding: "12px 14px", borderRadius: 12, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 10, color: T.textDim, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>Gross Margin</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginTop: 4 }}>
                    <span style={{ fontSize: 22, fontWeight: 700, color: T.text, fontFamily: "'IBM Plex Mono',monospace" }}>
                        {s.gross_margin?.match ? (s.gross_margin.match(/(\d+(\.\d+)?%)/)?.[0] || s.gross_margin) : (s.gross_margin || "—")}
                    </span>
                    {s.gross_margin && s.gross_margin.length > 8 && (
                        <span title={s.gross_margin} style={{ fontSize: 14, cursor: "help" }}>ℹ️</span>
                    )}
                </div>
                {s.gross_margin && s.gross_margin.length > 8 && (
                    <div style={{ fontSize: 10, color: T.textSec, marginTop: 6, lineHeight: 1.3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {s.gross_margin.replace(/(\d+(\.\d+)?%)/, "").trim().replace(/^,/, "").trim()}
                    </div>
                )}
                <div style={{ height: 4, width: "100%", background: T.bg, marginTop: 8, borderRadius: 2 }}>
                    <div style={{ height: "100%", width: `${Math.min(margin, 100)}%`, background: T.blue, borderRadius: 2 }} />
                </div>
            </div>

            {/* CASH */}
            <div style={{ background: T.surface, padding: "12px 14px", borderRadius: 12, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 10, color: T.textDim, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>Cash Mountain</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: T.text, marginTop: 4 }}>{s.cash_position?.match(/(\$?[\d.,]+\s*(?:Trillion|Billion|Million|[TBMK])?)/i)?.[1] || s.cash_position}</div>
            </div>

            {/* FCF */}
            <div style={{ background: T.surface, padding: "12px 14px", borderRadius: 12, border: `1px solid ${T.border}` }}>
                <div style={{ fontSize: 10, color: T.textDim, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>Free Cash Flow</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: T.accent, marginTop: 4 }}>{s.free_cash_flow_latest?.match(/(\$?[\d.,]+\s*(?:Trillion|Billion|Million|[TBMK])?)/i)?.[1] || s.free_cash_flow_latest}</div>
            </div>
        </div>
    );
}

export function S2({ d }) {
    const s = d.step_2_check_the_financials;
    const g = GRADE[s.financial_health_grade] || GRADE.C;

    return (<div>
        <KeyTakeaway text={`Financial Health Grade: ${s.financial_health_grade} (${g.l}) — Revenue ${s.revenue_growth_yoy || 'N/A'} YoY`} />
        <Card delay={.1} glow>
            <div style={{ textAlign: "center", marginBottom: 4 }}>
                <SectionLabel color={T.textDim}>Financial Health Grade</SectionLabel>
                <div style={{ display: "inline-flex", width: 68, height: 68, borderRadius: "50%", alignItems: "center", justifyContent: "center", background: `${g.c}18`, border: `3px solid ${g.c}`, boxShadow: `0 0 18px ${g.c}28` }}>
                    <span style={{ fontSize: 30, fontWeight: 700, color: g.c, fontFamily: "'IBM Plex Mono',monospace" }}>{s.financial_health_grade}</span>
                </div>
                <div style={{ fontSize: 12, color: g.c, fontWeight: 600, marginTop: 5 }}>{g.l}</div>
            </div>
        </Card>

        <Card delay={.2}>
            <SectionLabel color={T.textDim}>Latest: {s.latest_quarter}</SectionLabel>

            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, gap: 15 }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: T.textDim, letterSpacing: 1, marginBottom: 4 }}>REVENUE</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 6 }}>{s.revenue_latest}</div>
                    <Badge color={/beat/i.test(s.revenue_beat_miss) ? T.accent : T.danger}>{s.revenue_beat_miss}</Badge>
                </div>
                <div style={{ flex: 1, textAlign: "right" }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: T.textDim, letterSpacing: 1, marginBottom: 4 }}>EPS</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 6 }}>{s.eps_latest}</div>
                    <Badge color={/beat/i.test(s.eps_beat_miss) ? T.accent : T.danger}>{s.eps_beat_miss}</Badge>
                </div>
            </div>

            <FinancialGrid s={s} />

            {(s.operating_margin_trend && s.operating_margin_trend.length > 25) ? (
                <div style={{ marginBottom: 16, padding: 12, background: T.surface, borderRadius: 12, border: `1px solid ${T.border}`, fontSize: 13, color: T.textSec, lineHeight: 1.6 }}>
                    <strong style={{ color: T.text, fontSize: 11, textTransform: "uppercase", display: "block", marginBottom: 4 }}>Operating Margin Trend</strong>
                    {s.operating_margin_trend}
                </div>
            ) : (
                <MetricRow label="Op. Margin Trend" value={s.operating_margin_trend || "—"} />
            )}

            <MetricRow label="Debt" value={s.debt_level} hl={s.debt_level === "LOW" ? T.accent : T.warn} />
        </Card>

        <RevenueBreakdown items={s.revenue_breakdown} />

        <Card delay={.3}><SectionLabel color={T.danger}>🚩 Red Flags</SectionLabel><Flags items={s.red_flags} type="red" /></Card>
        <Card delay={.4}><SectionLabel color={T.accent}>✅ Green Flags</SectionLabel><Flags items={s.green_flags} type="green" /></Card>
        <SoWhat text={`A grade of ${s.financial_health_grade} means the balance sheet ${s.financial_health_grade >= 'C' ? 'needs attention' : 'is solid'}. Focus on the trend, not one quarter.`} />
    </div>);
}


export function S2A({ d }) {
    const s = d.step_2a_earnings_and_guidance_review;
    if (!s) return <Card><div style={{ fontSize: 13, color: T.textDim, textAlign: "center" }}>Earnings deep-dive data not available for this report.</div></Card>;
    const toneColor = { Confident: T.accent, Cautious: T.warn, Defensive: T.danger, Uncertain: T.textDim }[s.management_tone?.split(/[—,]/)[0]?.trim()] || T.blue;
    return (<div>
        <Card delay={.1} style={{ background: `linear-gradient(135deg,${toneColor}08,${T.card})`, border: `1px solid ${toneColor}30` }}>
            <SectionLabel color={toneColor}>🎙️ Management Tone</SectionLabel>
            <div style={{ fontSize: 14, color: T.text, lineHeight: 1.75, fontStyle: "italic", padding: "4px 0 4px 12px", borderLeft: `3px solid ${toneColor}60` }}>
                "{s.management_tone}"
            </div>
        </Card>
        <Card delay={.2}>
            <SectionLabel color={T.blue}>📊 Segment Performance</SectionLabel>
            <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.8 }}>
                {s.segment_breakdown?.split(". ").map((sent, i) => sent.trim() && (
                    <SentimentRow key={i} text={sent + (sent.endsWith(".") ? "" : ".")} />
                ))}
            </div>
        </Card>
        {s.one_time_items && s.one_time_items !== "None" && (
            <Card delay={.3} border={T.warn}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>⚠️</span>
                    <div>
                        <SectionLabel color={T.warn}>One-Time Adjustments</SectionLabel>
                        <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}><SmartText text={s.one_time_items} /></div>
                    </div>
                </div>
            </Card>
        )}
        <Card delay={.4} style={{ background: `linear-gradient(135deg,${T.accent}06,${T.blue}06)`, border: `1px solid ${T.accent}28` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <SectionLabel color={T.accent} style={{ marginBottom: 0 }}>📈 Guidance Update</SectionLabel>
                <Badge color={T.warn}>FORWARD-LOOKING</Badge>
            </div>
            <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.75 }}><SmartText text={s.guidance_changes} /></div>
        </Card>
        <Card delay={.5}>
            <SectionLabel color={T.gold}>🏦 Analyst Reaction</SectionLabel>
            <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}><SmartText text={s.analyst_reaction} /></div>
        </Card>
        {s.forward_statements_note && (
            <div style={{ fontSize: 10, color: T.textDim, lineHeight: 1.5, padding: "8px 14px", background: `${T.surface}88`, borderRadius: 8, animation: "fi .4s ease .6s both", fontStyle: "italic" }}>
                ℹ️ {s.forward_statements_note}
            </div>
        )}
    </div>);
}

export function S3({ d }) {
    const s = d.step_3_understand_the_story;
    return (<div>
        <KeyTakeaway text={s.bull_case?.split('.')[0] + '.'} />
        <Card delay={.1} border={T.accent}><SectionLabel color={T.accent}>Bull Case</SectionLabel><div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}><SmartText text={s.bull_case} /></div></Card>
        <Card delay={.15}><SectionLabel color={T.blue}>Base Case</SectionLabel><div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}><SmartText text={s.base_case} /></div></Card>
        <Card delay={.2} border={T.danger}><SectionLabel color={T.danger}>Bear Case</SectionLabel><div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}><SmartText text={s.bear_case} /></div></Card>
        <Card delay={.3} style={{ background: `linear-gradient(135deg,${T.bg2},${T.surface}44)` }}><SectionLabel color={T.gold}>Macro Overlay</SectionLabel><div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}><SmartText text={s.macro_overlay} /></div></Card>
        <Card delay={.4}><SectionLabel color={T.accent}>Must Go Right</SectionLabel><CollapsibleContent maxItems={3}><Flags items={s.what_must_go_right} type="green" /></CollapsibleContent></Card>
        <Card delay={.5}><SectionLabel color={T.danger}>Bearish Catalysts</SectionLabel><CollapsibleContent maxItems={3}><Flags items={s.what_could_break_the_story} type="red" /></CollapsibleContent></Card>
        <Card delay={.6}><SectionLabel color={T.blue}>Timeline</SectionLabel>
            {s.catalyst_timeline?.map((c, i) => (<div key={i} style={{ fontSize: 12, color: T.textSec, marginBottom: 5 }}>• {c}</div>))}
        </Card>
        <SoWhat text="The story matters because it tells you what the market is pricing in — and what could surprise it." />
    </div>);
}

export function S4({ d }) {
    const s = d.step_4_know_the_risks;
    const topRisk = s.top_risks?.[0];
    return (<div>
        <KeyTakeaway text={topRisk ? `Top Risk: ${topRisk.risk} (${topRisk.severity})` : 'Risk analysis in progress...'} />
        <CollapsibleContent maxItems={3}>
            {s.top_risks.map((r, i) => (<Card key={i} delay={.1 * (i + 1)} border={SEVERITY[r.severity]}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: T.text, flex: 1, marginRight: 8 }}>{r.risk}</div>
                    <div style={{ display: "flex", gap: 4 }}>
                        <Badge color={SEVERITY[r.severity]}>{r.severity}</Badge>
                        <Badge color={T.textDim}>Prob: {r.likelihood}</Badge>
                    </div>
                </div>
                <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.55 }}>{r.explanation}</div></Card>))}
        </CollapsibleContent>
        <Card delay={.4}><SectionLabel color={T.gold}>Ownership & Analysts</SectionLabel>
            <AnalystConsensus text={s.ownership_signals && s.ownership_signals !== "None" ? s.ownership_signals : "No data available."} />
        </Card>
        <Card delay={.5}>
            <MetricRow label="Regulatory" value={s.regulatory_exposure} hl={T.danger} />
            <div style={{ marginTop: 8, fontSize: 12, color: T.textSec, lineHeight: 1.55 }}><span style={{ color: T.warn, fontWeight: 600 }}>Concentration: </span><SmartText text={s.concentration_risk} /></div>
            <SoWhat text="Every stock has risks. The question is whether you're being compensated for taking them." />
        </Card>
    </div>);
}

export function S5({ d }) {
    const s = d.step_5_check_the_competition;
    const mc = MOAT[s.moat_strength] || T.textDim;
    return (<div>
        <KeyTakeaway text={`Moat Strength: ${s.moat_strength} — ${s.main_competitors?.length || 0} key competitors identified`} />
        <CollapsibleContent maxItems={3}>
            {s.main_competitors.map((c, i) => (<Card key={i} delay={.1 * (i + 1)}>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 5 }}>{c.name}</div>
                <div style={{ fontSize: 12, color: T.textDim, marginBottom: 7 }}>{c.why_compete}</div>
                <div style={{ fontSize: 12, color: T.warn, lineHeight: 1.5 }}><span style={{ fontWeight: 600 }}>Edge: </span>{c.their_advantage}</div></Card>))}
        </CollapsibleContent>
        <Card delay={.4} glow><div style={{ textAlign: "center" }}>
            <SectionLabel color={T.textDim}>Competitive Moat</SectionLabel>
            <div style={{ display: "inline-block", padding: "7px 22px", borderRadius: 10, background: `${mc}18`, border: `2px solid ${mc}`, fontSize: 16, fontWeight: 700, color: mc, letterSpacing: 1 }}>{s.moat_strength}</div>
            <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.6, marginTop: 10 }}>{s.moat_explanation}</div></div></Card>
        <SoWhat text={`A ${s.moat_strength?.toLowerCase() || 'narrow'} moat means ${s.moat_strength === 'STRONG' ? 'durable competitive advantages — pricing power and margin stability.' : 'competitors could erode margins. Watch for market share shifts.'}`} />
    </div>);
}

export function S6({ d }) {
    const s = d.step_6_valuation_reality_check;
    const ec = { CHEAP: T.accent, FAIR: T.blue, EXPENSIVE: T.warn, SPECULATIVE: T.danger }[s.is_it_expensive] || T.text;
    return (<div>
        <KeyTakeaway text={`Valuation: ${s.is_it_expensive || 'N/A'} — Current P/E ${s.current_pe || 'N/A'}, Forward P/E ${s.forward_pe || 'N/A'}`} />
        <Card delay={.1}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <SectionLabel>Valuation Multiples</SectionLabel>
                <Badge color={ec}>{s.is_it_expensive}</Badge>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <BigMetric label="Current P/E" raw={s.current_pe} />
                <BigMetric label="Forward P/E" raw={s.forward_pe} hl={T.blue} />
                <BigMetric label="P/S Ratio" raw={s.price_to_sales} />
                <BigMetric label="EV/EBITDA" raw={s.ev_ebitda_if_relevant} />
            </div>
        </Card>

        {s.sector_or_peer_avg_pe && (
            <Card delay={.15}>
                <SectionLabel color={T.gold}>📊 Peer Comparison</SectionLabel>
                <PeerComparison text={s.sector_or_peer_avg_pe} />
            </Card>
        )}
        {s.simple_dcf_implied_value && (
            <Card delay={.15}>
                <DCFCard text={s.simple_dcf_implied_value} />
            </Card>
        )}
        <Card delay={.2}>
            <SectionLabel color={T.text}>💡 Context & History</SectionLabel>
            <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7, marginBottom: 4 }}><SmartText text={s.valuation_context} /></div>
            <ContextBadge text={s.valuation_context} />
        </Card>
        <Card delay={.3}><SectionLabel>Price targets</SectionLabel>
            {[{ l: "Bear", v: s.bear_case_target, c: T.danger }, { l: "Base", v: s.base_case_target, c: T.blue }, { l: "Bull", v: s.bull_case_target, c: T.accent }].map((x, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, padding: "12px 14px", borderRadius: 10, background: `${x.c}0A`, border: `1px solid ${x.c}28`, marginBottom: 8, animation: `fi .35s ease ${.12 * i}s both` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, flexShrink: 0, marginTop: 4 }}>
                        <span style={{ width: 7, height: 7, borderRadius: "50%", background: x.c }} />
                        <span style={{ fontSize: 13, color: T.textSec, fontWeight: 700 }}>{x.l}</span>
                    </div>
                    <div style={{ textAlign: "right", flex: 1 }}>
                        <div style={{ fontSize: 17, fontWeight: 700, color: x.c, fontFamily: "'IBM Plex Mono',monospace" }}>{x.v}</div>
                    </div>
                </div>))}</Card>
        <SoWhat text={`The stock is currently rated ${s.is_it_expensive || 'unrated'} on valuation. Compare price targets to decide if the risk/reward makes sense for your portfolio.`} />
    </div>);
}

export function S7({ d }) {
    const s = d.step_7_verdict;
    const a = ACTION[s.action] || ACTION.WATCH;
    return (<div>
        <KeyTakeaway text={`Verdict: ${s.action} — ${s.one_line_reason}`} />
        <Card delay={.1} style={{ background: a.bg, border: `2px solid ${a.bc}`, boxShadow: a.g }}>
            <div className="verdict-celebrate" style={{ textAlign: "center", padding: "14px 0" }}>
                <div style={{ fontSize: 44, marginBottom: 6 }}>{a.i}</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: a.c, letterSpacing: 2, fontFamily: "'IBM Plex Mono',monospace" }}>{s.action}</div>
                <div style={{ marginTop: 7 }}><Badge color={T.textSec}>Confidence: {s.confidence}</Badge></div>
                <div style={{ fontSize: 14, color: T.text, lineHeight: 1.65, marginTop: 14, fontWeight: 500 }}>{s.one_line_reason}</div></div></Card>
        <Card delay={.2}><SectionLabel color={T.blue}>Signal to Change Course</SectionLabel><div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>{s.what_signal_would_change_this}</div></Card>
        <Card delay={.3}><MetricRow label="Tracking" value={s.most_important_metric_to_track} hl={T.accent} /><MetricRow label="Revisit" value={s.suggested_revisit_date} hl={T.warn} /></Card>
    </div>);
}

// Helper to get YouTube Embed URL
function getEmbedUrl(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
}

export function Gut({ d }) {
    const s = d.investor_gut_check;
    const qs = [s.question_1, s.question_2, s.question_3, s.question_4];
    const video = s.video_analysis;
    const embedUrl = video ? getEmbedUrl(video.url) : null;

    return (<div style={{ paddingBottom: 100 }}>
        <Card delay={.1} style={{ background: `linear-gradient(135deg,${T.warn}06,${T.danger}06)`, border: `1px solid ${T.warn}28` }}>
            <div style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: T.warn, letterSpacing: 2.5, textTransform: "uppercase" }}>Honest Self-Assessment</div></Card>

        {qs.map((q, i) => (<Card key={i} delay={.12 * (i + 1)}>
            <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: `${T.accent}18`, border: `1px solid ${T.accent}38`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 700, color: T.accent, fontFamily: "'IBM Plex Mono',monospace" }}>{i + 1}</div>
                <div style={{ fontSize: 13, color: T.text, lineHeight: 1.7, fontWeight: 500 }}>{q}</div></div></Card>))}

        {video && embedUrl && (
            <Card delay={.6} style={{ background: T.surface, border: `1px solid ${T.border}`, scrollMarginTop: 100 }}>
                <SectionLabel color={T.blue}>📺 Recommended Watch</SectionLabel>
                <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, borderRadius: 12, overflow: "hidden", marginBottom: 12, background: "#000" }}>
                    <iframe
                        src={embedUrl}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                    />
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 4, lineHeight: 1.4 }}>{video.title}</div>
                <div style={{ fontSize: 11, color: T.textDim, marginBottom: 8 }}>via {video.channel}</div>
                <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.5, fontStyle: "italic", borderLeft: `2px solid ${T.blue}`, paddingLeft: 8 }}>
                    "Why: {video.why_watch}"
                </div>
            </Card>
        )}

        <Card delay={.7} style={{ background: `linear-gradient(135deg,${T.card},${T.accent}06)`, border: `1px solid ${T.accent}38` }}>
            <SectionLabel color={T.accent}>Remember</SectionLabel>
            <div style={{ fontSize: 14, color: T.text, lineHeight: 1.8, fontStyle: "italic" }}>"{s.mindset_reminder}"</div></Card>
        <div style={{ textAlign: "center", padding: "18px", marginTop: 6, animation: "fi .5s ease .9s both" }}>
            <div style={{ fontSize: 10, color: T.textDim, letterSpacing: 2.5, textTransform: "uppercase" }}>Built by</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: T.accent, letterSpacing: 1, marginTop: 3 }}>Stock Fortress</div>
            <div style={{ fontSize: 11, color: T.textDim, marginTop: 3 }}>Research before you trade. Always.</div></div>
    </div>);
}
