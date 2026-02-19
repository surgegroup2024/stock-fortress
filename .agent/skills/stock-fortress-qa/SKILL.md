---
name: stock-fortress-qa
description: >
  QA and test the Stock Fortress web application by navigating all analysis pages
  for a given stock ticker. Use this skill when asked to test, QA, review, or audit
  Stock Fortress functionality, data quality, or user experience. Triggers on:
  "test Stock Fortress", "QA ticker", "review analysis pages", "check data quality",
  "user engagement score", "verify Stock Fortress".
---

# Stock Fortress QA Skill

Perform a comprehensive QA audit of the Stock Fortress stock analysis application for a given ticker symbol. This skill navigates every analysis step, verifies functionality, evaluates AI-generated data quality, and produces a structured report with a User Engagement Score out of 10.

## Prerequisites

- **Playwright MCP server** installed and running (required)
- Access to the live site (`https://www.stockfortress.com`) or local dev server (`http://localhost:5173`)
- A valid stock ticker to test (e.g., `AAPL`, `TSLA`, `HIMS`)

## Tools Used

This skill uses the **Playwright MCP** tools exclusively:
- `browser_navigate` — open URLs
- `browser_snapshot` — capture accessibility snapshots for element verification
- `browser_take_screenshot` — capture visual screenshots for QA evidence
- `browser_click` — click buttons and interactive elements
- `browser_type` — enter ticker symbols
- `browser_wait_for` — wait for page loads and transitions
- `browser_console_messages` — check for JS errors
- `browser_evaluate` — run custom JS checks (e.g., validate data in the DOM)

## Execution Flow

### Phase 1: Navigate to the Application

1. **Open the app** at `https://www.stockfortress.com` (or `http://localhost:5173` for local testing)
2. **Verify the homepage loads** — look for:
   - The search bar / ticker input field
   - "Stock Fortress" branding
   - CTA elements and hero section
3. **Screenshot the homepage** for the QA report

### Phase 2: Enter Ticker & Start Report

4. **Enter the ticker** (e.g., `AAPL`) into the search bar and submit
5. **Observe the loading screen** — verify:
   - The animated loading spinner appears with the "SF" logo
   - Loading messages cycle (e.g., "Initializing market data scan...", "Crunching financial statements...")
   - The progress shimmer bar animates
6. **Wait for the report to load** — the URL should be `/report/{TICKER}`
7. **Check for errors**:
   - If "Using demo data (backend unavailable)" banner shows → note as ⚠️ demo mode
   - If "No data for {TICKER}" error → note as ❌ backend failure
   - If report loads successfully → note as ✅ live data

### Phase 3: Walk Through All 9 Analysis Steps

For **each step**, evaluate three dimensions:

| Dimension | What to Check |
|-----------|---------------|
| **Functionality** | Page renders, buttons work, no JS errors, no blank sections |
| **Data Quality** | Numbers are realistic, text is substantive (not placeholder), data is current |
| **UX/Improvements** | Visual polish, readability, mobile feel, missing features |

#### Step 0: Landing Page
- **Navigate**: This is the first view after report loads
- **Verify these elements render**:
  - Ticker symbol in large format (e.g., "AAPL")
  - Company name and sector
  - Current price with dollar sign
  - Market cap
  - 52-week range bar with position indicator dot
  - Trailing P/E and Forward P/E in the MetaGrid
  - Beta with color-coded badge (Hi Vol / Stable / Market)
  - Average volume
  - Report date and data freshness note
  - "7-Step Research Checklist" prompt card
  - "START RESEARCH →" button (green gradient)
- **Data quality checks**:
  - Price should be a reasonable number (not $0 or negative)
  - Market cap should match rough expectations (e.g., AAPL should be ~$3T range)
  - 52W range: low < current price < high
  - P/E ratios should be positive for profitable companies
  - Beta typically between 0.5 and 3.0
- **Click "START RESEARCH →"** to proceed

#### Step 1: Know What You Own (S1)
- **Verify these sections render**:
  - "In Plain English" — one-liner quote
  - "How They Make Money" — 2-3 sentence description
  - "Key Products" — bullet list with green dots
  - "Target Customer" — MetricRow
  - "Could you explain this to a friend?" — YES/NO badge (clickable)
- **Data quality checks**:
  - One-liner should be a clear, jargon-free sentence
  - Revenue model description should match the actual company
  - Key products should be real products/services of the company
  - Customer type should be reasonable
- **Click "Next Step →"** to proceed

#### Step 2: Check Financials (S2)
- **Verify these sections render**:
  - Financial Health Grade — large circular badge (A/B/C/D/F) with color
  - Latest quarter label (e.g., "Q1 FY2026")
  - Revenue and EPS with beat/miss badges
  - FinancialGrid: YoY Growth, Gross Margin, Cash Mountain, Free Cash Flow
  - Revenue Breakdown — horizontal bar chart with segment percentages
  - Red Flags — list with 🚩 styling
  - Green Flags — list with ✅ styling
- **Data quality checks**:
  - Revenue growth percentage should be realistic (-50% to +200% typical range)
  - Gross margin should be a valid percentage (0-100%)
  - Health grade should match the financial profile
  - Revenue breakdown percentages should sum to ~100%
  - Beat/miss labels should say "BEAT" or "MISS" (not gibberish)
- **Click "Next Step →"** to proceed

#### Step 2A: Earnings Deep-Dive (S2A)
- **Verify these sections render**:
  - 🎙️ Management Tone — styled quote with color-coded border
  - 📊 Segment Performance — SentimentRow items with icons (📈/📉/📊)
  - ⚠️ One-Time Adjustments (if applicable)
  - 📈 Guidance Update — with "FORWARD-LOOKING" badge
  - 🏦 Analyst Reaction — SmartText formatted
  - ℹ️ Forward statements disclaimer (if present)
- **Data quality checks**:
  - Management tone should be one of: Confident, Cautious, Defensive, Uncertain
  - Segment data should reference real business segments
  - Guidance should include revenue/EPS projections
  - Analyst reaction should mention real firms
- **Click "Next Step →"** to proceed

#### Step 3: Understand The Story (S3)
- **Verify these sections render**:
  - Bull Case — green-bordered card
  - Base Case — neutral card
  - Bear Case — red-bordered card
  - Macro Overlay — gold label
  - "Must Go Right" — green flag list
  - "Bearish Catalysts" — red flag list
  - Timeline — catalyst timeline bullets
- **Data quality checks**:
  - Bull/base/bear cases should be distinct and substantive (not single words)
  - Catalysts should include specific dates or events
  - Macro overlay should be relevant to the sector
- **Click "Next Step →"** to proceed

#### Step 4: Know The Risks (S4)
- **Verify these sections render**:
  - Risk cards with severity badges (LOW/MEDIUM/HIGH/CRITICAL)
  - Probability badges
  - Risk explanations
  - Ownership & Analysts — AnalystConsensus component (bar chart)
  - Regulatory exposure MetricRow
  - Concentration risk text
- **Data quality checks**:
  - At least 2-3 risks should be listed
  - Severity levels should use valid enum values
  - Ownership signals should reference real data (insider trading, 13F)
  - AnalystConsensus: buy/hold/sell numbers should sum to total
- **Click "Next Step →"** to proceed

#### Step 5: Competition (S5)
- **Verify these sections render**:
  - Competitor cards with name, "why they compete", and "their edge"
  - Competitive Moat badge (NONE/WEAK/MODERATE/STRONG)
  - Moat explanation text
- **Data quality checks**:
  - Competitors should be real companies in the same space
  - Moat strength should match the explanation
  - At least 1-3 competitors listed
- **Click "Next Step →"** to proceed

#### Step 6: Valuation Check (S6)
- **Verify these sections render**:
  - Valuation Multiples grid (Current P/E, Forward P/E, P/S, EV/EBITDA)
  - "CHEAP/FAIR/EXPENSIVE/SPECULATIVE" badge
  - 📊 Peer Comparison — bar chart (PeerComparison component)
  - DCF Card — implied share price, growth/terminal/discount rates, methodology
  - 💡 Context & History
  - ContextBadge (upside/downside signal)
  - Price Targets — bear/base/bull with colored cards
- **Data quality checks**:
  - All multiples should be positive numbers (for profitable companies)
  - DCF implied value should be a reasonable share price
  - Price targets: bear < base < bull
  - The "expensive" label should match the multiples vs sector averages
- **Click "Next Step →"** to proceed

#### Step 7: The Verdict (S7)
- **Verify these sections render**:
  - Large action badge: BUY (▲ green), WATCH (◉ yellow), or AVOID (✕ red)
  - Confidence badge (LOW/MEDIUM/HIGH)
  - One-line reason text
  - "Signal to Change Course" section
  - "Most Important Metric to Track" MetricRow
  - "Suggested Revisit Date" MetricRow
- **Data quality checks**:
  - Action must be exactly BUY, WATCH, or AVOID
  - Confidence must be LOW, MEDIUM, or HIGH
  - One-line reason should be a coherent sentence
  - Revisit date should be a future date
- **Click "Next Step →"** to proceed

#### Step 8: Gut Check (Final Step)
- **Verify these sections render**:
  - "Honest Self-Assessment" header
  - 4 numbered question cards
  - 📺 Recommended Watch — YouTube embed (if video data present)
  - "Remember" — mindset reminder quote
  - "Built by Stock Fortress" footer
- **Data quality checks**:
  - Questions should be specific to the stock (not generic)
  - Mindset reminder should be stock-specific
  - YouTube video should be relevant (if present)
- **This is the final step** — verify "New Research" button appears instead of "Next Step"

### Phase 4: Additional Checks

8. **Navigation verification**:
   - Test "← Back" button on each step — should go to previous step
   - Test progress bar — should fill proportionally (step/9)
   - Test "New ↗" button in header — should navigate to homepage
   - Test "SF Stock Fortress" logo click — should navigate to homepage

9. **Header features**:
   - If logged in: verify "✓ Saved", "👀 Watch" button, "✓ Watching" states
   - If not logged in: verify "Sign up to save" button appears
   - Step indicator: icon + "Step N: Label" + "N/9" counter

10. **View mode toggle** (if applicable):
    - Check if AnalysisSnapshot view is available
    - Verify "View Full Analysis" button switches back to steps

### Phase 5: Console Error Check

11. **Check browser console** for JavaScript errors using `browser_console_messages`
12. **Screenshot each step** using `browser_take_screenshot` for the QA evidence archive

### Phase 6: Generate QA Report

Produce a structured report with this format:

```markdown
# Stock Fortress QA Report — {TICKER}

**Date**: {date}
**Environment**: Live / Local / Demo Data
**Ticker Tested**: {TICKER}

## Per-Step Results

| Step | Functionality | Data Quality | Issues Found |
|------|:---:|:---:|---|
| Landing | ✅/⚠️/❌ | ✅/⚠️/❌ | ... |
| S1: Know What You Own | ✅/⚠️/❌ | ✅/⚠️/❌ | ... |
| S2: Check Financials | ✅/⚠️/❌ | ✅/⚠️/❌ | ... |
| S2A: Earnings Deep-Dive | ✅/⚠️/❌ | ✅/⚠️/❌ | ... |
| S3: Understand Story | ✅/⚠️/❌ | ✅/⚠️/❌ | ... |
| S4: Know Risks | ✅/⚠️/❌ | ✅/⚠️/❌ | ... |
| S5: Competition | ✅/⚠️/❌ | ✅/⚠️/❌ | ... |
| S6: Valuation | ✅/⚠️/❌ | ✅/⚠️/❌ | ... |
| S7: Verdict | ✅/⚠️/❌ | ✅/⚠️/❌ | ... |
| Gut Check | ✅/⚠️/❌ | ✅/⚠️/❌ | ... |

## Improvement Suggestions
1. ...
2. ...

## User Engagement Score: X/10
(See references/scoring-rubric.md for breakdown)

| Category | Score | Notes |
|----------|:---:|---|
| Visual Polish | /10 | ... |
| Content Depth | /10 | ... |
| Interactivity | /10 | ... |
| Data Accuracy | /10 | ... |
| Mobile UX | /10 | ... |
| Loading Experience | /10 | ... |
| Error Handling | /10 | ... |
| **Overall** | **X/10** | ... |
```

## Reference Files

For detailed schemas and rubrics, read:
- `references/analysis-steps.md` — step-by-component mapping
- `references/data-schema.md` — full JSON response schema
- `references/scoring-rubric.md` — engagement scoring criteria
