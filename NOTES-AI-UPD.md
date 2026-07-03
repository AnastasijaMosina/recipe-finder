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

- No existing search behavior was changed — all AI features run on a parallel code path.
- Steps 1–5 and 8–9 from `AI_IMPLEMENTATION_PLAN.md` are implemented:
  - Step 1: conversation contract + Zod schemas + parse helpers.
  - Step 2: BFF API route skeleton with stable response shape.
  - Step 3: strict JSON prompt strategy + safe provider response parsing.
  - Step 4: slot-filling logic (`slotFilling.ts`) + rule-based filter extractor (`ruleBasedFilterExtractor.ts`).
  - Step 5: chat page (`app/ai/page.tsx`) with message list, input, possible-answer chips, and interpreted-filters panel.
  - Step 8: AI-to-search adapter (`aiSearchAdapter.ts`) — routes normalized filters through `normalizeSearchFilters` and triggers SWR fetch when `isReadyToSearch` is true.
  - Step 9: conversation state managed via `useReducer` inside `AiConversationContext.tsx`; context exposes typed actions (`set_input`, `start_submit`, `apply_assistant_response`, `set_error`, `finish_submit`).
- Step 6 (Multilanguage Conversation Support) is **not yet started** — next step.
- Step 7 (Voice Input) is **skipped** — will be implemented separately.
- Steps 10–13 (tests, guardrails, docs/rollout) are **pending**.

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

## Step 3 Progress: Strict JSON Prompt + Safe Parsing

Added files:

- `app/domain/ai/aiProviderResponseSchema.ts`
- `app/services/ai/aiConversationPrompt.ts`

Updated file:

- `app/api/ai/conversation/route.ts`

What was added in Step 3:

1. A strict Zod schema for provider output:
   - `assistantReply`
   - `followUpQuestions`
   - optional `extractedFilters`
   - `isReadyToSearch`
2. A server-side prompt builder that instructs the model to return strict JSON only.
3. A parser function that:
   - `JSON.parse`s raw model text
   - validates it with `safeParse`
4. Route fallback behavior:
   - if parse/validation fails, return a safe fallback assistant message.

Why this matters:

1. The route becomes deterministic even when model output is unreliable.
2. Frontend consumers always receive a stable contract shape.
3. This reduces breakage risk before real provider integration.

## Knowledge: Step 3 - Strict JSON Prompt + Safe Parsing

What was added:

- `app/domain/ai/aiProviderResponseSchema.ts` with strict provider output validation.
- `app/services/ai/aiConversationPrompt.ts` to enforce JSON-only provider responses.
- Route parsing + fallback handling in `app/api/ai/conversation/route.ts`.

Why it was done:

- AI model output can be inconsistent, so server-side contract enforcement is needed.
- The frontend requires a predictable payload shape for reliable rendering and flow control.

Benefits:

- Reduces runtime failures from malformed provider text.
- Keeps API responses stable even when provider output is invalid.
- Improves maintainability by centralizing prompt and schema responsibilities.
