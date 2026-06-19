---
name: recipe-add-integration-tests
description: Use when adding integration or E2E tests from acceptance criteria, risk surfaces, or existing behavior. Selects minimal high-value tests and verifies non-vacuity. NOT for unit-only test changes.
harness:
  tier: shared
  family: process
  gist: "Integration-test recipe: select minimal high-value integration/E2E tests and verify non-vacuity."
---

# Recipe: Add Integration Tests

## Procedure

1. Read acceptance criteria, SPECs, and changed surfaces.
2. Choose the proving layer: integration, fixture e2e, or service-backed e2e.
3. Prefer the smallest test that proves observable behavior.
4. Add a regression test that would fail if the behavior were reverted.
5. Run the test and then the relevant broader suite.
6. Use `acceptance-verifier` when user-facing/API behavior is involved.

P0 remains dominant throughout the recipe.
