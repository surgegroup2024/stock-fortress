# Stock Fortress — CEO Strategy Document

**Version**: 1.0
**Updated**: 2026-03-09
**Status**: Active

---

## Company Mission

**Help retail investors make better decisions before they trade.**

We provide an AI-powered 7-step pre-trade checklist that analyzes any stock in 30 seconds using Gemini AI and web search. Our thesis: retail investors often trade without adequate research, leading to poor decisions. We remove the friction by automating deep analysis.

---

## Current Product Status

- **MVP**: Fully functional (React PWA + FastAPI backend with Gemini integration)
- **Tech Stack**: React (frontend), FastAPI (backend), Gemini API, Railway (hosting), Supabase (auth)
- **Unit Economics**: ~$0.15-0.25 cost per report; Pro tier margin ~$0.49/user/month
- **Monetization**: Freemium (3 free reports → Pro $7.99/mo → Premium $14.99/mo)

---

## Q1 2026 Priorities (In Order)

### 1. Get to Market (CRITICAL — Blocker for Everything Else)
- [ ] Deploy backend to Railway (10 min)
- [ ] Deploy frontend to Vercel or Railway (10 min)
- [ ] Set up custom domain (stockfortress.com)
- [ ] Test end-to-end with real Gemini API calls
- **Owner**: Founding Engineer (once approved)
- **DueDate**: This week
- **Success Metric**: API responds in <3s per request; frontend loads in <2s

### 2. Implement Authentication & Payments
- [ ] Wire Supabase auth (user signup/login)
- [ ] Implement Stripe for Pro/Premium tiers
- [ ] Track user tier and enforce rate limits per tier
- **Owner**: Founding Engineer
- **Due**: 2026-03-20
- **Success Metric**: 1 test user can sign up, make free reports, attempt paid upgrade

### 3. Launch & Drive Initial Users
- [ ] Write Product Hunt launch copy
- [ ] Reach out to 50 retail investor communities (Reddit, Discord, Twitter)
- [ ] Track early user feedback via Supabase logs + PostHog
- **Owner**: Marketing/Growth (TBD — may be CEO in early stage)
- **Due**: 2026-03-25
- **Success Metric**: 100+ signups in first week; >5% free-to-Pro conversion

### 4. Optimize Unit Economics
- [ ] Cache results for popular tickers (reduce API cost)
- [ ] A/B test pricing tiers
- [ ] Monitor Gemini API cost vs. revenue
- **Owner**: Founding Engineer
- **Due**: 2026-04-15

---

## Team Structure (Current & Planned)

| Role | Status | Focus |
|------|--------|-------|
| **CEO** | 🟢 Active | Strategy, fundraising, hiring, unblocking |
| **Founding Engineer** | 🟡 Pending Approval | Backend/frontend deployment, auth, payments |
| **CTO** | ⬜️ Not Started | Architecture, scaling, reliability (hire after we hit 1000 users) |
| **Designer** | ⬜️ Not Started | UX/UI improvements (hire after we hit 10K users) |
| **Growth/Marketing** | ⬜️ Not Started | Acquisition, retention, GTM (hire when we need to scale) |

---

## Financial Model (At Scale)

| Metric | Target | Path |
|--------|--------|------|
| **Signups (Day 1)** | 100 | Product Hunt + communities |
| **Free→Pro Conversion** | 5% | Launch with great onboarding |
| **Pro Users (Month 1)** | 5 | 100 signups × 5% conversion |
| **Pro Users (Month 3)** | 50+ | 10% month-over-month growth |
| **Monthly Recurring Revenue (Month 3)** | $400+ | 50 users × $7.99/mo |
| **COGS (Month 3)** | $375 | 50 users × $7.50 cost |
| **Gross Profit** | $25+ | Growing margin as we optimize API costs |

---

## Key Decisions & Trade-Offs

### 1. Freemium vs. Paid-Only
**Decision**: Freemium (3 free → Pro $7.99/mo)
**Why**: Lowers acquisition friction, validates product-market fit before asking for money.
**Risk**: Some users only use free tier. **Mitigation**: Track free→Pro conversion closely; optimize if <2%.

### 2. Gemini API vs. Local Model
**Decision**: Gemini API (cloud-hosted)
**Why**: Fastest to market, best accuracy, no DevOps burden.
**Cost**: ~$0.15-0.25 per report. **Mitigation**: Cache popular tickers; monitor API cost as we scale.

### 3. Railway vs. Self-Hosted
**Decision**: Railway for backend, Vercel for frontend.
**Why**: Zero DevOps burden, automatic scaling, staging/prod isolation.
**Risk**: Vendor lock-in. **Mitigation**: Code is portable; can migrate if needed.

### 4. Supabase vs. Custom Auth
**Decision**: Supabase (managed PostgreSQL + auth).
**Why**: User creation, password reset, and OAuth are table stakes; no reason to build.
**Cost**: Free tier supports 500K users. **Upgrade**: Pay as we grow.

---

## What We Say No To (For Now)

- **Mobile apps**: Web PWA is sufficient for MVP.
- **Email marketing**: PostHog + in-app messaging is enough.
- **Sales team**: Self-serve SaaS only; no direct sales until $10K MRR.
- **AI model training**: Use Gemini; don't build our own.
- **Portfolio tracking**: After we hit 10K users.
- **Advanced analytics**: PostHog provides all we need; no data warehouse yet.
- **Premium support**: Free tier only.

---

## Northstar Metrics

Track these weekly:

| Metric | Current | Target (3mo) | Target (12mo) |
|--------|---------|-------------|-------------|
| **Daily Active Users** | 0 | 50 | 5,000 |
| **Paid Subscribers** | 0 | 5 | 500 |
| **MRR** | $0 | $40 | $4,000 |
| **Free→Pro Conversion** | N/A | 5% | 8% |
| **API Cost per Report** | TBD | <$0.20 | <$0.15 |
| **Unit Economics Margin** | TBD | $0.49 | $1.00+ |

---

## Decision-Making Framework

### When Hiring / Delegation
- **Hire for**: Strategic leverage (CEO time freed up for fundraising, planning, big decisions).
- **Don't hire for**: Execution of known, boundaried tasks (use contractors or freelancers first).
- **Test before committing**: 1-2 week trial or small project before full hire.

### When Deprioritizing Work
- **Ask**: "If we don't do this, what breaks in Q1?"
- **If answer is "nothing"**: Deprioritize or move to Q2.
- **If answer is "MRR goes down"**: Do it now.

### When Blocked
- **Escalate to the board**: If a decision blocks >1 person for >1 day.
- **Default to shipping**: If the decision is reversible, make the call and move on.
- **Escalate authoritatively**: CEO makes the final call on conflicts between engineers.

---

## Success Criteria for Q1

By 2026-03-31:

- ✅ Product deployed and live (backend + frontend)
- ✅ Auth + Stripe working (users can sign up and pay)
- ✅ 100+ signups
- ✅ 5+ paying Pro users
- ✅ First $40 MRR
- ✅ Founding Engineer onboarded and shipping
- ✅ PostHog + Google Analytics tracking all key events

By 2026-06-30:

- ✅ 1,000+ signups
- ✅ 50+ paying Pro users
- ✅ $400+ MRR
- ✅ <3s API response time maintained
- ✅ API cost optimized to <$0.15 per report
- ✅ CTO or second engineer onboarded

---

## CEO Commitment

I will:

1. **Remove blockers** for the engineering team daily.
2. **Make fast calls** on strategy, hiring, and trade-offs.
3. **Know the numbers**: MRR, DAU, cost per report, conversion rate — updated weekly.
4. **Stay close to users**: Reach out to first 50 customers for feedback monthly.
5. **Protect focus**: Maximum 3 simultaneous priorities; no new projects until Q1 goals are hit.
6. **Communicate clearly**: Post weekly strategy updates so everyone knows the plan.

---

## Next CEO Heartbeat Actions

1. Approve and onboard Founding Engineer (once board approves)
2. Set up weekly metrics dashboard (MRR, DAU, API cost)
3. Prepare Q1 launch plan (community outreach, Product Hunt, TikTok)
4. Begin Stripe integration planning
5. Schedule first customer research calls (if we have users)

---

**Document Version Control**:
- v1.0 (2026-03-09): Initial strategy; reflects pre-launch stage
- Reviewed / Updated: TBD (update this after each major milestone)
