# Development Notes & Best Practices

## React Context Pattern

### What is Context?

Context is a React feature that allows sharing state across multiple components without prop drilling. Instead of passing props down through every level, components can directly access shared data via `useContext()`.

**Problem it solves:** Prop drilling (passing props through many intermediate components that don't need them)

### How it works:

1. **Create context** - Define what data will be shared
2. **Create provider** - Wraps components and provides the data
3. **Consume context** - Any component inside the provider accesses data via `useContext()`

---

## Context Approach: FavoritesContext vs AppContext

### Why We Chose FavoritesContext ✅

**Specialized, Single-Purpose Context**

```typescript
<FavoritesProvider>
  <Header />
  <Main />
</FavoritesProvider>
```

**Advantages:**

- **Separation of concerns** - Each context has one responsibility
- **Performance** - Components don't re-render when unrelated state changes
- **Scalability** - Easy to add more specialized contexts as app grows
- **Reusability** - Can use in different projects
- **Maintainability** - Clear what each context manages
- **Testability** - Easy to test in isolation

### Why NOT AppContext ❌

**Monolithic, All-in-One Context**

```typescript
<AppContext.Provider value={{favorites, user, theme, filters}}>
  <Header />
  <Main />
</AppContext.Provider>
```

**Problems:**

- Everything connected = harder to maintain
- Performance issue - Any state change causes all consumers to potentially re-render
- Hard to scale - becomes a nightmare as app grows
- Tightly coupled - changing one piece affects everything
- Not reusable - too specific to this app

---

## Best Practice: Multi-Context Pattern

For scalable apps, use **multiple specialized contexts**:

```typescript
<AuthContext>        // User login & profile
  <FavoritesContext> // Favorites list
    <ThemeContext>   // Dark mode, styling
      <App />
    </ThemeContext>
  </FavoritesContext>
</AuthContext>
```

**This is the industry standard** and what drives most professional React applications.

---

## Key Takeaways

| Aspect      | FavoritesContext  | AppContext          |
| ----------- | ----------------- | ------------------- |
| Purpose     | Only favorites    | Everything          |
| Performance | ✅ Efficient      | ❌ Re-renders often |
| Scalability | ✅ Easy to extend | ❌ Gets messy       |
| Reusability | ✅ Yes            | ❌ No               |
| Complexity  | ✅ Simple         | ❌ Complex          |

**Lesson:** Always prefer specialized contexts over monolithic ones.

---

## 1. API Pattern: Server Route Handler Proxy

Instead of calling Spoonacular directly from the browser, the frontend now calls internal routes (`/api/recipes/random`, `/api/recipes/search`) and those routes call Spoonacular.

### Why this is better

- **Security**: API key stays on the server, not exposed in browser requests.
- **Control**: One central place for error handling, retries, logging, and rate-limit handling.
- **Maintainability**: UI depends on our internal API contract, not directly on third-party response shapes.
- **Scalability**: Easier to swap providers, add caching, or combine multiple APIs later.

### Tradeoff

- Adds one extra network hop, but this is usually worth it for production safety and cleaner architecture.

### 2. Why we switched to `SPOONACULAR_API_KEY` only

- We removed `NEXT_PUBLIC_SPOONACULAR_API_KEY` fallback so the key is never exposed to browser code.
- This reduces accidental secret leaks and follows production security best practices.
- It also enforces a clear boundary: frontend calls our API routes, server handles third-party secrets.

---

## 3. Centralized API Error Handling

All API error logic lives in `app/utils/apiErrorHandler.ts` instead of being scattered across route files.

### How it works

- `ApiError` — structured error class with `statusCode` and `userMessage`
- `mapSpoonacularError(status)` — maps known HTTP codes to user-friendly messages
- `errorResponse(error)` — returns a consistent `NextResponse` JSON shape

### Why this is better

- **Single source of truth** — fix or adjust error messages in one place
- **User-friendly** — UI gets readable messages, not raw HTTP status text
- **Consistent shape** — all error responses have the same JSON structure
- **Extensible** — add new status mappings without touching route files

---

## 4. Request Timeout & Retry Strategy

All Spoonacular requests now go through `app/utils/fetchUtils.ts` instead of raw `fetch`.

### How it works

- `fetchWithTimeout` — aborts the request if it exceeds 8 seconds
- `fetchWithRetry` — retries up to 2 times on transient failures (5xx, 429, timeout) with exponential back-off (500ms → 1s → 2s)
- Client errors (4xx) are **not retried** — no point retrying bad input

### Why this is better

- **Resilience** — transient network blips or API hiccups don't immediately surface as errors
- **User experience** — silent retry before showing an error message
- **Predictable** — all timeouts and retry rules are in one place

---

## 5. SWR for Caching & Deduplication

We added SWR to replace manual request state on Home/Search pages.

### Why this helps

- **Caching** — repeated searches can reuse recent results instead of refetching immediately.
- **Deduplication** — simultaneous identical requests are merged into one network call.
- **Cleaner code** — loading/error/data state is managed by SWR hooks.

---

## 6. Query-State Instead of Manual Request State

(This was completed as part of Step 5 by replacing manual request flags with SWR query state.)
We removed manual request flags and now rely on SWR state directly.

### What changed

- Home uses `isMutating` + `error` from `useSWRMutation`.
- Search uses `isLoading` / `isValidating` + `error` from `useSWR`.

### Why this is better

- Less custom state logic to maintain.
- Fewer sync bugs between UI state and request lifecycle.

---

## 7. Stale-Time & Background Refetch Strategy

### Strategy used

- Global stale window via `dedupingInterval = 15m`.
- No focus-based background refetch (`revalidateOnFocus: false`).
- No reconnect background refetch globally (`revalidateOnReconnect: false`).
- No stale background refetch (`revalidateIfStale: false`).
- No client-side retry on query errors (`shouldRetryOnError: false`) because retries are handled on the backend.

### Why this is better

- Predictable cache behavior and fewer surprise requests.
- Better API quota usage while keeping UX responsive.

---

## 8. Response Mapping Layer

All API payloads are normalized in `app/services/recipeMappers.ts` before UI components consume them.

### What changed

- `normalizeRecipe` converts one raw payload into a stable `Recipe` shape.
- `normalizeRecipes` converts arrays and guarantees `Recipe[]` output.
- `spoonacularApi` now always returns normalized data.

### Why this is better

- UI gets predictable data with fewer null/shape edge cases.
- API response changes are isolated in one mapping file.

### Risks if not done

- UI regressions from undefined/null/wrong-type fields.
- Repeated ad-hoc checks scattered across components, increasing complexity.
- Inconsistent behavior between pages (one component handles missing fields, another crashes).
- Harder migrations when API changes shape.

---

## 9. Search Form Refactor with React Hook Form

The search form was refactored from manual field state (`useState` per input) to `react-hook-form`.

### What changed

- `app/components/RecipeSearchForm.tsx` now uses `useForm` for field registration and submit handling.
- Form fields are registered with `register(...)` instead of controlled `value` + `onChange` pairs.
- `app/search/page.tsx` no longer stores one state variable per input.
- The form submits a clean `SearchFilters` object to the page, and the page only stores submitted filters for SWR.

### Why this was done

- Reduce repetitive boilerplate and state wiring.
- Keep form logic in the form component instead of splitting it across form + page.
- Prepare the codebase for the next step (schema validation with Zod) with less rework.

### Pros

- Less code and fewer opportunities for sync bugs between UI inputs and submission state.
- Better separation of concerns: form state stays local to the form component.
- Easier to add validation rules and error messages incrementally.
- Better performance characteristics on larger forms due to uncontrolled input strategy.

### Cons / Tradeoffs

- Adds an external dependency and a small learning curve for the API (`register`, `handleSubmit`, `formState`).
- Slightly less straightforward for very simple forms where a couple of `useState` calls may be enough.
- Team consistency matters: mixing multiple form patterns can make the codebase harder to follow.

### Risks if not refactored

- Continued growth of repetitive state and handler code as filters increase.
- Higher chance of mismatch bugs between local field state and submitted query state.
- Harder adoption path for typed validation and richer form UX in the next upgrade steps.

---

## 10. Zod Schema Validation for Filters and Input Parsing

Add a shared Zod schema for both form validation and API query-param parsing.

### Why this is useful

- One source of truth for validation rules on client and server.
- Strong type inference (`z.infer`) keeps types synced with validation logic.
- Safer API boundary: reject malformed input before calling Spoonacular.

### Suggested implementation

- Create `app/schemas/searchFiltersSchema.ts`.
- Validate form values with `zodResolver` in React Hook Form.
- Validate incoming search params in the API route with `safeParse`.

### Tradeoffs

- Adds dependency and slight runtime parsing overhead.
- Requires team familiarity with Zod schema patterns.

### Risk if skipped

- Validation drift between UI and backend.
- Invalid params can leak into external API requests.

---

## 11. URL-Synced Search Filters

Search filters are now written to and read from the URL query string instead of local React state.

### What it means

Submitting the search form calls `router.push('/search?cuisine=italian&type=soup')` instead of `setState`. On load, `useSearchParams()` reads those params back — pre-filling the form and triggering the SWR fetch automatically.

### Why it's done

- **Shareability** — the URL fully describes the search, so it can be copied and shared.
- **Bookmarkable** — users can save specific searches.
- **Back/forward navigation** — browser history reflects each search, so the back button returns to the previous one.
- **Refreshable** — results survive a page reload.
- **Single source of truth** — URL drives both the form defaults and the SWR cache key, eliminating state duplication.

### Tradeoffs

- Slightly more code to sync URL, form defaults, and SWR key together.
- Form defaults only apply on initial mount; subsequent URL-driven navigations rely on the component remounting (back/forward) rather than dynamic re-initialization.

### Risk if skipped

- Any refresh or accidental tab close loses the search entirely.
- Back button skips out of the search page instead of returning to the previous search.
- Searches cannot be shared or linked.

---

## 12. Persist Last Search Criteria (localStorage)

The app stores the last submitted search filters in `localStorage` and allows restoring them via a `Load last search` button.

### Why this was done

- Improves return-user UX: users can quickly continue from their previous search without retyping filters.
- Complements URL state: URL remains source of current search, while storage keeps a convenience fallback.

### Pros

- Faster repeated searching and less friction.
- Works across refreshes and browser restarts.
- Simple implementation with small code footprint.

### Cons / Tradeoffs

- Introduces client-side persistence concerns (stale/invalid stored data).
- Requires validation/normalization before use.
- Must keep storage logic separate from form/UI logic to avoid coupling.

### Risk if skipped

- Users must re-enter filters after leaving or reloading the app.
- More repetitive input and weaker return-user experience.

---

## 16. Clear Folder Boundaries (`domain`, `ui`, `services`, `hooks`)

We clarified architecture boundaries so each folder has one responsibility.

### Why this was done

- Make code placement predictable as the project grows.
- Reduce mixing of business logic, UI rendering, and integration code.
- Make onboarding and refactors faster.

### What changed (in this project)

- Introduced domain-first folders for core business concepts:
  - `app/domain/favorites/FavoritesContext.tsx`
  - `app/domain/favorites/useFavorites.tsx`
  - `app/domain/search/searchFiltersSchema.ts`
- Removed old locations:
  - `app/context/FavoritesContext.tsx`
  - `app/hooks/useFavorites.tsx`
  - `app/schemas/searchFiltersSchema.ts`
- Updated imports in layout, components, search page/form, search storage/mappers, and API route to use new domain paths.

### Benefits

- Better separation of concerns and clearer ownership per file.
- Faster “where should this code go?” decisions.
- Lower risk of accidental coupling across features.

### When this practice is most useful

- Medium/large projects with multiple contributors.
- Projects expected to grow features over time.
- Codebases where mixed responsibilities already cause confusion.

### Tradeoff

- Short-term churn from moving files and updating imports.
- For very small apps, strict boundaries can feel heavier than needed.

### Domain layer — what it is

`domain` is the business layer of the app: core concepts, rules, and feature state that should remain valid even if UI framework or API transport changes.

### What goes into `domain`

- Feature models/types and validation schemas (for example search filter schema/types).
- Feature state and behavior (favorites state, toggle logic, selectors/helpers).
- Rules that describe **what the app does**, not **how it is displayed**.

### What should NOT go into `domain`

- Pure UI rendering (`components`, CSS, icons, layout details).
- External transport/integration concerns (HTTP client, retry, fetch wrappers, API mapping adapters).
- Generic infrastructure helpers not tied to business meaning.

### Practical examples from this repo

- Domain examples:
  - `app/domain/search/searchFiltersSchema.ts`
  - `app/domain/favorites/useFavorites.tsx`
  - `app/domain/favorites/FavoritesContext.tsx`
- Not domain examples:
  - `app/components/RecipeCard.tsx` (UI)
  - `app/services/spoonacularApi.ts` (integration)
  - `app/utils/fetchUtils.ts` (infrastructure)

### Quick placement rule (for future files)

- If file answers “what is the business rule/state?” → put it in `domain`.
- If file answers “how to render?” → put it in `ui/components`.
- If file answers “how to call/transform external systems?” → put it in `services`.

---

## 17. Unit & Component Testing with Vitest

We added a fast test setup with Vitest and covered core logic + key UI behavior.

### Why this was done

- Catch regressions early while refactoring architecture.
- Validate business logic (mappers/storage) separately from UI.
- Add confidence for future features and cleanup work.

### What changed

- Test tooling/config:
  - `vitest.config.ts`
  - `vitest.setup.ts`
  - `package.json` scripts: `test`, `test:watch`, `test:ui`
- Added unit tests:
  - `app/services/recipeMappers.test.ts`
  - `app/services/searchMappers.test.ts`
  - `app/utils/searchStorage.test.ts`
- Added component tests:
  - `app/components/FavoriteButton.test.tsx`
  - `app/components/RecipeSearchForm.test.tsx`

### Current coverage focus

- Data normalization safety and edge cases.
- Search filter mapping + storage persistence rules.
- Form submit behavior and “Load last search” UX path.
- Favorite button state/interaction behavior.

### Benefits

- Faster debugging and safer refactors.
- Better reliability of critical user flows.
- Clear executable examples of expected behavior.

### Tradeoffs

- More files to maintain as UI evolves.
- Tests can become brittle if tied too closely to markup.

### Practical guideline

- Keep most tests on pure logic (`services`, `utils`) for stability.
- Add component tests only for user-critical behaviors (submit, toggle, restore).
