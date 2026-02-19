# Stock Fortress — Analysis Steps Reference

Maps each analysis step to its route key, React component, and data fields from the API response.

## Step Configuration (from `theme.js`)

| Index | Key | Label | Icon | Step # | Component |
|-------|-----|-------|------|--------|-----------|
| 0 | `landing` | *(landing page)* | — | 0 | `Landing` |
| 1 | `s1` | Know What You Own | 🏢 | 1 | `S1` |
| 2 | `s2` | Check Financials | 📊 | 2 | `S2` |
| 3 | `s2a` | Earnings Deep-Dive | 🔍 | 2A | `S2A` |
| 4 | `s3` | Understand The Story | 📖 | 3 | `S3` |
| 5 | `s4` | Know The Risks | ⚠️ | 4 | `S4` |
| 6 | `s5` | Competition | ⚔️ | 5 | `S5` |
| 7 | `s6` | Valuation Check | 💰 | 6 | `S6` |
| 8 | `s7` | The Verdict | 🎯 | 7 | `S7` |
| 9 | `gut` | Gut Check | 🧠 | 8 | `Gut` |

**Total Steps**: 9 (displayed as step/9 in progress bar, index 0 is landing)

## Route

```
/report/:ticker
```

The `ReportPage.jsx` component reads `:ticker` from the URL, calls `/api/report/{TICKER}`, and renders the step components.

## Data Field → Step Mapping

### Landing Page (`Landing`)
- **Data key**: `data.meta`
- **Fields**: `ticker`, `company_name`, `sector`, `current_price`, `market_cap`, `trailing_pe`, `forward_pe`, `fifty_two_week_range`, `avg_volume`, `beta`, `report_date`, `data_freshness_note`
- **Sub-component**: `MetaGrid` (renders P/E, beta, volume, date)

### Step 1: Know What You Own (`S1`)
- **Data key**: `data.step_1_know_what_you_own`
- **Fields**: `one_liner`, `how_it_makes_money`, `key_products_or_services[]`, `customer_type`, `pass_fail`

### Step 2: Check Financials (`S2`)
- **Data key**: `data.step_2_check_the_financials`
- **Fields**: `latest_quarter`, `revenue_latest`, `revenue_growth_yoy`, `revenue_beat_miss`, `eps_latest`, `eps_beat_miss`, `net_income_latest`, `profitable`, `gross_margin`, `operating_margin_trend`, `debt_level`, `free_cash_flow_latest`, `cash_position`, `financial_health_grade`, `red_flags[]`, `green_flags[]`, `revenue_breakdown[{segment, percentage, revenue}]`
- **Sub-components**: `FinancialGrid`, `RevenueBreakdown`, `Flags`

### Step 2A: Earnings Deep-Dive (`S2A`)
- **Data key**: `data.step_2a_earnings_and_guidance_review`
- **Fields**: `one_time_items`, `segment_breakdown`, `guidance_changes`, `management_tone`, `analyst_reaction`, `forward_statements_note`
- **Sub-components**: `SentimentRow`, `SmartText`
- **Note**: This step may return `null` if data is unavailable

### Step 3: Understand The Story (`S3`)
- **Data key**: `data.step_3_understand_the_story`
- **Fields**: `bull_case`, `base_case`, `bear_case`, `macro_overlay`, `what_must_go_right[]`, `what_could_break_the_story[]`, `catalyst_timeline[]`
- **Sub-components**: `Flags`, `SmartText`

### Step 4: Know The Risks (`S4`)
- **Data key**: `data.step_4_know_the_risks`
- **Fields**: `top_risks[{risk, severity, likelihood, explanation}]`, `ownership_signals`, `regulatory_exposure`, `concentration_risk`
- **Severity enum**: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`
- **Sub-components**: `AnalystConsensus`, `Badge`

### Step 5: Competition (`S5`)
- **Data key**: `data.step_5_check_the_competition`
- **Fields**: `main_competitors[{name, why_compete, their_advantage}]`, `moat_strength`, `moat_explanation`
- **Moat enum**: `NONE`, `WEAK`, `MODERATE`, `STRONG`

### Step 6: Valuation Check (`S6`)
- **Data key**: `data.step_6_valuation_reality_check`
- **Fields**: `current_pe`, `forward_pe`, `sector_or_peer_avg_pe`, `price_to_sales`, `ev_ebitda_if_relevant`, `simple_dcf_implied_value`, `is_it_expensive`, `valuation_context`, `bear_case_target`, `base_case_target`, `bull_case_target`
- **Expensive enum**: `CHEAP`, `FAIR`, `EXPENSIVE`, `SPECULATIVE`
- **Sub-components**: `BigMetric`, `DCFCard`, `PeerComparison`, `ContextBadge`

### Step 7: The Verdict (`S7`)
- **Data key**: `data.step_7_verdict`
- **Fields**: `action`, `confidence`, `one_line_reason`, `what_signal_would_change_this`, `most_important_metric_to_track`, `suggested_revisit_date`
- **Action enum**: `BUY`, `WATCH`, `AVOID`
- **Confidence enum**: `LOW`, `MEDIUM`, `HIGH`

### Gut Check (`Gut`)
- **Data key**: `data.investor_gut_check`
- **Fields**: `question_1`, `question_2`, `question_3`, `question_4`, `mindset_reminder`, `video_analysis{url, title, channel, why_watch}`

## Helper Components (in `atoms.jsx`)

| Component | Purpose |
|-----------|---------|
| `Badge` | Color-coded status badge |
| `Card` | Animated card container with optional glow/border |
| `MetricRow` | Label + value row |
| `Flags` | Red/green flag list |
| `SectionLabel` | Section header with color |
| `NavBtn` | Navigation button (Back / Next Step) |

## View Modes

The `ReportPage` supports two view modes:
1. **`steps`** (default) — step-by-step checklist navigation
2. **`snapshot`** — single-page `AnalysisSnapshot` component (toggled for cached reports)
