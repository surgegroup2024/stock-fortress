import { useState, useEffect, useCallback, useRef } from "react";

// ─── DESIGN TOKENS ───
const T = {
  bg: "#0A0E17",
  bgCard: "#111827",
  bgCardHover: "#1A2236",
  surface: "#1E293B",
  border: "#2A3A52",
  accent: "#00D4AA",
  accentDim: "#00D4AA33",
  accentGlow: "#00D4AA22",
  danger: "#FF4757",
  dangerDim: "#FF475722",
  warning: "#FBBF24",
  warningDim: "#FBBF2422",
  text: "#F1F5F9",
  textMuted: "#94A3B8",
  textDim: "#64748B",
  gold: "#F59E0B",
  blue: "#3B82F6",
};

const GRADES = {
  A: { color: "#00D4AA", label: "Strong" },
  B: { color: "#3B82F6", label: "Good" },
  C: { color: "#FBBF24", label: "Fair" },
  D: { color: "#F97316", label: "Weak" },
  F: { color: "#FF4757", label: "Poor" },
};

const SEVERITY_COLORS = {
  LOW: "#00D4AA",
  MEDIUM: "#FBBF24",
  HIGH: "#F97316",
  CRITICAL: "#FF4757",
};

const MOAT_COLORS = {
  NONE: "#FF4757",
  WEAK: "#F97316",
  MODERATE: "#FBBF24",
  STRONG: "#00D4AA",
};

const ACTION_STYLES = {
  BUY: { bg: "#00D4AA22", border: "#00D4AA", color: "#00D4AA", icon: "▲" },
  WATCH: { bg: "#FBBF2422", border: "#FBBF24", color: "#FBBF24", icon: "◉" },
  AVOID: { bg: "#FF475722", border: "#FF4757", color: "#FF4757", icon: "✕" },
};

// ─── DEMO DATA ───
const DEMO_DATA = {
  meta: {
    ticker: "HIMS",
    company_name: "Hims & Hers Health, Inc.",
    sector: "Healthcare / Telehealth",
    current_price: "$15.80",
    market_cap: "$3.6B",
    pe_ratio: "30.86",
    fifty_two_week_range: "$15.63 - $72.98",
    avg_volume: "46.75M",
    report_date: "February 13, 2026",
    data_freshness_note: "Data as of market close Feb 12, 2026",
  },
  step_1_know_what_you_own: {
    one_liner:
      "Hims sells prescription medications and health products online — you chat with a doctor on your phone, and your pills arrive by mail.",
    how_it_makes_money:
      "Monthly subscriptions for prescription drugs (hair loss, ED, skincare, weight loss). Patients pay cash — no insurance involved. They also sell over-the-counter supplements and skincare products.",
    key_products_or_services: [
      "Prescription telehealth consultations",
      "Hair loss treatments (finasteride, minoxidil)",
      "Sexual health (sildenafil, tadalafil)",
      "Weight loss (compounded GLP-1 drugs)",
      "Skincare, mental health, supplements",
    ],
    customer_type:
      "Millennials and Gen-Z consumers who want convenient, affordable healthcare without visiting a doctor's office",
    pass_fail: "YES",
  },
  step_2_check_the_financials: {
    revenue_latest: "$599M (Q3 2025)",
    revenue_growth_yoy: "+49%",
    profitable: true,
    net_income_latest: "$15.8M (Q3 2025)",
    gross_margin: "74%",
    debt_level: "LOW",
    free_cash_flow: "$79.4M (Q3 2025)",
    financial_health_grade: "B",
    red_flags: [
      "Gross margin declining (79% → 74% YoY)",
      "Revenue per subscriber falling ($84 → $74)",
      "~35% of revenue from compounded GLP-1s now under legal threat",
      "EPS missed estimates by 40% in Q3",
    ],
    green_flags: [
      "Revenue growing 49-111% YoY across quarters",
      "Free cash flow positive at $79M/quarter",
      "2.5M subscribers and growing",
      "First full year of GAAP profitability in 2024",
    ],
  },
  step_3_understand_the_story: {
    bull_case:
      "HIMS is the scale leader in DTC telehealth with 2.5M subscribers. The GLP-1 crackdown is temporary — the core business (hair, skin, sexual health) was growing before weight loss and will survive after. At $3.6B market cap for a $2.3B revenue company, it's absurdly cheap if the platform holds.",
    bear_case:
      "The business model is built on regulatory arbitrage — selling cheap copies of patented drugs. Novo Nordisk is suing, the FDA is cracking down, and the DOJ has been referred the case. If enforcement extends beyond GLP-1 to all compounding, the entire model is at risk.",
    what_must_go_right: [
      "Core non-GLP-1 subscribers must keep growing",
      "Novo lawsuit settles without catastrophic damages",
      "FDA enforcement stays limited to GLP-1 only",
      "Branded drug partnerships replace some compounding revenue",
    ],
    what_could_go_wrong: [
      "FDA bans all mass compounding of patented APIs",
      "DOJ opens criminal investigation",
      "Subscriber churn accelerates across all categories",
      "Brand permanently damaged by 'knock-off drugs' narrative",
    ],
    is_this_priced_in:
      "The stock has fallen 78% from its peak. The market is pricing in severe permanent impairment — potentially the total loss of GLP-1 revenue AND damage to the core business. If only GLP-1 goes away but the core holds, the stock is undervalued.",
  },
  step_4_know_the_risks: {
    top_3_risks: [
      {
        risk: "Novo Nordisk patent lawsuit",
        severity: "CRITICAL",
        explanation:
          "Could result in permanent injunction on all compounded semaglutide, plus damages",
      },
      {
        risk: "FDA enforcement expansion",
        severity: "HIGH",
        explanation:
          "If enforcement moves beyond GLP-1 to other compounded drugs, the entire model breaks",
      },
      {
        risk: "DOJ criminal referral",
        severity: "HIGH",
        explanation:
          "HHS referred HIMS to Justice Department — criminal investigation could create existential risk",
      },
    ],
    recent_red_flags: [
      "Feb 9: Novo Nordisk files patent infringement lawsuit",
      "Feb 7: HIMS withdraws compounded GLP-1 pill after FDA pressure",
      "Feb 6: FDA announces crackdown on mass-marketed compounded GLP-1s",
      "Feb 6: HHS refers HIMS to DOJ for potential FDCA violations",
      "Stock down 52% in 9 consecutive trading days",
    ],
    regulatory_exposure:
      "EXTREME — FDA, DOJ, and major pharma litigation simultaneously",
    concentration_risk:
      "~35% of 2025 revenue from compounded GLP-1 products now under existential legal/regulatory threat",
  },
  step_5_check_the_competition: {
    main_competitors: [
      {
        name: "Ro (Roman)",
        why_they_compete:
          "Same DTC telehealth model for men's and women's health",
        advantage_over_this_stock:
          "More vertically integrated (own pharmacy, diagnostics), pivoted to branded GLP-1 partnerships earlier",
      },
      {
        name: "LifeMD",
        why_they_compete: "DTC telehealth platform with weight management focus",
        advantage_over_this_stock:
          "Smaller scale but less regulatory exposure from compounding",
      },
      {
        name: "Teladoc Health",
        why_they_compete: "Largest telehealth platform by revenue",
        advantage_over_this_stock:
          "B2B model with enterprise contracts provides more stable, diversified revenue",
      },
    ],
    moat_strength: "WEAK",
    moat_explanation:
      "Strong brand awareness and 2.5M subscriber base, but limited pricing power — generic drugs are commodities and the compounding arbitrage that drove growth is being eliminated.",
  },
  step_6_valuation_reality_check: {
    current_pe: "30.86x",
    sector_avg_pe: "~25x",
    price_to_sales: "~1.5x (FY2025E)",
    is_it_expensive: "CHEAP",
    valuation_context:
      "At 1.5x forward revenue, the market is pricing this like a company in permanent decline. Even removing all GLP-1 revenue, the core ~$1.5B business at 3x revenue would be worth more than the current market cap. The stock is cheap IF the core business survives intact.",
    bear_case_price: "$8-12",
    base_case_price: "$30-40",
    bull_case_price: "$55-62",
  },
  step_7_verdict: {
    action: "WATCH",
    confidence: "MEDIUM",
    one_line_reason:
      "Asymmetric setup, but buying before Feb 23 earnings is gambling, not investing.",
    what_would_change_this:
      "Feb 23 earnings showing core subscriber growth + credible 2026 guidance upgrades this to BUY. FDA enforcement expanding to all compounding downgrades to AVOID.",
    most_important_metric_to_track:
      "Non-GLP-1 subscriber net additions in Q4 2025",
    suggested_revisit_date: "February 23, 2026 (Q4 earnings)",
  },
  investor_gut_check: {
    question_1:
      "Are you buying this because you researched it, or because you saw it crash and think it's a deal?",
    question_2:
      "If HIMS drops another 30% on a bad earnings report, would you buy more or panic sell?",
    question_3:
      "Can you explain the Novo Nordisk lawsuit and why it matters without looking it up?",
    question_4:
      "What percentage of your portfolio would this be? Can you afford to lose it all?",
    mindset_reminder:
      "A stock that falls 78% is not automatically cheap. It can fall another 50% from here if the legal situation worsens. The Feb 23 earnings report will tell you whether you're catching a knife or finding a bargain. Wait for the data. There is no urgency premium in investing.",
  },
};

// ─── STEP CONFIG ───
const STEPS = [
  { key: "landing", label: "", icon: "", num: 0 },
  { key: "step1", label: "Know What You Own", icon: "🏢", num: 1 },
  { key: "step2", label: "Check The Financials", icon: "📊", num: 2 },
  { key: "step3", label: "Understand The Story", icon: "📖", num: 3 },
  { key: "step4", label: "Know The Risks", icon: "⚠️", num: 4 },
  { key: "step5", label: "Check Competition", icon: "⚔️", num: 5 },
  { key: "step6", label: "Valuation Check", icon: "💰", num: 6 },
  { key: "step7", label: "The Verdict", icon: "🎯", num: 7 },
  { key: "gutcheck", label: "Gut Check", icon: "🧠", num: 8 },
];

// ─── ANIMATIONS ───
const fadeIn = `@keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }`;
const slideUp = `@keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }`;
const pulse = `@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }`;
const glow = `@keyframes glow { 0%, 100% { box-shadow: 0 0 20px ${T.accentGlow}; } 50% { box-shadow: 0 0 40px ${T.accentDim}; } }`;
const shimmer = `@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`;

// ─── COMPONENTS ───
function Badge({ children, color = T.accent, bg }) {
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: 6,
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: "0.5px",
        color,
        background: bg || `${color}22`,
        border: `1px solid ${color}44`,
      }}
    >
      {children}
    </span>
  );
}

function Card({ children, delay = 0, glow: glowEffect, style = {} }) {
  return (
    <div
      style={{
        background: T.bgCard,
        borderRadius: 16,
        border: `1px solid ${T.border}`,
        padding: "20px",
        marginBottom: 16,
        animation: `fadeIn 0.5s ease ${delay}s both`,
        ...(glowEffect
          ? {
              boxShadow: `0 0 30px ${T.accentGlow}, inset 0 1px 0 ${T.border}`,
            }
          : { boxShadow: `0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 ${T.border}` }),
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function ProgressBar({ current, total }) {
  const pct = (current / total) * 100;
  return (
    <div
      style={{
        width: "100%",
        height: 3,
        background: T.surface,
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${pct}%`,
          height: "100%",
          background: `linear-gradient(90deg, ${T.accent}, ${T.blue})`,
          borderRadius: 2,
          transition: "width 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      />
    </div>
  );
}

function SeverityDot({ level }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 10,
        height: 10,
        borderRadius: "50%",
        background: SEVERITY_COLORS[level] || T.textDim,
        marginRight: 8,
        boxShadow: `0 0 6px ${SEVERITY_COLORS[level] || T.textDim}66`,
      }}
    />
  );
}

function MetricRow({ label, value, highlight }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: `1px solid ${T.border}33`,
      }}
    >
      <span style={{ color: T.textMuted, fontSize: 14 }}>{label}</span>
      <span
        style={{
          color: highlight || T.text,
          fontSize: 14,
          fontWeight: 600,
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {value}
      </span>
    </div>
  );
}

function FlagList({ items, type = "red" }) {
  const color = type === "red" ? T.danger : T.accent;
  const icon = type === "red" ? "✕" : "✓";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            animation: `fadeIn 0.4s ease ${0.1 * i}s both`,
          }}
        >
          <span
            style={{
              color,
              fontSize: 11,
              fontWeight: 700,
              marginTop: 2,
              flexShrink: 0,
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: `${color}22`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {icon}
          </span>
          <span style={{ color: T.textMuted, fontSize: 13, lineHeight: 1.5 }}>
            {item}
          </span>
        </div>
      ))}
    </div>
  );
}

function NavButton({ onClick, children, primary, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        flex: 1,
        padding: "14px 20px",
        borderRadius: 12,
        border: primary ? "none" : `1px solid ${T.border}`,
        background: primary
          ? `linear-gradient(135deg, ${T.accent}, #00B894)`
          : "transparent",
        color: primary ? T.bg : T.textMuted,
        fontSize: 15,
        fontWeight: 700,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition: "all 0.2s ease",
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: "0.3px",
      }}
    >
      {children}
    </button>
  );
}

// ─── STEP VIEWS ───
function LandingView({ data, onStart }) {
  const d = data.meta;
  const priceNum = parseFloat(d.current_price.replace("$", ""));
  const [lo, hi] = d.fifty_two_week_range.split(" - ").map((s) => parseFloat(s.replace("$", "")));
  const pricePct = ((priceNum - lo) / (hi - lo)) * 100;

  return (
    <div style={{ animation: "fadeIn 0.6s ease both" }}>
      <div style={{ textAlign: "center", marginBottom: 32, paddingTop: 20 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 3,
            color: T.accent,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Stock Fortress Research
        </div>
        <div
          style={{
            display: "inline-block",
            background: `linear-gradient(135deg, ${T.accent}22, ${T.blue}22)`,
            borderRadius: 16,
            padding: "12px 28px",
            border: `1px solid ${T.accent}33`,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontSize: 42,
              fontWeight: 800,
              color: T.text,
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "-1px",
            }}
          >
            {d.ticker}
          </div>
        </div>
        <div style={{ color: T.textMuted, fontSize: 15, marginBottom: 4 }}>
          {d.company_name}
        </div>
        <div style={{ color: T.textDim, fontSize: 13 }}>{d.sector}</div>
      </div>

      <Card delay={0.1} glow>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            marginBottom: 16,
          }}
        >
          <div>
            <div style={{ fontSize: 36, fontWeight: 800, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>
              {d.current_price}
            </div>
            <div style={{ fontSize: 12, color: T.danger, marginTop: 2 }}>
              ▼ 78% from 52-week high
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 12, color: T.textDim }}>Market Cap</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: T.text, fontFamily: "'JetBrains Mono', monospace" }}>
              {d.market_cap}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: T.textDim, marginBottom: 6 }}>
            <span>${lo}</span>
            <span style={{ color: T.textMuted, fontSize: 10 }}>52-WEEK RANGE</span>
            <span>${hi}</span>
          </div>
          <div style={{ height: 6, background: T.surface, borderRadius: 3, position: "relative" }}>
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                height: "100%",
                width: `${pricePct}%`,
                background: `linear-gradient(90deg, ${T.danger}, ${T.warning})`,
                borderRadius: 3,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: -3,
                left: `${pricePct}%`,
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: T.danger,
                border: `2px solid ${T.bg}`,
                transform: "translateX(-50%)",
                boxShadow: `0 0 8px ${T.danger}66`,
              }}
            />
          </div>
        </div>
      </Card>

      <Card delay={0.2}>
        <MetricRow label="P/E Ratio" value={d.pe_ratio} />
        <MetricRow label="Avg Volume" value={d.avg_volume} />
        <MetricRow label="Report Date" value={d.report_date} />
        <div style={{ fontSize: 11, color: T.textDim, marginTop: 8, fontStyle: "italic" }}>
          {d.data_freshness_note}
        </div>
      </Card>

      <Card delay={0.3} style={{ background: `linear-gradient(135deg, ${T.accent}08, ${T.blue}08)`, border: `1px solid ${T.accent}33` }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" }}>
            Before You Trade
          </div>
          <div style={{ fontSize: 15, color: T.textMuted, lineHeight: 1.6, marginBottom: 4 }}>
            Complete the <strong style={{ color: T.text }}>7-Step Research Checklist</strong> to make an informed decision.
          </div>
          <div style={{ fontSize: 12, color: T.textDim }}>
            ~3 min read · No shortcuts
          </div>
        </div>
      </Card>

      <button
        onClick={onStart}
        style={{
          width: "100%",
          padding: "16px",
          borderRadius: 14,
          border: "none",
          background: `linear-gradient(135deg, ${T.accent}, #00B894)`,
          color: T.bg,
          fontSize: 16,
          fontWeight: 800,
          cursor: "pointer",
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: "0.5px",
          boxShadow: `0 4px 24px ${T.accent}44`,
          animation: "glow 3s ease infinite",
          marginTop: 8,
        }}
      >
        START RESEARCH →
      </button>
    </div>
  );
}

function Step1View({ data }) {
  const d = data.step_1_know_what_you_own;
  return (
    <div>
      <Card delay={0.1}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>
          In Plain English
        </div>
        <div style={{ fontSize: 17, color: T.text, lineHeight: 1.7, fontWeight: 500 }}>
          "{d.one_liner}"
        </div>
      </Card>

      <Card delay={0.2}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.textMuted, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>
          How They Make Money
        </div>
        <div style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.7 }}>
          {d.how_it_makes_money}
        </div>
      </Card>

      <Card delay={0.3}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.textMuted, letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>
          Key Products
        </div>
        {d.key_products_or_services.map((p, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 0",
              borderBottom: i < d.key_products_or_services.length - 1 ? `1px solid ${T.border}33` : "none",
              animation: `fadeIn 0.3s ease ${0.1 * i}s both`,
            }}
          >
            <span style={{ color: T.accent, fontSize: 8 }}>●</span>
            <span style={{ color: T.textMuted, fontSize: 14 }}>{p}</span>
          </div>
        ))}
      </Card>

      <Card delay={0.4}>
        <MetricRow label="Target Customer" value={d.customer_type} />
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <span style={{ fontSize: 12, color: T.textDim }}>Could you explain this to a friend?</span>
          <div style={{ marginTop: 6 }}>
            <Badge color={d.pass_fail === "YES" ? T.accent : T.danger}>
              {d.pass_fail}
            </Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Step2View({ data }) {
  const d = data.step_2_check_the_financials;
  const g = GRADES[d.financial_health_grade] || GRADES.C;
  return (
    <div>
      <Card delay={0.1} glow>
        <div style={{ textAlign: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: T.textDim, letterSpacing: 2, marginBottom: 8, textTransform: "uppercase" }}>
            Financial Health Grade
          </div>
          <div
            style={{
              display: "inline-flex",
              width: 72,
              height: 72,
              borderRadius: "50%",
              alignItems: "center",
              justifyContent: "center",
              background: `${g.color}22`,
              border: `3px solid ${g.color}`,
              boxShadow: `0 0 20px ${g.color}33`,
            }}
          >
            <span style={{ fontSize: 32, fontWeight: 800, color: g.color, fontFamily: "'JetBrains Mono', monospace" }}>
              {d.financial_health_grade}
            </span>
          </div>
          <div style={{ fontSize: 13, color: g.color, fontWeight: 600, marginTop: 6 }}>{g.label}</div>
        </div>
      </Card>

      <Card delay={0.2}>
        <MetricRow label="Revenue (Latest)" value={d.revenue_latest} />
        <MetricRow label="YoY Growth" value={d.revenue_growth_yoy} highlight={T.accent} />
        <MetricRow label="Net Income" value={d.net_income_latest} highlight={d.profitable ? T.accent : T.danger} />
        <MetricRow label="Gross Margin" value={d.gross_margin} />
        <MetricRow label="Free Cash Flow" value={d.free_cash_flow} highlight={T.accent} />
        <MetricRow label="Debt Level" value={d.debt_level} highlight={d.debt_level === "LOW" ? T.accent : T.warning} />
      </Card>

      <Card delay={0.3}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.danger, letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>
          🚩 Red Flags
        </div>
        <FlagList items={d.red_flags} type="red" />
      </Card>

      <Card delay={0.4}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>
          ✅ Green Flags
        </div>
        <FlagList items={d.green_flags} type="green" />
      </Card>
    </div>
  );
}

function Step3View({ data }) {
  const d = data.step_3_understand_the_story;
  return (
    <div>
      <Card delay={0.1} style={{ borderLeft: `3px solid ${T.accent}` }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>
          Bull Case — Why Believers Buy
        </div>
        <div style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.7 }}>{d.bull_case}</div>
      </Card>

      <Card delay={0.2} style={{ borderLeft: `3px solid ${T.danger}` }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.danger, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>
          Bear Case — Why Skeptics Sell
        </div>
        <div style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.7 }}>{d.bear_case}</div>
      </Card>

      <Card delay={0.3}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>
          What Must Go Right
        </div>
        <FlagList items={d.what_must_go_right} type="green" />
      </Card>

      <Card delay={0.4}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.danger, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>
          What Could Go Wrong
        </div>
        <FlagList items={d.what_could_go_wrong} type="red" />
      </Card>

      <Card delay={0.5} style={{ background: `linear-gradient(135deg, ${T.blue}11, ${T.accent}08)` }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.blue, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>
          Is This Priced In?
        </div>
        <div style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.7 }}>{d.is_this_priced_in}</div>
      </Card>
    </div>
  );
}

function Step4View({ data }) {
  const d = data.step_4_know_the_risks;
  return (
    <div>
      {d.top_3_risks.map((r, i) => (
        <Card key={i} delay={0.1 * (i + 1)} style={{ borderLeft: `3px solid ${SEVERITY_COLORS[r.severity]}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{r.risk}</div>
            <Badge color={SEVERITY_COLORS[r.severity]}>{r.severity}</Badge>
          </div>
          <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.6 }}>{r.explanation}</div>
        </Card>
      ))}

      <Card delay={0.4}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.danger, letterSpacing: 1, marginBottom: 12, textTransform: "uppercase" }}>
          Recent Red Flags
        </div>
        {d.recent_red_flags.map((f, i) => (
          <div
            key={i}
            style={{
              fontSize: 13,
              color: T.textMuted,
              lineHeight: 1.6,
              padding: "6px 0",
              borderBottom: `1px solid ${T.border}22`,
              animation: `fadeIn 0.3s ease ${0.1 * i}s both`,
            }}
          >
            <span style={{ color: T.danger, marginRight: 8 }}>●</span>
            {f}
          </div>
        ))}
      </Card>

      <Card delay={0.5}>
        <MetricRow label="Regulatory Exposure" value={d.regulatory_exposure} highlight={T.danger} />
        <div style={{ marginTop: 10, fontSize: 13, color: T.textMuted, lineHeight: 1.6 }}>
          <span style={{ color: T.warning, fontWeight: 600 }}>Concentration: </span>
          {d.concentration_risk}
        </div>
      </Card>
    </div>
  );
}

function Step5View({ data }) {
  const d = data.step_5_check_the_competition;
  const mc = MOAT_COLORS[d.moat_strength] || T.textDim;
  return (
    <div>
      {d.main_competitors.map((c, i) => (
        <Card key={i} delay={0.1 * (i + 1)}>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 6 }}>{c.name}</div>
          <div style={{ fontSize: 13, color: T.textDim, marginBottom: 8 }}>{c.why_they_compete}</div>
          <div style={{ fontSize: 13, color: T.warning, lineHeight: 1.5 }}>
            <span style={{ fontWeight: 600 }}>Edge: </span>
            {c.advantage_over_this_stock}
          </div>
        </Card>
      ))}

      <Card delay={0.4} glow>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 11, color: T.textDim, letterSpacing: 2, marginBottom: 10, textTransform: "uppercase" }}>
            Competitive Moat
          </div>
          <div
            style={{
              display: "inline-block",
              padding: "8px 24px",
              borderRadius: 10,
              background: `${mc}22`,
              border: `2px solid ${mc}`,
              fontSize: 18,
              fontWeight: 800,
              color: mc,
              letterSpacing: 1,
            }}
          >
            {d.moat_strength}
          </div>
          <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.6, marginTop: 12 }}>
            {d.moat_explanation}
          </div>
        </div>
      </Card>
    </div>
  );
}

function Step6View({ data }) {
  const d = data.step_6_valuation_reality_check;
  const expColor = { CHEAP: T.accent, FAIR: T.blue, EXPENSIVE: T.warning, SPECULATIVE: T.danger }[d.is_it_expensive] || T.text;
  return (
    <div>
      <Card delay={0.1}>
        <MetricRow label="Current P/E" value={d.current_pe} />
        <MetricRow label="Sector Avg P/E" value={d.sector_avg_pe} />
        <MetricRow label="Price/Sales" value={d.price_to_sales} />
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Badge color={expColor}>{d.is_it_expensive}</Badge>
        </div>
      </Card>

      <Card delay={0.2}>
        <div style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.7 }}>{d.valuation_context}</div>
      </Card>

      <Card delay={0.3}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.textMuted, letterSpacing: 1, marginBottom: 16, textTransform: "uppercase" }}>
          Price Scenarios
        </div>
        {[
          { label: "Bear Case", val: d.bear_case_price, color: T.danger },
          { label: "Base Case", val: d.base_case_price, color: T.blue },
          { label: "Bull Case", val: d.bull_case_price, color: T.accent },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "12px 16px",
              borderRadius: 10,
              background: `${s.color}11`,
              border: `1px solid ${s.color}33`,
              marginBottom: 8,
              animation: `fadeIn 0.4s ease ${0.15 * i}s both`,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: s.color }} />
              <span style={{ fontSize: 14, color: T.textMuted, fontWeight: 600 }}>{s.label}</span>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: s.color, fontFamily: "'JetBrains Mono', monospace" }}>
              {s.val}
            </span>
          </div>
        ))}
      </Card>
    </div>
  );
}

function Step7View({ data }) {
  const d = data.step_7_verdict;
  const a = ACTION_STYLES[d.action] || ACTION_STYLES.WATCH;
  return (
    <div>
      <Card delay={0.1} style={{ background: a.bg, border: `2px solid ${a.border}`, animation: "glow 3s ease infinite, fadeIn 0.5s ease both" }}>
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{a.icon}</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: a.color, letterSpacing: 2, fontFamily: "'JetBrains Mono', monospace" }}>
            {d.action}
          </div>
          <div style={{ marginTop: 8 }}>
            <Badge color={T.textMuted}>Confidence: {d.confidence}</Badge>
          </div>
          <div style={{ fontSize: 15, color: T.text, lineHeight: 1.6, marginTop: 16, fontWeight: 500 }}>
            {d.one_line_reason}
          </div>
        </div>
      </Card>

      <Card delay={0.2}>
        <div style={{ fontSize: 13, fontWeight: 700, color: T.blue, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>
          What Changes This Verdict
        </div>
        <div style={{ fontSize: 14, color: T.textMuted, lineHeight: 1.7 }}>{d.what_would_change_this}</div>
      </Card>

      <Card delay={0.3}>
        <MetricRow label="Key Metric to Track" value={d.most_important_metric_to_track} highlight={T.accent} />
        <MetricRow label="Revisit Date" value={d.suggested_revisit_date} highlight={T.warning} />
      </Card>
    </div>
  );
}

function GutCheckView({ data }) {
  const d = data.investor_gut_check;
  const qs = [d.question_1, d.question_2, d.question_3, d.question_4];
  return (
    <div>
      <Card delay={0.1} style={{ background: `linear-gradient(135deg, ${T.warning}08, ${T.danger}08)`, border: `1px solid ${T.warning}33` }}>
        <div style={{ textAlign: "center", fontSize: 13, fontWeight: 700, color: T.warning, letterSpacing: 2, textTransform: "uppercase" }}>
          Honest Self-Assessment
        </div>
      </Card>

      {qs.map((q, i) => (
        <Card key={i} delay={0.15 * (i + 1)}>
          <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: `${T.accent}22`,
                border: `1px solid ${T.accent}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                fontSize: 14,
                fontWeight: 700,
                color: T.accent,
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              {i + 1}
            </div>
            <div style={{ fontSize: 14, color: T.text, lineHeight: 1.7, fontWeight: 500 }}>{q}</div>
          </div>
        </Card>
      ))}

      <Card
        delay={0.8}
        style={{
          background: `linear-gradient(135deg, ${T.bgCard}, ${T.accent}08)`,
          border: `1px solid ${T.accent}44`,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: T.accent, letterSpacing: 1, marginBottom: 10, textTransform: "uppercase" }}>
          Remember
        </div>
        <div style={{ fontSize: 15, color: T.text, lineHeight: 1.8, fontStyle: "italic" }}>
          "{d.mindset_reminder}"
        </div>
      </Card>

      <div
        style={{
          textAlign: "center",
          padding: "20px",
          marginTop: 8,
          animation: "fadeIn 0.5s ease 1s both",
        }}
      >
        <div style={{ fontSize: 11, color: T.textDim, letterSpacing: 2, textTransform: "uppercase" }}>
          Built by
        </div>
        <div style={{ fontSize: 18, fontWeight: 800, color: T.accent, letterSpacing: 1, marginTop: 4 }}>
          Stock Fortress
        </div>
        <div style={{ fontSize: 12, color: T.textDim, marginTop: 4 }}>
          Research before you trade. Always.
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ───
export default function StockFortressApp() {
  const [step, setStep] = useState(0);
  const [ticker, setTicker] = useState("");
  const [data, setData] = useState(DEMO_DATA);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  const goNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    }
  };
  const goPrev = () => {
    if (step > 0) setStep((s) => s - 1);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [step]);

  const handleSearch = () => {
    if (!ticker.trim()) return;
    setLoading(true);
    // In production, this calls your API endpoint
    // For demo, we show the HIMS data after a brief delay
    setTimeout(() => {
      setData(DEMO_DATA);
      setLoading(false);
      setStep(0);
    }, 1500);
  };

  const currentStep = STEPS[step];
  const isLanding = step === 0;

  const VIEW_MAP = {
    landing: <LandingView data={data} onStart={goNext} />,
    step1: <Step1View data={data} />,
    step2: <Step2View data={data} />,
    step3: <Step3View data={data} />,
    step4: <Step4View data={data} />,
    step5: <Step5View data={data} />,
    step6: <Step6View data={data} />,
    step7: <Step7View data={data} />,
    gutcheck: <GutCheckView data={data} />,
  };

  return (
    <div
      style={{
        maxWidth: 430,
        margin: "0 auto",
        minHeight: "100vh",
        background: T.bg,
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        ${fadeIn} ${slideUp} ${pulse} ${glow} ${shimmer}
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
        body { background: ${T.bg}; overflow: hidden; }
        ::-webkit-scrollbar { width: 0; }
        input::placeholder { color: ${T.textDim}; }
      `}</style>

      {/* HEADER */}
      <div
        style={{
          padding: "12px 20px",
          borderBottom: `1px solid ${T.border}33`,
          background: `${T.bg}EE`,
          backdropFilter: "blur(12px)",
          zIndex: 10,
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: step > 0 ? 10 : 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 16, fontWeight: 800, color: T.accent, fontFamily: "'JetBrains Mono', monospace", letterSpacing: 1 }}>
              SF
            </span>
            <span style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
              Stock Fortress
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="text"
              placeholder="Ticker..."
              value={ticker}
              onChange={(e) => setTicker(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              style={{
                width: 100,
                padding: "6px 10px",
                borderRadius: 8,
                border: `1px solid ${T.border}`,
                background: T.surface,
                color: T.text,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "'JetBrains Mono', monospace",
                outline: "none",
              }}
            />
            <button
              onClick={handleSearch}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: "none",
                background: T.accent,
                color: T.bg,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {loading ? "..." : "GO"}
            </button>
          </div>
        </div>

        {step > 0 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 16 }}>{currentStep.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: T.text }}>
                  Step {currentStep.num <= 7 ? currentStep.num : ""}: {currentStep.label}
                </span>
              </div>
              <span style={{ fontSize: 12, color: T.textDim, fontFamily: "'JetBrains Mono', monospace" }}>
                {step}/8
              </span>
            </div>
            <ProgressBar current={step} total={8} />
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div
        ref={scrollRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px 16px 100px 16px",
        }}
        key={step}
      >
        {VIEW_MAP[currentStep.key]}
      </div>

      {/* NAV BAR */}
      {step > 0 && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "12px 16px",
            background: `linear-gradient(transparent, ${T.bg} 20%)`,
            paddingTop: 32,
            display: "flex",
            gap: 12,
            zIndex: 10,
          }}
        >
          <NavButton onClick={goPrev}>← Back</NavButton>
          {step < STEPS.length - 1 ? (
            <NavButton onClick={goNext} primary>
              Next Step →
            </NavButton>
          ) : (
            <NavButton onClick={() => setStep(0)} primary>
              New Research
            </NavButton>
          )}
        </div>
      )}
    </div>
  );
}
