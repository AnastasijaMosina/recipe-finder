# AI Notes

This document tracks AI feature implementation decisions and progress.

## Scope Completed

Step 1 from `AI_IMPLEMENTATION_PLAN.md` was implemented:

- Define AI conversation contract first.

## What Was Done

A new AI domain contract file was added:

- `app/domain/ai/conversationContract.ts`

Implemented items:

1. `aiMissingSlotSchema`
   - Restricts missing slot names to known filter keys:
     - `cuisine`
     - `type`
     - `includeIngredients`
     - `excludeIngredients`
     - `maxReadyTime`

2. `aiConversationStateSchema`
   - Defines the conversation state shape:
     - `intentText`
     - `extractedFilters`
     - `missingSlots`
     - `followUpQuestions`
     - `isReadyToSearch`

3. `createInitialAiConversationState()`
   - Provides a stable default state for new conversations.

4. Parse helpers:
   - `parseAiConversationState(input)` for strict parsing.
   - `safeParseAiConversationState(input)` for non-throwing validation.

5. Contract alignment with current search logic:
   - `extractedFilters` reuses `searchQueryParamsSchema` from
     `app/domain/search/searchFiltersSchema.ts`.
   - `ExtractedAiFilters` is aliased to existing `RecipeSearchFilters`.

## Why It Was Done This Way

1. Single source of truth
   - One shared contract prevents mismatched shapes between UI, route handlers, and services.

2. Reuse existing validated filter schema
   - Avoids creating a second filter standard.
   - Keeps AI-driven filters compatible with the existing recipe search flow.

3. Safer AI integration
   - Strict schema + parse helpers make malformed model output easier to detect and handle.

4. Better maintainability and testing
   - Clear domain types make unit tests and later implementation steps simpler and more reliable.

## Notes

- No existing search behavior was changed.
- This step is a foundation for the next slice (AI API route skeleton).

## Simple Schema Example

Example when more information is still needed:

```json
{
  "intentText": "I want something fast with chicken",
  "extractedFilters": {
    "includeIngredients": "chicken",
    "maxReadyTime": "30"
  },
  "missingSlots": ["type", "cuisine"],
  "followUpQuestions": [
    "What meal type do you want (breakfast, lunch, dinner)?",
    "Any preferred cuisine?"
  ],
  "isReadyToSearch": false
}
```

Example when data is complete and ready to search:

```json
{
  "intentText": "Quick Italian chicken dinner under 30 minutes",
  "extractedFilters": {
    "cuisine": "italian",
    "type": "dinner",
    "includeIngredients": "chicken",
    "maxReadyTime": "30"
  },
  "missingSlots": [],
  "followUpQuestions": [],
  "isReadyToSearch": true
}
```

## Step 2 Progress: AI Feature Route Skeleton (BFF)

Implemented route:

- `app/api/ai/conversation/route.ts`

What this route does now:

1. Accepts a POST request with:
   - `conversationHistory`
   - `latestUserMessage`
2. Validates request payload with Zod.
3. Returns a stable response shape for the frontend:
   - `assistantReply`
   - `followUpQuestions`
   - optional `extractedFilters`
   - `isReadyToSearch`
4. Reuses centralized API error handling via `ApiError` and `errorResponse`.
5. Uses mocked/skeleton assistant logic only for now.

Why this was done now:

1. The frontend can integrate against a stable API contract before model integration.
2. API keys and provider logic remain server-side only (BFF pattern).
3. Validation and error behavior are standardized from day one.

## Knowledge: Step 3 - Create Prompt Strategy with Strict JSON Output

What was added:

- `app/domain/ai/aiProviderResponseSchema.ts` — Zod schema for the AI provider response shape (`assistantReply`, `followUpQuestions`, `extractedFilters`, `isReadyToSearch`).
- `app/services/ai/aiConversationPrompt.ts` — server-side prompt builder (`buildAiConversationPrompt`), safe response parser (`parseAiProviderResponse`), and mock provider helper (`createMockProviderJsonResponse`).
- `FALLBACK_ASSISTANT_RESPONSE` constant in the route returned when `safeParse` fails.

Why it was done:

- Strict JSON-only prompt and `safeParse` ensure malformed model output never causes an unhandled crash.
- Mock provider helper lets the route run end-to-end before a real AI provider is wired in.

Benefits:

- Every model response is validated at the boundary; invalid output falls back gracefully.
- Prompt template and schema live in dedicated files, making provider swap straightforward.

## Knowledge: Step 4 - Implement Slot-Filling Question Logic

What was added:

- `app/services/ai/slotFilling.ts` — three exported helpers: `detectMissingSlots`, `isReadyToSearch`, and `generateFollowUpQuestions`.
- `SLOT_QUESTIONS` map — one human-readable question per filter slot (`type`, `cuisine`, `includeIngredients`, `excludeIngredients`, `maxReadyTime`).
- `MINIMUM_REQUIRED_SLOTS` rule — at least one of `type` or `includeIngredients` must be filled before `isReadyToSearch` returns `true`.

Why it was done:

- Keeps readiness rules and question generation in a testable service layer, not scattered across the route or UI components.
- Replaces the hardcoded fallback question in the route with slot-derived questions.

Benefits:

- Adding or changing slot rules requires editing one file only.
- `isReadyToSearch` is now determined server-side by a deterministic rule, independent of whatever the AI provider returned.

## Knowledge: Step 5 - Build AI Chat Page and Navigation Entry

What was added:

- `app/ai/page.tsx` — new client chat page with message list, text input + send button, follow-up suggestion chips, and interpreted filters panel.
- `app/components/Header.tsx` — primary navigation now includes an `AI Chat` entry to `/ai`.
- `app/css/recipeSearch.css` — AI chat styles added for message bubbles, chip list, readiness pill, and mobile layout behavior.

Why it was done:

- Delivers a usable text-first AI flow before voice and full search-trigger integration steps.
- Keeps the UI aligned with existing page/header patterns and shared styling.

Benefits:

- Users can interact with the AI route immediately and see normalized filters/state evolve per turn.
- Follow-up prompts and interpreted filters are visible in one place, making slot-filling behavior easier to validate.

## Knowledge: Step 5.5 - Interim Conversation Extraction Fix

What was added:

- `app/services/ai/ruleBasedFilterExtractor.ts` — lightweight parser that extracts `type`, `cuisine`, `includeIngredients`, `excludeIngredients`, and `maxReadyTime` from user conversation text.
- `app/api/ai/conversation/route.ts` now merges parsed filters from `conversationHistory` + `latestUserMessage` instead of relying on the mock provider payload.
- Route follow-up logic now uses slot-derived questions only, and returns a ready-to-search assistant message when required slots are filled.

Why it was done:

- The mock provider currently returns empty `extractedFilters`, which caused repeated follow-up questions even after users provided valid answers (for example, `dinner`).
- An interim deterministic parser keeps the chat flow usable until real model extraction is integrated.

Benefits:

- User answers now update interpreted filters across turns, so the same question is not asked repeatedly.
- Readiness transitions are now aligned with actual conversation content, improving local testing and demo reliability.

## Knowledge: Step 7 - Connect AI Readiness to Existing Search API

What was added:

- `app/services/ai/aiSearchAdapter.ts` with `mapAiFiltersToSearchParams`, which normalizes AI-extracted filters into the existing search query shape.
- `app/ai/page.tsx` now triggers recipe search through `spoonacularApi.searchRecipes` when `isReadyToSearch` is true and normalized filters are present.
- `app/ai/page.tsx` now renders existing `SearchResults` (and existing `ErrorMessage`) so recipe output reuses the same UI path as the search page.

Why it was done:

- Avoids creating a parallel backend/frontend path for AI results.
- Keeps query normalization deterministic before calling the existing recipe endpoint.

Benefits:

- AI chat now transitions directly from readiness to real recipe results.
- Search rendering behavior remains consistent with the existing search experience.
