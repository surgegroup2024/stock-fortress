# Stock Fortress — User Engagement Scoring Rubric

Score each category from 1–10, then compute the weighted average for the overall User Engagement Score.

## Scoring Categories

### 1. Visual Polish & Design (Weight: 15%)

| Score | Criteria |
|:---:|---|
| 9-10 | Premium feel — smooth gradients, consistent typography, color-coded badges, animated cards, dark/light contrast, glassmorphism effects. Feels like a fintech app |
| 7-8 | Polished — good use of color, clean layout, readable fonts, some nice touches but minor inconsistencies |
| 5-6 | Functional — plain design, basic styling, no visual bugs but nothing memorable |
| 3-4 | Rough — misaligned elements, inconsistent spacing, clunky appearance |
| 1-2 | Broken — missing styles, overlapping elements, unreadable text |

**What to look for**: Card animations with `fi` keyframe, glow effects on grade circles, gradient backgrounds on action badges, `IBM Plex Mono` for numbers, `Space Grotesk` for text, color-coded severity/moat/grade systems.

### 2. Content Depth & Readability (Weight: 20%)

| Score | Criteria |
|:---:|---|
| 9-10 | Institutional-grade analysis — specific data points, sourced claims, DCF with labeled assumptions, nuanced bull/bear cases with catalysts. SmartText highlighting works correctly |
| 7-8 | Strong analysis — substantive content, some sourcing, good detail in most steps |
| 5-6 | Adequate — covers all steps but thin on detail, generic statements, few sources |
| 3-4 | Shallow — single-sentence responses, missing data in multiple fields, placeholder text |
| 1-2 | Empty/Gibberish — most fields blank, AI hallucination, nonsensical data |

**What to look for**: Length of bull/bear cases (should be 2-3 sentences min), specificity of risks (dates, dollar amounts), analyst names in reactions, segment breakdowns with %, catalyst timeline with real dates.

### 3. Interactivity & Navigation (Weight: 15%)

| Score | Criteria |
|:---:|---|
| 9-10 | Fluid — step navigation is instant, progress bar fills smoothly, back/next buttons always work, scroll resets on step change, watchlist/save features work |
| 7-8 | Good — navigation works well, minor issues (e.g., scroll doesn't reset perfectly) |
| 5-6 | Functional — can navigate but with friction (slow transitions, occasional stuck states) |
| 3-4 | Buggy — some buttons don't work, navigation gets stuck, can't go back properly |
| 1-2 | Broken — can't navigate between steps, buttons unresponsive |

**What to look for**: `← Back` goes to previous step (step > 0) or homepage (step 0). `Next Step →` advances. Progress bar at `step/9`. `New ↗` goes to homepage. Scroll to top on step change. Watchlist button works for logged-in users.

### 4. Data Accuracy & Freshness (Weight: 25%)

| Score | Criteria |
|:---:|---|
| 9-10 | Accurate — prices match reality (within 1-2 days), market cap in right ballpark, financials match recent filings, competitors are real, analyst firms are real |
| 7-8 | Mostly accurate — minor discrepancies in prices/dates, data is from recent quarter |
| 5-6 | Approximate — some numbers off, data might be 1-2 quarters old, but directionally correct |
| 3-4 | Stale/Wrong — prices significantly off, outdated financials, incorrect competitors listed |
| 1-2 | Fabricated — AI hallucinated data, impossible numbers, fictional companies as competitors |

**What to look for**: Compare current_price to real market price. Check that latest_quarter matches the actual most recent quarter. Verify market_cap is in the right order of magnitude. Confirm competitors actually compete in this space.

### 5. Mobile UX & Responsiveness (Weight: 10%)

| Score | Criteria |
|:---:|---|
| 9-10 | Mobile-first — content fits perfectly in 480px viewport, touch targets are adequate, cards stack properly, text is readable without zooming |
| 7-8 | Good responsive — works well on mobile with minor layout issues |
| 5-6 | Usable — content is accessible but doesn't feel mobile-optimized |
| 3-4 | Cramped — content overflows, text too small, buttons hard to tap |
| 1-2 | Unusable — layout breaks completely on mobile |

**What to look for**: `max-width: 480px` default, expands to `720px` at `768px`, `1024px` at desktop. Cards should stack vertically. Financial grids should be 2-column. Navigation buttons should be full-width.

### 6. Loading Experience (Weight: 10%)

| Score | Criteria |
|:---:|---|
| 9-10 | Delightful — animated SF logo with pulse, rotating loading messages, shimmer progress bar, smooth transition to content |
| 7-8 | Good — loading indicator present, clear what's happening, reasonable wait time |
| 5-6 | Basic — some loading indicator but minimal feedback |
| 3-4 | Confusing — blank screen during load, no feedback on progress |
| 1-2 | Broken — infinite loading, no fallback, error without explanation |

**What to look for**: `LOADING_MESSAGES` cycle every 3.5s with fade-in animation. SF logo pulses. Shimmer bar animates. Loading state message shows "Analyzing {TICKER}...". Total load time should be < 15 seconds for live, < 1 second for cached.

### 7. Error Handling & Edge Cases (Weight: 5%)

| Score | Criteria |
|:---:|---|
| 9-10 | Graceful — demo data fallback works, error messages are clear, paywall shows usage info, invalid ticker handled |
| 7-8 | Good — most errors handled, clear message on failures |
| 5-6 | Basic — some error handling but edge cases cause blank screens |
| 3-4 | Poor — errors cause crashes, no fallback data, confusing error messages |
| 1-2 | None — unhandled exceptions, app breaks on edge cases |

**What to look for**: Demo data fallback (check `DEMOS` object — currently HIMS, AAPL, TSLA). Yellow warning banner for "Using demo data". Error screen with ⚠️ icon and "← Back to Home" button. Paywall component with usage counter. Anonymous rate limiting (1 report/month).

## Computing the Overall Score

```
Overall = (Visual × 0.15) + (Content × 0.20) + (Interactivity × 0.15) +
          (DataAccuracy × 0.25) + (MobileUX × 0.10) + (Loading × 0.10) +
          (ErrorHandling × 0.05)
```

Round to 1 decimal place. Report as: **User Engagement Score: X.X / 10**

## Score Interpretation

| Range | Rating | Meaning |
|-------|--------|---------|
| 9.0-10.0 | 🏆 Excellent | Production-ready, investor-grade experience |
| 7.0-8.9 | ✅ Good | Solid product with minor polish needed |
| 5.0-6.9 | ⚠️ Fair | Functional but needs significant improvement |
| 3.0-4.9 | 🔶 Poor | Major issues preventing user satisfaction |
| 1.0-2.9 | ❌ Critical | Unusable or severely broken |
