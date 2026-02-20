import { T, STEPS } from "../theme";

// S7 (The Verdict) is at STEPS index 8
const VERDICT_STEP_INDEX = 8;

export default function VerdictTeaser({ currentStep, ticker }) {
    // Hide on landing (0) and gut check (9)
    if (currentStep === 0 || currentStep > VERDICT_STEP_INDEX) return null;

    const stepsRemaining = VERDICT_STEP_INDEX - currentStep;

    // ON VERDICT STEP — Show celebration
    if (currentStep === VERDICT_STEP_INDEX) {
        return (
            <div className="verdict-celebrate" style={{
                padding: "10px 16px",
                background: `linear-gradient(135deg, ${T.accent}15, ${T.blue}10)`,
                borderBottom: `1px solid ${T.accent}30`,
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
            }}>
                {/* Confetti pieces */}
                {[...Array(8)].map((_, i) => (
                    <span key={i} style={{
                        position: "absolute",
                        top: -4,
                        left: `${10 + i * 12}%`,
                        fontSize: 12,
                        animation: `confettiPiece 1.5s ease-out ${i * 0.1}s both`,
                        pointerEvents: "none",
                    }}>
                        {["🎉", "✨", "🎊", "⭐", "💚", "🌟", "🎯", "✅"][i]}
                    </span>
                ))}
                <div style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: T.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                }}>
                    <span style={{ fontSize: 16 }}>✅</span>
                    Research Complete — Your {ticker} Verdict
                </div>
            </div>
        );
    }

    // ALMOST THERE — 1 step remaining (on S6/Valuation, step index 7)
    if (stepsRemaining === 1) {
        return (
            <div style={{
                padding: "8px 16px",
                background: `linear-gradient(135deg, ${T.accent}12, ${T.blue}08)`,
                borderBottom: `1px solid ${T.accent}25`,
                textAlign: "center",
            }}>
                <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: T.accent,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                }}>
                    <span>🔓</span>
                    Almost there — 1 more step to your {ticker} verdict!
                </div>
            </div>
        );
    }

    // DEFAULT — Show remaining count
    return (
        <div style={{
            padding: "8px 16px",
            background: `${T.surface}88`,
            borderBottom: `1px solid ${T.border}33`,
            textAlign: "center",
        }}>
            <div style={{
                fontSize: 12,
                fontWeight: 500,
                color: T.textSec,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 5,
            }}>
                <span>🔒</span>
                Your <strong style={{ color: T.text }}>{ticker}</strong> verdict is ready — complete{" "}
                <strong style={{ color: T.accent }}>{stepsRemaining}</strong> more step{stepsRemaining > 1 ? "s" : ""} to unlock it
            </div>
        </div>
    );
}
