import { useState, useMemo } from "react";
import { T } from "../theme";

export default function ROICalculator() {
    const [principal, setPrincipal] = useState(10000);
    const [years, setYears] = useState(10);

    const marketRate = 0.08; // Average S&P 500 return
    const fortressRate = 0.12; // Potential return with better stock picking (alpha)

    const marketValue = useMemo(() => principal * Math.pow(1 + marketRate, years), [principal, years]);
    const fortressValue = useMemo(() => principal * Math.pow(1 + fortressRate, years), [principal, years]);
    const difference = fortressValue - marketValue;

    const costOfService = 14.99 * 12 * years; // Premium plan cost over time

    return (
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: 32, marginTop: 40 }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
                <h3 style={{ fontSize: 24, fontWeight: 700, color: T.text, marginBottom: 8 }}>Is Better Research Worth It?</h3>
                <p style={{ fontSize: 14, color: T.textSec }}>See how a small edge in returns compounds over time.</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 40 }}>
                {/* Inputs */}
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <label style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Investable Assets</label>
                            <span style={{ fontSize: 14, fontWeight: 700, color: T.accent, fontFamily: "'IBM Plex Mono',monospace" }}>${principal.toLocaleString()}</span>
                        </div>
                        <input
                            type="range" min="1000" max="100000" step="1000"
                            value={principal} onChange={e => setPrincipal(Number(e.target.value))}
                            style={{ width: "100%", accentColor: T.accent, cursor: "pointer" }}
                        />
                    </div>

                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                            <label style={{ fontSize: 14, fontWeight: 600, color: T.text }}>Time Horizon</label>
                            <span style={{ fontSize: 14, fontWeight: 700, color: T.accent, fontFamily: "'IBM Plex Mono',monospace" }}>{years} Years</span>
                        </div>
                        <input
                            type="range" min="1" max="30" step="1"
                            value={years} onChange={e => setYears(Number(e.target.value))}
                            style={{ width: "100%", accentColor: T.accent, cursor: "pointer" }}
                        />
                    </div>

                    <div style={{ background: `${T.accent}10`, padding: 16, borderRadius: 12, border: `1px solid ${T.accent}30` }}>
                        <div style={{ fontSize: 13, color: T.textSec, marginBottom: 4 }}>The Cost of Stock Fortress</div>
                        <div style={{ fontSize: 20, fontWeight: 700, color: T.text }}>${costOfService.toLocaleString()} <span style={{ fontSize: 13, fontWeight: 400, color: T.textDim }}>total over {years} years</span></div>
                    </div>
                </div>

                {/* Results */}
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>
                        <div>
                            <div style={{ fontSize: 13, color: T.textSec }}>Average Market Return (8%)</div>
                            <div style={{ fontSize: 18, fontWeight: 600, color: T.textDim }}>${marketValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", paddingBottom: 12, borderBottom: `1px solid ${T.border}` }}>
                        <div>
                            <div style={{ fontSize: 13, color: T.textSec }}>With Better Research (12%)</div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: T.accent }}>${fortressValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        </div>
                    </div>

                    <div style={{ marginTop: 16, textAlign: "center", background: `linear-gradient(135deg,${T.accent},#059669)`, padding: 24, borderRadius: 16, color: "#fff", boxShadow: `0 8px 30px ${T.accent}40` }}>
                        <div style={{ fontSize: 14, fontWeight: 600, opacity: 0.9, marginBottom: 4 }}>POTENTIAL EXTRA GAINS</div>
                        <div style={{ fontSize: 32, fontWeight: 800, fontFamily: "'IBM Plex Mono',monospace" }}>+${difference.toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
                        <div style={{ fontSize: 12, opacity: 0.8, marginTop: 8 }}>
                            That's {Math.round(difference / costOfService)}x the cost of our Premium plan.
                        </div>
                    </div>
                </div>
            </div>
            <div style={{ fontSize: 11, color: T.textDim, textAlign: "center", marginTop: 24, fontStyle: "italic" }}>
                *Hypothetical projection for illustrative purposes only. Past performance does not guarantee future results.
            </div>
        </div>
    );
}
