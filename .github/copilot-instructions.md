# Copilot Instructions

Use these guidelines when generating or editing code in this workspace.

## Project Shape

- Prefer the App Router and keep route-specific UI under `app/`.
- Use this folder structure when adding new code:
  - `app/components/` for reusable UI pieces and skeletons.
  - `app/services/` for API integration, normalization, and mapping.
  - `app/domain/` for feature state, validation schemas, and business rules.
  - `app/utils/` for cross-cutting helpers like fetch, storage, and error handling.
  - `app/hooks/` for reusable React hooks.
  - `app/context/` or `app/domain/*` for shared client state, with small focused contexts.
  - `app/schemas/` only if the repo already uses that location; otherwise keep schemas in `app/domain/`.

## Framework Conventions

- Use Next.js App Router patterns and keep server components by default.
- Add `use client` only when a component needs browser-only APIs, local state, or event handlers.
- Use React Hook Form for forms instead of manual field state.
- Use Zod for schema validation and infer types from the schema when possible.
- Use SWR for client-side request caching, deduplication, and query state.

## Architecture Rules

- Prefer the BFF pattern: browser code should call internal route handlers, not third-party APIs directly.
- Keep secrets server-only. Do not expose API keys through `NEXT_PUBLIC_*` variables unless the key is explicitly intended for the browser.
- Centralize API error handling so route handlers return a consistent response shape.
- Normalize external API responses in the service layer before UI components consume them.
- Keep UI components focused on rendering; do not mix rendering with fetch logic, data mapping, or persistence logic when a lower layer can own it.

## Data Flow

- Home page: fetch a random recipe through the service layer, then render a featured card.
- Search page: read filters from the URL, validate them with Zod, fetch through SWR, and render the result list.
- Favorites: store data in localStorage through a small hook/context layer, then read it in UI components.

## Performance Guidance

- Memoize expensive list items and result containers when props stay stable across rerenders.
- Use `next/image` for recipe images and provide `sizes` so the browser can pick the right asset.
- Prefer skeleton loading states over blank screens or spinners when the layout is known.

## Testing Guidance

- Add or update Vitest tests for mapping, storage, and other pure logic.
- Add component tests when behavior matters more than markup.
- Keep Playwright coverage for the main user flow: search, favorite, and verify favorites.

## Writing Style

- Keep changes minimal and aligned with the existing codebase.
- Reuse the current naming conventions and directory boundaries.
- Avoid introducing new abstractions unless they clearly reduce duplication or improve isolation.