# WealthWatch Roadmap & Product Assessment

**Current Status**: Alpha v0.1.0 — Core portfolio tracking with AI insights  
**Last Updated**: April 21, 2026  
**Stack**: Next.js 16 + TypeScript + Supabase + Drizzle ORM + Recharts

---

## 📊 What's Working Well

✅ **Solid foundation**
- Clean architecture: server actions, typed database schema, proper separation of concerns
- Financial calculations correct: TWRR, P&L, return percentages
- Dashboard provides real-time portfolio overview at a glance
- AI-powered insights using Gemini 2.0 Flash via Vercel AI Gateway (better than Anthropic for cost)

✅ **Data integrity**
- Seed data reflects your actual portfolio history (R5,100 deposited, -27% P&L)
- Snapshot aggregates are computed and cached properly
- Deposit/snapshot relationships are solid

✅ **UX basics**
- Dark mode works
- Responsive mobile nav
- Form validation on critical fields
- Empty states guide users when no data exists

---

## ⚠️ What Needs Work (Priority Order)

### Critical Issues (Blocks production)

1. **No authentication**
   - Anyone with the URL can view and edit your portfolio
   - Missing Supabase Auth integration (OAuth, magic links, or simple session)
   - No user isolation — all users see the same portfolio

2. **No data persistence across sessions**
   - Form inputs reset on page navigation
   - No unsaved changes warnings
   - No draft snapshots

3. **Email reminders not tested**
   - Cron job configured but never manually triggered from UI
   - No RESEND_DOMAIN set in .env (email won't send)
   - No way to preview the email template before deployment

4. **Missing export/backup feature**
   - No way to download portfolio history as CSV or PDF
   - No database backup strategy documented

---

## 🚀 Implementation Roadmap (Phases)

Each phase is a **complete, deployable feature**. Phases can be done in order or in parallel depending on priority.

---

## Phase 0: Launch Ready (Before Production)
**Goal**: Make the app secure and testable  
**Effort**: 1–2 days  
**Deploy**: Yes, blocks all future work

### Tasks

#### 0.1 — Add Supabase Auth (Session-based)
- Install `@supabase/auth-helpers-nextjs`
- Create `/auth/login` and `/auth/signup` pages
- Protected routes using `createServerClient` in middleware
- User ID passed to all database queries (add `userId` column to tables)
- Sign-out button in settings page
- Test with multiple accounts to verify isolation

**Acceptance Criteria**:
- [ ] New users can sign up with email + password
- [ ] Users are logged out on browser close (session expires in 24h)
- [ ] Navigating to `/dashboard` without auth redirects to `/auth/login`
- [ ] Two users' portfolios are completely isolated
- [ ] Database schema updated with `userId` foreign key on all data tables

#### 0.2 — Manual Email Reminder Test
- Add "Send test email" button in Settings > Email Reminders
- Clicking it triggers `/api/cron/portfolio-reminder` manually
- Show success/error toast with the response
- Set `RESEND_DOMAIN` to a real domain (or Resend subdomain)

**Acceptance Criteria**:
- [ ] Button is visible in Settings
- [ ] Clicking it sends a real email to the configured address
- [ ] Email arrives within 30 seconds
- [ ] Email displays portfolio summary + AI insight (if available)
- [ ] Error handling shows why email failed (missing key, quota, etc.)

#### 0.3 — Fix Portfolio Snapshots Query Bug
- The `snapshots/page.tsx` was created but needs verification
- Ensure week-over-week delta calculations are accurate
- Add loading skeleton while data fetches

**Acceptance Criteria**:
- [ ] Snapshots page loads in < 2 seconds
- [ ] Week-over-week change is calculated correctly
- [ ] Older snapshots appear first (chronological order)
- [ ] Empty state appears if no snapshots exist

#### 0.4 — Environment Variables Checklist
Create a `.env.production` documentation file listing all required vars:
- `DATABASE_URL` (Supabase connection string)
- `SUPABASE_URL` + `SUPABASE_ANON_KEY` (for Auth)
- `AI_GATEWAY_API_KEY` (Vercel AI Gateway, not Anthropic)
- `RESEND_API_KEY` + `RESEND_DOMAIN` (email)
- `CRON_SECRET` (portfolio reminder auth)
- `NEXT_PUBLIC_APP_URL` (for email links)

**Acceptance Criteria**:
- [ ] All env vars documented with examples
- [ ] Build fails with clear error if a critical var is missing
- [ ] `bun run build` passes in CI/CD environment

---

## Phase 1: Data Export & Insights
**Goal**: Let users export portfolio data and understand their historical performance  
**Effort**: 3–4 days  
**Dependencies**: Phase 0 complete  
**Deploy**: Yes

### Tasks

#### 1.1 — CSV Export (Deposits + Snapshots)
- Add "Export data" button in Settings
- Generates a CSV with columns: Date, Asset, Type, Action (Deposit/Snapshot), Amount, Value, Notes
- Downloadable in browser as `wealthwatch-export-YYYY-MM-DD.csv`

**Acceptance Criteria**:
- [ ] CSV exports successfully
- [ ] Opens correctly in Excel/Google Sheets
- [ ] All data rows included (no truncation)
- [ ] Special characters (commas, quotes) are escaped properly

#### 1.2 — Performance Summary Card
Add a new card to the dashboard showing:
- Best performing asset (highest %)
- Worst performing asset (lowest %)
- Most recent deposit amount + date
- Time invested (months) + annualized return estimate (TWRR / months * 12)

**Acceptance Criteria**:
- [ ] Card appears below MetricCards
- [ ] Data updates when snapshots change
- [ ] Handles edge cases (only 1 asset, no snapshots yet, etc.)

#### 1.3 — Historical Return Chart (By Asset)
- Clicking an asset row in HoldingsTable expands to show a mini chart: value over time for that asset
- Or create a dedicated `/dashboard/assets/[id]` detail page with full-size chart

**Acceptance Criteria**:
- [ ] Chart appears or navigates to detail page
- [ ] Shows asset value from first deposit to latest snapshot
- [ ] Tooltip shows value on hover + % change from start
- [ ] Responsive on mobile

#### 1.4 — Insight History with Filters
Enhance `/dashboard/insights`:
- Filter by date range (last week, month, all time)
- Filter by model (Gemini vs future LLM options)
- Search by keyword in insight text
- Pagination (10 per page)

**Acceptance Criteria**:
- [ ] Filters work independently and combined
- [ ] Results update without full page reload
- [ ] Pagination shows correct page count

---

## Phase 2: Portfolio Rebalancing Tools
**Goal**: Help users plan and execute portfolio rebalancing  
**Effort**: 4–5 days  
**Dependencies**: Phase 0 complete  
**Deploy**: Yes

### Tasks

#### 2.1 — Target Allocation Input
New page: `/dashboard/rebalance`
- Input target % allocation for each asset (e.g., Large Cap 50%, Blue Chip 30%, etc.)
- Save to new `userSettings.targetAllocation` (JSON field in DB)
- Visual: side-by-side bars showing current vs target

**Acceptance Criteria**:
- [ ] Users can set targets for each active asset
- [ ] Targets must sum to 100% (validation)
- [ ] Targets persist in DB
- [ ] Current allocation chart updates when targets are set

#### 2.2 — Rebalance Recommendation Card
Dashboard card showing:
- "You are X% overweight in [asset], Y% underweight in [asset]"
- How much to buy/sell each asset to hit target allocation
- Assumes next deposit of $500 (or user-specified amount)
- Calculate: `targetValue = currentValue * (targetPct / currentPct) - currentValue`

**Acceptance Criteria**:
- [ ] Recommendations appear only if targets are set
- [ ] Math is correct (verify with 2–3 manual examples)
- [ ] Shows as a warning/info card if any asset is >10% off target

#### 2.3 — Rebalance Simulation
Tool: "If I deposit R[amount], how should I split it?"
- User enters deposit amount
- Tool calculates how to split across assets to hit target allocation
- Shows before/after allocation percentages
- "Apply" button is disabled (manual execution only — safety first)

**Acceptance Criteria**:
- [ ] Simulation updates in real-time as amount changes
- [ ] Shows exact amounts to deposit to each asset
- [ ] Respects minimum deposits (e.g., can't deposit <R10 per asset)

---

## Phase 3: Multi-Currency Support & Forex Integration
**Goal**: Handle ZAR-denominated investments accurately with forex conversions  
**Effort**: 3–4 days  
**Dependencies**: Phase 0 complete  
**Deploy**: Yes

### Tasks

#### 3.1 — Currency Selection per Asset
- Add `baseCurrency` enum to assets table: ZAR, USD, GBP, EUR
- When creating/editing an asset, select its native currency
- Store forex rates in a new `forexRates` table with daily snapshots

**Acceptance Criteria**:
- [ ] Assets can have different currencies
- [ ] UI shows currency next to asset name (e.g., "S&P 500 (USD)")
- [ ] Deposits/snapshots respect the asset's currency

#### 3.2 — Forex Rate Fetching (Daily)
- Create `/api/cron/update-forex-rates` endpoint
- Runs daily at 17:00 SAST (after Forex close in NYC)
- Fetches ZAR rates vs USD, GBP, EUR from a free API (e.g., Open Exchange Rates, Fixer.io)
- Stores rates in `forexRates` table

**Acceptance Criteria**:
- [ ] Cron job runs without errors
- [ ] Rates are stored with timestamp
- [ ] Fallback to last known rate if API fails

#### 3.3 — Portfolio Valuation in Multiple Currencies
- Dashboard shows portfolio total in ZAR + option to view in USD/GBP/EUR
- Uses most recent forex rate for conversion
- Update all charts to show converted values

**Acceptance Criteria**:
- [ ] Currency toggle button appears in top right of dashboard
- [ ] All metrics recalculate when currency changes
- [ ] Charts reflect selected currency
- [ ] Conversions are accurate to 2 decimal places

---

## Phase 4: Advanced Analytics & Reporting
**Goal**: Deep insights into portfolio performance and risk  
**Effort**: 5–6 days  
**Dependencies**: Phases 0, 1 complete  
**Deploy**: Yes

### Tasks

#### 4.1 — Risk Metrics Dashboard
New page: `/dashboard/analytics`
- **Volatility**: Standard deviation of weekly returns
- **Sharpe Ratio**: Return / volatility (assumes risk-free rate of 0%)
- **Max Drawdown**: Largest peak-to-trough decline in portfolio value
- **Sortino Ratio**: Return / downside volatility only
- Display as cards with explanatory tooltips

**Acceptance Criteria**:
- [ ] Each metric appears with a 1–2 sentence explanation
- [ ] Metrics update as snapshots are added
- [ ] Handles edge cases (< 3 snapshots = "insufficient data")
- [ ] Colors indicate good/bad (green/red)

#### 4.2 — Heatmap: Returns by Month
Grid showing:
- Rows: Assets
- Columns: Months
- Cells: Monthly return % for that asset
- Color intensity indicates performance (red = negative, green = positive)

**Acceptance Criteria**:
- [ ] Heatmap is responsive and doesn't overflow
- [ ] Hover shows exact % value
- [ ] Handles months with no data (gray out)

#### 4.3 — Performance Attribution
Breakdown showing:
- How much of your total return came from each asset (%)
- "Large Cap contributed 30% of gains" or "-40% of losses"
- Waterfall chart: starting value → gains → losses → ending value

**Acceptance Criteria**:
- [ ] Attribution sums to total P&L
- [ ] Waterfall visual is clear and intuitive
- [ ] Works even if some assets are negative

#### 4.4 — PDF Report Generation
- New button: "Download report"
- Generates a polished PDF with:
  - Cover page (date, name, summary stats)
  - Portfolio overview charts (allocation, value over time)
  - Holdings table
  - Performance metrics
  - Latest AI insights
- Use `@react-pdf/renderer` or `pdfkit`

**Acceptance Criteria**:
- [ ] PDF generates without errors
- [ ] All charts render correctly in PDF
- [ ] File size < 2MB
- [ ] Downloads as `WealthWatch-Portfolio-YYYY-MM-DD.pdf`

---

## Phase 5: Notifications & Alerts
**Goal**: Proactive alerts for portfolio milestones and anomalies  
**Effort**: 3–4 days  
**Dependencies**: Phase 0 complete  
**Deploy**: Yes

### Tasks

#### 5.1 — Alert Preferences
Settings page additions:
- [ ] Alert me when portfolio value crosses [target threshold]
- [ ] Alert me when an asset diverges >20% from target allocation
- [ ] Alert me when a new high/low is reached
- [ ] Frequency: Immediate, Daily digest, Weekly summary
- [ ] Channels: Email, In-app notification, Both

**Acceptance Criteria**:
- [ ] Preferences persist in DB
- [ ] Each alert type can be toggled independently

#### 5.2 — In-App Notification System
- Add a bell icon in top nav (Sidebar + mobile)
- Shows unread notification count
- Dropdown/modal displays last 20 notifications
- Notifications auto-clear after 30 days
- Table in DB: `notifications` with userId, type, message, read, createdAt

**Acceptance Criteria**:
- [ ] Bell icon appears and updates in real-time
- [ ] Clicking it opens a readable list
- [ ] Mark as read / clear all buttons work
- [ ] Notifications are user-isolated

#### 5.3 — Threshold & Anomaly Detection Cron
Create `/api/cron/check-alerts` (runs daily at 09:00 SAST)
- Check if any thresholds have been crossed since last run
- Detect anomalies (e.g., 1 asset dropped >15% in a week)
- Create notification records + send emails if user opted in

**Acceptance Criteria**:
- [ ] Cron job runs without errors
- [ ] Thresholds are checked accurately
- [ ] Email is sent only if user enabled that channel
- [ ] Notifications are not duplicated

#### 5.4 — Milestone Celebrations
When user hits milestones, show a celebratory card:
- First deposit logged
- First snapshot recorded
- Portfolio hits +10%, +50%, +100% returns
- 100 days invested
- $5k, $10k, $50k portfolio value reached

**Acceptance Criteria**:
- [ ] Card appears on dashboard for 1 week, then dismissable
- [ ] Includes emoji, congratulations message, and a fun fact
- [ ] No duplicate celebrations

---

## Phase 6: Collaboration & Sharing (Optional)
**Goal**: Share portfolio insights without exposing full data  
**Effort**: 4–5 days  
**Dependencies**: Phase 0 complete  
**Deploy**: Yes

### Tasks

#### 6.1 — Anonymous Portfolio Share Link
- "Generate share link" button in Settings
- Creates a read-only, publicly shareable URL: `wealthwatch.com/public/[shareId]`
- Expiration date: 7 days (configurable)
- User chooses what to expose: Summary only, Holdings, Full history, None
- Stored in `publicShares` table: userId, shareId, expiresAt, exposureLevel

**Acceptance Criteria**:
- [ ] Share link generation works
- [ ] Public page shows only what user selected
- [ ] Page is read-only (no edits via share link)
- [ ] Link expires and returns 404 after expiration
- [ ] User can revoke share link anytime

#### 6.2 — Benchmark Comparison
- Compare your portfolio to public market indexes (S&P 500, JSE Top 40, etc.)
- Show: Your TWRR vs benchmark TWRR over time
- Chart overlay with your line vs benchmark line

**Acceptance Criteria**:
- [ ] Benchmark data is fetched daily (via cron)
- [ ] Comparison is accurate
- [ ] Works even if user hasn't invested as long as benchmark

#### 6.3 — Social Share (Twitter, LinkedIn)
- "Share achievement" button on dashboard
- Generates a pre-filled social post: "I'm tracking my portfolio with WealthWatch. Up 15% in 6 months! 📊"
- Opens Twitter/LinkedIn with your achievement pre-filled
- Includes a referral link (if you want to add referral tracking later)

**Acceptance Criteria**:
- [ ] Social buttons generate correct share text
- [ ] Link opens in new window
- [ ] No sensitive data is exposed in the share text

---

## Phase 7: AI Features Enhancement
**Goal**: Deeper AI-powered analysis and personalization  
**Effort**: 4–5 days  
**Dependencies**: Phases 0, 1, 4 complete  
**Deploy**: Yes

### Tasks

#### 7.1 — Contextual AI Prompts
Let users ask custom questions about their portfolio:
- Input field: "What should I do with R2000?"
- AI uses portfolio context + risk profile to generate advice
- Response cached with user query in DB for future reference

**Acceptance Criteria**:
- [ ] Query input appears on dashboard or insights page
- [ ] AI responds within 5 seconds
- [ ] Response is specific to user's portfolio (not generic)
- [ ] Query history is searchable

#### 7.2 — Risk Profile Quiz
- New onboarding screen or Settings option
- 5–7 questions: investment horizon, risk tolerance, income stability
- Generates a score: Conservative (25%), Moderate (50%), Aggressive (75%)
- Used to personalize AI insights and alert thresholds

**Acceptance Criteria**:
- [ ] Quiz is quick (< 2 min) and mobile-friendly
- [ ] Risk score is stored and used in AI prompts
- [ ] Can be re-taken anytime

#### 7.3 — Anomaly Detection AI
- Every snapshot trigger, run an AI analysis: "Is this movement unusual?"
- Flag unusual patterns (e.g., "This asset dropped 20% in one week — that's a 5-year anomaly")
- Store flagged snapshots with AI explanation

**Acceptance Criteria**:
- [ ] Anomalies are detected and flagged
- [ ] Explanation is clear and data-backed
- [ ] Flag appears in snapshot history

#### 7.4 — Multi-Model Support
- Let users choose which AI model to use for insights: Gemini 2.0 Flash, Claude, Llama (via Vercel AI)
- Store user preference in settings
- Switch models on future insight generation

**Acceptance Criteria**:
- [ ] Model selector appears in Settings
- [ ] Insight generation respects user's model choice
- [ ] Falls back gracefully if chosen model is unavailable

---

## Phase 8: Mobile App (React Native)
**Goal**: Native iOS/Android apps with offline support  
**Effort**: 10–12 days  
**Dependencies**: Phases 0, 1 complete  
**Deploy**: Yes (separate tracks: iOS + Android)

### Tasks

#### 8.1 — React Native Project Setup
- Create `apps/mobile` folder in monorepo (or separate repo)
- Use Expo for faster development
- Share types & API client code with web via `packages/shared`

**Acceptance Criteria**:
- [ ] App builds and runs on iOS/Android simulators
- [ ] All dependencies resolve without conflicts

#### 8.2 — Offline-First Architecture
- Use React Query + SQLite for local data sync
- App syncs with backend when online
- Last snapshot shows offline indicator if sync needed

**Acceptance Criteria**:
- [ ] App works fully offline
- [ ] New snapshots are queued locally
- [ ] Sync happens automatically when online

#### 8.3 — Core Screens (Mobile MVP)
- Dashboard (simplified: top 3 assets, one metric card)
- "Quick snapshot": tap icon, enter asset values, save (optimized UX for quick updates)
- Deposits list with delete
- Settings (email, thresholds)

**Acceptance Criteria**:
- [ ] All screens render without errors
- [ ] Performance is smooth (< 60ms interactions)
- [ ] Layouts are mobile-optimized

#### 8.4 — App Store & Play Store Deployment
- Create app accounts on both stores
- Generate signing keys + certificates
- Submit builds with proper metadata, icons, screenshots
- Handle app store review feedback

**Acceptance Criteria**:
- [ ] iOS app is available on App Store
- [ ] Android app is available on Play Store
- [ ] Both have 4+ star ratings from first 100 users

---

## Phase 9: Accounting & Tax Integration (Advanced)
**Goal**: Export data for tax filing and accounting software  
**Effort**: 5–6 days  
**Dependencies**: Phases 0, 1 complete  
**Deploy**: Yes

### Tasks

#### 9.1 — Capital Gains Report
Generate a tax-ready report showing:
- Total capital gains (TWRR * totalDeposited)
- Per-asset breakdown
- Dates of gains (important for short-term vs long-term in some jurisdictions)
- Cost basis + current basis
- Export as PDF or CSV for accountant

**Acceptance Criteria**:
- [ ] Report is accurate and matches portfolio math
- [ ] Dates are precise (FIFO accounting)
- [ ] Export formats are readable by accounting software

#### 9.2 — Tax Lot Tracking
Enable "specific lot" identification for sales:
- When logging a deposit, optionally tag it (e.g., "Tax-loss harvest Q4 2026")
- When calculating gains, allow selecting which tax lot to sell
- Optimize for tax deferral (FIFO/LIFO options)

**Acceptance Criteria**:
- [ ] Lot tagging is optional
- [ ] Lot selection UI is intuitive
- [ ] Tax optimization recommendations appear

#### 9.3 — QuickBooks / Xero Integration
- OAuth to QuickBooks Online or Xero
- One-click sync: creates investment account + transactions in user's QB/Xero
- Keeps accounts in sync via nightly cron

**Acceptance Criteria**:
- [ ] Auth flow works for both platforms
- [ ] Transactions sync accurately
- [ ] Categories are correct (investment income, capital gains, etc.)

---

## Phase 10: Community & Gamification (Nice-to-Have)
**Goal**: Build engagement and community around portfolio tracking  
**Effort**: 6–7 days  
**Dependencies**: Phases 0, 6 complete  
**Deploy**: Yes

### Tasks

#### 10.1 — Leaderboard (Opt-in)
- Users can opt-in to appear on a public leaderboard
- Ranked by TWRR over 6/12 months
- Anonymized (username only, no real name or email)
- Leaderboard refreshes weekly

**Acceptance Criteria**:
- [ ] Leaderboard loads in < 2 seconds
- [ ] Only opt-in users appear
- [ ] Ranking is accurate
- [ ] User can toggle opt-in/out anytime

#### 10.2 — Achievements & Badges
Unlockable badges:
- "First Step" (logged first deposit)
- "Consistent Saver" (4+ deposits in a row, monthly)
- "Break Even" (TWRR crosses 0%)
- "Going for Gold" (TWRR > 50%)
- "Diversified" (10+ different assets)
- "Long Game" (invested > 1 year)
- "Milestone" (portfolio > $10k, $50k, $100k)

**Acceptance Criteria**:
- [ ] Badges appear in user profile
- [ ] Achievement emails sent when unlocked
- [ ] Badges are properly rewarded (not gamified unfairly)

#### 10.3 — User Forum / Discussions
Simple forum for users to share strategies:
- Threads per category: "Diversification", "Sector Allocation", "General", "Wins"
- Moderated (mods flag inappropriate posts)
- No sensitive data (portfolios not shared automatically)

**Acceptance Criteria**:
- [ ] Forum UI is clean and mobile-friendly
- [ ] Moderation tools work
- [ ] Spam filtering is in place

---

## 📋 Summary Table (Quick Reference)

| Phase | Name | Features | Days | Priority | Blocks |
|-------|------|----------|------|----------|--------|
| 0 | Launch Ready | Auth, email test, env docs | 2 | **CRITICAL** | Everything |
| 1 | Data Export & Insights | CSV export, performance cards, charts, filters | 4 | **HIGH** | Phases 2–5 |
| 2 | Rebalancing | Target allocation, recommendations, simulator | 5 | HIGH | None |
| 3 | Multi-Currency | Currency support, forex sync, conversions | 4 | MEDIUM | None |
| 4 | Advanced Analytics | Risk metrics, heatmap, attribution, PDF reports | 6 | HIGH | Phase 5, 7 |
| 5 | Notifications & Alerts | Preferences, in-app system, threshold checks | 4 | MEDIUM | None |
| 6 | Sharing & Collab | Share links, benchmarks, social | 5 | MEDIUM | None |
| 7 | AI Enhancement | Custom Q&A, risk quiz, anomaly detection, multi-model | 5 | MEDIUM | None |
| 8 | Mobile App | React Native, offline sync, iOS/Android launch | 12 | LOW | None |
| 9 | Tax & Accounting | Capital gains, tax lots, QB/Xero sync | 6 | MEDIUM | None |
| 10 | Community | Leaderboard, badges, forum | 7 | LOW | None |

---

## 🎯 Recommended 90-Day Sprint Plan

**Month 1** (Apr 21 – May 21):
- Phase 0: Launch Ready ✅
- Phase 1: Data Export & Insights ✅
- Phase 4: Advanced Analytics (partial) ✅

**Month 2** (May 21 – Jun 21):
- Phase 4: Advanced Analytics (complete) ✅
- Phase 2: Rebalancing ✅
- Phase 5: Notifications & Alerts ✅

**Month 3** (Jun 21 – Jul 21):
- Phase 3: Multi-Currency ✅
- Phase 6: Sharing & Collaboration ✅
- Phase 7: AI Enhancement ✅

**After 90 days**:
- Mobile (Phase 8) starts — can be parallel
- Tax & Accounting (Phase 9) — high-ROI for accountants
- Community (Phase 10) — engagement play

---

## 💡 Implementation Tips

### General
1. **Test each phase independently** before moving to next
2. **Deploy to staging first** — test email, auth, crons in prod-like environment
3. **Get user feedback early** — invite 3–5 beta users after Phase 1
4. **Document as you go** — API changes, new tables, cron schedules

### Code Quality
- Add unit tests for financial calculations (TWRR, P&L) — these are critical
- E2E tests for critical paths: signup → snapshot → export
- Linting: biome already configured, enforce on CI/CD

### Performance
- Snapshot queries can get slow with 1000s of data points — add pagination/windowing
- Dashboard metrics should cache for 5 mins (not every request)
- Large PDFs/exports should queue background jobs, not block user

### Security
- Rate limit API endpoints (already have cron auth, extend to user routes)
- Validate forex rates (don't trust external API blindly)
- Sanitize user inputs on forms
- No portfolio data in logs (PII concern)

### Database
- Add indexes on `(userId, assetId)`, `(userId, snapshotAt)`
- Keep `portfolioSnapshots` aggregate table — worth it
- Archive old snapshots after 5+ years (compliance + performance)

---

## 🚦 Go/No-Go Checklist Before Each Phase

Before starting a new phase, verify:

- [ ] Previous phase is merged to `main`
- [ ] Tests pass on CI/CD
- [ ] Staging deployment is green
- [ ] No critical bugs reported
- [ ] Team has agreed on acceptance criteria
- [ ] Design mockups reviewed (if UI changes)
- [ ] Database migration plan is documented
- [ ] Rollback plan exists (if data model changes)

---

## 📞 Questions & Next Steps

**Start immediately with Phase 0** (today/tomorrow). Your app is solid, but it's wide open without auth.

Once Phase 0 ships:
1. Invite beta users
2. Gather feedback on dashboard UX
3. Decide between Phases 1 (export) vs 2 (rebalance) based on what your users ask for
4. Parallel track: Phase 3 (multi-currency) if you start investing in non-ZAR assets

Good luck — this is a genuinely useful product. 🚀
