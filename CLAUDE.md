# Pragma Landing Page — Project Operating Manual

This file is the authoritative guide for all Claude Code sessions working on this project. Read it in full before making any changes.

---

## 1. Project Overview

**Pragma** is a personalized supplement guidance platform for women. It combines registered dietitian expertise with daily check-ins to build and refine each user's supplement stack based on her life stage, hormonal status, and goals.

**This repository** is the public-facing landing page and waitlist funnel for Pragma. It is the primary entry point for prospective users: it introduces the product, captures waitlist signups, and delivers a confirmation experience with referral mechanics.

**Current stage:** Production-ready MVP. The page is live, collecting real signups, and linked to active backend services. Treat every change as if it affects real users.

---

## 2. Current Stack

| Layer | Technology |
|---|---|
| Markup | HTML (plain, no framework) |
| Styles | CSS (single `styles.css` file) |
| Interactivity | Vanilla JavaScript (`script.js`, `motion.js`) |
| Serverless functions | Netlify Functions (`netlify/functions/`) |
| Database / auth | Supabase |
| Email / CRM | Kit (ConvertKit) |
| Version control | GitHub — `pragma-tartlabs/pragma-landingpage` |
| Domain registrar | GoDaddy |
| Hosting | To be decided (currently Netlify) |

Do not introduce new dependencies, frameworks, or services without explicit approval.

---

## 3. Design Principles

- **Preserve Pragma branding at all times.** Typography, color palette, spacing, and tone are intentional and approved.
- **Do not rewrite copy** unless explicitly instructed with the exact replacement text provided.
- **Do not redesign sections** unless a redesign is explicitly requested.
- **Match provided Figma mockups or screenshots exactly.** Do not interpret loosely.
- **Never make independent creative or UI decisions.** If something is ambiguous, ask before acting.
- **Do not add, remove, or reorder sections** without explicit instruction.

---

## 4. Development Principles

- **Make the smallest change that satisfies the request.** Do not clean up surrounding code, refactor adjacent logic, or improve things that were not asked about.
- **Do not refactor unrelated code.** If you notice something that could be improved, flag it — do not fix it silently.
- **Preserve all existing functionality.** A change to one feature must not break another.
- **Explain any backend or schema changes before making them.** This includes Supabase table changes, Netlify function edits, and Kit/ConvertKit configuration.
- **Test changes before declaring them complete.** Use the preview server to verify the change works visually and functionally on desktop and mobile before reporting done.
- **No comments in code** unless the reason behind a non-obvious decision needs to be recorded.

---

## 5. Git Workflow & Repository Safety

### Project Identity
- Project: Pragma Landing Page
- Expected GitHub repository: https://github.com/pragma-tartlabs/pragma-landingpage.git
- Expected branch: main

### Before Every Commit or Push
Before performing any Git operation that modifies history or pushes code, always verify:

1. Current working directory (`pwd`)
2. Git repository root
3. Current branch
4. Git remote (`git remote -v`)
5. Local Git identity (`git config user.name` and `git config user.email`)

Compare these against the expected project identity above.

### Safety Rules
- Never assume the current repository is correct.
- Never change Git remotes.
- Never change Git user.name or user.email.
- Never change GitHub authentication or credentials.
- Never push to any repository unless the remote exactly matches the expected repository.
- If anything does not match, STOP immediately and explain what is wrong before suggesting any Git commands.
- If there are multiple GitHub accounts configured on the machine, always verify that the current repository matches the expected remote before any commit or push.
- If authentication fails during a push, diagnose the cause first instead of changing credentials automatically.

### Standard Git Verification
Before every commit or push, run and inspect:

- `pwd`
- `git rev-parse --show-toplevel`
- `git branch --show-current`
- `git remote -v`
- `git config user.name`
- `git config user.email`
- `git status`

Do not skip these checks.

### Commit Workflow
Whenever a logical checkpoint is reached:

1. Verify the repository information above.
2. Show a summary of the files that changed.
3. Suggest a clear commit message.
4. Wait for approval before committing.
5. After committing, verify the remote once more before pushing.
6. Push only after all checks pass.

---

## 6. Deployment Workflow

Every deployment follows this sequence — no exceptions:

1. Verify current repository, branch, and remote match the expected project identity.
2. Run `git status` and confirm only intended files are staged.
3. Summarize what changed and why.
4. Propose a commit message and wait for approval.
5. Commit.
6. Verify the remote one more time.
7. Push only after approval is confirmed.

Netlify deploys automatically on push to `main`. There is no staging environment — every push goes live.

---

## 7. Before Declaring a Task Complete

Do not mark a task as done until all of the following have been verified:

- **Desktop layout** looks correct in the preview.
- **Tablet layout** (768px) renders without breakage.
- **Mobile layout** (375px) renders without breakage.
- **Existing functionality** (signup modal, referral code, waitlist position, copy invite link) still works.
- **No console errors** are present.
- **No broken links** or missing assets.
- **Existing backend flow** (Supabase insert, Kit tagging, Netlify function response) is unaffected.

If a browser preview is not available, state that explicitly rather than claiming the task is complete.

---

## 8. Things Never To Do Without Explicit Approval

The following changes require explicit written approval before any action is taken:

- Rewrite or rephrase any copy
- Change fonts, colors, spacing, or branding
- Restructure or redesign any page section
- Change the backend architecture or data flow
- Modify Supabase tables, columns, or RLS policies
- Replace or remove any library or framework
- Change the deployment platform or configuration
- Change Git remotes, branches, or repository targets
- Change Git credentials, user.name, or user.email
- Modify Netlify environment variables or function configuration
- Change Kit/ConvertKit forms, sequences, or tags
- Add analytics, tracking scripts, or third-party embeds

When in doubt, ask first.
