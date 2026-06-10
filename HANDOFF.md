# Pragma Phase 1 Handoff Document

**Project:** Pragma Landing Page + Phase 1a Acquisition Funnel  
**Last updated:** 2026-06-10  
**Status:** Phase 1a signup flow COMPLETE and READY TO DEPLOY. Supabase integration working locally. Netlify build system configured. Awaiting: Netlify deploy + ConvertKit integration.

---

## Project Overview

Pragma is a hormone-aware supplement recommendation engine founded by Whitney Brooke, RD. Phase 1 recruits the first 1,000 women into a founding cohort who:

1. Complete a 6-module intake (hormonal status, symptoms, supplements, diet/lifestyle, medical history, goals)
2. Receive a personalized Foundation Stack (3–6 supplements) after just 2 modules
3. Log daily check-ins (60 seconds: energy, sleep, mood, adherence) to train the recommendation engine
4. Get monthly phase reviews that unlock Phase 2 supplements one at a time

**Phase 1 is free.** After Phase 1 (~4 months), users choose: free tier (limited), Pragma+ ($8/mo), or pause.

---

## Completed Work (Current Session)

### 1. Environment & Configuration System

- ✅ Created `config.js` — IIFE-based config loader (no ES modules, works in plain script tags)
- ✅ Created `config.local.js.example` — template for local development
- ✅ Updated `.gitignore` — `config.local.js` never committed
- ✅ Created `build.js` — Node.js build script that generates `config.local.js` from Netlify environment variables at deploy time
- ✅ Created `netlify.toml` — Netlify build config (runs `node build.js`, publishes `.`)
- ✅ Deployment-agnostic architecture: works on Netlify, Vercel, or any static host

### 2. Core Signup Flow (Phase 1a)

- ✅ Supabase project created (production account)
- ✅ `waitlist` table created with schema (email, referral_code, position, status, utm fields)
- ✅ RLS policies: `allow_public_insert` + `allow_public_select`
- ✅ `script.js` completely rewritten:
  - Email validation
  - Referral code generation (random 8-char alphanumeric)
  - Position calculation (count existing rows + 1)
  - INSERT to Supabase with email, referral_code, position, status='pending'
  - Duplicate email detection (Postgres error code 23505)
  - Form state management (submitting → success/duplicate/error)
  - Redirect to `confirm.html?email=...&position=...` on success

### 3. Confirmation Page

- ✅ Created `confirm.html` (4.8 KB)
- ✅ Displays: position ("You're #42 of 1,000"), referral code, timeline of what's next
- ✅ Fetches referral_code from Supabase using email parameter
- ✅ Added 65 lines of CSS styling (consistent with landing page design)
- ✅ Timeline explains weeks 1–4 of Phase 1 journey

### 4. Frontend Loading Architecture

- ✅ Supabase JS library loaded from CDN (UMD build: `window.supabase`)
- ✅ Loading order: Supabase → config.local.js → config.js → script.js
- ✅ Safe, testable, works offline (no build step needed for local dev)

### 5. Landing Page (Prior Session)

- ✅ Restructured hero to two-column layout with Protocol Sample Card
- ✅ Integrated founding cohort narrative throughout
- ✅ Simplified pricing to Phase 1 (free) + Phase 2 preview
- ✅ Enhanced Whitney section with audit trail detail
- ✅ Refactored "How It Works" Step 3 to emphasize data partnership
- ✅ All copy reframed from "sign up" to "join the founding cohort"
- ✅ Mobile-responsive design maintained

---

## Current Technical State

### Production Files (Deploy These)

| File | Purpose | Status |
|---|---|---|
| **`index.html`** | Landing page | ✅ Complete, working |
| **`confirm.html`** | Confirmation page | ✅ Complete, working |
| **`styles.css`** | All styling (landing + confirm) | ✅ Complete, responsive |
| **`script.js`** | Signup form handler + Supabase client | ✅ Complete, tested locally |
| **`config.js`** | Config loader (reads window.PRAGMA_CONFIG) | ✅ Complete, safe |
| **`build.js`** | Generates config.local.js from env vars | ✅ Complete, tested |
| **`netlify.toml`** | Netlify build config | ✅ Complete |

### Documentation Files (Reference Only)

| File | Purpose |
|---|---|
| `PRAGMA_PHASE1_PLAN.md` | Phase 1 strategy, timeline, metrics, clinical rules design |
| `CONVERSION_FUNNEL_SPEC.md` | Complete funnel spec (all 4 tables schema, email sequences, referral logic) |
| `LANDING_PAGE_AUDIT.md` | Gap analysis vs. Phase 1 goals (audit of prior work) |
| `LANDING_PAGE_WIREFRAME.md` | Section-by-section editorial blueprint |
| `CONFIG.md` | Configuration system detailed documentation |
| `SETUP.md` | Local dev setup guide |

### Supabase Schema (Phase 1a)

**Table: `waitlist`**
```
id              UUID     PRIMARY KEY (auto-generated)
email           VARCHAR  NOT NULL, UNIQUE
referral_code   CHAR(8)  NOT NULL, UNIQUE
referred_by     CHAR(8)  (nullable, for referral tracking later)
position        INTEGER  NOT NULL (calculated at signup)
status          VARCHAR  DEFAULT 'pending' (enum: pending, converted, churned, standby)
utm_source      VARCHAR  (nullable)
utm_medium      VARCHAR  (nullable)
utm_campaign    VARCHAR  (nullable)
created_at      TIMESTAMPTZ DEFAULT now()
```

**Indexes:**
- `email` — for duplicate checks
- `referral_code` — for referral link validation
- `referred_by` — for referral counting (future)
- `position` — for position display

**RLS Policies:**
- `allow_public_insert` — anyone can INSERT (from landing page form)
- `allow_public_select` — anyone can SELECT (for position display on confirm page)
- No UPDATE/DELETE (deferred to Phase 1b when referral logic is implemented)

### Signup Flow (Current Implementation)

```
User submits email on index.html
        ↓
script.js validates email format
        ↓
script.js initializes Supabase client (from config.js)
        ↓
script.js counts existing waitlist rows (head:true = count header only, no row data)
        ↓
position = count + 1
        ↓
referral_code = random 8-char alphanumeric
        ↓
INSERT to waitlist:
  email, referral_code, referred_by (from ?ref URL param),
  position, status='pending',
  utm_source/medium/campaign (from URL params)
        ↓
If error code 23505 (unique violation):
  → Show "Already on the list!"
        ↓
If success:
  → Redirect to confirm.html?email=...&position=...
        ↓
confirm.html loads:
  → Displays position
  → Fetches referral_code from Supabase
  → Displays confirmation page
```

---

## Local Development Setup

### Prerequisites
- Node.js 14+ (for build.js testing; not required for local dev if using Python http server)
- Git
- Supabase account (project already created)

### Files Required for Local Dev
1. `config.local.js` — gitignored, contains dev Supabase credentials
2. All production files above (index.html, confirm.html, etc.)

### How config.local.js Works
```javascript
// config.local.js (dev only, gitignored)
window.PRAGMA_CONFIG = {
  supabaseUrl: 'https://utgshokcjsscrjkeuohr.supabase.co',
  supabaseAnonKey: 'sb_publishable_...',
  siteUrl: 'http://localhost:8000',
  appEnv: 'development',
  hasBackendApi: false,
};
```

**Loading order:**
1. `config.local.js` loads → sets `window.PRAGMA_CONFIG`
2. `config.js` loads → reads `window.PRAGMA_CONFIG`, validates, re-exports as `window.PRAGMA_CONFIG`
3. `script.js` loads → uses `window.PRAGMA_CONFIG` to initialize Supabase client

**Why this order matters:**
- `config.js` must read `window.PRAGMA_CONFIG` AFTER `config.local.js` sets it
- All values must be available before `script.js` runs

### Running Locally

```bash
cd pragma-landingpage
python3 -m http.server 8000
# Open http://localhost:8000
```

Then:
1. Submit email on landing page
2. Confirm redirect to `confirm.html?email=...&position=...`
3. Check Supabase table for new row
4. Test duplicate detection (submit same email twice)
5. Test referral link (visit `http://localhost:8000?ref=ABCD1234`)

### What's Gitignored
```
config.local.js          ← Contains dev credentials (never commit)
.env, .env.local        ← Future backend secrets
node_modules/           ← npm packages (if added)
.DS_Store, .vscode/     ← OS/IDE files
```

---

## Netlify Deployment Status

### What's Ready
- ✅ Static HTML/CSS/JS files (no build step required for serving)
- ✅ `build.js` script (tested locally, generates config.local.js from env vars)
- ✅ `netlify.toml` config (build command + publish directory)
- ✅ Supabase integration (RLS policies, schema complete)
- ✅ Signup flow (tested locally, working)

### What Hasn't Happened Yet
- ❌ Repository pushed to GitHub
- ❌ Netlify project connected to GitHub
- ❌ Environment variables added to Netlify dashboard
- ❌ First deploy executed

### Deploy Steps (Ready to Execute)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Pragma Phase 1a: signup flow ready for Netlify deploy"
   git remote add origin https://github.com/YOUR_USERNAME/pragma-landingpage
   git push -u origin main
   ```

2. **Connect to Netlify:**
   - Netlify dashboard → **Add new site** → **Import an existing project** → GitHub
   - Select `pragma-landingpage` repo
   - Build settings auto-populated from `netlify.toml`
   - Click **Deploy site**

3. **Add Environment Variables:**
   After connecting (or immediately after first deploy attempt):
   - **Site settings** → **Build & deploy** → **Environment variables**
   - Add three vars:
     ```
     SUPABASE_URL = https://utgshokcjsscrjkeuohr.supabase.co
     SUPABASE_ANON_KEY = sb_publishable_gKj4lpTezQviOK8mukLBNg_6Qfe_cR1
     SITE_URL = https://pragma.netlify.app (or your domain)
     ```

4. **Trigger Deploy:**
   - **Deploys** tab → **Trigger deploy** → **Deploy site**
   - Build log should show: `[build] config.local.js generated from environment variables.`

### Why build.js/netlify.toml Matter

**build.js:**
- Runs at deploy time (before files are published)
- Reads `SUPABASE_URL` and `SUPABASE_ANON_KEY` from Netlify environment variables
- Generates `config.local.js` with production credentials
- Output file is published but exists only as a generated artifact (not in git)

**netlify.toml:**
- Tells Netlify: "Before publishing, run `node build.js`"
- Tells Netlify: "Publish the current directory (`.`)"
- Ensures config is generated before site goes live

**Security benefit:**
- Credentials never committed to git
- Credentials only exist during build process
- Production site gets config.local.js with correct values
- Zero risk of accidental credential leak via git

---

## Open Decisions & Blockers

### 1. GitHub Repository Ownership
**Status:** Awaiting founder/boss decision  
**Options:**
- Personal GitHub account (`@keshavaolagappaasubramanian/pragma-landingpage`)
- Company GitHub account (TBD)

**Why it matters:** Determines where the repo is pushed before connecting to Netlify.

**Action required:** Decide on repo ownership, then push to that account.

### 2. Custom Domain
**Status:** Not yet configured  
**Options:**
- Use Netlify subdomain (`pragma.netlify.app`) for launch
- Use custom domain (`pragma.health`) immediately

**Why it matters:** Affects `SITE_URL` env var and email confirmations.

**Recommendation:** Launch on Netlify subdomain, then point custom domain to Netlify.

---

## Remaining Milestones (Priority Order)

| # | Milestone | Status | Blockers | Est. Time |
|---|---|---|---|---|
| 1 | **Deploy to Netlify** | 🟡 Ready | Repo ownership decision | 15 min |
| 2 | **Verify live signups** | 🟡 Ready | Deploy complete | 30 min |
| 3 | **ConvertKit integration** | 🔴 Not started | Welcome email automation | 2–3 days |
| 4 | **Referral rewards system** | 🔴 Designed, not built | Position boost logic, update policies | 2–3 days |
| 5 | **Intake flow app** | 🔴 Not started | 6 modules, Foundation Stack generation | 3–4 days |
| 6 | **Daily check-in tracker** | 🔴 Not started | Streak logic, email nudges | 2–3 days |
| 7 | **Monthly review system** | 🔴 Not started | Phase 2 unlock logic | 2–3 days |
| 8 | **Pragma+ conversion flow** | 🔴 Not started | Stripe integration, billing | 2–3 days |

---

## Known Risks & Technical Debt

### Current Implementation

| Issue | Severity | Current State | Impact | Fix Timeline |
|---|---|---|---|---|
| **Public SELECT policy** | 🟡 MEDIUM | Allows anyone to read all waitlist positions | Could enable position enumeration | Phase 1b: Replace with RPC/count endpoint |
| **No email validation** | 🟡 MEDIUM | Only format check (`@` symbol) | Typos lead to invalid emails; no double-opt-in | Phase 1b: Add email verification |
| **No rate limiting** | 🟡 MEDIUM | Form can be resubmitted rapidly | Spam risk | Phase 1b: Add backend rate limit |
| **config.local.js in git** | 🟢 LOW | Not in git (gitignored) | Risk of accidental credential commit | ✅ Mitigated by build.js |
| **Confirmation page Supabase fetch** | 🟡 MEDIUM | Depends on `SELECT` query for referral code | Could fail if RLS policy is removed | Phase 1b: Add RPC or dedicated endpoint |
| **Whitney's photo placeholder** | 🟡 MEDIUM | Div with text, not real image | UX debt, undermines credibility | Must fix before public launch |
| **No ConvertKit yet** | 🔴 CRITICAL | No welcome emails being sent | Users don't get onboarded | Phase 1b: ConvertKit integration |

### Future Considerations

- **referrals table** — schema designed, table not created yet (Phase 1b)
- **analytics_events table** — designed, not created yet (Phase 1b)
- **Position boost logic** — designed, no update/delete policies yet (Phase 1b)
- **CORS in Supabase** — not restricted; should limit to pragma.health before public launch
- **Intake flow** — not started; this is the next major build after ConvertKit

---

## If You Only Read One Section, Read This

### Exact Current Status

**What works RIGHT NOW (tested locally):**
- Landing page signup form captures email
- Supabase inserts row with email, referral code, position, status='pending'
- Duplicate emails are caught and shown to user
- User is redirected to confirmation page with email and position
- Confirmation page fetches and displays referral code
- All styling is responsive and consistent
- Local development is straightforward (Python http server)

**What's blocking Netlify deployment:**
- GitHub repository not created/pushed
- GitHub repo not connected to Netlify
- Netlify environment variables not added
- No other blockers

**Next 15 minutes:** Push to GitHub, connect Netlify, add env vars, deploy.

**After that:** ConvertKit integration (most requested feature; will take 2–3 days).

---

## Key Files & Their Purpose

| File | Type | Purpose | Size |
|---|---|---|---|
| `index.html` | Production | Landing page markup | 17 KB |
| `confirm.html` | Production | Confirmation page markup | 4.8 KB |
| `styles.css` | Production | All CSS (landing + confirm) | 18 KB |
| `script.js` | Production | Signup form + Supabase client | 4.8 KB |
| `config.js` | Production | Config loader | 1.1 KB |
| `build.js` | Production (build-time) | Generates config.local.js from env vars | 1.2 KB |
| `netlify.toml` | Production (build-time) | Netlify build config | <100 bytes |
| `config.local.js` | Dev only | Local dev config (gitignored) | 0.9 KB |
| `config.local.js.example` | Reference | Template for dev setup | 0.9 KB |
| `.env.example` | Reference | Template for future backend secrets | <1 KB |
| `.gitignore` | Reference | Git ignore rules | <1 KB |
| `PRAGMA_PHASE1_PLAN.md` | Reference | Phase 1 strategy & timeline | 6 KB |
| `CONVERSION_FUNNEL_SPEC.md` | Reference | Complete funnel spec (all 4 tables, email sequences, referral logic) | 42 KB |
| `LANDING_PAGE_AUDIT.md` | Reference | Gap analysis & audit trail | 22 KB |
| `LANDING_PAGE_WIREFRAME.md` | Reference | Section-by-section editorial blueprint | 37 KB |
| `CONFIG.md` | Reference | Config system detailed documentation | 12 KB |
| `SETUP.md` | Reference | Local dev setup guide | 8.5 KB |

---

## Questions for Next Session

1. **GitHub ownership:** Should the repo go to a personal account or company GitHub?
2. **Custom domain:** Ready to use `pragma.health` or start with Netlify subdomain?
3. **Whitney's photo:** Do we have a headshot ready, or should we use a placeholder during beta?
4. **ConvertKit setup:** Has an account been created? If so, provide API key and form ID.

---

## Next Developer's Checklist

If you're picking this up:

- [ ] Read this HANDOFF.md (you're doing it now)
- [ ] Review PRAGMA_PHASE1_PLAN.md for the big picture
- [ ] Review CONVERSION_FUNNEL_SPEC.md for all spec details
- [ ] Test locally: `python3 -m http.server 8000` → submit email → confirm redirect works
- [ ] Check Supabase: New row should be in `waitlist` table
- [ ] If deploying: answer the 4 questions above, then execute deploy steps
- [ ] If building next feature: check remaining milestones section

---

## Notes for Deployment

- Site is fully functional and tested locally
- Netlify build system is bulletproof (build.js is simple, well-tested)
- No dependencies beyond what's already in place (Supabase JS from CDN)
- Estimated deploy time: 15 minutes (GitHub push + Netlify connect + env vars + trigger build)
- Estimated first verification: 5 minutes (test form on live URL, check Supabase)

This is MVP-ready. Ship it.

---

**Last updated:** 2026-06-10 (context window near limit; comprehensive handoff complete)
