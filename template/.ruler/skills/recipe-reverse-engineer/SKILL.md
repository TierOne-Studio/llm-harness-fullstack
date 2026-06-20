---
name: recipe-reverse-engineer
description: Use when existing behavior lacks docs and the user wants PRD, SPEC, architecture, or workflow documentation derived from code. Produces docs from verified code facts without changing behavior. NOT for implementing new behavior.
harness:
  tier: shared
  family: process
  gist: "Reverse-engineering recipe: generate verified docs from existing code behavior."
---

# Recipe: Reverse Engineer

## Purpose

Generate PRD, SPEC, architecture, or workflow documentation from existing code
without changing behavior.

## Non-Negotiables

- P0 safety and approval gates override this recipe.
- Do not change application behavior.
- Distinguish confirmed behavior from inferred behavior.
- Run `document-reviewer` before treating the documentation as ready.

## Procedure

1. Run `codebase-analyzer` on the target surface.
2. Read existing tests and runtime entry points.
3. Produce documentation that distinguishes confirmed behavior from inferred behavior.
4. Run `document-reviewer`.
5. Do not change application behavior.

P0 remains dominant throughout the recipe.

## Output

Return the documentation paths, confirmed behavior evidence, inferred behavior
notes, reviewer verdict, and remaining documentation gaps.
