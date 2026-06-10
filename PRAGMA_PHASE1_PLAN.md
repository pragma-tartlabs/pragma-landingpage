# Pragma — Phase 1 Plan
**Free cohort · First 1,000 women · Algorithm training**

---

## Objective

Collect the first 1,000 signups, onboard them into a complete Foundation Stack protocol, gather daily check-in data to train the recommendation engine, and validate willingness to convert to Pragma+ ($8/mo) at the end of the free phase.

---

## Success Metrics

| Metric | Target |
|---|---|
| Waitlist signups | 1,000 |
| Onboarding completion (≥2 modules) | ≥ 70% |
| Daily check-in rate (week 4) | ≥ 40% |
| Free → Pragma+ conversion | ≥ 25% |
| NPS at end of free phase | ≥ 50 |

---

## Timeline

```
Week 1–2   Landing page live + waitlist open
Week 3–4   Intake flow (modules 1–2) built and tested
Week 5–6   Protocol engine v1: Foundation Stack output
Week 7–8   Daily check-in tracker live
Week 9–12  First cohort onboarded; data collection begins
Week 13–16 Monthly phase review + Phase 2 unlock logic
Week 17–18 Conversion campaign: free → Pragma+
```

---

## Product Build

### Milestone 1 — Waitlist & Landing Page
- [x] Landing page live (`index.html`)
- [ ] Email capture connected to backend (Supabase / Resend)
- [ ] Confirmation email with position in queue
- [ ] Admin dashboard: signup count, source tracking

### Milestone 2 — Intake Flow (Modules 1–6)
Modules are presented progressively. A starter protocol unlocks after Module 2.

| # | Module | Key inputs |
|---|---|---|
| 1 | Hormonal status | Life stage, cycle regularity, contraceptive use, GLP-1/Ozempic, perimenopause |
| 2 | Symptoms | Fatigue, brain fog, sleep, mood, hair/skin/nail changes |
| 3 | Current supplements | What they're already taking + doses |
| 4 | Diet & lifestyle | Dietary pattern, alcohol, exercise, stress level |
| 5 | Medical history | Diagnoses, medications, known deficiencies |
| 6 | Goals | Primary focus: energy / hormones / body composition / longevity |

**Deliverable:** Foundation Stack — 3–6 supplements with dose, form, timing, rationale, and two brand picks (premium + value) per supplement.

### Milestone 3 — Daily Check-in Tracker
- [ ] 60-second daily log: energy (1–5), sleep quality, mood, adherence
- [ ] Weekly summary card
- [ ] Streak + consistency nudge notifications (email or push)

### Milestone 4 — Monthly Phase Review
- [ ] 30-day review prompt surfaces after check-in streak
- [ ] One Phase 2 supplement unlocked per review cycle
- [ ] Attribution log: "This was added because [symptom/module change]"

### Milestone 5 — Conversion Flow
- [ ] In-app upgrade prompt at end of free phase
- [ ] Pragma+ feature gate: Phase 2 unlocks, no affiliate links, full tracker history
- [ ] Stripe billing integration

---

## Clinical Rules Engine

Whitney authors all recommendation logic. The engine applies her rules; it does not generate them.

**Rule structure (per supplement):**
```
IF [life stage] AND [symptom set] AND [NOT already taking X]
  AND [no contraindication from medications]
THEN recommend [supplement]
  WITH dose=[X mg], form=[preferred bioavailable form],
       timing=[with/without food, AM/PM],
       rationale=[plain-English explanation],
       brands=[{premium: ..., value: ...}]
```

**Phase 1 scope:** Foundation Stack rules only (≤6 supplements). Phase 2 rules (condition-specific, genetics, labs) ship in Phase 2.

**Audit requirement:** Every recommendation traceable to a named rule + Whitney's sign-off date. No AI-generated rules in Phase 1.

---

## Launch & Marketing

### Channels

| Channel | Tactic | Owner |
|---|---|---|
| Organic social | Whitney's POV content: "What your doctor didn't tell you about [X]" | Whitney |
| Substack / email | Long-form educational posts linked to waitlist | Whitney |
| Reddit | Genuine participation in r/PCOS, r/Perimenopause, r/GLP1 — no spam | Founder |
| Referral loop | "Skip the queue" — refer 3 friends, move up 50 spots | Product |
| Press | Pitch: "RD-authored, zero affiliate revenue" angle to women's health journalists | Founder |

### Content Pillars

1. **The gap** — what the current system gets wrong (Generic multivitamins, influencer stacks, 15-min appointments)
2. **The science** — hormone-specific depletion patterns, MTHFR, GLP-1 side effects, perimenopause nutrient shifts
3. **Whitney's take** — clinical reasoning made legible; not advice, not vibes
4. **Transparency** — how Pragma makes decisions, why we don't take affiliate money

### Pre-launch Sequence

```
T-14   Teaser post: "I built this because..." (Whitney's story)
T-7    "The problem with your multivitamin" (educational)
T-3    "We open to 1,000 women next week. Zero cost."
T-0    Launch email to waitlist + social blast
T+7    "Here's what the first protocols look like" (anonymized data)
T+30   First monthly phase review milestone post
```

---

## Trust & Compliance

- **No affiliate links** in Phase 1 (free tier shows brand picks; Pragma+ removes all affiliate links everywhere)
- **HIPAA-compliant infrastructure** — health data encrypted at rest and in transit; BAA in place before any health inputs collected
- **Disclosure** — every page footer: "Pragma is not a medical service and does not provide diagnoses or treatment."
- **Brand deal policy** — documented and public: Pragma takes $0 from supplement brands. Ever.

---

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Low onboarding completion | Progressive unlock (protocol after 2 modules, not 6) reduces all-or-nothing friction |
| Whitney bottleneck on rule authoring | Rules drafted in structured template; Whitney reviews/approves, doesn't write from scratch |
| HIPAA scope creep | Intake stays general health data in Phase 1; lab PDFs (which are PHI) gated to Pragma Pro (Phase 2) |
| Low check-in retention | Streak mechanic + weekly summary email; 60-second cap is non-negotiable |
| Conversion falls short | Downgrade path: Pragma+ pauses, not cancels; re-engagement sequence at 90 days |

---

## Phase 2 Preview (not in scope now)

- Lab PDF upload + interpretation
- 23andMe / DUTCH genetic agent
- Wearable integrations (Oura, Apple Health)
- Monthly RD messaging (Pragma Pro)
- Pragma Report PDF ($199 one-time)
