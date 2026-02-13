# Stock Fortress — Deployment Guide

## Quick Deploy (10 minutes)

### Option A: Railway (Recommended — you already use it)

```bash
# 1. Create new Railway project
railway init

# 2. Set environment variables
railway variables set GEMINI_API_KEY=your-gemini-key

# 3. Deploy backend
railway up

# Your API will be live at: https://your-project.up.railway.app
# Test: https://your-project.up.railway.app/api/report/AAPL
```

### Option B: Vercel (Frontend) + Railway (Backend)

```bash
# Frontend: Deploy the React app to Vercel
npx create-next-app stock-fortress --typescript
# Copy StockFortressApp.jsx into the project
# Update the fetch URL to point to your Railway backend
vercel deploy
```

---

## Project Structure

```
stock-fortress/
├── backend/
│   ├── stock_fortress_backend.py    # FastAPI server
│   ├── requirements.txt             # Python deps
│   ├── Dockerfile                   # For Railway
│   └── railway.toml                 # Railway config
├── frontend/
│   ├── StockFortressApp.jsx         # React PWA (artifact)
│   ├── index.html                   # Entry point
│   └── manifest.json                # PWA manifest
└── README.md
```

---

## requirements.txt

```
fastapi==0.115.0
uvicorn==0.30.0
google-genai>=1.0.0
```

---

## Dockerfile (for Railway)

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "stock_fortress_backend:app", "--host", "0.0.0.0", "--port", "${PORT:-8000}"]
```

---

## railway.toml

```toml
[build]
builder = "dockerfile"

[deploy]
healthcheckPath = "/api/health"
restartPolicyType = "on_failure"
```

---

## Frontend Integration

In your React app, replace the demo data loading with:

```javascript
const load = async (ticker) => {
  setLoading(true);
  try {
    const res = await fetch(`https://your-railway-url.up.railway.app/api/report/${ticker}`);
    const json = await res.json();
    setData(json.report);  // This matches the exact JSON structure the UI expects
    setStep(0);
  } catch (err) {
    alert("Failed to generate report. Try again.");
  } finally {
    setLoading(false);
  }
};
```

---

## Cost Breakdown Per Report

| Component          | Cost         |
|--------------------|-------------|
| Gemini API         | ~$0.01-0.05 |
| Google Search grounding | ~$0.035/query |
| Railway hosting    | ~$5/mo base |
| **Total per report** | **~$0.15-0.25** |

---

## Monetization

| Tier    | Price    | Reports/mo | Your Cost | Margin |
|---------|----------|-----------|-----------|--------|
| Free    | $0       | 3         | $0.75     | -$0.75 (acquisition) |
| Pro     | $7.99/mo | 30        | $7.50     | ~$0.49 |
| Premium | $14.99/mo| Unlimited  | ~$15-20   | Break-even + brand |

At scale (1000 Pro users): $7,990 MRR, ~$7,500 COGS = ~$490 gross profit
Real margin improves with caching (most users research same popular tickers)

---

## PWA Manifest (for "Install to Home Screen")

```json
{
  "name": "Stock Fortress",
  "short_name": "StockFortress",
  "description": "Research before you trade",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#06090F",
  "theme_color": "#00E5B0",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

---

## What's Next

1. Deploy backend to Railway (10 min)
2. Deploy frontend to Vercel or serve from Railway (10 min)  
3. Add Stripe for Pro tier
4. Add user auth (Supabase — you already use it)
5. Add portfolio tracker (save reports per user)
6. Add push notifications when verdicts change
7. Launch on Product Hunt + TikTok (Stock Fortress brand)
