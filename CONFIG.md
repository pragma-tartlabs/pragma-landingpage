# Pragma Environment Configuration Guide

This document explains how environment variables are set up for Pragma and how to configure them for different deployment scenarios.

---

## Overview

Pragma uses a **deployment-agnostic** environment variable system that works with:
- Local development
- Netlify
- Vercel
- Any static hosting provider

The system distinguishes between **frontend-safe** variables (which can be exposed in client-side code) and **server-side only** variables (which must never be in the frontend).

---

## Variables Overview

### Frontend-Safe Variables (Can be in client code)

| Variable | Purpose | Example | Where to set |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Supabase public endpoint | `https://project.supabase.co` | Frontend, safe (public endpoint) |
| `VITE_SUPABASE_ANON_KEY` | Supabase public anon key | `eyJhbGc...` | Frontend, safe (has RLS + rate limiting) |
| `VITE_SITE_URL` | Your app's public URL | `https://pragma.health` | Frontend, safe (public URL) |
| `VITE_APP_ENV` | Environment flag | `development` or `production` | Frontend, safe (public metadata) |

**Why these are safe:**
- `SUPABASE_ANON_KEY` is intentionally meant to be public. Supabase protects it via:
  - **Row-Level Security (RLS)**: Users can only access/modify their own records
  - **Rate limiting**: Prevents abuse
  - **Limited permissions**: Can only INSERT and SELECT with RLS constraints

### Server-Side Only (Never expose to frontend)

| Variable | Purpose | Used by | Where to set |
|---|---|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase admin key | Backend API endpoints | Backend environment only |
| `CONVERTKIT_API_KEY` | ConvertKit API credentials | Backend API endpoints | Backend environment only |
| `CONVERTKIT_FORM_ID` | ConvertKit form ID | Backend API endpoints | Backend environment only |

**Why these are server-side only:**
- `SUPABASE_SERVICE_ROLE_KEY` has **full admin access** to Supabase (dangerous if leaked)
- `CONVERTKIT_API_KEY` can manage subscribers and automations (sensitive credential)
- These should only be used in backend code (Node.js, Python, etc.)

---

## Local Development Setup

### Step 1: Copy the example file

```bash
cp config.local.js.example config.local.js
```

### Step 2: Get your Supabase credentials

1. Go to [supabase.com](https://supabase.com) and create/login to your project
2. Navigate to **Settings** → **API**
3. Copy:
   - **Project URL** → paste into `supabaseUrl`
   - **anon public key** → paste into `supabaseAnonKey`

### Step 3: Edit config.local.js

```javascript
window.PRAGMA_CONFIG = {
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  siteUrl: 'http://localhost:5173',
  appEnv: 'development',
  hasBackendApi: false,
};
```

### Step 4: Uncomment in index.html

In `index.html`, find the commented script tag and uncomment it:

```html
<!-- For local development, load local config -->
<script src="config.local.js"></script>
```

### Step 5: Start developing

The app will now use `config.local.js` for local development. Changes to `config.local.js` are never committed (it's in `.gitignore`).

---

## Deployment Setup

### Netlify

1. **Set environment variables in Netlify dashboard:**
   - Go to **Site settings** → **Build & deploy** → **Environment**
   - Add these variables:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_SITE_URL`
     - `VITE_APP_ENV=production`
     - `SUPABASE_SERVICE_ROLE_KEY` (for backend functions only)
     - `CONVERTKIT_API_KEY` (for backend functions only)

2. **Update netlify.toml** (if using functions):

```toml
[build]
  command = "npm run build"
  functions = "netlify/functions"
  publish = "dist"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

3. **For static HTML sites:**
   - Netlify will serve your `index.html` as-is
   - The frontend will load with environment variables from the dashboard
   - Create `netlify/functions/supabase-signup.js` for backend operations that need server-side keys

### Vercel

1. **Set environment variables in Vercel dashboard:**
   - Go to **Settings** → **Environment Variables**
   - Add the same variables as Netlify
   - Mark server-side keys as "Sensitive"

2. **Create API routes for backend operations:**

```javascript
// api/signup.js (server-side, can use SUPABASE_SERVICE_ROLE_KEY)
export default async function handler(req, res) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  // Handle signup, rate limiting, validation
  // Return position to frontend
}
```

3. **Frontend makes requests to `/api/signup`:**

```javascript
// In script.js (client-side, uses anon key)
const response = await fetch('/api/signup', {
  method: 'POST',
  body: JSON.stringify({ email: userEmail }),
});
```

### GitHub Pages (or any static hosting)

If using GitHub Pages or another static host without environment variable support:

1. **Create a build step** (using a CI/CD pipeline like GitHub Actions):

```yaml
# .github/workflows/deploy.yml
- name: Generate config
  run: |
    cat > config.js << EOF
    window.PRAGMA_CONFIG = {
      supabaseUrl: '${{ secrets.SUPABASE_URL }}',
      supabaseAnonKey: '${{ secrets.SUPABASE_ANON_KEY }}',
      siteUrl: 'https://pragma.health',
      appEnv: 'production',
    };
    EOF
```

2. Commit the generated `config.js` and deploy.

---

## How Configuration Loading Works

The `config.js` file has a **fallback chain**:

```javascript
// Priority order (first available wins):
1. window.PRAGMA_CONFIG (if set by config.local.js or deployment script)
2. import.meta.env.VITE_* (if using a build tool like Vite)
3. window.location.origin (for siteUrl fallback)
4. Empty string (if not set, will show a warning)
```

This means:
- **Local dev** → `config.local.js` sets `window.PRAGMA_CONFIG`
- **Netlify/Vercel** → Environment variables are available as `import.meta.env.VITE_*` (if using a build tool) or you create a config during build
- **Static hosting** → CI/CD pipeline generates `config.js` from secrets

---

## Security Checklist

- [ ] `config.local.js` is in `.gitignore` (never commit local credentials)
- [ ] `.env` and `.env.local` are in `.gitignore`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is **never** in `config.js` (frontend code)
- [ ] `CONVERTKIT_API_KEY` is **never** in `config.js` (frontend code)
- [ ] `VITE_SUPABASE_ANON_KEY` can be safely exposed (has RLS and rate limiting)
- [ ] Supabase Row-Level Security (RLS) is enabled on all tables before launch
- [ ] Deployment platform secrets are marked as sensitive/non-public

---

## Troubleshooting

### "Missing environment variables" warning

You'll see this in the console:
```
[Pragma Config] Missing environment variables: supabaseUrl, supabaseAnonKey
```

**Fix:** Make sure you've set up `config.local.js` or the deployment platform's environment variables.

### Supabase returns 401 Unauthorized

**Possible causes:**
- Anon key is incorrect
- Row-Level Security (RLS) policy is blocking the operation
- Email already exists (duplicate check failed)

**Fix:** Check Supabase logs and RLS policies.

### Form submissions do nothing

**Possible causes:**
- `config.js` didn't load (check browser console)
- `supabaseUrl` or `supabaseAnonKey` is empty
- Backend hasn't been implemented yet (current state)

**Fix:** Confirm `config.local.js` is loaded by checking `window.PRAGMA_CONFIG` in the browser console.

---

## Next Steps

1. **Local development:**
   - Copy `config.local.js.example` → `config.local.js`
   - Get Supabase credentials and fill in `config.local.js`
   - Uncomment the config load in `index.html`
   - Start building Supabase integration

2. **Deployment preparation:**
   - Add environment variables to your hosting platform
   - Create backend API endpoints (for ConvertKit, rate limiting, etc.)
   - Update deployment config (netlify.toml, vercel.json, etc.)
   - Test end-to-end on staging environment

3. **Security review:**
   - Run through the checklist above
   - Audit Supabase RLS policies
   - Test that server-side keys are never exposed to frontend
   - Verify rate limiting works before launch

---

## File Reference

| File | Purpose | Gitignored? |
|---|---|---|
| `.env.example` | Template for environment variables (documentation) | No |
| `.env` / `.env.local` | Your local environment variables | **Yes** |
| `config.js` | Configuration loader (shared by all environments) | No |
| `config.local.js` | Your local configuration (development) | **Yes** |
| `config.local.js.example` | Template for local config | No |
| `.gitignore` | Git ignore rules | No |

---

## Deployment-Agnostic Philosophy

The configuration system is designed so that:

1. **No hardcoding**: Credentials are never hardcoded in the repository
2. **Platform-agnostic**: Works with Netlify, Vercel, GitHub Pages, or any host
3. **Secure by default**: Server-side keys are kept out of the frontend
4. **Simple for devs**: Easy to set up locally, easy to deploy

If the project moves from Netlify to Vercel (or vice versa), **no code changes** are required. Only the environment variable setup differs between platforms.
