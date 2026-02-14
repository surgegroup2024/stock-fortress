import { T, SEVERITY, MOAT, GRADE, ACTION } from "../theme";
import { Badge, Card, MetricRow, Flags, SectionLabel } from "./atoms";

// ─── STEP VIEWS ───

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
        <Card delay={.2}>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 80 }}><MetricRow label="Trailing P/E" value={m.trailing_pe || "N/A"} /></div>
                <div style={{ flex: 1, minWidth: 80 }}><MetricRow label="Forward P/E" value={m.forward_pe || "N/A"} /></div>
            </div>
            <MetricRow label="Beta" value={m.beta || "N/A"} />
            <MetricRow label="Avg Volume" value={m.avg_volume} />
            <MetricRow label="Report Date" value={m.report_date} />
            <div style={{ fontSize: 10, color: T.textDim, marginTop: 6, fontStyle: "italic" }}>{m.data_freshness_note}</div>
        </Card>
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
        <Card delay={.1}><SectionLabel color={T.accent}>In Plain English</SectionLabel>
            <div style={{ fontSize: 16, color: T.text, lineHeight: 1.7, fontWeight: 500 }}>"{s.one_liner}"</div></Card>
        <Card delay={.2}><SectionLabel>How They Make Money</SectionLabel>
            <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>{s.how_it_makes_money}</div></Card>
        <Card delay={.3}><SectionLabel>Key Products</SectionLabel>
            {s.key_products_or_services.map((p, i) => (<div key={i} style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 0", borderBottom: i < s.key_products_or_services.length - 1 ? `1px solid ${T.border}22` : "none", animation: `fi .3s ease ${.08 * i}s both` }}>
                <span style={{ color: T.accent, fontSize: 7 }}>●</span><span style={{ color: T.textSec, fontSize: 13 }}>{p}</span></div>))}</Card>
        <Card delay={.4}><MetricRow label="Target Customer" value={s.customer_type} />
            <div style={{ marginTop: 10, textAlign: "center" }}><span style={{ fontSize: 11, color: T.textDim }}>Could you explain this to a friend?</span>
                <div style={{ marginTop: 5, cursor: "pointer" }} onClick={onNext} className="clickable">
                    <Badge color={s.pass_fail === "YES" ? T.accent : T.danger}>{s.pass_fail} ➔</Badge>
                </div>
            </div>
        </Card>
    </div>);
}

export function S2({ d }) {
    const s = d.step_2_check_the_financials;
    const g = GRADE[s.financial_health_grade] || GRADE.C;
    return (<div>
        <Card delay={.1} glow><div style={{ textAlign: "center", marginBottom: 4 }}>
            <SectionLabel color={T.textDim}>Financial Health Grade</SectionLabel>
            <div style={{ display: "inline-flex", width: 68, height: 68, borderRadius: "50%", alignItems: "center", justifyContent: "center", background: `${g.c}18`, border: `3px solid ${g.c}`, boxShadow: `0 0 18px ${g.c}28` }}>
                <span style={{ fontSize: 30, fontWeight: 700, color: g.c, fontFamily: "'IBM Plex Mono',monospace" }}>{s.financial_health_grade}</span></div>
            <div style={{ fontSize: 12, color: g.c, fontWeight: 600, marginTop: 5 }}>{g.l}</div></div></Card>
        <Card delay={.2}>
            <SectionLabel color={T.textDim}>Latest: {s.latest_quarter}</SectionLabel>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, gap: 15 }}>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: T.textDim, letterSpacing: 1, marginBottom: 4 }}>REVENUE</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 6 }}>{s.revenue_latest}</div>
                    <Badge color={s.revenue_beat_miss === "BEAT" || (s.revenue_beat_miss?.includes("BEAT")) ? T.accent : T.danger}>{s.revenue_beat_miss}</Badge>
                </div>
                <div style={{ flex: 1, textAlign: "right" }}>
                    <div style={{ fontSize: 9, fontWeight: 800, color: T.textDim, letterSpacing: 1, marginBottom: 4 }}>EPS</div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: T.text, marginBottom: 6 }}>{s.eps_latest}</div>
                    <Badge color={s.eps_beat_miss?.includes("BEAT") ? T.accent : T.danger}>{s.eps_beat_miss}</Badge>
                </div>
            </div>
            <MetricRow label="YoY Growth" value={s.revenue_growth_yoy} hl={T.accent} />
            <MetricRow label="Gross Margin" value={s.gross_margin} />
            <MetricRow label="Operating Margin" value={s.operating_margin_trend} />
            <MetricRow label="FCF" value={s.free_cash_flow_latest} hl={T.accent} />
            <MetricRow label="Cash" value={s.cash_position} hl={T.accent} />
            <MetricRow label="Debt" value={s.debt_level} hl={s.debt_level === "LOW" ? T.accent : T.warn} /></Card>
        <Card delay={.3}><SectionLabel color={T.danger}>🚩 Red Flags</SectionLabel><Flags items={s.red_flags} type="red" /></Card>
        <Card delay={.4}><SectionLabel color={T.accent}>✅ Green Flags</SectionLabel><Flags items={s.green_flags} type="green" /></Card>
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
            <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>{s.segment_breakdown}</div>
        </Card>
        {s.one_time_items && s.one_time_items !== "None" && (
            <Card delay={.3} border={T.warn}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>⚠️</span>
                    <div>
                        <SectionLabel color={T.warn}>One-Time Adjustments</SectionLabel>
                        <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>{s.one_time_items}</div>
                    </div>
                </div>
            </Card>
        )}
        <Card delay={.4} style={{ background: `linear-gradient(135deg,${T.accent}06,${T.blue}06)`, border: `1px solid ${T.accent}28` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <SectionLabel color={T.accent} style={{ marginBottom: 0 }}>📈 Guidance Update</SectionLabel>
                <Badge color={T.warn}>FORWARD-LOOKING</Badge>
            </div>
            <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.75 }}>{s.guidance_changes}</div>
        </Card>
        <Card delay={.5}>
            <SectionLabel color={T.gold}>🏦 Analyst Reaction</SectionLabel>
            <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>{s.analyst_reaction}</div>
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
        <Card delay={.1} border={T.accent}><SectionLabel color={T.accent}>Bull Case</SectionLabel><div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>{s.bull_case}</div></Card>
        <Card delay={.15}><SectionLabel color={T.blue}>Base Case</SectionLabel><div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>{s.base_case}</div></Card>
        <Card delay={.2} border={T.danger}><SectionLabel color={T.danger}>Bear Case</SectionLabel><div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>{s.bear_case}</div></Card>
        <Card delay={.3} style={{ background: `linear-gradient(135deg,${T.bg2},${T.surface}44)` }}><SectionLabel color={T.gold}>Macro Overlay</SectionLabel><div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>{s.macro_overlay}</div></Card>
        <Card delay={.4}><SectionLabel color={T.accent}>Must Go Right</SectionLabel><Flags items={s.what_must_go_right} type="green" /></Card>
        <Card delay={.5}><SectionLabel color={T.danger}>Bearish Catalysts</SectionLabel><Flags items={s.what_could_break_the_story} type="red" /></Card>
        <Card delay={.6}><SectionLabel color={T.blue}>Timeline</SectionLabel>
            {s.catalyst_timeline?.map((c, i) => (<div key={i} style={{ fontSize: 12, color: T.textSec, marginBottom: 5 }}>• {c}</div>))}
        </Card>
    </div>);
}

export function S4({ d }) {
    const s = d.step_4_know_the_risks;
    return (<div>
        {s.top_risks.map((r, i) => (<Card key={i} delay={.1 * (i + 1)} border={SEVERITY[r.severity]}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text, flex: 1, marginRight: 8 }}>{r.risk}</div>
                <div style={{ display: "flex", gap: 4 }}>
                    <Badge color={SEVERITY[r.severity]}>{r.severity}</Badge>
                    <Badge color={T.textDim}>Prob: {r.likelihood}</Badge>
                </div>
            </div>
            <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.55 }}>{r.explanation}</div></Card>))}
        <Card delay={.4}><SectionLabel color={T.gold}>Ownership Signals</SectionLabel><div style={{ fontSize: 13, color: T.textSec }}>{s.ownership_signals}</div></Card>
        <Card delay={.5}>
            <MetricRow label="Regulatory" value={s.regulatory_exposure} hl={T.danger} />
            <div style={{ marginTop: 8, fontSize: 12, color: T.textSec, lineHeight: 1.55 }}><span style={{ color: T.warn, fontWeight: 600 }}>Concentration: </span>{s.concentration_risk}</div></Card>
    </div>);
}

export function S5({ d }) {
    const s = d.step_5_check_the_competition;
    const mc = MOAT[s.moat_strength] || T.textDim;
    return (<div>
        {s.main_competitors.map((c, i) => (<Card key={i} delay={.1 * (i + 1)}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 5 }}>{c.name}</div>
            <div style={{ fontSize: 12, color: T.textDim, marginBottom: 7 }}>{c.why_compete}</div>
            <div style={{ fontSize: 12, color: T.warn, lineHeight: 1.5 }}><span style={{ fontWeight: 600 }}>Edge: </span>{c.their_advantage}</div></Card>))}
        <Card delay={.4} glow><div style={{ textAlign: "center" }}>
            <SectionLabel color={T.textDim}>Competitive Moat</SectionLabel>
            <div style={{ display: "inline-block", padding: "7px 22px", borderRadius: 10, background: `${mc}18`, border: `2px solid ${mc}`, fontSize: 16, fontWeight: 700, color: mc, letterSpacing: 1 }}>{s.moat_strength}</div>
            <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.6, marginTop: 10 }}>{s.moat_explanation}</div></div></Card>
    </div>);
}

export function S6({ d }) {
    const s = d.step_6_valuation_reality_check;
    const ec = { CHEAP: T.accent, FAIR: T.blue, EXPENSIVE: T.warn, SPECULATIVE: T.danger }[s.is_it_expensive] || T.text;
    return (<div>
        <Card delay={.1}>
            <MetricRow label="Current P/E" value={s.current_pe} />
            {s.forward_pe && <MetricRow label="Forward P/E" value={s.forward_pe} hl={T.blue} />}
            <MetricRow label="P/S Ratio" value={s.price_to_sales} />
            <MetricRow label="EV/EBITDA" value={s.ev_ebitda_if_relevant} />
            <div style={{ textAlign: "center", marginTop: 14 }}><Badge color={ec}>{s.is_it_expensive}</Badge></div>
        </Card>
        {s.sector_or_peer_avg_pe && (
            <Card delay={.15}>
                <SectionLabel color={T.gold}>📊 Peer Comparison</SectionLabel>
                <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>{s.sector_or_peer_avg_pe}</div>
            </Card>
        )}
        {s.simple_dcf_implied_value && (
            <Card delay={.15} style={{ background: `linear-gradient(135deg,${T.bg2},${T.blue}06)`, border: `1px solid ${T.blue}28` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <SectionLabel color={T.blue}>🧮 DCF Implied Value</SectionLabel>
                    <Badge color={T.textDim}>ASSUMPTION</Badge>
                </div>
                <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.7, fontFamily: "'IBM Plex Mono',monospace" }}>{s.simple_dcf_implied_value}</div>
            </Card>
        )}
        <Card delay={.2}><div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>{s.valuation_context}</div></Card>
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
    </div>);
}

export function S7({ d }) {
    const s = d.step_7_verdict;
    const a = ACTION[s.action] || ACTION.WATCH;
    return (<div>
        <Card delay={.1} style={{ background: a.bg, border: `2px solid ${a.bc}`, boxShadow: a.g }}>
            <div style={{ textAlign: "center", padding: "14px 0" }}>
                <div style={{ fontSize: 44, marginBottom: 6 }}>{a.i}</div>
                <div style={{ fontSize: 34, fontWeight: 800, color: a.c, letterSpacing: 2, fontFamily: "'IBM Plex Mono',monospace" }}>{s.action}</div>
                <div style={{ marginTop: 7 }}><Badge color={T.textSec}>Confidence: {s.confidence}</Badge></div>
                <div style={{ fontSize: 14, color: T.text, lineHeight: 1.65, marginTop: 14, fontWeight: 500 }}>{s.one_line_reason}</div></div></Card>
        <Card delay={.2}><SectionLabel color={T.blue}>Signal to Change Course</SectionLabel><div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>{s.what_signal_would_change_this}</div></Card>
        <Card delay={.3}><MetricRow label="Tracking" value={s.most_important_metric_to_track} hl={T.accent} /><MetricRow label="Revisit" value={s.suggested_revisit_date} hl={T.warn} /></Card>
    </div>);
}

export function Gut({ d }) {
    const s = d.investor_gut_check;
    const qs = [s.question_1, s.question_2, s.question_3, s.question_4];
    return (<div>
        <Card delay={.1} style={{ background: `linear-gradient(135deg,${T.warn}06,${T.danger}06)`, border: `1px solid ${T.warn}28` }}>
            <div style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: T.warn, letterSpacing: 2.5, textTransform: "uppercase" }}>Honest Self-Assessment</div></Card>
        {qs.map((q, i) => (<Card key={i} delay={.12 * (i + 1)}>
            <div style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                <div style={{ width: 26, height: 26, borderRadius: 7, background: `${T.accent}18`, border: `1px solid ${T.accent}38`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 13, fontWeight: 700, color: T.accent, fontFamily: "'IBM Plex Mono',monospace" }}>{i + 1}</div>
                <div style={{ fontSize: 13, color: T.text, lineHeight: 1.7, fontWeight: 500 }}>{q}</div></div></Card>))}
        <Card delay={.7} style={{ background: `linear-gradient(135deg,${T.card},${T.accent}06)`, border: `1px solid ${T.accent}38` }}>
            <SectionLabel color={T.accent}>Remember</SectionLabel>
            <div style={{ fontSize: 14, color: T.text, lineHeight: 1.8, fontStyle: "italic" }}>"{s.mindset_reminder}"</div></Card>
        <div style={{ textAlign: "center", padding: "18px", marginTop: 6, animation: "fi .5s ease .9s both" }}>
            <div style={{ fontSize: 10, color: T.textDim, letterSpacing: 2.5, textTransform: "uppercase" }}>Built by</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: T.accent, letterSpacing: 1, marginTop: 3 }}>Stock Fortress</div>
            <div style={{ fontSize: 11, color: T.textDim, marginTop: 3 }}>Research before you trade. Always.</div></div>
    </div>);
}
