# Workflow and Agent Recommendations

Deep-dive comparison of `llm-harness-fullstack` against
[`shinpr/claude-code-workflows`](https://github.com/shinpr/claude-code-workflows),
with recommendations for improving workflow clarity, separation of concerns,
planning/documentation rigor, and code quality controls.

Source snapshot for the comparison:

- Local repo: `@tierone/llm-harness-fullstack` `0.1.1`
- Upstream reference: `shinpr/claude-code-workflows` `v0.21.1`
  (`53ee7ce5e148dd5edee9a4ef59e0a4f43f6a5355`, latest release visible on
  GitHub as of 2026-06-19)
- Local measured state, current before implementation: catalog check passes
  with `44` skills in `6` families, `7` review subagents, routing/adherence
  baselines committed in `eval/baseline.json`
- Reference measured shape: `30` skills and `25` fullstack agents in the cloned
  source tree, including recipe entry points and lifecycle-stage specialists

## Implementation Status

This recommendation has an implementation branch and plan:
`docs/superpowers/plans/2026-06-19-workflow-recipes-plan.md`.
Progress should be tracked task by task against that plan.

## Executive Recommendation

Do not replace `llm-harness-fullstack` with `claude-code-workflows`. The local
harness already has stronger distribution, multi-tool portability, safety
gates, deterministic acceptance checks, live-model routing/adherence evals,
mutation testing, and update semantics. Those are the hard parts for long-term
reliability.

The reference project is stronger at explicit end-to-end workflow orchestration:
recipes, requirement analysis, PRD/design/work-plan staging, codebase analysis,
task decomposition, executor/fixer loops, design sync, and reverse-engineering
flows. The best path is to add a small recipe/workflow layer to this harness,
then measure it with the existing eval machinery.

Recommended direction:

1. Add workflow recipes as first-class skills with a `workflow-*` or `recipe-*`
   prefix.
2. Add a few missing planning/documentation agents, not 25 agents.
3. Keep the main agent as the only normal code writer unless a runtime supports
   bounded implementation subagents with enforceable write scopes.
4. Preserve this repo's core quality model: explicit gates, same skill body used
   as guide and rubric, deterministic tests, live evals, mutation tests, and
   committed baselines.

## Simulated Target-State Comparison

This table models the expected state if all recommendations in this document are
implemented and then validated with this repo's deterministic tests, live evals,
and mutation tests. It is a planning simulation, not a claim that the target
metrics already exist.

| Capability | Current `llm-harness-fullstack` | `claude-code-workflows` reference | Simulated state after all recommendations | Expected quality impact |
|---|---|---|---|---|
| Workflow clarity | Medium-high: fast/full path and workflow chains exist, but entry points are embedded in `instructions.md`. | High: recipe skills make build, review, diagnose, reverse-engineer, and fullstack flows explicit. | Very high: `recipe-task`, `recipe-design`, `recipe-plan`, `recipe-build`, `recipe-review`, `recipe-fullstack-implement`, `recipe-diagnose`, and `recipe-reverse-engineer` become first-class measured skills. | Better readability of the agent process; easier onboarding and easier eval coverage. |
| Separation of concerns | High for reviewers: main agent writes, subagents mostly verify; spec-steward is the only scoped writer. | High for lifecycle stages: many specialized agents handle requirements, design, execution, quality, sync, and review. | Very high with lower risk: keep strict writer/sensor split, add planning agents and design-sync, delay broad implementation subagents. | Better maintainability and lower blast radius than copying the full 25-agent model. |
| Requirements analysis | Medium: handled by main agent plus spec-steward clarification. | High: dedicated requirement-analyzer determines scale, affected layers, risks, and questions. | High: add read-only `requirements-analyzer` with structured output used by recipes and reviewers. | Fewer ambiguous starts; better scope control and resilience against requirement drift. |
| Pre-design repo understanding | Medium-high: `rlm-explore`, repo-conventions, and architect-reviewer help, but no dedicated fact artifact. | High: codebase-analyzer emits existing elements, call chains, data model, constraints, tests, and quality mechanisms. | High: add `codebase-analyzer` as objective pre-design fact source. | More maintainable designs because plans must account for actual code and tests. |
| Documentation ladder | Medium-high: SPEC-first and ADR guidance are strong, but artifact levels are not as explicit. | High: PRD, UI spec, design docs, work plans, task files. | Very high: scale ladder defines fast, standard, full, and reverse-engineering artifact requirements. | Better planning quality without forcing PRDs on small changes. |
| Fullstack consistency | High for TypeScript shape via shared contracts; medium for semantic doc sync. | High: separate backend/frontend docs plus design-sync. | Very high: keep shared contracts and add design-sync for behavioral consistency. | Better scalability across cross-tier features; fewer API/UI semantic mismatches. |
| Quality loop | High: TDD, design review, QA/security/acceptance reviewers, executed verification contract. | High: task-executor -> quality-fixer loop, code-verifier, security-reviewer, test skeleton generation. | Very high: add read-only `quality-runner`, stub detection, test-skeleton metadata, and recipe compliance checks while preserving acceptance-verifier. | Stronger resilience and fewer false "done" claims. |
| Measurement | Very high: catalog check, harness acceptance tests, routing eval, adherence eval, mutation test, context decay. | Medium from inspected source: strong workflow contracts, but no equivalent committed live-model eval suite found. | Very high-plus: add workflow routing/adherence cases and mutation seeds for recipes, design-sync, approval stops, and quality-runner blocks. | Better long-term maintainability because workflow behavior is regression-tested. |
| Multi-tool portability | Very high: `.ruler` payload fans out to Claude, Codex, Copilot, Cursor, and Windsurf. | Medium: optimized around Claude Code plugin workflows. | Very high: recipe skills stay inside `.ruler`; runtime-specific writer delegation remains optional. | Safer scaling across teams that use different agent frontends. |
| Update resilience | Very high: npm package plus 3-way merge-aware `init`/`update`. | Medium-high: plugin marketplace versioning, but different customization/update story. | Very high: unchanged; new recipes and agents ride the existing update machinery. | Lower operational risk when teams customize local rules. |
| Security and control posture | Very high: P0 approval gates, no main writes, DB/deploy/dependency gates, no AI attribution, eval-backed adherence. | High: stop points and security reviewer, less explicit local evidence for multi-tool gate adherence. | Very high: P0 remains dominant over recipe autonomy; new evals verify approval stops and blocked quality states. | Stronger governance and audit readiness. |
| Overall quality score, simulated | 8.4/10: strong harness foundation, weaker explicit workflow layer. | 8.2/10: strong orchestration, weaker portability/measurement for this repo's goals. | 9.2/10 if evals stay green: measured workflow harness with clear recipes, stronger planning, and preserved safety model. | Best balance of readability, maintainability, scalability, and resilience. |

The target score is intentionally conditional. It should be treated as achieved
only after the implementation phases add eval cases, update baselines, and keep
mutation kill rate at `1.0`.

## High-Level Comparison

| Dimension | `llm-harness-fullstack` | `claude-code-workflows` | Recommendation |
|---|---|---|---|
| Distribution | Versioned `.ruler` payload, npm CLI, 3-way merge update, ruler fan-out to Claude/Codex/Copilot/Cursor/Windsurf | Claude Code plugin marketplace packages | Keep local model. It is more portable and safer for teams using multiple agent tools. |
| Workflow entry points | Operating profile plus workflow chains inside `instructions.md` | Explicit recipe skills such as `recipe-fullstack-implement`, `recipe-fullstack-build`, `recipe-diagnose`, `recipe-reverse-engineer` | Add recipe skills. They make flows discoverable and auditable without bloating the always-loaded operating profile. |
| Agent topology | 7 review/sensor agents: architect, spec, code, QA, security, acceptance, lessons | 25 fullstack agents spanning requirements, design, analysis, planning, execution, quality, sync, diagnosis | Add only missing lifecycle roles. Avoid agent explosion unless evals prove routing and outcomes improve. |
| Separation of concerns | Strong reviewer SOC; subagents are mostly read-only sensors, one spec writer | Strong stage SOC; orchestrator delegates nearly all work to specialists | Borrow stage SOC for planning. Preserve strict writer/sensor separation for implementation. |
| Documentation model | SPEC-first for behavioral changes, ADR skill, docs for architecture/evals/adoption | PRD, UI spec, backend/frontend design docs, work plans, task files, external-resource context | Add scale-based documentation tiers and design-sync. Do not require PRDs for small work. |
| Fullstack seam | Shared TypeScript contracts for NestJS + React | Separate backend/frontend design docs plus design-sync | Add a cross-layer sync gate even when shared TS contracts exist. It catches doc/behavior drift, not just type drift. |
| Quality | TDD, design-review marker, review subagents, acceptance verifier, deterministic harness tests, live-model evals | Executor -> quality-fixer loop, code-verifier, security-reviewer, integration/E2E skeleton generation | Add a quality-fixer/check-runner role and test-skeleton guidance; keep local eval gates as the source of truth. |
| Measurement | Strong: routing eval, adherence eval, mutation test, context decay, catalog check, acceptance shell tests | No equivalent committed live-model eval suite in the inspected tree | Keep measurement as a non-negotiable differentiator. Every workflow addition needs eval cases. |

## What This Harness Already Does Better

### 1. It Is a Measured Harness, Not Just a Prompt Pack

The local repo has behavioral instrumentation:

- `routing-eval.mjs` checks whether models load the right skills.
- `adherence-eval.mjs` checks literal safety and workflow gates.
- `mutation-test.mjs` seeds regressions to prove the evals fail when important
  gates are weakened.
- `context-decay.mjs` tracks instruction adherence as context grows.
- `catalog:check` proves skill catalog drift is detected.

This matters because workflow systems decay quietly. A beautiful recipe is not
enough if models stop following it after a rename, model change, or context
growth. The local baseline model is materially stronger for resilience.

### 2. It Has Stronger Safety and Governance Defaults

`template/.ruler/instructions.md` has concrete P0 gates for git writes,
deploy/publish, DB writes, sensitive data, branch safety, and AI attribution.
It also has an output contract that requires executed verification before
claiming completion.

The reference project has workflow stop points and batch approval, but the local
harness has more explicit safety language and stronger eval coverage around
adherence.

### 3. It Avoids Over-Delegating Implementation

The local architecture keeps the main agent as the normal code writer and uses
subagents as independent reviewers. That is safer across heterogeneous runtimes
because write scopes are not equally enforceable everywhere.

The reference project delegates implementation to task executors and quality
fixers. That can work in Claude Code, but it is harder to port through `.ruler`
to Codex, Copilot, Cursor, and other agent frontends without losing tool-scope
guarantees.

## What `claude-code-workflows` Does Better

### 1. Workflow Recipes Are Clearer Than Embedded Workflow Chains

The reference project makes the workflow itself a skill:

- `recipe-fullstack-implement`
- `recipe-fullstack-build`
- `recipe-design`
- `recipe-plan`
- `recipe-review`
- `recipe-diagnose`
- `recipe-reverse-engineer`
- `recipe-add-integration-tests`

This is a better discoverability model than putting every chain into the
operating profile. Recipes make it clear whether the agent is planning,
building, reviewing, diagnosing, or reverse-engineering.

### 2. Scale-Based Planning Is More Explicit

The reference `requirement-analyzer` classifies work by affected file count:

- small: 1-2 files
- medium: 3-5 files
- large: 6+ files

It then chooses the minimum documentation path: small work gets a simplified
plan, medium work gets design/work-plan, large work gets PRD/design/work-plan.
The local harness has fast/full paths, but it can be clearer about planning
artifacts and scale thresholds.

### 3. Pre-Design Codebase Analysis Is a Missing Local Role

The reference `codebase-analyzer` produces objective facts before design:
affected files, call chains, data model facts, constraints, existing tests, and
quality mechanisms. This reduces hallucinated designs and improves
maintainability because the design doc must account for real code, not just the
request.

The local harness has `rlm-explore` and architect review, but it lacks a
dedicated pre-design fact-gathering agent contract.

### 4. Cross-Document Sync Is a Useful Fullstack Gate

The reference fullstack flow creates separate backend and frontend design docs,
then runs `design-sync` to verify cross-layer consistency. The local harness
uses shared TypeScript contracts and spec-steward reconciliation, but it should
still add a cross-layer doc sync step for behavioral consistency:

- endpoint/DTO names
- error states
- authorization assumptions
- loading/empty/error UI states
- migration and data-shape implications
- acceptance criteria ownership across API, UI, and E2E

Types catch shape drift. They do not catch semantic drift.

### 5. Task Decomposition Is More Operational

The reference project turns a work plan into task files and routes them by
filename pattern:

- `*-backend-task-*`
- `*-frontend-task-*`

That is useful for vertical slicing and commit-sized work. The local harness
requires plans but does not currently define a concrete task-file lifecycle.

## Primary Gaps in `llm-harness-fullstack`

### Gap 1: Workflow Entry Points Are Not First-Class

Current state: workflow chains exist in `instructions.md`, but there is no
dedicated, discoverable recipe layer.

Impact:

- Harder for users to know which mode to ask for.
- Harder to eval a complete workflow path.
- The operating profile carries too much workflow policy.

Recommendation:

Add recipe skills that encode task-level orchestration while keeping
`instructions.md` focused on safety, routing, and invariant gates.

### Gap 2: Planning Artifacts Need a Scale Ladder

Current state: fast/full path and SPEC-first behavior are strong, but there is
not a clear artifact ladder like PRD -> design -> plan -> task.

Impact:

- Small changes can feel over-governed.
- Large changes can proceed with a SPEC that is too implementation-adjacent and
  not product/architecture-rich enough.

Recommendation:

Introduce a scale-based documentation matrix:

| Scale | Criteria | Required artifacts |
|---|---|---|
| Fast | <=2 files, single tier, no risk surface, no contract/schema change | one-paragraph SPEC delta, TDD, design review |
| Standard | 3-5 files or cross-module but not architecture-level | SPEC + design note + work plan |
| Full | 6+ files, cross-tier feature, contract/schema/auth/data-flow change | PRD or requirements brief + backend/frontend SPEC or design docs + design-sync + work plan |
| Legacy/reverse | undocumented existing behavior | generated PRD/SPEC/design docs from code, verified by codebase analyzer and document reviewer |

### Gap 3: No Dedicated Requirements Analyzer

Current state: the main agent and spec-steward share clarification work.

Impact:

- Scope and ambiguity analysis is mixed into implementation flow.
- The first decision, "what workflow should this take?", is less explicit than
  it should be.

Recommendation:

Add `requirements-analyzer` as a read-only planning agent or skill. It should
return structured JSON with purpose, scale, affected surfaces, risk surfaces,
questions, and required artifacts.

### Gap 4: No Dedicated Design Sync Agent

Current state: architect-reviewer and spec-steward catch many issues, but there
is no named gate for consistency between layer documents.

Impact:

- Backend and frontend docs can both be internally good while disagreeing about
  data semantics or failure states.

Recommendation:

Add `design-sync` as a read-only subagent for cross-tier changes. It should run
after SPEC/design docs exist and before implementation, then again post-change
when behavior changed.

### Gap 5: Quality-Fixer Is a Useful Concept, But Needs Local Constraints

Current state: `qa-validator`, `acceptance-verifier`, and deterministic tests
verify quality, but there is no workflow role that owns "run the relevant checks,
fix mechanical quality failures, and detect stubs."

Impact:

- Main agent still owns all quality loop mechanics.
- Stub or placeholder detection is spread across review/eval text instead of a
  named gate.

Recommendation:

Add a `quality-runner` or `quality-fixer` role with a tightly bounded mandate:
run checks, classify failures, apply only mechanical fixes when allowed by the
runtime, and route design/behavioral failures back to the main agent. For
multi-tool portability, prefer a read-mostly report role first; do not grant
broad write scope until tool-scope enforcement is verified.

## Proposed Target Architecture

### Keep the Three Planes

Preserve the current architecture:

- Payload: `.ruler` instructions, skills, agents, tests
- Distribution: CLI `init`/`update` with 3-way merge
- Measurement: deterministic tests, live evals, mutation/decay probes

Add a fourth conceptual layer inside the payload:

- Workflow recipes: entrypoint skills that orchestrate existing skills and
  subagents for common jobs

The recipe layer should not replace the operating profile. It should call into
it.

### Recommended Workflow Recipes

Add these as skills under `template/.ruler/skills/`:

| Recipe | Purpose | Notes |
|---|---|---|
| `recipe-task` | Small bug/fix/refactor path | Uses fast/standard matrix; no PRD. |
| `recipe-design` | Create or update design docs before implementation | Invokes requirements analyzer, codebase facts, architect review. |
| `recipe-plan` | Convert approved SPEC/design into an implementation plan | Creates task list and verification plan. |
| `recipe-build` | Execute from an existing plan | Main agent remains writer; quality runner/review agents verify. |
| `recipe-fullstack-implement` | End-to-end fullstack feature workflow | Requirements -> design docs/SPECs -> design-sync -> plan -> build. |
| `recipe-review` | Post-implementation consistency review | Runs code/spec/design/security/acceptance checks. |
| `recipe-diagnose` | Root-cause workflow for bugs | Formalizes investigator/verifier/solver loop or adapts existing `bug-investigation`. |
| `recipe-reverse-engineer` | Generate docs from existing code | Useful for legacy onboarding and making repos agent-friendly. |

Use `recipe-*`, not `workflow-*`, if you want alignment with the reference
project and discoverability by tab completion in Claude Code. Use `workflow-*`
if you want to avoid semantic collision with external plugins. My preference:
`recipe-*`, with eval cases guarding routing.

### Recommended New Agents

Add only five agents initially:

| Agent | Phase | Write scope | Why |
|---|---|---|---|
| `requirements-analyzer` | PRE | read-only | Classifies scale, risk, affected layers, artifact requirements, and open questions. |
| `codebase-analyzer` | PRE | read-only | Produces objective repo facts before design; reduces hallucinated architecture. |
| `design-sync` | PRE + POST | read-only | Verifies backend/frontend/SPEC consistency across cross-tier changes. |
| `document-reviewer` | PRE | read-only | Reviews PRD/SPEC/design/work-plan quality, not code. Complements `spec-steward`. |
| `quality-runner` | POST | read-only first; optional bounded write later | Runs quality checks, reports failures, detects stubs/placeholders, distinguishes mechanical failures from design failures. |

Do not add implementation agents in the first iteration. They add risk and
runtime-specific assumptions. Reconsider after the recipe and quality-runner
flows are measured.

### Existing Agents After the Change

| Existing agent | Keep? | Adjustment |
|---|---|---|
| `architect-reviewer` | Yes | Consume `requirements-analyzer` and `codebase-analyzer` outputs. |
| `spec-steward` | Yes | Remains only docs/specs writer. Coordinate with `document-reviewer`, but do not merge their mandates. |
| `code-reviewer` | Yes | Add checks for recipe compliance and task-plan drift. |
| `qa-validator` | Yes | Consume `quality-runner` output; focus on coverage/edge cases, not running every mechanical check. |
| `security-reviewer` | Yes | Add trend-sensitive check guidance only if it can be kept source-backed and not noisy. |
| `acceptance-verifier` | Yes | Pair with generated acceptance/test skeleton metadata. |
| `lessons-curator` | Yes | Add recipe/agent improvement suggestions when workflow failures repeat. |

## Separation of Concerns Model

The goal is not "more agents"; it is fewer ambiguous responsibilities.

### Main Agent

Owns:

- User communication
- Path/recipe selection
- P0 approval gates
- Writing app code and tests
- Aggregating subagent findings
- Final verification report

Does not own:

- Independent review verdicts
- Spec truth when `spec-steward` is in scope
- Cross-document sync verdict
- Quality evidence after a quality-runner or acceptance-verifier reports BLOCK

### Skills

Skills should remain durable knowledge and procedures:

- stack conventions
- TDD
- design review
- testing principles
- security checklists
- documentation standards
- recipe procedures

Skills should not pretend to be agents. If a thing needs a fresh context,
structured verdict, or independent evidence, it should be an agent.

### Subagents

Subagents should own one narrow concern each:

- requirements classification
- codebase fact gathering
- design review
- document review
- cross-layer sync
- code design review
- QA coverage
- security
- acceptance execution
- quality check execution
- lesson curation

Every subagent should have:

- trigger and anti-trigger
- required reading
- input contract
- output schema
- verdict semantics
- allowed tools
- forbidden behaviors
- escalation conditions

## Recommended Fullstack Workflow

### Fast Path

Use for <=2 files, single tier, no high-risk surface, no contract/schema change,
no new dependency.

1. Main agent declares fast path.
2. Load force-fire skills and touched-tier skills.
3. Add or update a minimal SPEC delta if behavior changes.
4. TDD: failing test -> implementation -> green.
5. Run relevant suite.
6. Design review self-check.
7. `qa-validator` only if observable behavior changes.
8. Final output with executed verification.

### Standard Path

Use for 3-5 files or cross-module changes without major architecture impact.

1. `requirements-analyzer`
2. `codebase-analyzer`
3. `spec-steward` PRE or `document-reviewer` on existing governing doc
4. `architect-reviewer` if 3+ files or risk surface
5. Main agent implementation with TDD
6. `quality-runner`
7. `code-reviewer` + `qa-validator` in parallel when triggered
8. `security-reviewer` if triggered
9. `spec-steward` POST
10. `acceptance-verifier` when user-facing/API behavior changed

### Full Cross-Tier Path

Use for large or cross-tier work.

1. `requirements-analyzer`
2. PRD or requirements brief if feature scope is broad
3. `codebase-analyzer` per tier
4. `spec-steward` PRE creates/updates layer docs, or design docs are created
   through `recipe-design`
5. `document-reviewer` reviews each doc
6. `design-sync` checks backend/frontend/contract consistency
7. `architect-reviewer` reviews the implementation plan
8. Main agent implements vertical slices with TDD
9. `quality-runner` after each slice or before final review
10. `code-reviewer`, `qa-validator`, `security-reviewer` as triggered
11. `spec-steward` POST reconciliation
12. `design-sync` POST if layer docs changed or cross-tier assumptions shifted
13. `acceptance-verifier` last

## Code Quality Measurement Model

The user-facing objective names readability, maintainability, scalability, and
resilience. Convert those into observable gates:

| Quality | Observable checks |
|---|---|
| Readability | file/function size, naming, no hidden side effects, test names describe behavior, comments explain why only |
| Maintainability | single responsibility, low coupling, no duplicated business rules, docs/specs updated, clear ownership boundaries |
| Scalability | no unbounded data paths, pagination/backpressure where relevant, query shape reviewed, frontend state not duplicated, no avoidable hot render paths |
| Resilience | fail-fast validation, explicit error handling, timeout/cancellation strategy, transaction boundaries, rollback/partial-failure tests, security review for trust boundaries |

Add these to the `design-review`, `qa-validator`, and future `quality-runner`
contracts as rubric rows. Avoid self-scored confidence as a completion signal;
use executed tests, reviewer verdicts, and eval scores.

## Evaluation Additions Required

Every workflow addition should include eval coverage before it is considered
shippable.

### Routing Eval Cases

Add cases for:

- "Plan a medium feature before implementation" -> `recipe-design` or
  `recipe-plan`
- "Build from this approved work plan" -> `recipe-build`
- "Fullstack feature with backend and React UI" -> `recipe-fullstack-implement`
- "Investigate this failing endpoint" -> `recipe-diagnose`
- "Generate docs from legacy code" -> `recipe-reverse-engineer`
- "Review whether implementation matches design docs" -> `recipe-review`

### Adherence Eval Cases

Add cases for:

- requirements analyzer stop point
- design approval stop point
- batch implementation approval
- fast-path escalation to standard/full path
- design-sync conflict -> no implementation
- quality-runner blocked -> no "done" claim
- safety gate still overrides recipe autonomy

### Mutation Tests

Seed regressions such as:

- remove design-sync from cross-tier recipe
- soften "must stop for approval" to "should"
- allow quality-runner failures to be ignored
- remove fast-path escalation text
- remove P0 override from recipe autonomy

Expected result: mutation kill rate stays `1.0`.

## Implementation Roadmap

### Phase 1: Low-Risk Workflow Layer

Add recipe skills only:

- `recipe-task`
- `recipe-design`
- `recipe-plan`
- `recipe-build`
- `recipe-review`

Keep them as orchestration procedures that call existing skills and agents. Do
not add new writer agents yet.

Validation:

- `npm test`
- `npm run test:harness`
- `npm run catalog:check`
- routing/adherence eval additions for recipe selection and approval gates

### Phase 2: Planning and Documentation Agents

Add:

- `requirements-analyzer`
- `codebase-analyzer`
- `document-reviewer`
- `design-sync`

Update:

- `architect-reviewer` required reading and inputs
- `spec-steward` coordination text
- `docs/AGENTS-AND-SKILLS.md`
- `docs/ARCHITECTURE.md`

Validation:

- deterministic tests for agent file presence and no write-scope leaks
- new routing/adherence cases
- mutation tests for missing design-sync and missing approval stop points

### Phase 3: Quality Runner

Add `quality-runner` as a read-only/reporting subagent first.

Responsibilities:

- discover relevant package checks
- run tests/lint/type/build where available
- detect stubs/placeholders/skipped tests
- classify failures as mechanical, behavioral, environment, or spec ambiguity
- return a structured verdict

Only after that works across runtimes should the project consider a bounded
write-capable `quality-fixer`.

### Phase 4: Fullstack and Reverse-Engineering Recipes

Add:

- `recipe-fullstack-implement`
- `recipe-diagnose`
- `recipe-reverse-engineer`
- optional `recipe-add-integration-tests`

These are higher ceremony and should ship only after Phase 1-3 evals are stable.

## What Not to Copy

Do not copy the entire 25-agent topology. It is powerful, but it would dilute
this harness's simplicity and increase routing/eval surface area.

Do not make `docs/plans/` cleanup or per-task commits mandatory in the core
harness. The local user and repo preference requires explicit approval for git
writes, and this harness targets multiple agent runtimes. Per-task commit loops
should be optional and approval-gated.

Do not add broad write-capable implementation subagents until there is a
runtime-independent way to enforce write scope. The current sensor-heavy design
is safer and more portable.

Do not weaken existing eval gates to accommodate workflows. Recipes should be
measured by the harness, not exempt from it.

## Final Recommendation

Evolve `llm-harness-fullstack` into a measured workflow harness:

- Keep `.ruler` + npm + 3-way update + live evals as the foundation.
- Add recipe skills for workflow clarity.
- Add four planning/documentation agents and one quality-runner agent.
- Keep implementation mostly in the main agent until bounded write scopes are
  proven across target runtimes.
- Gate every new workflow with routing evals, adherence evals, and mutation
  tests.

This gives the project the best parts of `claude-code-workflows` without losing
the local harness's strongest differentiators: portability, safety, update
resilience, and measurable agent behavior.
