# Pragma Phase 1 Handoff Document

**Project:** Pragma Landing Page + Phase 1a Acquisition Funnel  
**Last updated:** 2026-06-11  
**Status:** LIVE. Signup flow working in production. Visual design system applied and refined. Motion system queued as next priority.

---

## Project Overview

Pragma is a hormone-aware supplement recommendation engine founded by Whitney Brooke, RD. Phase 1 recruits the first 1,000 women into a founding cohort who:

1. Complete a 6-module intake (hormonal status, symptoms, supplements, diet/lifestyle, medical history, goals)
2. Receive a personalized Foundation Stack (3–6 supplements) after just 2 modules
3. Log daily check-ins (60 seconds: energy, sleep, mood, adherence) to train the recommendation engine
4. Get monthly phase reviews that unlock Phase 2 supplements one at a time

**Phase 1 is free.** After Phase 1 (~4 months), users choose: free tier (limited), Pragma+ ($8/mo), or pause.

---

## Live Production

**Production URL:** `https://pragma-health.netlify.app`

**Deployment method:** GitHub → Netlify auto-deploy (push to `main` → automatic Netlify build → live in ~30 seconds)

**Build system:**
- `build.js` runs at deploy time, reads `SUPABASE_URL` / `SUPABASE_ANON_KEY` / `SITE_URL` from Netlify environment variables, generates `config.local.js`
- `netlify.toml` configures build command (`node build.js`) and publish directory (`.`)
- Generated `config.local.js` contains production credentials and is never committed to git

**Netlify environment variables set:**
```
SUPABASE_URL        = https://utgshokcjsscrjkeuohr.supabase.co
SUPABASE_ANON_KEY   = sb_publishable_gKj4lpTezQviOK8mukLBNg_6Qfe_cR1
SITE_URL            = https://pragma-health.netlify.app
```

---

## Completed Work — All Sessions

### Session 1: Core Infrastructure

- ✅ Created `config.js` — IIFE-based config loader (no ES modules, works in plain script tags)
- ✅ Created `config.local.js.example` — template for local development
- ✅ Updated `.gitignore` — `config.local.js` never committed
- ✅ Created `build.js` — Node.js build script that generates `config.local.js` from Netlify environment variables at deploy time
- ✅ Created `netlify.toml` — Netlify build config (runs `node build.js`, publishes `.`)
- ✅ Deployment-agnostic architecture: works on Netlify, Vercel, or any static host

### Session 1: Core Signup Flow (Phase 1a)

- ✅ Supabase project created (production account)
- ✅ `waitlist` table created with schema (email, referral_code, position, status, utm fields)
- ✅ RLS policies: `allow_public_insert` + `allow_public_select`
- ✅ `script.js` completely written:
  - Email format validation
  - Referral code generation (random 8-char alphanumeric)
  - Position calculation (COUNT existing rows + 1)
  - INSERT to Supabase with email, referral_code, position, status='pending'
  - Duplicate email detection (Postgres unique-violation error code `23505`)
  - Form state management (submitting → success/duplicate/error)
  - Redirect to `confirm.html?email=...&position=...` on success

### Session 1: Confirmation Page

- ✅ Created `confirm.html`
- ✅ Displays: position ("You're #42 of 1,000"), referral code, timeline of what's next
- ✅ Fetches referral_code from Supabase using email parameter
- ✅ CSS styling consistent with landing page
- ✅ Timeline explains weeks 1–4 of Phase 1 journey

### Session 1: Landing Page Copy & Structure

- ✅ Restructured hero to two-column layout with Protocol Sample Card
- ✅ Integrated founding cohort narrative throughout
- ✅ Simplified pricing to Phase 1 (free) + Phase 2 preview
- ✅ Enhanced Whitney section with audit trail detail
- ✅ Refactored "How It Works" Step 3 to emphasize data partnership
- ✅ All copy reframed from "sign up" to "join the founding cohort"
- ✅ Mobile-responsive design maintained

### Session 2: Deployment

- ✅ GitHub repository created and connected to Netlify
- ✅ Environment variables added to Netlify dashboard
- ✅ Site deployed successfully to `https://pragma-health.netlify.app`
- ✅ GitHub auto-deploy confirmed working (push to `main` triggers live deploy)
- ✅ Live signup flow tested and verified in production

### Session 3: Email Validation Fix

**Problem:** Users could sign up with `abc@abc` — the old validation only checked for presence of `@`.

**Fix applied in `script.js`:**
- Replaced simple `includes('@')` check with proper regex: `/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/`
- Emails normalized to lowercase before validation, duplicate checks, and database inserts
- `setCustomValidity()` + `reportValidity()` for browser-native tooltip error feedback
- Input clears custom validity message on every `input` event
- Added `required` and `autocomplete="email"` attributes to both email inputs (hero + final form)

**Validation behavior (current):**

| Input | Result |
|---|---|
| `abc` | ❌ Rejected |
| `abc@` | ❌ Rejected |
| `@abc` | ❌ Rejected |
| `abc@abc` | ❌ Rejected |
| `abc@gmail` | ❌ Rejected |
| `abc@gmail.` | ❌ Rejected |
| `abc@gmail.com` | ✅ Accepted |
| `test@example.org` | ✅ Accepted |
| `hello@pragmahealth.io` | ✅ Accepted |

**Note:** The test row `abc@abc` created before the fix remains in the Supabase `waitlist` table. It should be manually deleted from the Supabase dashboard.

### Session 4: Official Brand Color System Migration

Full replacement of all legacy/incorrect colors throughout `styles.css` with the official Pragma color palette.

**Official brand palette:**

| Name | Hex | Usage |
|---|---|---|
| Cream | `#FDF8F5` | Primary background, light sections |
| Cream 2 | `#F7F0EC` | Secondary background, cards, pricing |
| Cream Highlight | `#F5D8E0` | Tags, pill backgrounds, warm accents |
| Plum Dark | `#5A0F35` | Hero background, nav background |
| Plum Deep | `#3A0820` | Quote/interrupt section, audience section |
| Magenta | `#C41E5B` | CTAs, highlights, final section — use sparingly |
| Magenta Light | `#E8336D` | Quote em-phrases, dark-section labels |
| Ink | `#1C0A18` | Primary body text |
| Ink Mid | `#4A2D40` | Secondary body text |
| Ink Muted | `#8A6070` | Tertiary text, attribution, footnotes |

**Brand rules:**
- Cream and Plum dominate the palette
- Magenta is an accent, not a background color (exception: final CTA section)
- The site reads as premium, scientific, female-first, trustworthy
- No crypto aesthetic, no neon, no heavy gradients as decoration
- The color spine follows a day-cycle arc: night (hero) → first light (problem) → daylight (protocol) → evening (CTA) → midnight (footer)

**Hero section fix (critical):** The hero heading was incorrectly set to `#5A0F35` as *text color* instead of the *background*. Fixed: hero background is now `#5A0F35`, all text uses on-dark equivalents.

**On-dark hero color assignments:**
```css
.hero { background: #5A0F35; }
.hero h1 { color: #FDF8F5; }
.hero h1 em { color: #F5D8E0; }
.hero h1 .muted { color: rgba(255,255,255,0.65); }
.hero-body { color: rgba(255,255,255,0.65); }
.hero-caveat { color: rgba(255,255,255,0.45); }
.hero-caveat strong { color: rgba(255,255,255,0.65); }
.hero-card { border: 1px solid rgba(255,255,255,0.12); }
```

### Session 5: Visual Continuity — Section Transitions

**Problem:** The site felt like disconnected colored blocks. Hard color cuts between every section broke the sense of a single continuous experience.

**Approach:** CSS-only gradient bridges. Seven targeted changes to `styles.css`, no HTML modifications, no new colors.

**Changes made:**

**1. Nav merged with hero (cream → plum, eliminated)**
```css
.nav { background: #5A0F35; border-bottom: 1px solid rgba(255,255,255,0.08); }
.logo { color: #FDF8F5; }
.nav-link { color: rgba(255,255,255,0.60); }
```
The nav and hero now form one unified dark zone at the top of the page.

**2. Hero atmospheric bloom (new depth layer)**
```css
.hero {
  background:
    radial-gradient(ellipse 80% 60% at 72% 35%, rgba(196,30,91,0.14) 0%, transparent 70%),
    radial-gradient(ellipse 55% 75% at 12% 72%, rgba(245,216,224,0.10) 0%, transparent 60%),
    #5A0F35;
}
```
Two static radial gradients give the hero dimensional depth: soft magenta near the protocol card, soft cream-pink in the lower copy area. No animation, no new colors.

**3. Hero → Quote (plum dark → plum deep, now seamless)**
```css
.interrupt {
  background: linear-gradient(to bottom, #5A0F35 0%, #3A0820 14%, #3A0820 100%);
}
```
The interrupt section starts at the hero's exact color at its top edge. The transition between sections is pixel-identical.

**4. Quote → Problem (darkest-to-cream, now a 180px melt)**
```css
.interrupt { padding: 4rem 2.5rem calc(4rem + 180px); position: relative; }
.interrupt::after {
  content: ''; position: absolute; left: 0; right: 0; bottom: 0;
  height: 180px;
  background: linear-gradient(to bottom, rgba(58,8,32,0), #FDF8F5);
  pointer-events: none;
}
```

**5. "Why Pragma" → Audience (white → plum deep, 160px sink)**
```css
.diff-section { position: relative; padding-bottom: calc(5rem + 160px); }
.diff-section::after { ... background: linear-gradient(to bottom, rgba(255,255,255,0), #3A0820); }
```

**6. Audience → How (plum deep → cream, 180px lift)**
```css
.audience-section { position: relative; padding-bottom: calc(5rem + 180px); }
.audience-section::after { ... background: linear-gradient(to bottom, rgba(58,8,32,0), #FDF8F5); }
```

**7. Whitney → Final CTA (white → magenta, 140px warm)**
```css
.whitney-section { padding: 5rem 2.5rem calc(5rem + 140px); position: relative; }
.whitney-section::after { ... background: linear-gradient(to bottom, rgba(255,255,255,0), #C41E5B); }
```

**8. Final CTA → Footer (magenta → cream, 120px exhale)**
```css
.final { padding: 5rem 2.5rem calc(5rem + 120px); position: relative; }
.final::after { ... background: linear-gradient(to bottom, rgba(196,30,91,0), #FDF8F5); }
```

**Technical notes on gradients:**
- All gradients use the source section's own color at `alpha: 0` (not CSS `transparent`) to prevent browsers from interpolating through black — e.g., `rgba(58,8,32,0)` not `transparent`
- `pointer-events: none` on all `::after` elements to prevent blocking clicks
- All gradient bridges live inside section padding space — content layout is unchanged
- No z-index management required; no overflow issues

---

## Approved Design Direction

### Visual Identity

The site should feel like: **Oura, Function Health, Levels, Eight Sleep.**

Not like: crypto, AI startup, developer tool, or generic wellness.

**Emotional arc the page delivers:**
1. Night (hero) — "You've been told you're fine." — *being seen*
2. Deepest night (quote) — "Your doctor has 15 minutes." — *naming it*
3. First light (problem) — Four failures — *it wasn't your fault*
4. Daylight (protocol) — The system, building in real time — *competence you can watch*
5. Conviction (trust rules) — Three rules we don't break — *stated quietly*
6. Golden hour (Whitney) — The person behind it — *accountability*
7. Dusk (audience) — Who it's for — *one of these is you*
8. Evening (CTA) — Join — *commitment, witnessed*
9. Footer — Midnight. The day is over. Hers is beginning.

### Typography

- Headlines: **DM Serif Display** — editorial authority
- Body: **Inter** — clinical precision
- Rule: Headlines convey voice; body text conveys facts. Never reverse.

### Motion Principles (not yet implemented)

**Three motifs — use these, repeat only these:**

1. **Bloom** — Radial wash expanding from a center point. Used in: hero background (static version live), waitlist CTA section, success ring on signup.
2. **Blur-Resolve** — Text or card arrives at `blur(8px)`, resolves to sharp over 600–900ms. Used in: hero headline, confirmation page headline, waitlist headline.
3. **Draw** — SVG stroke animation or sequential character reveal. Used in: trust section rule icons, Whitney's signature, confirmation timeline.

**One easing curve:** `cubic-bezier(0.22, 1, 0.36, 1)` everywhere. Nothing bounces, nothing snaps.

**Two speeds:** Entrances 600–900ms. Feedback (hover, click) 150–250ms. Nothing in between.

**Motion rules:**
- Opacity leads, distance follows. Max travel 24px.
- Reveals fire once. Scrolling back never replays them.
- All motion wrapped in `@media (prefers-reduced-motion: reduce)`.
- Animate only `transform`, `opacity`, `filter` — never layout properties.
- No GSAP. No Framer Motion. Vanilla CSS keyframes + IntersectionObserver + ~60 lines of JS.

**Buttons:** hover = deepen color + 2px lift + arrow nudge 3px right. Press = `scale(0.98)` at 120ms.

**Cards:** hover = 4px lift on plum shadow `rgba(90,15,53,0.10)`, border warming toward magenta. Never tilt, never flip — clinical documents don't somersault.

---

## Motion System Implementation Roadmap (Next Priority)

This is the next major piece of frontend work. Implement in this order:

### Phase A: Hero Entrance (highest impact, implement first)

**Hero entrance sequence — 5 beats, 1.4 seconds total:**

| Beat | Element | Timing | Animation |
|---|---|---|---|
| 1 | Kicker pill + dot pulse | 150ms | Fade up from `opacity:0, translateY(8px)` |
| 2 | Headline words | 200–600ms | `blur(8px)` → sharp, 80ms stagger per word |
| 3 | Body + email field | 500ms | Fade up |
| 4 | Protocol card | 600ms | Slide in from right |
| 5 | Card tags | 700–900ms | Cascade in 60ms apart |

**Hero bloom (static version is already live — animate on Phase A):**
Add a 36-second `@keyframes` loop to the two radial gradients. Subtle drift — not spinning, just breathing.

### Phase B: Scroll Reveals (section-by-section)

IntersectionObserver triggers when each element crosses `rootMargin: '0px 0px -80px 0px'`.

**Standard reveal:** `opacity: 0, translateY(16px)` → `opacity: 1, translateY(0)`. Duration 600ms, easing `cubic-bezier(0.22, 1, 0.36, 1)`.

**Staggered grid reveals:** Cards get 80ms stagger per item.

**Quote section line-reveal:** Each line of the blockquote fades up 120ms apart.

**Trust section icon draw:** SVG stroke animation, 600ms each, 150ms stagger between icons.

### Phase C: Interaction Microinteractions

- Button hover: deepen + lift + arrow nudge
- Email field focus: soft magenta halo `0 0 0 3px rgba(196,30,91,0.15)`
- Email field invalid: 4px head-shake, `setCustomValidity` tooltip
- Form submit: button label crossfades to "Joining…"

### Phase D: Signup Success Animation

When signup succeeds (before redirect):
1. Button shimmer (satin highlight crossing left→right, 400ms)
2. Shimmer resolves into bloom-ring: `rgba(245,216,224,0.6)` ring expanding from button, 600ms
3. Viewport exhales — cream crossfade wipe into confirm.html

### Phase E: Confirmation Page Reveal

2.5-second ceremony on `confirm.html` load:

| Timing | Element | Animation |
|---|---|---|
| 0ms | "You're in!" | Blur-resolve |
| 200ms | Position number | Count up from 1 to N, 900ms ease-out |
| 500ms | Referral code | Characters mint 60ms apart, mono, 2px settle |
| 800ms | Timeline | Plum line grows downward, each step lights as it passes |

---

## Current Technical State

### Production Files

| File | Purpose | Status |
|---|---|---|
| **`index.html`** | Landing page | ✅ Live |
| **`confirm.html`** | Confirmation page | ✅ Live |
| **`styles.css`** | All styling (landing + confirm) | ✅ Official brand palette, gradient transitions applied |
| **`script.js`** | Signup form handler + Supabase client | ✅ Email validation fixed, lowercase normalization |
| **`config.js`** | Config loader (reads window.PRAGMA_CONFIG) | ✅ Complete |
| **`build.js`** | Generates config.local.js from Netlify env vars | ✅ Live in production |
| **`netlify.toml`** | Netlify build config | ✅ Live |

### Reference / Documentation Files

| File | Purpose |
|---|---|
| `PRAGMA_PHASE1_PLAN.md` | Phase 1 strategy, timeline, metrics, clinical rules design |
| `CONVERSION_FUNNEL_SPEC.md` | Complete funnel spec (all 4 tables schema, email sequences, referral logic) |
| `LANDING_PAGE_AUDIT.md` | Gap analysis vs. Phase 1 goals (audit of prior work) |
| `LANDING_PAGE_WIREFRAME.md` | Section-by-section editorial blueprint |
| `CONFIG.md` | Configuration system detailed documentation |
| `SETUP.md` | Local dev setup guide |

---

## Supabase Schema (Phase 1a)

**Table: `waitlist`**
```
id              UUID     PRIMARY KEY (auto-generated)
email           VARCHAR  NOT NULL, UNIQUE
referral_code   CHAR(8)  NOT NULL, UNIQUE
referred_by     CHAR(8)  (nullable, for referral tracking later)
position        INTEGER  NOT NULL (calculated at signup via COUNT+1)
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

**Known Supabase issue:** A test row `abc@abc` was inserted before email validation was fixed. Delete it manually from the Supabase dashboard.

**Planned position fix (not yet applied):** The current position calculation uses `COUNT(*) + 1`, which has a race condition if two signups happen simultaneously. Fix with a Postgres sequence:
```sql
CREATE SEQUENCE IF NOT EXISTS waitlist_position_seq;
SELECT setval('waitlist_position_seq', COALESCE((SELECT MAX(position) FROM waitlist), 0));
ALTER TABLE waitlist ALTER COLUMN position SET DEFAULT nextval('waitlist_position_seq');
```
Run this in the Supabase SQL editor. Then remove the COUNT query from `script.js` — position will be assigned atomically by the database.

---

## Signup Flow (Current Implementation)

```
User submits email on index.html
        ↓
script.js validates email format (regex: /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/)
Normalizes to lowercase
        ↓
On invalid: setCustomValidity + reportValidity browser tooltip, return
        ↓
script.js initializes Supabase client (from config.js / window.PRAGMA_CONFIG)
        ↓
script.js counts existing waitlist rows (head:true = count header only, no row data)
        ↓
position = count + 1
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
  → Displays position from URL param
  → Fetches referral_code from Supabase via SELECT WHERE email = ?
  → Displays confirmation page
```

---

## Local Development Setup

### Prerequisites
- Node.js 14+ (for `build.js` testing; not required for local dev using Python http server)
- Git
- Supabase account (project already created)

### Files Required for Local Dev
1. `config.local.js` — gitignored, must be created locally with dev credentials
2. All production files

### config.local.js for Local Dev
```javascript
window.PRAGMA_CONFIG = {
  supabaseUrl: 'https://utgshokcjsscrjkeuohr.supabase.co',
  supabaseAnonKey: 'sb_publishable_gKj4lpTezQviOK8mukLBNg_6Qfe_cR1',
  siteUrl: 'http://localhost:8000',
  appEnv: 'development',
  hasBackendApi: false,
};
```

**Script loading order (critical):**
1. `config.local.js` → sets `window.PRAGMA_CONFIG`
2. `config.js` → reads and validates `window.PRAGMA_CONFIG`
3. `script.js` → uses `window.PRAGMA_CONFIG` to initialize Supabase client

### Running Locally
```bash
cd pragma-landingpage
python3 -m http.server 8000
# Open http://localhost:8000
```

Test checklist:
1. Submit email on landing page — confirm redirect to `confirm.html?email=...&position=...`
2. Check Supabase table for new row
3. Test duplicate detection (submit same email twice — should show "Already on the list!")
4. Test validation rejection (try `abc@abc`, `test@gmail`, `@test.com`)
5. Test referral link (`http://localhost:8000?ref=ABCD1234`)

### What's Gitignored
```
config.local.js          ← Contains dev credentials (never commit)
.env, .env.local        ← Future backend secrets
node_modules/           ← npm packages (if added)
.DS_Store, .vscode/     ← OS/IDE files
```

---

## Remaining Milestones (Priority Order)

| # | Milestone | Status | Notes |
|---|---|---|---|
| 1 | **Motion system — Phase A: Hero entrance** | 🔴 Not started | Highest visual impact; implement first |
| 2 | **Motion system — Phase B: Scroll reveals** | 🔴 Not started | IntersectionObserver-driven; vanilla JS |
| 3 | **Motion system — Phase C–E: Micro + signup + confirm** | 🔴 Not started | Complete motion language |
| 4 | **ConvertKit integration** | 🔴 Not started | Welcome email automation; Netlify Function proxy |
| 5 | **Position race condition fix** | 🟡 Designed | Run Supabase SQL for sequence; update script.js |
| 6 | **Whitney photo** | 🟡 Placeholder | Replace text placeholder with real headshot before public launch |
| 7 | **Referral rewards system** | 🔴 Designed | Position boost logic; requires update/delete RLS policies |
| 8 | **Intake flow app** | 🔴 Not started | 6 modules, Foundation Stack generation |
| 9 | **Daily check-in tracker** | 🔴 Not started | Streak logic, email nudges |
| 10 | **Monthly review system** | 🔴 Not started | Phase 2 unlock logic |
| 11 | **Pragma+ conversion flow** | 🔴 Not started | Stripe integration, billing |

---

## ConvertKit Integration (Designed, Not Built)

When implemented, the architecture must be:

```
User signs up
        ↓
Supabase INSERT succeeds
        ↓
script.js calls /.netlify/functions/signup (POST with email)
        ↓
Netlify Function (server-side, Node 18):
  - Reads CONVERTKIT_API_KEY + CONVERTKIT_FORM_ID from env (never exposed to browser)
  - POST to https://api.convertkit.com/v3/forms/{FORM_ID}/subscribe
  - Non-blocking: ConvertKit failure must NOT prevent confirmation page load
        ↓
Confirmation page always loads, regardless of ConvertKit result
```

**Netlify environment variables to add when implementing:**
```
CONVERTKIT_API_KEY    = (from ConvertKit account)
CONVERTKIT_FORM_ID    = (from ConvertKit form)
CONVERTKIT_TAG_ID     = (optional, for founding cohort tag)
```

**Function location:** `netlify/functions/signup.js` (directory doesn't exist yet)

**netlify.toml update needed:**
```toml
[functions]
  directory = "netlify/functions"
```

**Key rule:** ConvertKit API key must NEVER be in browser-side code. Always proxy through a Netlify Function.

---

## Known Risks & Technical Debt

| Issue | Severity | Current State | Impact | Fix Timeline |
|---|---|---|---|---|
| **Position race condition** | 🟡 MEDIUM | COUNT+1 approach; two simultaneous signups could get same position | Cosmetic — positions could duplicate | Fix with Postgres SEQUENCE; SQL written, just needs to be run |
| **Public SELECT policy** | 🟡 MEDIUM | Anyone can read all waitlist rows | Could enable position enumeration | Phase 1b: Replace with RPC/count endpoint |
| **No ConvertKit yet** | 🔴 HIGH | No welcome emails being sent | Users don't get onboarded | Phase 1b: Netlify Function + ConvertKit |
| **No rate limiting** | 🟡 MEDIUM | Form can be resubmitted rapidly | Spam risk on waitlist | Phase 1b: Add Netlify Function rate limiting |
| **Confirmation page Supabase fetch** | 🟡 MEDIUM | Depends on public SELECT policy for referral code | Breaks if RLS policy is changed | Phase 1b: Dedicated RPC endpoint |
| **Whitney's photo placeholder** | 🟡 MEDIUM | Div with text, not real image | Undermines credibility; must fix before PR push | Before public launch |
| **`abc@abc` test row in DB** | 🟢 LOW | In Supabase `waitlist` table | Pollutes position count by 1 | Delete manually from Supabase dashboard |
| **config.local.js in git** | 🟢 RESOLVED | Gitignored; `build.js` handles production | ✅ Not an issue | — |

### Future Considerations

- **referrals table** — schema designed in CONVERSION_FUNNEL_SPEC.md, table not created yet (Phase 1b)
- **analytics_events table** — designed, not created yet (Phase 1b)
- **Position boost logic** — designed; requires update/delete RLS policies (Phase 1b)
- **CORS in Supabase** — not restricted; should limit to `pragma.health` before high-traffic launch
- **Intake flow** — not started; next major build after ConvertKit

---

## Current Design System Summary

### Section Backgrounds (top to bottom)

| Section | Background | Type |
|---|---|---|
| Nav | `#5A0F35` | Solid, dark plum |
| Hero | `#5A0F35` + 2 radial bloom layers | Dark plum with atmospheric depth |
| Quote/Interrupt | `linear-gradient(#5A0F35 → #3A0820)` then fades to cream via `::after` | Dark, continuous from hero |
| Problem | `#FDFAF7` (inline style) | Cream, first light |
| "Why Different" | `#FFFFFF` + `::after` fades to `#3A0820` | White, sinks to dark |
| Audience | `#3A0820` + `::after` fades to `#FDF8F5` | Dark, lifts to cream |
| How It Works | `#FDF8F5` | Cream |
| Founding Cohort | `#FFFFFF` | White |
| Pricing | `#F7F0EC` | Warm cream |
| Whitney | `#FFFFFF` + `::after` fades to `#C41E5B` | White, warms to magenta |
| Final CTA | `#C41E5B` + `::after` fades to `#FDF8F5` | Full magenta, fades to cream |
| Footer | `#FDF8F5` | Cream, midnight |
| Confirm page | `#FDF8F5` | Cream |

---

## If You Only Read One Section, Read This

### Exact Current Status

**What works in production (`https://pragma-health.netlify.app`):**
- Landing page renders correctly
- Signup form validates email (regex-based, rejects `abc@abc` and variants)
- Supabase inserts row with email, referral code, position, status='pending'
- Duplicate emails caught with "Already on the list!" feedback
- User redirected to confirmation page with email and position
- Confirmation page fetches and displays referral code
- All styling uses official brand palette
- Visual section transitions use gradient bridges (no hard color cuts)
- GitHub push to `main` auto-deploys to Netlify

**What's not done yet:**
- Motion system (hero entrance, scroll reveals, micro-interactions, signup ceremony, confirm reveal)
- ConvertKit integration (no welcome emails currently sent)
- Whitney's photo is a placeholder
- `abc@abc` test row is still in Supabase (delete it)
- Position race condition is unpatched (low urgency until scale)

**Next immediate priorities:**
1. Delete `abc@abc` from Supabase
2. Implement motion system Phase A (hero entrance) — see Motion System section above
3. ConvertKit Netlify Function

---

## Key Files & Their Purpose

| File | Type | Purpose |
|---|---|---|
| `index.html` | Production | Landing page markup |
| `confirm.html` | Production | Confirmation page markup |
| `styles.css` | Production | All CSS; official brand palette applied; gradient transitions |
| `script.js` | Production | Signup form + email validation + Supabase client |
| `config.js` | Production | Config loader (reads window.PRAGMA_CONFIG) |
| `build.js` | Build-time | Generates config.local.js from Netlify env vars |
| `netlify.toml` | Build-time | Netlify build config |
| `config.local.js` | Dev only | Local dev config (gitignored; not in repo) |
| `config.local.js.example` | Reference | Template for local dev config |
| `.env.example` | Reference | Template for future backend secrets |
| `.gitignore` | Reference | Git ignore rules |
| `PRAGMA_PHASE1_PLAN.md` | Reference | Phase 1 strategy & timeline |
| `CONVERSION_FUNNEL_SPEC.md` | Reference | Complete funnel spec (tables, email sequences, referral logic) |
| `LANDING_PAGE_AUDIT.md` | Reference | Gap analysis & audit trail |
| `LANDING_PAGE_WIREFRAME.md` | Reference | Section-by-section editorial blueprint |
| `CONFIG.md` | Reference | Config system detailed documentation |
| `SETUP.md` | Reference | Local dev setup guide |

---

## Next Developer's Checklist

If you're picking this up:

- [ ] Read this HANDOFF.md (you're doing it now)
- [ ] Review PRAGMA_PHASE1_PLAN.md for the big picture
- [ ] Test locally: `python3 -m http.server 8000` → submit email → confirm redirect works
- [ ] Check Supabase: New row in `waitlist` table; delete `abc@abc` test row if present
- [ ] For motion system: see "Motion System Implementation Roadmap" section above
- [ ] For ConvertKit: see "ConvertKit Integration" section above
- [ ] For position race condition: run the Postgres SEQUENCE SQL in Supabase dashboard

---

**Last updated:** 2026-06-11
