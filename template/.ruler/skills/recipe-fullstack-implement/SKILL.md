---
name: recipe-fullstack-implement
description: Use for medium or large fullstack features spanning backend, React frontend, shared contracts, migrations, API behavior, or E2E acceptance. Orchestrates requirements, codebase facts, docs, design-sync, plan, build, quality, review, and acceptance. NOT for single-tier small work; use recipe-task.
harness:
  tier: shared
  family: process
  gist: "Fullstack feature recipe: requirements, layer docs, design-sync, plan, vertical implementation, quality, and acceptance."
---

# Recipe: Fullstack Implement

## Purpose

Coordinate medium or large changes that span backend, frontend, shared
contracts, migrations, API behavior, or E2E acceptance.

## Non-Negotiables

- P0 safety and approval gates override this recipe.
- Do not skip requirements, codebase facts, design sync, planning, or approval.
- Cross-tier behavior must stay synchronized before and after implementation.
- Acceptance must be proven at the named user/API surface, not only by unit tests.

## Procedure

1. Run `requirements-analyzer`.
2. Run `codebase-analyzer` per affected tier.
3. Create or update backend, frontend, shared-contract, and e2e SPEC/design docs as needed.
4. Run `document-reviewer` for each document.
5. Run `design-sync`; stop on conflicts.
6. Run `recipe-plan`.
7. Stop for user approval before implementation.
8. Run `recipe-build` task by task.
9. Run `quality-runner`, P4 reviewers, `spec-steward` POST, `design-sync` POST, and `acceptance-verifier`.

P0 remains dominant throughout the recipe.

## Output

Return linked requirements/design artifacts, the implementation plan path,
design-sync verdicts, quality/reviewer verdicts, acceptance evidence, and open
risks.
