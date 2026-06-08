---
name: quality-gates
description: Use when setting up or reviewing the repo's CI pipeline, pre-commit hooks, or merge gates — a GitHub Actions workflow + husky/lint-staged that run typecheck, lint, unit tests, and the Playwright e2e seam on every push/PR. Ships ready-to-copy templates. The point is DETERMINISTIC enforcement at the gate: skills steer the model before it acts, but a green pipeline is what actually blocks a regression from merging. NOT for writing application code (use the stack skills) or for the harness's own template tests.
---

# Quality Gates — CI + pre-commit (deterministic enforcement)

The skills and review agents in this harness are **advisory**: they steer the model, but a model can skip a skill, mis-route, or rubber-stamp its own `Confidence:` line. The quality gate is **not advisory** — it runs on every push/PR and blocks the merge when typecheck, lint, tests, or the FE↔BE e2e seam fail. Use it to make the best practices the rest of this harness *teaches* into rules the toolchain *enforces*.

> Ready-to-copy templates live in `templates/`. They use generic monorepo npm-workspace scripts (`lint`, `build`, `test`, `test:e2e`) with `--if-present`, so they adapt to any repo — rename the scripts to match yours.

## What the gate enforces (and which skill it makes non-optional)

| Stage | Enforces | Makes non-optional |
|---|---|---|
| `npm ci` + `build` | strict TypeScript compiles across every workspace — no `any`-to-silence reaching `main` | P9 typing, `typescript-advanced-types` |
| lint | the repo's lint rules (style + any rule-as-error you add over time) | `repo-conventions`, `code-simplifier`, `cyclomatic-complexity` |
| unit tests | every workspace's suite is green (frontend Vitest + backend Jest) | `tdd-workflow`, `react-testing`, `nestjs-best-practices` test rules |
| e2e seam | the FE↔BE contract actually holds end to end | `repo-conventions` § 17 (shared contract), `playwright-best-practices` |

A red gate blocks the merge **regardless of what the model claimed**. That is the whole point: it's the deterministic backstop behind P4's review agents and P8's confidence rubric.

## CI workflow (`templates/ci.yml`)

Copy to `.github/workflows/ci.yml`. Two jobs so the fast checks fail quickly while the slow e2e runs in parallel:
- **checks** — install → lint → build (typecheck) → unit tests.
- **e2e** — install → Playwright (the FE↔BE seam; the consumer's `test:e2e` script is expected to start the app, e.g. via Playwright's `webServer`).

It triggers on every PR and on push to `main`, cancels superseded runs, and runs on the Node version your repo standardizes on. Each step uses `--if-present`, so a workspace missing a given script degrades gracefully instead of failing — wire the scripts you actually have.

## Pre-commit (`templates/pre-commit`)

A fast LOCAL gate so a broken commit never even reaches CI. It uses husky + lint-staged to lint/format only **staged** files (seconds, not minutes); the heavy typecheck/test/e2e stay in CI where they belong.

Setup:
```bash
npm i -D husky lint-staged
npx husky init                                   # creates .husky/
cp .ruler/skills/quality-gates/templates/pre-commit .husky/pre-commit
```
Add to the root `package.json`:
```json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
}
```

## Discipline

- **The gate is the boundary, not a suggestion.** Never merge red. Never `--no-verify` past the pre-commit hook — that is the deterministic equivalent of a forbidden TDD waiver (`tdd-workflow` § Waivers).
- **Keep it fast.** Pre-commit = staged-file lint only. CI = the full matrix. If CI creeps past ~10 min, shard or parallelize rather than dropping coverage.
- **Promote recurring findings into rules.** Every review finding that *can* be a lint or type error should become one over time — that moves it from "the agent should catch it" to "the build catches it." Feed these from `meta-skill-hygiene` / `lessons-curator`.

## Cross-references

- `tdd-workflow` — the tests this gate runs; a green gate is NOT a TDD waiver.
- `git-workflow` — the branch/PR flow the gate hooks into (the gate enforces P0.1 "no broken merge to `main`" deterministically).
- `playwright-best-practices` — the e2e seam job.
- `repo-conventions` § 17 (shared contract) and § 18 (per-tier test layout) — what the gate validates.
