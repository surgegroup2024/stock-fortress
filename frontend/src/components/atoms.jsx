import { T } from "../theme";

export const Badge = ({ children, color = T.accent }) => (
    <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: .5, color, background: `${color}18`, border: `1px solid ${color}40` }}>{children}</span>
);

export const Card = ({ children, delay = 0, glow, border: borderColor, style = {} }) => (
    <div style={{
        background: T.card, borderRadius: 14, border: `1px solid ${borderColor || T.border}`, padding: "18px", marginBottom: 14, animation: `fi .45s ease ${delay}s both`,
        boxShadow: glow ? `0 10px 30px ${T.accentDim}, 0 4px 12px rgba(0,0,0,0.03)` : `0 2px 10px rgba(0,0,0,.03), 0 1px 2px rgba(0,0,0,.02)`, ...style
    }}>{children}</div>
);

export const MetricRow = ({ label, value, hl }) => {
    const v = typeof value === "string" ? value : (value ?? "").toString();
    const isLong = v.length > 60;
    if (isLong) return (
        <div style={{ padding: "10px 0", borderBottom: `1px solid ${T.border}22` }}>
            <div style={{ color: T.textSec, fontSize: 12, fontWeight: 700, letterSpacing: .5, textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
            <div style={{ color: hl || T.text, fontSize: 13, lineHeight: 1.65, fontFamily: "'IBM Plex Mono',monospace" }}>{value}</div>
        </div>
    );
    return (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14, padding: "10px 0", borderBottom: `1px solid ${T.border}22` }}>
            <span style={{ color: T.textSec, fontSize: 13, flexShrink: 0 }}>{label}</span>
            <span style={{ color: hl || T.text, fontSize: 13, fontWeight: 600, fontFamily: "'IBM Plex Mono',monospace", textAlign: "right", lineHeight: 1.4 }}>{value}</span>
        </div>
    );
};

export const Flags = ({ items, type = "red" }) => {
    const c = type === "red" ? T.danger : T.accent;
    const ic = type === "red" ? "✕" : "✓";
    return (<div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {items.map((it, i) => (<div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, animation: `fi .35s ease ${.08 * i}s both` }}>
            <span style={{ color: c, fontSize: 10, fontWeight: 700, marginTop: 3, flexShrink: 0, width: 16, height: 16, borderRadius: "50%", background: `${c}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>{ic}</span>
            <span style={{ color: T.textSec, fontSize: 13, lineHeight: 1.55 }}>{it}</span>
        </div>))}
    </div>);
};

export const NavBtn = ({ onClick, children, primary, disabled, isLoading }) => (
    <button onClick={onClick} disabled={disabled || isLoading} className="nav-btn" style={{
        flex: 1, padding: "14px 18px", borderRadius: 12, border: primary ? "none" : `1px solid ${T.border}`,
        background: primary ? `linear-gradient(135deg,${T.accent},#059669)` : "transparent", color: primary ? "#FFFFFF" : T.textSec, fontSize: 14, fontWeight: 700,
        cursor: (disabled || isLoading) ? "not-allowed" : "pointer", opacity: (disabled || isLoading) ? .45 : 1, transition: "all .15s ease", fontFamily: "'Space Grotesk',sans-serif", letterSpacing: .3,
        minHeight: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
        boxShadow: primary ? `0 4px 14px ${T.accent}30` : "none",
    }}>
        {isLoading && <span style={{ width: 14, height: 14, border: `2px solid ${primary ? '#FFF' : T.textDim}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite", flexShrink: 0 }} />}
        {children}
    </button>
);

export const SectionLabel = ({ children, color = T.textSec }) => (
    <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>{children}</div>
);
