---
description: How to start Stock Fortress locally and run QA tests with Playwright
---

## Starting the Application

### 1. Start the Backend (Python/FastAPI on port 8000)
// turbo
```
python stock_fortress_backend.py
```
CWD: `c:\Local_GIT\stock-fortress\backend`

> The backend uses Gemini 2.5 Flash for AI analysis. It connects to Redis (caching), Supabase (auth/data), and Stripe (billing). Check `.env` in the backend directory for API keys.

### 2. Start the Frontend (Vite on port 3000)
// turbo
```
npm run dev
```
CWD: `c:\Local_GIT\stock-fortress\frontend`

> The frontend proxies `/api` requests to `http://localhost:8000` via `vite.config.js`. No need to configure CORS separately.

### 3. Wait for Both Services
- Backend: Look for `Uvicorn running on http://0.0.0.0:8000`
- Frontend: Look for `VITE ready` and `Local: http://localhost:3000/`

## Running QA Tests with Playwright MCP

### Important Notes
- **Real data takes time**: The Gemini API can take 60-120 seconds to generate a full report for a new ticker. Use `page.waitForSelector('button:has-text("START RESEARCH")', { timeout: 120000 })` when waiting for report generation.
- **Cached reports are fast**: If a ticker has been analyzed before and is cached in Redis, it returns instantly.
- **Demo data fallback**: If the backend is offline, the frontend falls back to demo data for AAPL only.

### Test Flow
1. Navigate to `http://localhost:3000/report/{TICKER}` (e.g., TSLA, AAPL, MSFT)
2. Wait for the loading screen to finish (can take 60-120s for uncached tickers)
3. Click "START RESEARCH →" to enter the wizard
4. Click through all 9 steps using the "Next Step →" button
5. On Step 7 (Valuation), the button says "See Your Verdict ✅"
6. On Step 8 (Verdict), verify the celebration banner and confetti
7. On Step 9 (Gut Check), the button says "New Research ↗"

### Step Button Names (for Playwright selectors)
| Step | Next Button Text |
|------|-----------------|
| Landing (0) | `START RESEARCH →` |
| Steps 1-6 | `Next Step →` |
| Step 7 (Valuation) | `See Your Verdict ✅` |
| Step 8 (Verdict) | `Final Step →` |
| Step 9 (Gut Check) | `New Research ↗` |

### Playwright Code to Navigate All Steps
```javascript
// Click through all wizard steps
async (page) => {
    for (let i = 0; i < 9; i++) {
        const btn = page.locator('button').filter({ 
            has: page.locator('text=/START RESEARCH|Next Step|See Your Verdict|Final Step|Continue/') 
        }).first();
        await btn.click();
        await page.waitForTimeout(500);
    }
}
```

### Verify Progress Bar
Each step should show:
- Completed steps → green circles with ✓ checkmarks
- Current step → larger, pulsing circle with step icon
- "Step X of 9 — [Step Name]" text below

### Verify Verdict Teaser
- Steps 1-6: "🔒 Your [TICKER] verdict is ready — complete X more steps to unlock it"
- Step 7: "🔓 Almost there — 1 more step to your [TICKER] verdict!"
- Step 8: "✅ Research Complete — Your [TICKER] Verdict" (with confetti)

## Build Verification
// turbo
```
npm run build
```
CWD: `c:\Local_GIT\stock-fortress\frontend`

## Troubleshooting
- **Port 3000 in use**: Kill stale processes with `Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }`
- **Backend 500 errors**: Check Gemini API key in `backend/.env` (GEMINI_API_KEY)
- **Redis connection issues**: Verify REDIS_URL in `backend/.env`
