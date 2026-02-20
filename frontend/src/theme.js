// ─── DESIGN TOKENS ───
export const T = {
    bg: "#F9F9F7", bg2: "#F0F0EE", card: "#FFFFFF", cardAlt: "#FDFDFB",
    surface: "#EBEBE6", border: "#E1E1D9", borderLight: "#D6D6CC",
    accent: "#10B981", accentDim: "#10B98115", accentMid: "#10B98133",
    danger: "#EF4444", dangerDim: "#EF444415",
    warn: "#F59E0B", warnDim: "#F59E0B15",
    blue: "#3B82F6", blueDim: "#3B82F615",
    text: "#111827", textSec: "#4B5563", textDim: "#9CA3AF",
    gold: "#D97706",
};

export const SEVERITY = { LOW: T.accent, MEDIUM: T.warn, HIGH: "#F97316", CRITICAL: T.danger };
export const MOAT = { NONE: T.danger, WEAK: "#F97316", MODERATE: T.warn, STRONG: T.accent };
export const GRADE = {
    A: { c: T.accent, l: "Strong" }, B: { c: T.blue, l: "Good" },
    C: { c: T.warn, l: "Fair" }, D: { c: "#F97316", l: "Weak" }, F: { c: T.danger, l: "Poor" }
};
export const ACTION = {
    BUY: { bg: T.accentDim, bc: T.accent, c: T.accent, i: "▲", g: "0 4px 20px #10B98122" },
    WATCH: { bg: T.warnDim, bc: T.warn, c: T.warn, i: "◉", g: "0 4px 20px #F59E0B22" },
    AVOID: { bg: T.dangerDim, bc: T.danger, c: T.danger, i: "✕", g: "0 4px 20px #EF444422" },
};

// ─── STEP CONFIG ───
export const STEPS = [
    { k: "landing", l: "", i: "", n: 0 },
    { k: "s1", l: "Know What You Own", i: "🏢", n: 1 },
    { k: "s2", l: "Check Financials", i: "📊", n: 2 },
    { k: "s2a", l: "Earnings Deep-Dive", i: "🔍", n: "2A" },
    { k: "s3", l: "Understand The Story", i: "📖", n: 3 },
    { k: "s4", l: "Know The Risks", i: "⚠️", n: 4 },
    { k: "s5", l: "Competition", i: "⚔️", n: 5 },
    { k: "s6", l: "Valuation Check", i: "💰", n: 6 },
    { k: "s7", l: "The Verdict", i: "🎯", n: 7 },
    { k: "gut", l: "Gut Check", i: "🧠", n: 8 },
];
export const TOTAL_STEPS = STEPS.length - 1;

// ─── GLOBAL CSS ───
export const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
@keyframes fi { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
@keyframes pu { 0%,100%{opacity:1}50%{opacity:.5} }
@keyframes gl { 0%,100%{box-shadow:0 0 20px ${T.accentDim}}50%{box-shadow:0 0 40px ${T.accentMid}} }
@keyframes spin { to { transform: rotate(360deg) } }
@keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }

/* Step Transition Animations */
@keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes slideOutLeft { from { transform: translateX(0); opacity: 1; } to { transform: translateX(-100%); opacity: 0; } }
@keyframes slideInLeft { from { transform: translateX(-100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
@keyframes fadeStepIn { from { opacity: 0; } to { opacity: 1; } }
@keyframes confettiBurst {
  0% { transform: scale(0) rotate(0deg); opacity: 1; }
  50% { transform: scale(1.2) rotate(180deg); opacity: 1; }
  100% { transform: scale(1) rotate(360deg); opacity: 1; }
}
@keyframes confettiPiece {
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(80px) rotate(720deg); opacity: 0; }
}
@keyframes celebratePop {
  0% { transform: scale(0.5); opacity: 0; }
  60% { transform: scale(1.15); }
  100% { transform: scale(1); opacity: 1; }
}
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 0 ${T.accent}40; }
  50% { box-shadow: 0 0 0 6px ${T.accent}00; }
}

* { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }
body { background:${T.bg}; overflow-x:hidden; }
::-webkit-scrollbar{width:0}
input::placeholder{color:${T.textDim}}
.clickable { cursor: pointer; transition: transform 0.2s; }
.clickable:active { transform: scale(0.95); }

/* Step Transition Wrapper */
.step-slide-next { animation: slideInRight 250ms ease-out both; }
.step-slide-prev { animation: slideInLeft 250ms ease-out both; }

/* Nav Button Enhanced */
.nav-btn { transition: all 0.15s ease; }
.nav-btn:active { transform: scale(0.95); opacity: 0.8; }
.nav-btn:disabled { pointer-events: none; }

/* Verdict Celebration */
.verdict-celebrate { animation: celebratePop 0.5s ease-out both; }

/* Show More Toggle */
.show-more-btn {
  background: none; border: none; color: ${T.accent}; font-size: 12px; font-weight: 600;
  cursor: pointer; padding: 6px 0; font-family: 'Space Grotesk', sans-serif;
  display: flex; align-items: center; gap: 4px;
}
.show-more-btn:hover { text-decoration: underline; }

/* Reduced motion fallback */
@media (prefers-reduced-motion: reduce) {
  .step-slide-next, .step-slide-prev { animation: fadeStepIn 150ms ease both !important; }
  * { animation-duration: 0.01ms !important; }
}

/* RESPONSIVE LAYOUT */
.layout-container {
    width: 100%;
    margin: 0 auto;
    max-width: 480px;
    transition: max-width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
@media (min-width: 768px) {
    .layout-container { max-width: 720px; }
}
@media (min-width: 1024px) {
    .layout-container { max-width: 1024px; }
}
`;
