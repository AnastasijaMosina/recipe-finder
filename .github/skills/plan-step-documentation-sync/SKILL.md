---
name: plan-step-documentation-sync
description: 'Use when an AI implementation plan step has just been completed and project documentation must be updated. Updates AI_IMPLEMENTATION_PLAN.md status and adds a concise learning note to NOTES-AI.md.'
---

# Plan Step Documentation Sync

Use this skill immediately after finishing any step from AI_IMPLEMENTATION_PLAN.md.

## Goal

Keep implementation status and learning notes synchronized so progress is visible and future review is easier.

## Required Inputs

1. Completed step number and title.
2. Summary of what changed (files + behavior).
3. Why the approach was chosen.
4. Main benefit or risk reduction.

## Workflow

1. Identify the completed step in AI_IMPLEMENTATION_PLAN.md.
2. Mark the step heading as done by appending `✅`.
3. Open NOTES-AI.md.
4. Add or update a short section for the completed step using the template below.
5. Keep the section concise and revision-friendly (short bullets, no long prose).
6. Ensure statements are factual and match implemented code.

## Knowledge Section Template (NOTES-AI.md)

Use this exact structure per completed step:

```md
## Knowledge: Step <N> - <Title>

What was added:

- <1-3 concrete additions>

Why it was done:

- <1-2 reasons>

Benefits:

- <1-3 practical outcomes>
```

## Quality Rules

- Do not mark a step complete unless implementation is already present in code.
- Keep wording implementation-focused, not aspirational.
- Prefer reusable lessons over temporary details.
- Keep each Knowledge section short but informative.
