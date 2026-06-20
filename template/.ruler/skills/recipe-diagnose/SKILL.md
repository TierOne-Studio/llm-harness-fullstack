---
name: recipe-diagnose
description: Use as the workflow recipe when the user asks to diagnose, root-cause, reproduce, or isolate a bug/failing test/flaky CI/production-like symptom before fixing it. Sequences bug-investigation plus evidence capture, then routes into recipe-task or recipe-plan. NOT for straightforward planned implementation.
harness:
  tier: shared
  family: process
  gist: "Diagnosis recipe: reproduce, isolate root cause, gather evidence, then route to task or plan."
---

# Recipe: Diagnose

## Procedure

1. Load `bug-investigation` and `failure-mode-analysis`.
2. Reproduce the symptom or record why reproduction is blocked.
3. Identify the smallest failing command or evidence source.
4. Isolate root cause before proposing a fix.
5. Route the fix through `recipe-task` for focused changes or `recipe-plan` for larger changes.
6. Preserve the regression test as part of the fix.

P0 remains dominant throughout the recipe.
