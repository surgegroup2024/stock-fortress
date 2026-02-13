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
    meta: { ticker: "HIMS", company_name: "Hims & Hers Health, Inc.", sector: "Healthcare / Telehealth", current_price: "$15.80", market_cap: "$3.6B", pe_ratio: "30.86", fifty_two_week_range: "$15.63 - $72.98", avg_volume: "46.75M", report_date: "Feb 13, 2026", data_freshness_note: "Market close Feb 12, 2026" },
    step_1_know_what_you_own: { one_liner: "Hims sells prescription medications online — you chat with a doctor on your phone, and pills arrive by mail.", how_it_makes_money: "Monthly subscriptions for prescription drugs (hair loss, ED, skincare, weight loss). Cash-pay, no insurance. Also sells OTC supplements and skincare.", key_products_or_services: ["Telehealth consultations", "Hair loss Rx (finasteride, minoxidil)", "Sexual health Rx (sildenafil, tadalafil)", "Compounded GLP-1 weight loss drugs", "Skincare, mental health, supplements"], customer_type: "Millennials & Gen-Z wanting convenient, affordable healthcare", pass_fail: "YES" },
    step_2_check_the_financials: { revenue_latest: "$599M (Q3 2025)", revenue_growth_yoy: "+49%", profitable: true, net_income_latest: "$15.8M", gross_margin: "74%", debt_level: "LOW", free_cash_flow: "$79.4M", financial_health_grade: "B", red_flags: ["Gross margin declining (79% → 74% YoY)", "Revenue per subscriber falling ($84 → $74)", "~35% of revenue from GLP-1s under legal threat", "EPS missed estimates by 40% in Q3"], green_flags: ["Revenue growing 49-111% YoY", "FCF positive at $79M/quarter", "2.5M subscribers and growing", "First GAAP profitable year in 2024"] },
    step_3_understand_the_story: { bull_case: "Scale leader in DTC telehealth with 2.5M subs. GLP-1 crackdown is temporary — core business (hair, skin, ED) was growing before weight loss. At $3.6B for a $2.3B rev company, absurdly cheap if the platform holds.", bear_case: "Business model built on regulatory arbitrage — selling cheap copies of patented drugs. Novo suing, FDA cracking down, DOJ referred. If enforcement extends beyond GLP-1, entire model at risk.", what_must_go_right: ["Core non-GLP-1 subs keep growing", "Novo lawsuit settles reasonably", "FDA stays limited to GLP-1 enforcement", "Branded partnerships replace some revenue"], what_could_go_wrong: ["FDA bans all mass compounding", "DOJ opens criminal investigation", "Subscriber churn accelerates", "Brand permanently damaged"], is_this_priced_in: "Stock down 78% from peak. Market pricing severe permanent impairment. If only GLP-1 goes away but core holds, stock is undervalued." },
    step_4_know_the_risks: { top_3_risks: [{ risk: "Novo Nordisk patent lawsuit", severity: "CRITICAL", explanation: "Could permanently ban all compounded semaglutide + damages" }, { risk: "FDA enforcement expansion", severity: "HIGH", explanation: "If enforcement moves beyond GLP-1, entire compounding model breaks" }, { risk: "DOJ criminal referral", severity: "HIGH", explanation: "HHS referred HIMS to DOJ — criminal investigation possible" }], recent_red_flags: ["Feb 9: Novo files patent suit", "Feb 7: HIMS pulls GLP-1 pill after FDA pressure", "Feb 6: FDA crackdown on compounded GLP-1s", "Feb 6: HHS refers HIMS to DOJ", "Stock down 52% in 9 days"], regulatory_exposure: "EXTREME", concentration_risk: "~35% revenue from compounded GLP-1s under threat" },
    step_5_check_the_competition: { main_competitors: [{ name: "Ro (Roman)", why_they_compete: "Same DTC telehealth model", advantage_over_this_stock: "More vertically integrated, pivoted to branded GLP-1 earlier" }, { name: "LifeMD", why_they_compete: "DTC telehealth with weight management", advantage_over_this_stock: "Less regulatory exposure" }, { name: "Teladoc", why_they_compete: "Largest telehealth platform", advantage_over_this_stock: "B2B model, diversified revenue" }], moat_strength: "WEAK", moat_explanation: "Strong brand and 2.5M subs, but limited pricing power. Generic drugs are commodities and compounding arbitrage is being eliminated." },
    step_6_valuation_reality_check: { current_pe: "30.86x", sector_avg_pe: "~25x", price_to_sales: "~1.5x", is_it_expensive: "CHEAP", valuation_context: "At 1.5x forward revenue, priced like a company in permanent decline. Even removing GLP-1, core ~$1.5B biz at 3x rev = more than current cap.", bear_case_price: "$8-12", base_case_price: "$30-40", bull_case_price: "$55-62" },
    step_7_verdict: { action: "WATCH", confidence: "MEDIUM", one_line_reason: "Asymmetric setup, but buying before Feb 23 earnings is gambling, not investing.", what_would_change_this: "Feb 23 earnings showing core sub growth + 2026 guidance → BUY. FDA expands enforcement → AVOID.", most_important_metric_to_track: "Non-GLP-1 subscriber net adds (Q4 2025)", suggested_revisit_date: "February 23, 2026" },
    investor_gut_check: { question_1: "Are you buying because you researched it, or because you saw it crash?", question_2: "If it drops another 30% on bad earnings, buy more or panic sell?", question_3: "Can you explain the Novo lawsuit without looking it up?", question_4: "What % of your portfolio? Can you afford to lose it all?", mindset_reminder: "A stock that falls 78% isn't automatically cheap. It can fall another 50%. The Feb 23 report tells you if you're catching a knife or finding a bargain. Wait for the data." }
  },
  AAPL: {
    meta: { ticker: "AAPL", company_name: "Apple Inc.", sector: "Technology / Consumer Electronics", current_price: "$232.50", market_cap: "$3.5T", pe_ratio: "37.2", fifty_two_week_range: "$169.21 - $260.10", avg_volume: "52.3M", report_date: "Feb 13, 2026", data_freshness_note: "Market close Feb 12, 2026" },
    step_1_know_what_you_own: { one_liner: "Apple makes iPhones, Macs, and iPads, and charges you monthly for services like iCloud, Apple Music, and the App Store.", how_it_makes_money: "~52% from iPhone sales, ~25% from Services (App Store, iCloud, Apple Pay, Music, TV+), rest from Mac, iPad, Wearables. Services segment is high-margin recurring revenue.", key_products_or_services: ["iPhone", "Mac & iPad", "Services (App Store, iCloud, Music, TV+)", "Wearables (Apple Watch, AirPods)", "Apple Intelligence / AI features"], customer_type: "Global consumers and professionals locked into the Apple ecosystem", pass_fail: "YES" },
    step_2_check_the_financials: { revenue_latest: "$124.3B (Q1 FY2026)", revenue_growth_yoy: "+4%", profitable: true, net_income_latest: "$36.3B (Q1)", gross_margin: "46.9%", debt_level: "MODERATE", free_cash_flow: "$30.6B (Q1)", financial_health_grade: "A", red_flags: ["iPhone growth slowing in key markets", "China revenue declining amid competition", "Regulatory pressure on App Store fees globally", "AI features behind competitors"], green_flags: ["Services growing 14% YoY at 75%+ margins", "$30B+ quarterly FCF", "Massive buyback program ($110B authorized)", "2B+ active devices = sticky ecosystem"] },
    step_3_understand_the_story: { bull_case: "Largest tech ecosystem ever built with 2B+ devices. Services is becoming dominant profit driver at 75%+ margins. Apple Intelligence brings AI features that drive upgrade cycles. Capital return program is unmatched.", bear_case: "Hardware growth is saturating. China market share eroding to Huawei. Regulators forcing App Store fee cuts globally. AI features lag behind Google and Samsung. At 37x earnings, priced for growth that's decelerating.", what_must_go_right: ["iPhone 17 cycle drives upgrades", "Services continues 14%+ growth", "Apple Intelligence drives real engagement", "India/emerging markets offset China weakness"], what_could_go_wrong: ["iPhone supercycle doesn't materialize", "EU/DOJ forces major App Store changes", "China bans or restricts Apple further", "AI perceived as inferior to Android"], is_this_priced_in: "At $3.5T, the market expects steady mid-single-digit growth + services expansion. Any acceleration in AI adoption is upside; any deceleration in services or China deterioration is downside." },
    step_4_know_the_risks: { top_3_risks: [{ risk: "China revenue decline", severity: "HIGH", explanation: "Apple losing share to Huawei; geopolitical risk of restrictions" }, { risk: "Regulatory pressure on App Store", severity: "MEDIUM", explanation: "EU DMA, DOJ suit could force fee cuts on highest-margin business" }, { risk: "AI competitive gap", severity: "MEDIUM", explanation: "Apple Intelligence perceived as behind Google/Samsung AI features" }], recent_red_flags: ["China Q1 revenue down 11% YoY", "Apple Intelligence adoption slower than expected", "EU forcing sideloading and alternative app stores"], regulatory_exposure: "MODERATE — App Store fees under pressure in EU, US, Japan", concentration_risk: "iPhone still ~52% of revenue; Services depends on iPhone installed base" },
    step_5_check_the_competition: { main_competitors: [{ name: "Samsung", why_they_compete: "Largest Android OEM, Galaxy AI", advantage_over_this_stock: "Faster AI feature rollout, stronger in Asia" }, { name: "Google", why_they_compete: "Android ecosystem, Pixel, Gemini AI", advantage_over_this_stock: "Superior AI/ML capabilities, controls the OS" }, { name: "Huawei", why_they_compete: "Premium smartphones in China", advantage_over_this_stock: "Dominant in China where Apple is losing" }], moat_strength: "STRONG", moat_explanation: "2B+ device ecosystem with extremely high switching costs. Services revenue locked into hardware base. Brand loyalty unmatched in consumer tech." },
    step_6_valuation_reality_check: { current_pe: "37.2x", sector_avg_pe: "~30x", price_to_sales: "~8.5x", is_it_expensive: "EXPENSIVE", valuation_context: "Trading above sector avg on decelerating growth. Market paying a premium for ecosystem durability and capital returns. Justified only if services growth sustains 12%+.", bear_case_price: "$180-200", base_case_price: "$230-250", bull_case_price: "$280-310" },
    step_7_verdict: { action: "WATCH", confidence: "MEDIUM", one_line_reason: "Great company at a full price. Wait for a better entry on any China/regulatory shock.", what_would_change_this: "iPhone 17 supercycle data or pullback to $200 → BUY. Services growth drops below 10% → AVOID.", most_important_metric_to_track: "Services revenue growth rate", suggested_revisit_date: "April 2026 (Q2 earnings)" },
    investor_gut_check: { question_1: "Are you buying Apple because it's a great company, or because it feels 'safe'? Safe and overpriced can still lose you money.", question_2: "If Apple drops 20% on a China ban headline, do you have conviction to hold?", question_3: "Can you explain why Services matters more than iPhone growth?", question_4: "At $3.5T, how much upside is realistically left in 12 months?", mindset_reminder: "Apple is one of the greatest companies ever built. That doesn't make it a great stock at every price. At 37x earnings with slowing growth, you're paying a premium for stability. Make sure that's what you need in your portfolio, not just comfort." }
  },
  TSLA: {
    meta: { ticker: "TSLA", company_name: "Tesla, Inc.", sector: "Automotive / Energy / AI", current_price: "$345.20", market_cap: "$1.1T", pe_ratio: "155x", fifty_two_week_range: "$138.80 - $488.54", avg_volume: "78.5M", report_date: "Feb 13, 2026", data_freshness_note: "Market close Feb 12, 2026" },
    step_1_know_what_you_own: { one_liner: "Tesla makes electric cars, but investors are really betting on self-driving taxis, robots, and energy storage becoming massive businesses.", how_it_makes_money: "~78% from car sales (Model 3/Y/S/X/Cybertruck), ~10% from energy storage (Megapack), ~7% from services, and regulatory credits. Robotaxi and Optimus robot are pre-revenue.", key_products_or_services: ["Electric vehicles (Model 3/Y/S/X, Cybertruck)", "Energy storage (Megapack, Powerwall)", "Full Self-Driving (FSD) software", "Robotaxi (planned launch)", "Optimus humanoid robot (development)"], customer_type: "EV buyers, energy companies, and speculative investors betting on future AI/robotics", pass_fail: "YES" },
    step_2_check_the_financials: { revenue_latest: "$25.7B (Q4 2025)", revenue_growth_yoy: "+2%", profitable: true, net_income_latest: "$2.3B", gross_margin: "19.8%", debt_level: "LOW", free_cash_flow: "$2.0B", financial_health_grade: "C", red_flags: ["Auto margins compressed from 28% to under 20%", "Revenue growth near zero — price cuts not driving volume", "155x P/E assumes massive future growth not yet visible", "Elon's political activities polarizing the customer base"], green_flags: ["Energy storage growing 60%+ YoY", "FSD improving rapidly with real-world data", "$34B cash on balance sheet", "Robotaxi could be transformative if it launches"] },
    step_3_understand_the_story: { bull_case: "Tesla isn't a car company — it's an AI company that happens to sell cars. FSD becomes autonomous, robotaxi generates Uber-like margins, Optimus creates a new industry. Energy storage is already scaling. $1.1T is cheap for all three.", bear_case: "It IS a car company. Cars are commoditizing, margins are falling, growth is stalling. Robotaxi is years away from regulatory approval at scale. At 155x earnings, any disappointment causes massive downside. Elon's controversies are costing real sales.", what_must_go_right: ["Robotaxi launches in 2026 with regulatory approval", "FSD reaches true Level 4 autonomy", "Auto margins stabilize above 18%", "Energy storage maintains 50%+ growth"], what_could_go_wrong: ["Robotaxi delayed again beyond 2026", "BYD/Chinese EVs take global share", "FSD causes high-profile accidents", "Elon distraction costs more sales"], is_this_priced_in: "At $1.1T and 155x earnings, the market is pricing in robotaxi success, energy dominance, AND margin recovery. None of these are certain. The stock price assumes a future that hasn't happened yet." },
    step_4_know_the_risks: { top_3_risks: [{ risk: "Robotaxi regulatory delay", severity: "CRITICAL", explanation: "The entire valuation premium depends on autonomous driving working at scale" }, { risk: "Auto margin compression", severity: "HIGH", explanation: "Price war with BYD/legacy OEMs could push margins below 15%" }, { risk: "Brand/demand destruction", severity: "HIGH", explanation: "Elon's political involvement measurably reducing demand in key markets" }], recent_red_flags: ["European sales down 45% in Jan 2026", "Model Y showing age vs new competition", "FSD still not Level 4 anywhere", "Multiple executive departures in 2025"], regulatory_exposure: "HIGH — Autonomous driving regs vary by state/country", concentration_risk: "Model 3/Y = ~80% of sales. Robotaxi/Optimus = 0% of current revenue but majority of valuation" },
    step_5_check_the_competition: { main_competitors: [{ name: "BYD", why_they_compete: "Largest EV maker globally, half Tesla's price", advantage_over_this_stock: "Lower costs, dominant in China, expanding globally fast" }, { name: "Waymo (Alphabet)", why_they_compete: "Leading autonomous driving service", advantage_over_this_stock: "Already operating robotaxis commercially in multiple cities" }, { name: "Rivian / Legacy OEMs", why_they_compete: "Competing EV offerings across segments", advantage_over_this_stock: "Established dealer networks, diverse product lines" }], moat_strength: "MODERATE", moat_explanation: "Supercharger network, FSD data advantage, and manufacturing scale are real moats. But EV hardware is commoditizing fast, and Waymo leads in actual autonomous operations." },
    step_6_valuation_reality_check: { current_pe: "155x", sector_avg_pe: "~15x (auto) / ~35x (tech)", price_to_sales: "~11x", is_it_expensive: "SPECULATIVE", valuation_context: "Trading at 10x the auto sector P/E and 4x the tech sector P/E. The market is valuing robotaxi + energy + Optimus at ~$800B+ despite generating $0 revenue. You're buying a bet on 2028+ earnings.", bear_case_price: "$150-200", base_case_price: "$300-350", bull_case_price: "$500-700" },
    step_7_verdict: { action: "AVOID", confidence: "MEDIUM", one_line_reason: "Great company, terrible valuation. Too much future embedded in today's price with too many execution risks.", what_would_change_this: "Stock pulls back to $200 (bringing P/E to ~80x) → WATCH. Robotaxi achieves regulatory approval in 3+ states → reassess entirely.", most_important_metric_to_track: "Robotaxi regulatory milestones and FSD intervention rates", suggested_revisit_date: "After Q2 2026 earnings + robotaxi update" },
    investor_gut_check: { question_1: "Are you buying Tesla the business, or Tesla the Elon Musk fan club?", question_2: "At 155x earnings, can you explain what needs to happen to justify this price?", question_3: "If robotaxi is delayed another 2 years, are you still comfortable holding?", question_4: "What percentage of your portfolio is this? Concentration in a speculative stock is how portfolios blow up.", mindset_reminder: "Tesla could absolutely be worth $2 trillion in 2030 if robotaxi and energy play out. It could also be worth $300 billion if they don't. At $1.1T today, you're paying closer to the optimistic outcome. Ask yourself: am I being paid to take this risk, or am I paying for the privilege?" }
  }
};

// ─── STEP CONFIG ───
const STEPS = [
  { k: "landing", l: "", i: "", n: 0 },
  { k: "s1", l: "Know What You Own", i: "🏢", n: 1 },
  { k: "s2", l: "Check Financials", i: "📊", n: 2 },
  { k: "s3", l: "Understand The Story", i: "📖", n: 3 },
  { k: "s4", l: "Know The Risks", i: "⚠️", n: 4 },
  { k: "s5", l: "Competition", i: "⚔️", n: 5 },
  { k: "s6", l: "Valuation Check", i: "💰", n: 6 },
  { k: "s7", l: "The Verdict", i: "🎯", n: 7 },
  { k: "gut", l: "Gut Check", i: "🧠", n: 8 },
];

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

const MetricRow = ({ label, value, hl }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${T.border}22` }}>
    <span style={{ color: T.textSec, fontSize: 13 }}>{label}</span>
    <span style={{ color: hl || T.text, fontSize: 13, fontWeight: 600, fontFamily: "'IBM Plex Mono',monospace" }}>{value}</span>
  </div>
);

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
      <MetricRow label="P/E Ratio" value={m.pe_ratio} />
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
      <MetricRow label="Revenue" value={s.revenue_latest} />
      <MetricRow label="YoY Growth" value={s.revenue_growth_yoy} hl={T.accent} />
      <MetricRow label="Net Income" value={s.net_income_latest} hl={s.profitable ? T.accent : T.danger} />
      <MetricRow label="Gross Margin" value={s.gross_margin} />
      <MetricRow label="Free Cash Flow" value={s.free_cash_flow} hl={T.accent} />
      <MetricRow label="Debt" value={s.debt_level} hl={s.debt_level === "LOW" ? T.accent : T.warn} /></Card>
    <Card delay={.3}><SectionLabel color={T.danger}>🚩 Red Flags</SectionLabel><Flags items={s.red_flags} type="red" /></Card>
    <Card delay={.4}><SectionLabel color={T.accent}>✅ Green Flags</SectionLabel><Flags items={s.green_flags} type="green" /></Card>
  </div>);
}

function S3({ d }) {
  const s = d.step_3_understand_the_story;
  return (<div>
    <Card delay={.1} border={T.accent}><SectionLabel color={T.accent}>Bull Case</SectionLabel><div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>{s.bull_case}</div></Card>
    <Card delay={.2} border={T.danger}><SectionLabel color={T.danger}>Bear Case</SectionLabel><div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>{s.bear_case}</div></Card>
    <Card delay={.3}><SectionLabel color={T.accent}>Must Go Right</SectionLabel><Flags items={s.what_must_go_right} type="green" /></Card>
    <Card delay={.4}><SectionLabel color={T.danger}>Could Go Wrong</SectionLabel><Flags items={s.what_could_go_wrong} type="red" /></Card>
    <Card delay={.5} style={{ background: `linear-gradient(135deg,${T.blue}08,${T.accent}05)` }}><SectionLabel color={T.blue}>Is This Priced In?</SectionLabel><div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>{s.is_this_priced_in}</div></Card>
  </div>);
}

function S4({ d }) {
  const s = d.step_4_know_the_risks;
  return (<div>
    {s.top_3_risks.map((r, i) => (<Card key={i} delay={.1 * (i + 1)} border={SEVERITY[r.severity]}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: T.text, flex: 1, marginRight: 8 }}>{r.risk}</div>
        <Badge color={SEVERITY[r.severity]}>{r.severity}</Badge></div>
      <div style={{ fontSize: 12, color: T.textSec, lineHeight: 1.55 }}>{r.explanation}</div></Card>))}
    <Card delay={.4}><SectionLabel color={T.danger}>Recent Red Flags</SectionLabel>
      {s.recent_red_flags.map((f, i) => (<div key={i} style={{ fontSize: 12, color: T.textSec, lineHeight: 1.6, padding: "5px 0", borderBottom: `1px solid ${T.border}18`, animation: `fi .3s ease ${.08 * i}s both` }}>
        <span style={{ color: T.danger, marginRight: 7 }}>●</span>{f}</div>))}</Card>
    <Card delay={.5}>
      <MetricRow label="Regulatory Exposure" value={s.regulatory_exposure} hl={T.danger} />
      <div style={{ marginTop: 8, fontSize: 12, color: T.textSec, lineHeight: 1.55 }}><span style={{ color: T.warn, fontWeight: 600 }}>Concentration: </span>{s.concentration_risk}</div></Card>
  </div>);
}

function S5({ d }) {
  const s = d.step_5_check_the_competition;
  const mc = MOAT[s.moat_strength] || T.textDim;
  return (<div>
    {s.main_competitors.map((c, i) => (<Card key={i} delay={.1 * (i + 1)}>
      <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 5 }}>{c.name}</div>
      <div style={{ fontSize: 12, color: T.textDim, marginBottom: 7 }}>{c.why_they_compete}</div>
      <div style={{ fontSize: 12, color: T.warn, lineHeight: 1.5 }}><span style={{ fontWeight: 600 }}>Edge: </span>{c.advantage_over_this_stock}</div></Card>))}
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
    <Card delay={.1}><MetricRow label="P/E" value={s.current_pe} /><MetricRow label="Sector Avg P/E" value={s.sector_avg_pe} /><MetricRow label="Price/Sales" value={s.price_to_sales} />
      <div style={{ textAlign: "center", marginTop: 14 }}><Badge color={ec}>{s.is_it_expensive}</Badge></div></Card>
    <Card delay={.2}><div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>{s.valuation_context}</div></Card>
    <Card delay={.3}><SectionLabel>Price Scenarios</SectionLabel>
      {[{ l: "Bear", v: s.bear_case_price, c: T.danger }, { l: "Base", v: s.base_case_price, c: T.blue }, { l: "Bull", v: s.bull_case_price, c: T.accent }].map((x, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 14px", borderRadius: 10, background: `${x.c}0A`, border: `1px solid ${x.c}28`, marginBottom: 7, animation: `fi .35s ease ${.12 * i}s both` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: x.c }} /><span style={{ fontSize: 13, color: T.textSec, fontWeight: 600 }}>{x.l}</span></div>
          <span style={{ fontSize: 17, fontWeight: 700, color: x.c, fontFamily: "'IBM Plex Mono',monospace" }}>{x.v}</span></div>))}</Card>
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
    <Card delay={.2}><SectionLabel color={T.blue}>What Changes This</SectionLabel><div style={{ fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>{s.what_would_change_this}</div></Card>
    <Card delay={.3}><MetricRow label="Key Metric" value={s.most_important_metric_to_track} hl={T.accent} /><MetricRow label="Revisit" value={s.suggested_revisit_date} hl={T.warn} /></Card>
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
    s1: <S1 d={data} onNext={next} />, s2: <S2 d={data} />, s3: <S3 d={data} />,
    s4: <S4 d={data} />, s5: <S5 d={data} />, s6: <S6 d={data} />,
    s7: <S7 d={data} />, gut: <Gut d={data} />,
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
    <div style={{ maxWidth: 430, margin: "0 auto", height: "100vh", height: "100dvh", background: T.bg, fontFamily: "'Space Grotesk',sans-serif", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
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
              <span style={{ fontSize: 12, fontWeight: 700, color: T.text }}>Step {cur.n <= 7 ? cur.n : ""}: {cur.l}</span></div>
            <span style={{ fontSize: 11, color: T.textDim, fontFamily: "'IBM Plex Mono',monospace" }}>{step}/8</span></div>
          <div style={{ width: "100%", height: 3, background: T.surface, borderRadius: 2, overflow: "hidden" }}>
            <div style={{ width: `${(step / 8) * 100}%`, height: "100%", background: `linear-gradient(90deg,${T.accent},${T.blue})`, borderRadius: 2, transition: "width .4s cubic-bezier(.4,0,.2,1)" }} /></div>
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
