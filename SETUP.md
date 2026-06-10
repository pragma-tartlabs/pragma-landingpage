# Pragma Project Setup Guide

This guide walks you through setting up the Pragma landing page for local development and deployment.

---

## Part 1: Environment Variables (This Session)

### What was just set up

1. **`.env.example`** — Template for all environment variables (for reference)
2. **`config.js`** — Configuration loader that works across all platforms
3. **`config.local.js.example`** — Template for local development configuration
4. **`.gitignore`** — Prevents credentials from being committed to git
5. **`CONFIG.md`** — Detailed documentation on configuration

### What you need to do

1. **Copy the template to your local config:**
   ```bash
   cp config.local.js.example config.local.js
   ```

2. **Get Supabase credentials:**
   - Sign up/login at [supabase.com](https://supabase.com)
   - Create a new project or open an existing one
   - Go to **Settings** → **API**
   - Copy:
     - **Project URL** (under "Project URL")
     - **anon public** key (under "Your API keys")

3. **Edit `config.local.js` with your credentials:**
   ```javascript
   window.PRAGMA_CONFIG = {
     supabaseUrl: 'https://your-project.supabase.co',  // ← Paste Project URL
     supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',  // ← Paste anon key
     siteUrl: 'http://localhost:5173',
     appEnv: 'development',
     hasBackendApi: false,
   };
   ```

4. **Uncomment config loading in `index.html`:**

   Find this section (around line 310):
   ```html
   <!-- For local development, optionally load local config (if it exists) -->
   <!-- <script src="config.local.js"></script> -->
   ```

   Uncomment the second line:
   ```html
   <!-- For local development, optionally load local config (if it exists) -->
   <script src="config.local.js"></script>
   ```

5. **Verify the setup:**
   - Open `index.html` in your browser (or run a local dev server)
   - Open the browser console (F12 → Console)
   - Type: `window.PRAGMA_CONFIG`
   - You should see your configuration object with the Supabase URL and key

✅ **Done!** Your environment is now set up. You can proceed to Phase 1a (Supabase integration).

---

## Part 2: Frontend-Safe vs. Server-Side Variables

### Frontend-Safe (OK to expose in client code)

These variables are safe to put in `config.js` or the browser:

- `VITE_SUPABASE_URL` — Public Supabase endpoint
- `VITE_SUPABASE_ANON_KEY` — Anon key with Row-Level Security
- `VITE_SITE_URL` — Your app's public URL
- `VITE_APP_ENV` — Environment flag (dev/prod)

**Why safe:** Supabase anon keys have built-in protection (RLS policies, rate limiting, limited permissions).

### Server-Side Only (NEVER expose)

These variables must NEVER appear in client-side code:

- `SUPABASE_SERVICE_ROLE_KEY` — Has full admin access to Supabase
- `CONVERTKIT_API_KEY` — Can manage ConvertKit subscribers
- `CONVERTKIT_FORM_ID` — Associated with the API key

**Why secret:** These allow unrestricted access; leaking them is a security incident.

**How to handle them:**
- Store only in your backend environment (Vercel serverless functions, Netlify functions, Node.js server, etc.)
- Never add to `config.js` or pass to the frontend
- Only use in `/api/` routes or backend code
- Rotate keys immediately if leaked

---

## Part 3: Directory Structure (Reference)

```
pragma-landingpage/
├── index.html                    # Landing page markup
├── styles.css                    # All styling
├── script.js                     # Form handler (ready for Supabase integration)
├── config.js                     # Configuration loader (shared)
├── config.local.js               # Your local config (gitignored)
├── config.local.js.example       # Template for local config
│
├── .env.example                  # Environment variables template (for reference)
├── .gitignore                    # Git ignore rules (prevents credential leaks)
├── CONFIG.md                     # Detailed configuration documentation
├── SETUP.md                      # This file
│
├── CONVERSION_FUNNEL_SPEC.md     # Complete funnel specification
├── LANDING_PAGE_AUDIT.md         # Gap analysis vs. Phase 1 goals
├── LANDING_PAGE_WIREFRAME.md     # Editorial blueprint
├── PRAGMA_PHASE1_PLAN.md         # Phase 1 strategy & timeline
├── HANDOFF.md                    # Overall project summary
│
└── assets/                       # Images, icons, etc.
```

---

## Part 4: What's NOT Implemented Yet

The following are **ready to implement** but not yet wired up:

- ❌ Supabase integration (form → database)
- ❌ Confirmation page (`/confirm?email=...&position=...`)
- ❌ ConvertKit automation sequences
- ❌ Referral system (position boost logic)
- ❌ Intake flow (6 modules → Foundation Stack)
- ❌ Daily check-in tracker
- ❌ Monthly phase review logic
- ❌ Stripe billing integration

**All of these are fully specified** in `CONVERSION_FUNNEL_SPEC.md`. The environment setup is just the foundation.

---

## Part 5: Next Steps (Phase 1a)

Once you have `config.local.js` set up, the next task is:

**Set up Supabase database:**

1. In the Supabase dashboard, create the 4 tables from `CONVERSION_FUNNEL_SPEC.md` Section 3:
   - `waitlist`
   - `referrals`
   - `analytics_events`
   - `waitlist_position_history`

2. Set up Row-Level Security (RLS) policies (see CONFIG.md and CONVERSION_FUNNEL_SPEC.md Appendix)

3. Wire the form to POST to Supabase (update `script.js`)

4. Build `/confirm` page to display position

5. Test: submit email → Supabase record created → position calculated → redirect to confirm page

See `HANDOFF.md` Section "Recommended Next Steps" for the complete Phase 1a roadmap.

---

## Part 6: Troubleshooting

### "Cannot read property 'supabaseUrl' of undefined"

**Cause:** `config.local.js` didn't load

**Fix:**
- Check that `config.local.js` exists (not the `.example`)
- Check the browser console for any loading errors
- Make sure the `<script src="config.local.js"></script>` line is uncommented in `index.html`

### Form submission does nothing

**Cause:** Supabase integration not yet implemented

**Expected:** This is correct. The form currently just validates email and shows "You're on the list!" for UX testing.

**Next:** Phase 1a will implement the actual Supabase signup flow.

### "Missing environment variables" warning in console

**Cause:** `config.js` couldn't find `supabaseUrl` or `supabaseAnonKey`

**Fix:** Make sure `config.local.js` is set up correctly and loaded (see Part 1 above)

---

## Part 7: Security Reminders

Before launching to production:

- [ ] `config.local.js` is in `.gitignore` (never commit credentials)
- [ ] `.env` and `.env.local` are in `.gitignore`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is stored only on your backend
- [ ] `CONVERTKIT_API_KEY` is stored only on your backend
- [ ] Row-Level Security (RLS) is enabled on all Supabase tables
- [ ] API rate limiting is configured on your backend
- [ ] No hardcoded credentials in git history

---

## Questions?

Refer to:
- **General config questions** → See `CONFIG.md`
- **Implementation questions** → See `CONVERSION_FUNNEL_SPEC.md`
- **Overall project status** → See `HANDOFF.md`

Good luck! 🚀
