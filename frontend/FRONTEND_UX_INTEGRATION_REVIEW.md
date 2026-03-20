# PayLens Frontend Review (UX + Fake API Integration Readiness)

Date: 2026-03-19  
Scope: Full frontend audit (`/`, `/dashboard`, `/negotiate`) + fake API behavior under `frontend/app/api/*` + UX research-backed improvement plan.  
Constraint respected: No edits to `backend/` were considered in this review.

---

## 1) Executive Summary

The app is already strong in visual polish and feature coverage, and the frontend-hosted fake API enables end-to-end testing now.  
Main opportunities are not missing features, but **system-level UX coherence**:

1. Color system is aesthetically attractive but over-indexed on neon blue/emerald accents, with some low-emphasis text becoming hard to scan on mobile.
2. Motion strategy is mostly mount-time; it should evolve to **scroll-aware reveal patterns** and reduced-motion-safe behavior.
3. API integration readiness is good, but contract governance is not centralized yet (some schema/request definitions drift from backend task specs).
4. Status language improved (`calling/thinking`), but can be made more consistent and measurable across all async states.
5. Accessibility and readability need a formal pass (contrast, focus, semantic heading hierarchy, keyboard affordances).

---

## 2) How This Review Was Performed

- Code audit: `app`, `components`, `lib`, fake routes.
- Live behavior check with fake API routes:
  - `GET /health`
  - `POST /api/profile/github`
  - `POST /api/diagnosis`
  - `POST /api/what-if`
  - `POST /api/negotiate`
  - `POST /api/negotiate/report`
- Visual QA screenshots (desktop/mobile): entry, dashboard, negotiate.
- Research references used:
  - NN/g heuristics and system-status guidance.
  - NN/g response-time limits and progress indicators.
  - MDN Intersection Observer API.
  - web.dev `prefers-reduced-motion`.
  - WCAG 2.2 contrast + focus visibility.

---

## 3) Integration Readiness vs `paylens-plan/tasks/backend`

### Current readiness

- Fake API routes now cover expected endpoint surface and allow full UI flow without a backend service.
- Frontend API client uses runtime response parsing (`zod`) and request timeout.

### Contract alignment matrix

| Endpoint | Backend task expectation | Current fake API state | Gap |
|---|---|---|---|
| `GET /health` | status + version | returns status/version (+ gemini/groq/mode) | Extra fields only; low risk |
| `POST /api/profile/github` | `github_username` (BE-02) | accepts `github_username` and `github_url` | Good |
| `POST /api/profile/manual` | echo + `profile_ready` | implemented | Good |
| `POST /api/diagnosis` | manual profile -> full diagnosis | implemented | Good |
| `POST /api/what-if` | what-if request -> delta response | implemented | Good |
| `POST /api/negotiate` | company/role/user_profile/history/message | implemented | Good |
| `POST /api/negotiate/report` | full report request payload | currently requires only offers for generation | Medium alignment gap (input validation not strict) |

### Schema governance gap (important)

`frontend/lib/schemas.ts` request schemas for `WhatIfRequest` and `NegotiateRequest` are not aligned with currently used payloads/endpoints.  
Responses are aligned; request schemas need consolidation to prevent drift when real backend arrives.

---

## 4) UX Findings and Improvement Options

## 4.1 Async states (`calling`, `thinking`, loaded) consistency

Current:
- Entry, dashboard, negotiate include `calling/thinking` copy.
- Pattern not yet shared as a reusable status component.

Option A (Recommended): Shared `AsyncState` primitive  
- Build one reusable component for state labels/icons/tones (`idle`, `calling`, `thinking`, `loaded`, `error`).  
- Use it in entry submit, diagnosis load, what-if recalc, negotiate send/report generation.  
- Benefit: consistency, less copy drift.

Option B: Keep local states but standardize copy constants  
- Define global copy map in `lib/ui-copy.ts` and consume per feature.  
- Lower implementation effort but still fragmented structure.

---

## 4.2 Scroll appearance functionality (requested)

Current:
- Most reveals happen on mount (`AnimatedSection` delays), not tied to viewport entry.

Option A (Recommended): IntersectionObserver + Framer Motion variants  
- Use `useInView`/`whileInView` for each major dashboard card/section.  
- Trigger once with threshold/rootMargin tuned for mobile.  
- Add stagger by section index, not fixed global time.

Option B: Manual IntersectionObserver + utility class toggles  
- Add `data-reveal` attributes and toggle CSS classes (`opacity/translate`) on intersection.  
- Lower JS animation dependency, slightly less expressive.

Option C: GSAP ScrollTrigger  
- Richest choreography, but dependency overhead and increased complexity.  
- Better for marketing pages than product dashboards.

Implementation notes:
- Honor reduced-motion (`prefers-reduced-motion`) and disable non-essential reveal movement.
- Keep initial state readable for no-JS and SSR hydration safety.

---

## 4.3 Color palette and visual direction

Current:
- Dominant dark navy + cyan/emerald + occasional violet/amber.
- Strong visual consistency, but sections start to feel visually similar; hierarchy relies mostly on glow intensity.
- Some text (`text-slate-400/500`) on dark gradients risks legibility on smaller screens.

Option A (Recommended): Two-tier semantic color system  
- Keep base theme dark but define semantic roles:
  - Success = emerald
  - Insight = cyan
  - Action = blue
  - Warning = amber
  - Risk = rose  
- Restrict each role to specific UI purposes to reduce “everything glows” effect.

Option B: Neutral-first palette with accent bursts  
- Move most cards/backgrounds to neutral slate scale.
- Use one primary accent per section headline only.  
- Cleaner enterprise feel, less dramatic.

Option C: Brand duo palette
- Keep emerald as brand primary, replace cyan-heavy usage with warm secondary (teal + amber).  
- More distinctive than common “dark blue + neon cyan” SaaS style.

Implementation steps:
- Create `:root` token map for semantic accents (`--accent-insight`, `--accent-warning`, etc.).
- Refactor hardcoded per-component color classes into utility variants.
- Run contrast checks on text/icon chips for AA thresholds.

---

## 4.4 Information hierarchy and cognitive load

Current:
- Dashboard is feature-rich; long page can feel dense.
- On mobile, cards remain readable but scan speed drops due repeated section framing.

Option A (Recommended): Progressive disclosure by section summaries  
- Show concise “at-a-glance” row before deep cards.  
- Collapsible details on mobile for lower-priority submetrics.

Option B: Navigation wayfinding bar  
- Sticky mini-TOC: Diagnosis, Score, Radar, Opportunities, What-if, Trends, Summary.  
- Improves long-page orientation.

Option C: Split into tabs  
- Dashboard sections grouped into tabs (Overview, Upside, Action Plan).  
- Faster focused analysis, but hides context continuity.

---

## 4.5 Form UX and task completion

Current:
- Entry flow is clear and polished.
- Validation is mostly binary and post-submit.

Option A (Recommended): Inline validation + affordance hints  
- Show immediate syntax validation for GitHub URL/username.
- Add “example profile URL” helper under input.
- For quick input: show “minimum required” indicators before submit.

Option B: Keep flow unchanged, improve error text quality only  
- Better copy and recovery hints, minimal engineering changes.

---

## 4.6 Accessibility upgrades

Current:
- Focus states exist in many controls.
- Needs full pass for contrast, focus visibility consistency, and motion sensitivity.

Option A (Recommended): Accessibility hardening checklist gate (CI/manual)
- Add routine checks:
  - contrast ratio verification for text and focus indicators
  - keyboard-only navigation pass for all pages
  - reduced-motion fallback behavior
  - heading order validation (`h1`/`h2` structure)

Option B: Lightweight manual QA pass only
- Faster now, but risk of regressions as UI evolves.

---

## 4.7 Fake backend maturity for real backend swap

Current:
- Good for UI testability, deterministic and fast.
- Some request validation remains permissive vs planned backend strictness.

Option A (Recommended): Strict compatibility mode  
- Validate fake API request bodies exactly to planned backend schemas.
- Return realistic 422/400 structures where contract fails.
- Simulate latency variability and occasional controlled failures.

Option B: Keep permissive mode  
- Faster development flow, but lower confidence before real backend cutover.

---

## 5) Recommended Plan (Prioritized)

## Phase 1 (High impact / low risk)

1. Introduce scroll-reveal with IntersectionObserver + reduced-motion-safe behavior.
2. Standardize async state component/copy (`calling`, `thinking`, `loaded`, `error`).
3. Align frontend request schemas with actual contract payloads (especially what-if/negotiate requests).
4. Tighten fake API request validation for report endpoint to mirror backend tasks.

## Phase 2 (Medium impact)

1. Palette redesign using semantic accent roles and reduced glow density.
2. Mobile hierarchy improvements (collapsible lower-priority metrics).
3. Add wayfinding/sticky section index for long dashboard.

## Phase 3 (Quality gate)

1. Accessibility audit pass (contrast, focus, keyboard, motion).
2. UX instrumentation plan (time-to-first-insight, step completion, abandon points).

---

## 6) Concrete Implementation Options by Area

## Scroll reveal
- Option 1: `whileInView` + `viewport={{ once: true, amount: 0.2 }}`
- Option 2: custom `useIntersectionReveal` hook with CSS class toggles

## Palette system
- Option 1: semantic token map in CSS vars + component variant refactor
- Option 2: utility-class patching per section (faster, less maintainable)

## Async UX
- Option 1: shared `AsyncStatus` component and status enum
- Option 2: per-component local status state with shared copy constants

## Fake API realism
- Option 1: strict schema validation + deterministic latency + 5% failure mode toggle
- Option 2: deterministic success-only mock for faster demos

## Dashboard density
- Option 1: collapsible sections on mobile + sticky jump menu
- Option 2: tabbed dashboard segmentation

---

## 7) Success Criteria for UX Upgrade

- User can identify selected entry mode instantly.
- Time to “first insight” (salary gap visible) feels < 2s on local mock.
- No long page section appears without entering viewport (except top hero).
- Motion-reduced users see no decorative reveal animations.
- All critical text/focus states meet WCAG AA contrast targets.
- Fake API rejects invalid payloads similarly to planned backend.

---

## 8) Key Risks

- Over-animation can hurt perceived performance on mid-tier devices.
- Aggressive palette changes may break existing section identity.
- Strict mock API can slow early dev unless feature flags are used.

Mitigation:
- Add feature flags for motion/palette variants.
- Roll out in A/B style by route or environment.

---

## 9) Research References

1. NN/g — 10 Usability Heuristics  
   https://www.nngroup.com/articles/ten-usability-heuristics/

2. NN/g — Response Times: The 3 Important Limits  
   https://www.nngroup.com/articles/response-times-3-important-limits/

3. NN/g — Progress Indicators Make a Slow System Less Insufferable  
   https://www.nngroup.com/articles/progress-indicators/

4. MDN — Intersection Observer API  
   https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API

5. web.dev — prefers-reduced-motion  
   https://web.dev/articles/prefers-reduced-motion

6. W3C WCAG 2.2 — Contrast (Minimum) understanding  
   https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html

7. W3C WCAG 2.2 (spec) — Focus visible and related focus criteria  
   https://www.w3.org/TR/wcag/

8. web.dev — Design and user experience (inclusive design and consistency principles)  
   https://web.dev/learn/accessibility/design-ux

