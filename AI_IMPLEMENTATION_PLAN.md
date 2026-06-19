# AI Chat + Voice Implementation Plan

A practical, incremental roadmap to add an AI-assisted recipe discovery flow where users can type or speak cravings, answer follow-up questions, and receive recipe results.

## Goal

Build an AI conversation experience that:

1. Accepts typed input and voice input.
2. Shows recognized text back to the user.
3. Asks follow-up questions to fill missing search details.
4. Converts conversation answers into search filters.
5. Calls the existing recipe API flow and renders results.

---

## Step-by-Step Plan

## 1. Define AI Conversation Contract First ✅

Add:

1. A domain model for conversation state:
   1. User intent text
   2. Extracted filters
   3. Missing slots
   4. Follow-up questions
   5. Readiness flag

Change:

1. No existing search behavior yet.

Remove:

1. Nothing.

Why:

1. Strong types up front prevent unclear UI/API behavior later.

---

A very simple contract example:

{
"intentText": "I want a quick spicy chicken dinner",
"filters": {
"cuisine": null,
"type": "dinner",
"includeIngredients": ["chicken"],
"excludeIngredients": [],
"maxReadyTime": 30
},
"missingSlots": ["cuisine"],
"followUpQuestions": ["What cuisine do you prefer?"],
"isReadyToSearch": false
}

What each field means (plain language):

intentText: what the user said.
filters: structured values your existing search API understands.
missingSlots: required fields still empty.
followUpQuestions: what assistant should ask next.
isReadyToSearch: true only when you have enough info to run search.

## 2. Add AI Feature Route Skeleton (BFF Pattern) ✅

Add:

1. New server route under app/api for AI orchestration.
2. Route input:
   1. Conversation history
   2. Latest user message
3. Route output:
   1. Assistant reply text
   2. Follow-up questions array
   3. Optional extracted filters
   4. isReadyToSearch boolean

Change:

1. Reuse centralized error formatting from existing API utilities.

Remove:

1. Nothing.

Why:

1. Keeps model keys and provider calls server-side only.

---

## 3. Create Prompt Strategy with Strict JSON Output ✅

Add:

1. Server-side prompt template requesting strict JSON only.
2. Zod schema for AI response parsing.

Change:

1. Parse every model response with safeParse.
2. Return a fallback assistant message if parsing fails.

Remove:

1. Any free-form parsing approach.

Why:

1. Deterministic output shape makes the feature reliable.

---

## 4. Implement Slot-Filling Question Logic

Add:

1. Mapper from free text to existing filter shape:
   1. cuisine
   2. type
   3. includeIngredients
   4. excludeIngredients
   5. maxReadyTime
2. Rule set for required minimum data before searching.

Change:

1. Keep question generation and readiness rules in domain/service logic, not UI components.

Remove:

1. Hardcoded assumptions inside components.

Why:

1. Business logic stays testable and reusable.

---

## 5. Build AI Chat Page and Navigation Entry

Add:

1. New AI page route.
2. Chat UI components:
   1. Message list
   2. Text input and send button
   3. Follow-up suggestion chips/buttons
   4. Interpreted filters panel

Change:

1. Add AI entry in header navigation.
2. Reuse existing styling conventions.

Remove:

1. Nothing.

Why:

1. Adds a new feature without disturbing existing search page behavior.

---

## 6. Add Voice Input (Speech-to-Text)

Add:

1. Client hook around browser SpeechRecognition:
   1. start/stop listening
   2. transcript text
   3. permission and error states
2. Voice button in chat input area.

Change:

1. On transcript complete, populate input and submit via the same text flow.

Remove:

1. Nothing.

Why:

1. Voice becomes a progressive enhancement over the same conversation pipeline.

---

## 7. Connect AI Readiness to Existing Search API

Add:

1. Adapter that maps extracted AI filters into current recipe search params.

Change:

1. When isReadyToSearch is true, trigger existing recipe search endpoint via existing service layer.
2. Reuse existing search results rendering components where possible.

Remove:

1. Duplicate result rendering logic if reused components are available.

Why:

1. Avoids creating a second recipe backend path.

---

## 8. Add Focused Conversation State Management

Add:

1. Local reducer or specialized AI context for conversation state only.

Change:

1. Keep context specialized, aligned with current multi-context approach.

Remove:

1. Temporary scattered state once reducer/context is ready.

Why:

1. Keeps architecture clean and scalable.

---

## 9. Add Optional Persistence for Last AI Session

Add:

1. Local storage utility for:
   1. Recent messages
   2. Extracted filter state

Change:

1. Restore state on page reload if desired.

Remove:

1. Nothing.

Why:

1. Better UX continuity, similar to existing saved search behavior.

---

## 10. Add Tests in a Stable Order

Add:

1. Unit tests:
   1. AI response schema parsing
   2. Slot-filling mapper
   3. Filter adapter output
2. Component tests:
   1. Chat submit flow
   2. Follow-up click behavior
   3. Voice unsupported fallback rendering
3. E2E test:
   1. Type/speak intent -> follow-up -> answers -> recipe results

Change:

1. Assert outcomes and structure, not exact assistant wording.

Remove:

1. Fragile text-exact assertions tied to model phrasing.

Why:

1. Makes tests resilient for AI-assisted behavior.

---

## 11. Add Guardrails and Observability

Add:

1. Minimal route-level logging:
   1. Latency
   2. Parse failures
   3. Provider error classes
2. Turn/token limits to avoid runaway usage.

Change:

1. Convert provider failures to safe, user-friendly responses.

Remove:

1. Raw provider error leakage.

Why:

1. Improves reliability and production readiness.

---

## 12. Document and Roll Out

Add:

1. README section for:
   1. AI architecture
   2. Required environment variables
   3. Browser support notes for voice
2. Notes entry describing lessons and decisions.

Change:

1. Update app metadata if needed to reflect AI feature.

Remove:

1. Any outdated setup notes once AI flow is complete.

Why:

1. Keeps team-facing documentation aligned with implementation.

---

## Recommended Implementation Slices

Use small PR-sized slices so you can learn and verify each stage:

1. Slice 1: AI contract + schema + API route skeleton
2. Slice 2: Text-only chat UI
3. Slice 3: Slot filling + search trigger + results
4. Slice 4: Voice input integration
5. Slice 5: Tests + docs + polish

---

## Definition of Done

Feature is complete when:

1. User can type or speak a craving.
2. App displays captured text in chat.
3. App asks contextual follow-up questions.
4. Answers produce normalized filters.
5. Existing recipe endpoint is called with those filters.
6. Recipe results are shown in UI.
7. Errors are user-friendly and schema-validated.
8. Unit, component, and e2e tests pass.
9. Documentation is updated.
