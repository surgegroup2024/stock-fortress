import { T, STEPS } from "../theme";

// Research steps (skip landing at index 0)
const RESEARCH_STEPS = STEPS.filter((_, i) => i > 0);

export default function WizardProgressBar({ currentStep }) {
    if (currentStep === 0) return null; // Hide on landing

    const totalResearchSteps = RESEARCH_STEPS.length;
    const researchIndex = currentStep - 1; // 0-based index into research steps
    const currentStepData = RESEARCH_STEPS[researchIndex];
    const stepLabel = currentStepData?.l || "";
    const stepNum = researchIndex + 1;

    return (
        <div style={{
            padding: "10px 16px 8px",
            background: `${T.bg}F0`,
            backdropFilter: "blur(8px)",
            borderBottom: `1px solid ${T.border}44`,
        }}>
            {/* Step Circles */}
            <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0,
                marginBottom: 6,
            }}>
                {RESEARCH_STEPS.map((s, i) => {
                    const isCompleted = i < researchIndex;
                    const isCurrent = i === researchIndex;
                    const isFuture = i > researchIndex;

                    return (
                        <div key={i} style={{ display: "flex", alignItems: "center" }}>
                            {/* Circle */}
                            <div style={{
                                width: isCurrent ? 26 : 20,
                                height: isCurrent ? 26 : 20,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: isCurrent ? 11 : 9,
                                fontWeight: 700,
                                fontFamily: "'IBM Plex Mono', monospace",
                                transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
                                ...(isCompleted ? {
                                    background: T.accent,
                                    color: "#FFF",
                                    border: `2px solid ${T.accent}`,
                                    boxShadow: `0 0 8px ${T.accent}30`,
                                } : isCurrent ? {
                                    background: `${T.accent}18`,
                                    color: T.accent,
                                    border: `2px solid ${T.accent}`,
                                    animation: "pulseGlow 2s ease-in-out infinite",
                                } : {
                                    background: T.surface,
                                    color: T.textDim,
                                    border: `2px solid ${T.border}`,
                                }),
                            }}>
                                {isCompleted ? "✓" : (isCurrent ? s.i : "")}
                            </div>

                            {/* Connector Line */}
                            {i < totalResearchSteps - 1 && (
                                <div style={{
                                    width: window.innerWidth < 400 ? 6 : 12,
                                    height: 2,
                                    borderRadius: 1,
                                    transition: "background 0.35s ease",
                                    background: i < researchIndex
                                        ? T.accent
                                        : T.border,
                                }} />
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Text Label */}
            <div style={{
                textAlign: "center",
                fontSize: 11,
                fontWeight: 600,
                color: T.textSec,
                fontFamily: "'Space Grotesk', sans-serif",
            }}>
                <span style={{ color: T.accent, fontWeight: 700 }}>
                    Step {stepNum} of {totalResearchSteps}
                </span>
                {stepLabel && (
                    <span style={{ color: T.textDim }}> — {stepLabel}</span>
                )}
            </div>
        </div>
    );
}
