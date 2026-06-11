## AI Workflows

This file indexes the repo's agentic workflow automations.

### CI Doctor

- **Path**: [.github/workflows/ci-doctor.md](.github/workflows/ci-doctor.md)
- **Purpose**: Investigate failed GitHub Actions runs and produce actionable remediation guidance.
- **Trigger**: `workflow_run` on failure for monitored workflows on `main`.
- **Behavior**: Deduplicates repeated runs, inspects failed jobs and logs, checks prior investigations, and records findings for future runs.
- **Output**: Investigation report, issue/comment actions when warranted, and cached failure-pattern knowledge.

### Documentation Rules

1. Keep this file as the entry point for agentic workflow references.
2. Record only workflows that are actually implemented in the repo.
3. Link to the executable workflow file or agent definition directly.
