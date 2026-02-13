import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════
// STOCK FORTRESS — Pre-Trade Research App
// Architecture: Gemini API (with Google Search grounding) → Structured JSON → UI
// ═══════════════════════════════════════════════════════

const T = {
  bg: "#F9F9F7", bg2: "#F0F0EE", card: "#FFFFFF", cardAlt: "#FDFDFB",
  surface: "#EBEBE6", border: "#E1E1D9", borderLight: "#D6D6CC",
  accent: "#10B981", accentDim: "#10B98115", accentMid: "#10B98133",
  danger: "#EF4444", dangerDim: "#EF444415",
  warn: "#F59E0B", warnDim: "#F59E0B15",
  blue: "#3B82F6", blueDim: "#3B82F615",
  text: "#111827", textSec: "#4B5563", textDim: "#9CA3AF",
  gold: "#D97706",
};

const SEVERITY = { LOW: T.accent, MEDIUM: T.warn, HIGH: "#F97316", CRITICAL: T.danger };
const MOAT = { NONE: T.danger, WEAK: "#F97316", MODERATE: T.warn, STRONG: T.accent };
const GRADE = {
  A: { c: T.accent, l: "Strong" }, B: { c: T.blue, l: "Good" },
  C: { c: T.warn, l: "Fair" }, D: { c: "#F97316", l: "Weak" }, F: { c: T.danger, l: "Poor" }
};
const ACTION = {
  BUY: { bg: T.accentDim, bc: T.accent, c: T.accent, i: "▲", g: "0 4px 20px #10B98122" },
  WATCH: { bg: T.warnDim, bc: T.warn, c: T.warn, i: "◉", g: "0 4px 20px #F59E0B22" },
  AVOID: { bg: T.dangerDim, bc: T.danger, c: T.danger, i: "✕", g: "0 4px 20px #EF444422" },
};

// ─── DEMO TICKERS ───
const DEMOS = {
  HIMS: {
    meta: { ticker: "HIMS", company_name: "Hims & Hers Health, Inc.", sector: "Healthcare / Telehealth", current_price: "$15.80", market_cap: "$3.6B", trailing_pe: "30.86", forward_pe: "22.50", fifty_two_week_range: "$15.63 - $72.98", avg_volume: "46.75M", beta: "1.2", report_date: "Feb 13, 2026", data_freshness_note: "Market close Feb 12, 2026" },
    step_1_know_what_you_own: { one_liner: "Hims sells prescription medications online — you chat with a doctor on your phone, and pills arrive by mail.", how_it_makes_money: "Monthly subscriptions for prescription drugs (hair loss, ED, skincare, weight loss). Cash-pay, no insurance. Also sells OTC supplements and skincare.", key_products_or_services: ["Telehealth consultations", "Hair loss Rx (finasteride, minoxidil)", "Sexual health Rx (sildenafil, tadalafil)", "Compounded GLP-1 weight loss drugs", "Skincare, mental health, supplements"], customer_type: "Millennials & Gen-Z wanting convenient, affordable healthcare", pass_fail: "YES" },
    step_2_check_the_financials: { latest_quarter: "Q3 2025", revenue_latest: "$599M", revenue_growth_yoy: "+49%", revenue_beat_miss: "BEAT", eps_latest: "$0.08", eps_beat_miss: "MISS (40%)", net_income_latest: "$15.8M", profitable: true, gross_margin: "74%", operating_margin_trend: "Compressing", debt_level: "LOW", free_cash_flow_latest: "$79.4M", cash_position: "$250M", financial_health_grade: "B", red_flags: ["Gross margin declining (79% → 74% YoY)", "Revenue per subscriber falling ($84 → $74)", "~35% of revenue from GLP-1s under legal threat", "EPS missed estimates by 40% in Q3"], green_flags: ["Revenue growing 49-111% YoY", "FCF positive at $79M/quarter", "2.5M subscribers and growing", "First GAAP profitable year in 2024"] },
    step_2a_earnings_and_guidance_review: { one_time_items: "GAAP vs Adjusted: Stock-based comp of $45M excluded from adjusted figures.", segment_breakdown: "Telehealth subscriptions: +52% YoY ($420M, 70% of rev). Weight loss: +180% YoY ($130M). Dermatology: +18% YoY ($49M).", guidance_changes: "FY2026 revenue guide: $2.3-2.5B (prev $2.1-2.3B). EPS: $0.35-0.50. [FORWARD-LOOKING]", management_tone: "Cautious — 'We remain confident in our core business, but acknowledge regulatory headwinds require us to diversify revenue streams.'", analyst_reaction: "2 downgrades post-earnings (Morgan Stanley, Jefferies). 1 upgrade (Piper Sandler). Avg PT cut from $45 to $28.", forward_statements_note: "All guidance and outlook flagged as [FORWARD-LOOKING] with significant regulatory uncertainty." },
    step_3_understand_the_story: { bull_case: "Scale leader in DTC telehealth with 2.5M subs. GLP-1 crackdown is temporary — core business (hair, skin, ED) was growing before weight loss. At $3.6B for a $2.3B rev company, absurdly cheap if the platform holds.", base_case: "Steady core growth.", bear_case: "Business model built on regulatory arbitrage — selling cheap copies of patented drugs. Novo suing, FDA cracking down, DOJ referred. If enforcement extends beyond GLP-1, entire model at risk.", what_must_go_right: ["Core non-GLP-1 subs keep growing", "Novo lawsuit settles reasonably", "FDA stays limited to GLP-1 enforcement", "Branded partnerships replace some revenue"], what_could_break_the_story: ["FDA bans all mass compounding", "DOJ opens criminal investigation", "Subscriber churn accelerates", "Brand permanently damaged"], macro_overlay: "GLP-1 regulation is the key macro driver for this sector currently.", catalyst_timeline: ["Feb 23: Q4 earnings release"] },
    step_4_know_the_risks: { top_risks: [{ risk: "Novo Nordisk patent lawsuit", severity: "CRITICAL", likelihood: "HIGH", explanation: "Could permanently ban all compounded semaglutide + damages" }, { risk: "FDA enforcement expansion", severity: "HIGH", likelihood: "MEDIUM", explanation: "If enforcement moves beyond GLP-1, entire compounding model breaks" }, { risk: "DOJ criminal referral", severity: "HIGH", likelihood: "HIGH", explanation: "HHS referred HIMS to DOJ — criminal investigation possible" }], ownership_signals: "Insider selling trend in late 2025.", regulatory_exposure: "EXTREME", concentration_risk: "~35% revenue from compounded GLP-1s under threat" },
    step_5_check_the_competition: { main_competitors: [{ name: "Ro (Roman)", why_compete: "Same DTC telehealth model", their_advantage: "More vertically integrated, pivoted to branded GLP-1 earlier" }], moat_strength: "WEAK", moat_explanation: "Strong brand and 2.5M subs, but limited pricing power. Generic drugs are commodities." },
    step_6_valuation_reality_check: { current_pe: "30.86x", forward_pe: "22.50x", sector_or_peer_avg_pe: "25x", price_to_sales: "1.5x", ev_ebitda_if_relevant: "10x", simple_dcf_implied_value: "TTM FCF $318M × 15% 5yr growth [ASSUMPTION] × 3% terminal [ASSUMPTION] × 10% discount = ~$22/share implied value", is_it_expensive: "CHEAP", valuation_context: "At 1.5x forward revenue, priced like a company in permanent decline.", bear_case_target: "$8-12", base_case_target: "$30", bull_case_target: "$55" },
    step_7_verdict: { action: "WATCH", confidence: "MEDIUM", one_line_reason: "Asymmetric setup, but buying before Feb 23 earnings is gambling.", what_signal_would_change_this: "Feb 23 earnings showing core sub growth + 2026 guidance", most_important_metric_to_track: "Non-GLP-1 subscriber net adds (Q4 2025)", suggested_revisit_date: "February 23, 2026" },
    investor_gut_check: { question_1: "Ready to hold?", question_2: "Upside?", question_3: "Lawsuit scope?", question_4: "Size?", mindset_reminder: "Stock-specific warning based on current situation" }
  },
  AAPL: {
    meta: { ticker: "AAPL", company_name: "Apple Inc.", sector: "Technology / Consumer Electronics", current_price: "$232.50", market_cap: "$3.5T", trailing_pe: "37.2", forward_pe: "32.1", fifty_two_week_range: "$169.21 - $260.10", avg_volume: "52.3M", beta: "1.1", report_date: "Feb 13, 2026", data_freshness_note: "Market close Feb 12, 2026" },
    step_1_know_what_you_own: { one_liner: "Apple makes iPhones, Macs, and iPads, and charges you monthly for services.", how_it_makes_money: "~52% from iPhone sales, ~25% from Services.", key_products_or_services: ["iPhone", "Services"], customer_type: "Global consumers", pass_fail: "YES" },
    step_2_check_the_financials: { latest_quarter: "Q1 FY2026", revenue_latest: "$124.3B", revenue_growth_yoy: "+4%", revenue_beat_miss: "BEAT", eps_latest: "$2.18", eps_beat_miss: "BEAT", net_income_latest: "$36.3B", profitable: true, gross_margin: "46.9%", operating_margin_trend: "Stable", debt_level: "MODERATE", free_cash_flow_latest: "$30.6B", cash_position: "$160B", financial_health_grade: "A", red_flags: ["China growth slowing"], green_flags: ["FCF positive", "Buybacks"] },
    step_2a_earnings_and_guidance_review: { one_time_items: "None notable. Clean GAAP quarter.", segment_breakdown: "iPhone: $69.1B (+1%). Services: $26.3B (+14%). Mac: $8.7B (+16%). iPad: $8.1B (+15%). Wearables: $12.1B (-2%).", guidance_changes: "No formal guidance given (Apple policy). Analysts expect Q2 rev ~$94B. [FORWARD-LOOKING]", management_tone: "Confident — 'Apple Intelligence is off to a very strong start and we're just getting started.'", analyst_reaction: "Broadly positive. 3 PT raises post-earnings. Consensus PT ~$255.", forward_statements_note: "Apple does not provide formal guidance. All estimates are consensus-based [FORWARD-LOOKING]." },
    step_3_understand_the_story: { bull_case: "Apple Intelligence supercycle.", base_case: "Steady growth.", bear_case: "Regulatory fees cut.", what_must_go_right: ["AI adoption"], what_could_break_the_story: ["China ban"], macro_overlay: "Tech regulation trends", catalyst_timeline: ["April Earnings"] },
    step_4_know_the_risks: { top_risks: [{ risk: "China", severity: "HIGH", likelihood: "MEDIUM", explanation: "Revenue drop" }], ownership_signals: "Stable", regulatory_exposure: "MODERATE", concentration_risk: "iPhone" },
    step_5_check_the_competition: { main_competitors: [{ name: "Samsung", why_compete: "Premium phones", their_advantage: "AI speed" }], moat_strength: "STRONG", moat_explanation: "Device ecosystem" },
    step_6_valuation_reality_check: { current_pe: "37.2x", forward_pe: "32.1x", sector_or_peer_avg_pe: "30x", price_to_sales: "8.5x", ev_ebitda_if_relevant: "25x", simple_dcf_implied_value: "TTM FCF $112B × 8% growth [ASSUMPTION] × 3% terminal × 10% discount = ~$210/share implied", is_it_expensive: "EXPENSIVE", valuation_context: "Trading at historical premium.", bear_case_target: "$180", base_case_target: "$230", bull_case_target: "$300" },
    step_7_verdict: { action: "WATCH", confidence: "HIGH", one_line_reason: "Great biz, full price.", what_signal_would_change_this: "Pullback to $200", most_important_metric_to_track: "Services growth", suggested_revisit_date: "April 2026" },
    investor_gut_check: { question_1: "Safe haven?", question_2: "Upside?", question_3: "Services?", question_4: "Size?", mindset_reminder: "Premium price" }
  },
  TSLA: {
    meta: { ticker: "TSLA", company_name: "Tesla, Inc.", sector: "Automotive / AI", current_price: "$345.20", market_cap: "$1.1T", trailing_pe: "155", forward_pe: "100", fifty_two_week_range: "$138.80 - $488.54", avg_volume: "78.5M", beta: "2.5", report_date: "Feb 13, 2026", data_freshness_note: "Market close Feb 12, 2026" },
    step_1_know_what_you_own: { one_liner: "Tesla makes EVs and develops AI/robots.", how_it_makes_money: "Car sales and energy storage.", key_products_or_services: ["EVs", "Energy"], customer_type: "Tech-savvy people", pass_fail: "YES" },
    step_2_check_the_financials: { latest_quarter: "Q4 2025", revenue_latest: "$25.7B", revenue_growth_yoy: "+2%", revenue_beat_miss: "MISS", eps_latest: "$0.72", eps_beat_miss: "MISS", net_income_latest: "$2.3B", profitable: true, gross_margin: "19.8%", operating_margin_trend: "Compressing", debt_level: "LOW", free_cash_flow_latest: "$2.0B", cash_position: "$34B", financial_health_grade: "C", red_flags: ["Margin compression"], green_flags: ["Energy growth"] },
    step_2a_earnings_and_guidance_review: { one_time_items: "$600M restructuring charge (Austin layoffs). Adjusted EPS $0.85 vs GAAP $0.72.", segment_breakdown: "Automotive: $19.8B (-3%). Energy/Storage: $3.1B (+67%). Services: $2.8B (+12%).", guidance_changes: "FY2026 deliveries: 2.1-2.3M vehicles (flat-ish). Energy: 100GWh target [FORWARD-LOOKING]", management_tone: "Defensive — 'The market doesn't appreciate the optionality in our robotaxi and Optimus programs.'", analyst_reaction: "Mixed. 2 downgrades (Goldman, UBS). 1 upgrade (Wedbush). Wide PT range: $85-$550.", forward_statements_note: "Robotaxi timeline and Optimus revenue projections are [FORWARD-LOOKING] with high uncertainty." },
    step_3_understand_the_story: { bull_case: "AI/Robot/Energy leader.", base_case: "Car company.", bear_case: "Commoditized auto.", what_must_go_right: ["Robotaxi"], what_could_break_the_story: ["Reg delay"], macro_overlay: "EV adoption rates", catalyst_timeline: ["2026 Robotaxi"] },
    step_4_know_the_risks: { top_risks: [{ risk: "Regs", severity: "CRITICAL", likelihood: "HIGH", explanation: "Robotaxi delay" }], ownership_signals: "Elon selling", regulatory_exposure: "HIGH", concentration_risk: "Elon key man" },
    step_5_check_the_competition: { main_competitors: [{ name: "BYD", why_compete: "Same market", their_advantage: "Cost" }], moat_strength: "MODERATE", moat_explanation: "Brand and data" },
    step_6_valuation_reality_check: { current_pe: "155x", forward_pe: "100x", sector_or_peer_avg_pe: "30x", price_to_sales: "10x", ev_ebitda_if_relevant: "50x", simple_dcf_implied_value: "TTM FCF $8B × 20% growth [ASSUMPTION] × 3% terminal × 12% discount (high beta) = ~$120/share implied", is_it_expensive: "SPECULATIVE", valuation_context: "AI premium priced in.", bear_case_target: "$150", base_case_target: "$300", bull_case_target: "$500" },
    step_7_verdict: { action: "WATCH", confidence: "LOW", one_line_reason: "Extreme valuation.", what_signal_would_change_this: "Margin recovery", most_important_metric_to_track: "Auto margins", suggested_revisit_date: "April 2026" },
    investor_gut_check: { question_1: "AI bet?", question_2: "Growth?", question_3: "Elon?", question_4: "Risk?", mindset_reminder: "High volatility" }
  }
};

// ─── STEP CONFIG ───
const STEPS = [
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
const TOTAL_STEPS = STEPS.length - 1; // exclude landing

// ─── STYLES ───
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap');
@keyframes fi { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
@keyframes pu { 0%,100%{opacity:1}50%{opacity:.5} }
@keyframes gl { 0%,100%{box-shadow:0 0 20px ${T.accentDim}}50%{box-shadow:0 0 40px ${T.accentMid}} }
@keyframes spin { to { transform: rotate(360deg) } }
* { box-sizing:border-box; margin:0; padding:0; -webkit-tap-highlight-color:transparent; }
body { background:${T.bg}; overflow-x:hidden; }
::-webkit-scrollbar{width:0}
input::placeholder{color:${T.textDim}}
.clickable { cursor: pointer; transition: transform 0.2s; }
.clickable:active { transform: scale(0.95); }
`;

// ─── ATOMS ───
const Badge = ({ children, color = T.accent }) => (
  <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: .5, color, background: `${color}18`, border: `1px solid ${color}40` }}>{children}</span>
);

const Card = ({ children, delay = 0, glow, border: borderColor, style = {} }) => (
  <div style={{
    background: T.card, borderRadius: 14, border: `1px solid ${borderColor || T.border}`, padding: "18px", marginBottom: 14, animation: `fi .45s ease ${delay}s both`,
    boxShadow: glow ? `0 10px 30px ${T.accentDim}, 0 4px 12px rgba(0,0,0,0.03)` : `0 2px 10px rgba(0,0,0,.03), 0 1px 2px rgba(0,0,0,.02)`, ...style
  }}>{children}</div>
);

const MetricRow = ({ label, value, hl }) => {
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

const Flags = ({ items, type = "red" }) => {
  const c = type === "red" ? T.danger : T.accent;
  const ic = type === "red" ? "✕" : "✓";
  return (<div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
    {items.map((it, i) => (<div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9, animation: `fi .35s ease ${.08 * i}s both` }}>
      <span style={{ color: c, fontSize: 10, fontWeight: 700, marginTop: 3, flexShrink: 0, width: 16, height: 16, borderRadius: "50%", background: `${c}18`, display: "flex", alignItems: "center", justifyContent: "center" }}>{ic}</span>
      <span style={{ color: T.textSec, fontSize: 13, lineHeight: 1.55 }}>{it}</span>
    </div>))}
  </div>);
};

const NavBtn = ({ onClick, children, primary, disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{
    flex: 1, padding: "13px 18px", borderRadius: 12, border: primary ? "none" : `1px solid ${T.border}`,
    background: primary ? `linear-gradient(135deg,${T.accent},#059669)` : "transparent", color: primary ? "#FFFFFF" : T.textSec, fontSize: 14, fontWeight: 700,
    cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? .35 : 1, transition: "all .2s", fontFamily: "'Space Grotesk',sans-serif", letterSpacing: .3
  }}>{children}</button>
);

const SectionLabel = ({ children, color = T.textSec }) => (
  <div style={{ fontSize: 11, fontWeight: 700, color, letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>{children}</div>
);

// ─── VIEWS ───
function Landing({ d, onStart }) {
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

function S1({ d, onNext }) {
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

function S2({ d }) {
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

function S2A({ d }) {
  const s = d.step_2a_earnings_and_guidance_review;
  if (!s) return <Card><div style={{ fontSize: 13, color: T.textDim, textAlign: "center" }}>Earnings deep-dive data not available for this report.</div></Card>;
  const toneColor = { Confident: T.accent, Cautious: T.warn, Defensive: T.danger, Uncertain: T.textDim }[s.management_tone?.split(/[—,]/)[0]?.trim()] || T.blue;
  return (<div>
    {/* Management Tone — the hook */}
    <Card delay={.1} style={{ background: `linear-gradient(135deg,${toneColor}08,${T.card})`, border: `1px solid ${toneColor}30` }}>
      <SectionLabel color={toneColor}>🎙️ Management Tone</SectionLabel>
      <div style={{ fontSize: 14, color: T.text, lineHeight: 1.75, fontStyle: "italic", padding: "4px 0 4px 12px", borderLeft: `3px solid ${toneColor}60` }}>
        "{s.management_tone}"
      </div>
    </Card>

    {/* Segment Breakdown */}
    <Card delay={.2}>
      <SectionLabel color={T.blue}>📊 Segment Performance</SectionLabel>
      <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>{s.segment_breakdown}</div>
    </Card>

    {/* One-Time Items */}
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

    {/* Guidance Changes — highlighted */}
    <Card delay={.4} style={{ background: `linear-gradient(135deg,${T.accent}06,${T.blue}06)`, border: `1px solid ${T.accent}28` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <SectionLabel color={T.accent} style={{ marginBottom: 0 }}>📈 Guidance Update</SectionLabel>
        <Badge color={T.warn}>FORWARD-LOOKING</Badge>
      </div>
      <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.75 }}>{s.guidance_changes}</div>
    </Card>

    {/* Analyst Reaction */}
    <Card delay={.5}>
      <SectionLabel color={T.gold}>🏦 Analyst Reaction</SectionLabel>
      <div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>{s.analyst_reaction}</div>
    </Card>

    {/* Forward Statements Disclaimer */}
    {s.forward_statements_note && (
      <div style={{ fontSize: 10, color: T.textDim, lineHeight: 1.5, padding: "8px 14px", background: `${T.surface}88`, borderRadius: 8, animation: "fi .4s ease .6s both", fontStyle: "italic" }}>
        ℹ️ {s.forward_statements_note}
      </div>
    )}
  </div>);
}

function S3({ d }) {
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

function S4({ d }) {
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

function S5({ d }) {
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

function S6({ d }) {
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

function S7({ d }) {
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

function Gut({ d }) {
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

// ─── MAIN APP ───
export default function App() {
  const [step, setStep] = useState(-1); // -1 = home
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ticker, setTicker] = useState("");
  const ref = useRef(null);

  const [error, setError] = useState("");

  const load = async (tk) => {
    const t = tk.toUpperCase().trim();
    if (!t) return;
    setLoading(true);
    setError("");
    setTicker(t);

    try {
      const res = await fetch(`/api/report/${t}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();
      setData(json.report);
      setStep(0);
    } catch (err) {
      // Fallback to demo data if backend is unavailable
      const d = DEMOS[t];
      if (d) {
        setData(d);
        setStep(0);
        setError("Using demo data (backend unavailable)");
      } else {
        setError(`No data for ${t}. Backend may be offline.`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { ref.current?.scrollTo({ top: 0, behavior: "smooth" }) }, [step]);

  const next = () => step < STEPS.length - 1 && setStep(s => s + 1);
  const prev = () => step > 0 ? setStep(s => s - 1) : setStep(-1);

  const VIEWS = data ? {
    landing: <Landing d={data} onStart={next} />,
    s1: <S1 d={data} onNext={next} />, s2: <S2 d={data} />, s2a: <S2A d={data} />,
    s3: <S3 d={data} />, s4: <S4 d={data} />, s5: <S5 d={data} />,
    s6: <S6 d={data} />, s7: <S7 d={data} />, gut: <Gut d={data} />,
  } : {};

  // HOME SCREEN
  if (step === -1) {
    return (
      <div style={{ maxWidth: 430, margin: "0 auto", minHeight: "100vh", background: T.bg, fontFamily: "'Space Grotesk',sans-serif", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <style>{CSS}</style>
        <div style={{ animation: "fi .6s ease both", textAlign: "center", width: "100%" }}>
          <div style={{ marginBottom: 40 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: `linear-gradient(135deg,${T.accent},#00C49A)`, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16, boxShadow: `0 0 40px ${T.accentDim}` }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: T.bg, fontFamily: "'IBM Plex Mono',monospace" }}>SF</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: T.text, letterSpacing: -.5 }}>Stock Fortress</div>
            <div style={{ fontSize: 13, color: T.textDim, marginTop: 6, lineHeight: 1.5 }}>Research before you trade.<br />Every time. No exceptions.</div>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 24, animation: "fi .6s ease .2s both" }}>
            <input type="text" placeholder="Enter ticker (e.g. HIMS)" value={ticker} onChange={e => setTicker(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && load(ticker)}
              style={{ flex: 1, padding: "14px 16px", borderRadius: 12, border: `1px solid ${T.border}`, background: T.surface, color: T.text, fontSize: 15, fontWeight: 600, fontFamily: "'IBM Plex Mono',monospace", outline: "none", letterSpacing: 1 }} />
            <button onClick={() => load(ticker)} disabled={loading || !ticker.trim()}
              style={{
                padding: "14px 24px", borderRadius: 12, border: "none", background: loading ? "transparent" : `linear-gradient(135deg,${T.accent},#059669)`, color: loading ? T.accent : "#FFFFFF", fontSize: 14, fontWeight: 700, cursor: loading ? "wait" : "pointer", fontFamily: "'Space Grotesk',sans-serif", opacity: !ticker.trim() ? .4 : 1, minWidth: 70,
                ...(loading ? { border: `2px solid ${T.accent}` } : {})
              }}>
              {loading ? <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span> : "GO"}
            </button>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 10, background: error.includes("demo") ? `${T.warn}18` : `${T.danger}18`, border: `1px solid ${error.includes("demo") ? T.warn : T.danger}40`, fontSize: 12, color: error.includes("demo") ? T.warn : T.danger, textAlign: "center", marginBottom: 8, animation: "fi .3s ease both" }}>
              {error}
            </div>
          )}

          <div style={{ animation: "fi .6s ease .4s both" }}>
            <div style={{ fontSize: 11, color: T.textDim, letterSpacing: 2, marginBottom: 12, textTransform: "uppercase" }}>Try These Demos</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              {["HIMS", "AAPL", "TSLA"].map(t => (
                <button key={t} onClick={() => { setTicker(t); load(t) }}
                  style={{ padding: "10px 20px", borderRadius: 10, border: `1px solid ${T.border}`, background: T.card, color: T.text, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'IBM Plex Mono',monospace", transition: "all .2s", letterSpacing: .5 }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 40, padding: "16px", borderRadius: 12, border: `1px solid ${T.border}22`, animation: "fi .6s ease .6s both" }}>
            <div style={{ fontSize: 11, color: T.textDim, lineHeight: 1.6 }}>
              <strong style={{ color: T.textSec }}>Production Setup:</strong> Connect your Gemini API key to generate reports for any ticker in real-time using Google Search. Demo shows pre-built reports for HIMS, AAPL, TSLA.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const cur = STEPS[step];
  return (
    <div style={{ maxWidth: 430, margin: "0 auto", height: "100dvh", background: T.bg, fontFamily: "'Space Grotesk',sans-serif", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
      <style>{CSS}</style>

      {/* HEADER */}
      <div style={{ padding: "10px 16px", borderBottom: `1px solid ${T.border}22`, background: `${T.bg}EE`, backdropFilter: "blur(12px)", zIndex: 10, flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: step > 0 ? 8 : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: T.accent, fontFamily: "'IBM Plex Mono',monospace", letterSpacing: 1 }}>SF</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>Stock Fortress</span>
          </div>
          <button onClick={() => { setStep(-1); setData(null); setTicker("") }} style={{ padding: "5px 12px", borderRadius: 7, border: `1px solid ${T.border}`, background: T.card, color: T.textSec, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "'Space Grotesk',sans-serif", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}>
            New ↗
          </button>
        </div>
        {step > 0 && (<div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ fontSize: 14 }}>{cur.i}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>Step {cur.n}: {cur.l}</span></div>
            <span style={{ fontSize: 11, color: T.textDim, fontFamily: "'IBM Plex Mono',monospace" }}>{step}/{TOTAL_STEPS}</span></div>
          <div style={{ width: "100%", height: 3, background: T.surface, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${(step / TOTAL_STEPS) * 100}%`, height: "100%", background: `linear-gradient(90deg,${T.accent},${T.blue})`, borderRadius: 2, transition: "width .4s cubic-bezier(.4,0,.2,1)" }} /></div>
        </div>)}
      </div>

      {/* CONTENT */}
      <div ref={ref} style={{ flex: 1, overflowY: "auto", padding: "14px 14px 96px 14px" }} key={step}>
        {VIEWS[cur.k]}
      </div>

      {/* NAV */}
      {step > 0 && (<div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "10px 14px", background: `linear-gradient(transparent, ${T.bg} 20%)`, paddingTop: 28, display: "flex", gap: 10, zIndex: 10 }}>
        <NavBtn onClick={prev}>← Back</NavBtn>
        {step < STEPS.length - 1 ? <NavBtn onClick={next} primary>Next Step →</NavBtn> : <NavBtn onClick={() => { setStep(-1); setData(null); setTicker("") }} primary>New Research</NavBtn>}
      </div>)}
    </div>
  );
}
