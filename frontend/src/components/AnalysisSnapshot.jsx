import { T } from "../theme";
import { Card, Badge, SectionLabel } from "./atoms";
import { DCFCard, RevenueBreakdown, FinancialGrid, SentimentRow, SmartText, BigMetric, ContextBadge } from "./steps";

const SimpleMetric = ({ label, value, hl }) => (
    <div style={{ background: T.surface, padding: "12px", borderRadius: 12, border: `1px solid ${T.border}` }}>
        <div style={{ fontSize: 10, color: T.textDim, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase" }}>{label}</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: hl || T.text, marginTop: 4, fontFamily: "'IBM Plex Mono',monospace" }}>{value || "—"}</div>
    </div>
);

export default function AnalysisSnapshot({ data, onViewFull }) {
    if (!data || !data.meta) return null;
    const m = data.meta;

    // CORRECT KEYS MAPPED FROM STEPS.JSX
    const s2 = data.step_2_check_the_financials || {};
    const s2a = data.step_2a_earnings_and_guidance_review || {};
    const s3 = data.step_3_understand_the_story || {};
    const s4 = data.step_4_know_the_risks || {};
    const s5 = data.step_5_check_the_competition || {};
    const s6 = data.step_6_valuation_reality_check || {};
    const v = data.step_7_verdict || {};

    const risks = s4.top_risks || [];
    const moat = s5.moat_strength || "NONE";
    const target = s6.base_case_target || "—";

    const action = v.action || "HOLD";
    const actionColor = action === "BUY" ? T.accent : action === "AVOID" ? T.danger : T.warn;

    return (
        <div style={{ paddingBottom: 40, animation: "fi .5s ease both" }}>
            {/* MATCHING HEADER STYLE FROM REPORT PAGE BUT COMPACT */}
            <div style={{ textAlign: "center", marginBottom: 24, padding: "20px 0" }}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "8px 24px", borderRadius: 20, background: `${actionColor}15`, border: `1px solid ${actionColor}40`, marginBottom: 16 }}>
                    <div style={{ fontSize: 24 }}>{action === "BUY" ? "🚀" : action === "AVOID" ? "🛑" : "👀"}</div>
                    <div style={{ fontSize: 20, fontWeight: 800, color: actionColor, letterSpacing: 1 }}>VERDICT: {action}</div>
                </div>

                <h1 style={{ fontSize: 42, fontWeight: 800, color: T.text, margin: "0 0 8px 0", fontFamily: "'IBM Plex Mono',monospace" }}>{m.ticker}</h1>
                <div style={{ fontSize: 18, color: T.textSec }}>{m.company_name}</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: T.text, marginTop: 12, fontFamily: "'IBM Plex Mono',monospace" }}>{m.current_price}</div>
            </div>

            <div style={{ display: "grid", gap: 16 }}>
                {/* 1. KEY SIGNALS */}
                <Card>
                    <SectionLabel color={T.blue}>🎯 Executive Summary</SectionLabel>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 16 }}>
                        <SimpleMetric label="Health Grade" value={s2.financial_health_grade} hl={s2.financial_health_grade === "A" || s2.financial_health_grade === "B" ? T.accent : T.text} />
                        <SimpleMetric label="Moat" value={moat} hl={moat === "STRONG" || moat === "WIDE" ? T.accent : T.text} />
                        <SimpleMetric label="Base Price Target" value={target} hl={T.blue} />
                    </div>
                </Card>

                {/* 2. VALUATION (DCF) */}
                <Card>
                    <SectionLabel color={T.accent}>💰 Valuation Model</SectionLabel>
                    {s6.simple_dcf_implied_value ? (
                        <>
                            <DCFCard text={s6.simple_dcf_implied_value} />
                            <ContextBadge text={s6.valuation_context} />
                        </>
                    ) : (
                        <div style={{ padding: 20, textAlign: "center", color: T.textDim, fontStyle: "italic", fontSize: 13 }}>
                            Valuation model data unavailable.
                        </div>
                    )}
                </Card>

                {/* 3. BUSINESS QUALITY */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
                    <Card>
                        <SectionLabel color={T.blue}>📊 Growth & Margins</SectionLabel>
                        {(s2.revenue_growth_yoy || s2.gross_margin) ? (
                            <>
                                <FinancialGrid s={s2} />
                                <RevenueBreakdown items={s2.revenue_breakdown} />
                            </>
                        ) : (
                            <div style={{ padding: 20, textAlign: "center", color: T.textDim, fontStyle: "italic", fontSize: 13 }}>
                                Financial data unavailable.
                            </div>
                        )}
                    </Card>

                    <Card>
                        <SectionLabel color={T.warn}>⚠️ Key Risks</SectionLabel>
                        {risks.length > 0 ? (
                            <>
                                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                    {risks.slice(0, 3).map((r, i) => (
                                        <div key={i} style={{ padding: "10px", borderRadius: 8, background: `${T.danger}08`, borderLeft: `3px solid ${T.danger}`, fontSize: 13, color: T.textSec, lineHeight: 1.5 }}>
                                            {r.risk || r}
                                        </div>
                                    ))}
                                </div>
                                {risks.length > 3 && (
                                    <div style={{ marginTop: 12, fontSize: 12, color: T.textDim, fontStyle: "italic" }}>
                                        + {risks.length - 3} more risks in full report
                                    </div>
                                )}
                            </>
                        ) : (
                            <div style={{ padding: 20, textAlign: "center", color: T.textDim, fontSize: 13, fontStyle: "italic" }}>
                                No specific risks identified.
                            </div>
                        )}
                    </Card>
                </div>

                {/* 4. SEGMENT PERFORMANCE */}
                {s2a.segment_performance_narrative && (
                    <Card>
                        <SectionLabel color={T.purple}>📈 Segment Performance</SectionLabel>
                        <SentimentRow text={s2a.segment_performance_narrative} />
                    </Card>
                )}
            </div>

            {/* ACTION BAR */}
            <div style={{ marginTop: 30, textAlign: "center" }}>
                <div style={{ fontSize: 14, color: T.textSec, marginBottom: 12 }}>Want to see the full 7-step analysis?</div>
                <button onClick={onViewFull} style={{ padding: "14px 32px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, color: T.text, fontSize: 14, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", transition: "transform 0.2s" }}>
                    View Full Step-by-Step Report →
                </button>
            </div>
        </div>
    );
}
