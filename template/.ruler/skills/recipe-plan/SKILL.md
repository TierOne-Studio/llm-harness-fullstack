---
name: recipe-plan
description: Use when approved requirements, SPECs, or design docs need to be converted into an implementation plan with tasks, tests, risk notes, and verification commands. NOT for writing code directly.
harness:
  tier: shared
  family: process
  gist: "Planning recipe: turn approved docs into executable tasks with tests, risks, and verification commands."
---

# Recipe: Plan

## Purpose

Produce an implementation plan that another agent can execute task by task.

## Non-Negotiables

- P0 safety and approval gates override this recipe.
- The plan must name exact files, tests, commands, and review gates.
- Each task must be independently testable.
- No task may require broad write-capable subagents.

## Procedure

1. Read approved requirements, SPECs, ADRs, and design docs.
2. Map touched surfaces to tiers: frontend, backend, shared contract, e2e, docs, harness payload, evals.
3. Split tasks by independently reviewable deliverables.
4. For each task, include files, interfaces, failing test, implementation notes, verification command, and approval-gated commit command.
5. Include final validation: `npm test`, `npm run test:harness`, `npm run catalog:check`, and targeted evals when workflow behavior changes.

## Output

A Markdown plan under the repo's plan location with checkbox steps.
