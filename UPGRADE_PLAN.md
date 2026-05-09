# Frontend Upgrade Plan

A practical roadmap to improve this project using stronger frontend architecture and patterns.

## Phase 1 — Security & API Architecture (Highest Priority)

1. Move Spoonacular requests from client-side code to server-side route handlers. ✅
2. Keep API key server-only (remove public exposure pattern). ✅
3. Add centralized API error handling (status mapping + user-friendly messages). ✅
4. Add request timeout/retry strategy for unstable network/API failures. ✅

**You learn:** secure API boundaries, BFF pattern, production-safe env usage.

---

## Phase 2 — Data Fetching Pattern

5. Introduce TanStack Query (or SWR) for request caching and deduplication. ✅
6. Replace manual loading/error state with query states. ✅
7. Add stale time and background refetch strategy. ✅
8. Normalize response data in one mapping layer before UI consumption. ✅

**You learn:** scalable async state management and cache strategy.

---

## Phase 3 — Forms, Validation & URL State

9. Refactor search form with React Hook Form. ✅
10. Add Zod schema validation for all filters and input parsing. ✅
11. Sync search filters to URL query params (shareable/bookmarkable searches). ✅
12. Persist last search criteria for better UX. ✅

**You learn:** type-safe forms, validation patterns, URL-driven state.

---

## Phase 4 — State & Context Design

13. Keep small specialized contexts (Favorites, Theme, Auth if added).
14. Avoid a monolithic AppContext; use focused providers.
15. Add derived helpers/selectors for context values to reduce unnecessary rerenders.
16. Define clear folder boundaries: `domain`, `ui`, `services`, `hooks`. ✅

**You learn:** maintainable state architecture and separation of concerns.

---

## Phase 5 — Quality & Testing

17. Add unit tests for favorites logic and utility functions. ✅
18. Add component tests for search form and favorite button behavior. ✅
19. Add one end-to-end flow (search -> favorite -> verify favorites page). ✅
20. Add CI checks for lint, typecheck, and tests. ✅

**You learn:** confidence-driven development and regression prevention.

---

## Phase 6 — Performance & Accessibility

21. Improve accessibility: keyboard flow, aria labels, pressed states, focus visibility. ✅
22. Add skeleton/loading UI patterns for perceived performance. ✅
23. Audit rerenders and memoize expensive components when needed. ✅
24. Optimize images and avoid unnecessary client-side work. ✅

**You learn:** practical performance tuning and accessible UI fundamentals.

---

## Phase 7 — Documentation & Developer Experience

25. Update README to match real project architecture and versions.
26. Add architectural notes: data flow, context boundaries, API strategy.
27. Add scripts for `typecheck`, `test`, and a pre-commit quality gate.
28. Keep a changelog section in notes for each pattern you adopt.

**You learn:** team-friendly project communication and maintainable DX.

---

## Suggested Execution Order (MVP Path)

1. Phase 1 (Security/API)
2. Phase 2 (Data fetching)
3. Phase 3 (Form/validation)
4. Phase 5 (Tests)
5. Phase 6 (A11y/performance)
6. Phase 7 (Docs/DX)

If you complete phases 1–3 + 5, your project quality will already feel close to production-level for a portfolio app.

## Extra — Copilot Reusable Starter Script

Based on the patterns established in this project, create a reusable GitHub Copilot instructions file for bootstrapping future Next.js applications with:

- Consistent folder structure (`app/`, `services/`, `schemas/`, `utils/`, `components/`, `hooks/`, `context/`)
- Framework conventions (Next.js App Router, React Hook Form, SWR, Zod)
- Architectural best practices (BFF pattern, server-only secrets, centralized error handling, response mapping, schema validation)
