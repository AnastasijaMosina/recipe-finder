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
