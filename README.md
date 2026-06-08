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

Then regenerate your agent config:

```bash
npx ruler apply
```

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
└── skills/                # guides — the union of both stacks:
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

The `quality-gates` skill ships ready-to-copy CI + pre-commit templates (`templates/ci.yml`,
`templates/pre-commit`) so the practices the skills *teach* become a gate the toolchain
*enforces*: typecheck, lint, unit tests, and the Playwright FE↔BE seam run on every PR and
block a red merge. Skills and review agents steer the model *before* it acts; the gate is the
deterministic backstop that catches what advice doesn't. Copy them into `.github/workflows/`
and `.husky/` to turn that guidance into enforcement.

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
| `--dry-run` | `update` | Report what would change without writing anything. |
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

`update` requires `git`, `npm`, and `tar` on `PATH`. `init` has no such requirements.
The shipped template is text-only.

## License

[MIT](./LICENSE) © TierOne Studio
