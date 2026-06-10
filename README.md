# @tierone/llm-harness-fullstack

An **LLM agent harness** for fullstack (**NestJS + React**) monorepos, distributed as an installable `.ruler/` payload. It is the union of [`@tierone/llm-harness-nest`](https://github.com/TierOne-Studio/llm-harness-nest) and [`@tierone/llm-harness-react`](https://github.com/TierOne-Studio/llm-harness-react) — the backend skills, the frontend skills, the shared engineering disciplines, and dual-tier review agents — in one harness for a monorepo that ships both tiers (e.g. a [fullstack-base](https://github.com/TierOne-Studio/fullstack-base)-style `apps/api` + `apps/web` + `packages/contracts` layout).

> In the sense of [Martin Fowler's *Harness Engineering*](https://martinfowler.com/articles/harness-engineering.html):
> `Agent = Model + Harness`. The harness is everything around the model — the
> **guides** (skills, instructions, conventions) that steer it *before* it acts,
> and the **sensors** (review agents) that catch problems *after*. This package
> ships that harness so you can drop it into any React + NestJS monorepo.

It installs into your project's `.ruler/` directory, which [ruler](https://github.com/intellectronica/ruler)
fans out to `CLAUDE.md`, `AGENTS.md`, `.github/copilot-instructions.md`, Cursor, etc.

## Install

This is **not** a runtime dependency. It copies files into your repo and gets out
of the way — nothing is left in `node_modules`.

```bash
# First time — creates ./.ruler and copies the harness in
npx @tierone/llm-harness-fullstack init

# Later — pull a newer harness version, merging your local edits (3-way)
npx @tierone/llm-harness-fullstack update
```

Then regenerate your agent config with [ruler](https://github.com/intellectronica/ruler).
Use the **scoped** package name — the bare `ruler` on npm is an unrelated package with no
executable, so plain `npx ruler apply` fails with *"could not determine executable to run"*:

```bash
npx @intellectronica/ruler apply
```

> **Tip:** to keep typing the short `ruler` command, add it to your project once —
> `npm i -D @intellectronica/ruler` — after which `npx ruler apply` resolves to the
> local binary instead of the unrelated public package.

## What you get

```
.ruler/
├── instructions.md        # the senior-engineer operating profile (P0–P9), monorepo-aware
├── ruler.toml             # ruler fan-out config (claude / copilot / codex / cursor / windsurf)
├── agents/                # dual-tier review subagents (sensors) — review both apps/web and apps/api
│   ├── architect-reviewer.md
│   ├── code-reviewer.md
│   ├── qa-validator.md
│   ├── security-reviewer.md
│   └── lessons-curator.md
└── skills/                # guides — the union of both stacks. 54 skills in 7
                           # families; see skills/README.md for the visual catalog
                           # (mindmap + grouped tables — the dirs stay flat because
                           # agent runtimes discover skills as skills/<name>/SKILL.md):
                           #   process: tdd-workflow, design-review, plan-mode, bug-investigation,
                           #            failure-mode-analysis, decision-rules, repo-conventions,
                           #            quality-gates, …
                           #   frontend: react-patterns, react-state-management, react-routing,
                           #            react-data-fetching, react-forms, accessibility,
                           #            frontend-security, vite, vitest, shadcn, tailwind-v4-shadcn, …
                           #   backend: nestjs-best-practices, nestjs-clean-architecture,
                           #            nestjs-patterns, nodejs-best-practices,
                           #            database-transactions, db-write-protocol
```

The `repo-conventions` skill ships as a fill-in skeleton covering **both** tiers (frontend
feature layout / state / routing / auth, backend module layout / authz / persistence) **plus**
the shared-contract seam — fill it in with your project's actual choices.

The `quality-gates` skill ships ready-to-copy CI + pre-commit + permission templates
(`templates/ci.yml`, `templates/pre-commit`, `templates/claude-settings.json`) so the
practices the skills *teach* become a gate the toolchain *enforces*: typecheck, lint, unit
tests, and the Playwright FE↔BE seam run on every PR and block a red merge, and Claude
Code's own permission system denies pushes to `main` and prompts on publish/deploy/DB-write
commands. Skills and review agents steer the model *before* it acts; the gates are the
deterministic backstop that catches what advice doesn't. Copy them into `.github/workflows/`,
`.husky/`, and `.claude/` to turn that guidance into enforcement.

## Commands

| Command | What it does |
|---|---|
| `init` | Copy the harness into `./.ruler` (creates it if missing). Refuses if already installed — use `update`. |
| `update` | 3-way-merge a newer version into `./.ruler`, preserving your local edits. |
| `version` | Print the installed package version. |
| `help` | Usage. |

### Flags

| Flag | Applies to | Effect |
|---|---|---|
| `--force` | `init` | Overwrite an existing `.ruler` (unrelated files are preserved). |
| `--force` | `update` | Overwrite instead of merge — needs no `git`/`npm`/`tar`. Your edits to harness-shipped files are lost; files you created are kept. The escape hatch when the recorded base version can't be downloaded. |
| `--dry-run` | `update` | Report what would change without writing anything. Exits `1` if the merge would conflict, so it works as a CI check. |
| `--cwd DIR` | both | Operate on `DIR` instead of the current directory. |

## How `update` works (3-way merge)

On `init`, a sentinel `.ruler/.harness-version.json` records the installed version.
On `update`:

1. The **BASE** (the version you last installed) is downloaded via `npm pack`.
2. Each file is reconciled across **BASE → your local copy → the new version**
   using `git merge-file` — the same engine git uses for merges.
3. **Your edits and upstream edits both survive** when they don't overlap.
4. **Overlapping edits** leave standard `<<<<<<<` conflict markers, the conflicted
   files are listed, and the version is **not** advanced until you resolve them and
   re-run `update`.
5. Files you created yourself (never shipped by the harness) are left untouched.

`update` requires `git`, `npm`, and `tar` on `PATH` (`update --force` and `init` have
no such requirements). The shipped template is text-only.

## Supported model floor (measured)

Both eval layers were baselined on a cost-floor model (Haiku 4.5) and a consumer-grade
model (Sonnet 4.6), 3-vote majority per adherence case. Measured result: **skill routing
is perfect on both tiers** (mean recall 1.000, 32/32 prompts), and gate adherence is
**1.000 on Sonnet** vs **0.952 on Haiku** — Haiku's one failing gate is the approval
pause on branch creation, and several of its passes are split votes (2/3), i.e. marginal.
The marginal layer on both tiers is exact-literal-string emission (the verbatim
`Awaiting approval (…)` line, the exact waiver phrases): models reliably *do* the gated
behavior but less reliably emit the mandated token. This is why command-shaped gates
belong to the deterministic permission layer (`quality-gates` →
`templates/claude-settings.json`) with the prose protocol as fallback — that division is
by design. Practical floor: **Sonnet-class for full prose-gate fidelity; Haiku-class is
sufficient when the deterministic permission layer is installed** (it owns exactly the
gates Haiku fumbles).

## Evals (how the harness proves itself)

Two layers of self-test guard the shipped template:

- **Deterministic** (`npm run test:harness`): structural acceptance suite (frontmatter,
  cross-reference integrity, project-agnosticism, write-scope guard, instruction budget,
  skill-size ceilings) + a keyword-level skill-trigger simulation. Zero cost, runs everywhere.
- **Live-model** (`npm run eval`, see [`eval/`](./eval/README.md)): a routing eval (does a
  model route canonical prompts to the right skills, given the shipped catalog?) and a
  gate-adherence eval (under the full `instructions.md`, does it actually emit the approval
  pause, waiver phrases, tier routing, and path declaration?). Scores gate against the
  committed `eval/baseline.json`; the scripts self-skip when no `ANTHROPIC_API_KEY` or
  `claude` CLI is available. After an intended behavioral change, re-run with
  `--update-baseline` and commit the diff — that diff is the evidence of impact.

## License

[MIT](./LICENSE) © TierOne Studio
