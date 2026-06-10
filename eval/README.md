# Eval harness

Live-model evals for the shipped template — the measured counterpart to the
deterministic suites (`npm test`, `npm run test:harness`). Zero dependencies:
plain `node`, `fetch`, and regex assertions. See `docs/IMPROVEMENT-PLAN.md` § P1
for the rationale and the tooling decision (hand-rolled now; promptfoo only at
the future outcome-eval milestone).

| Script | Question it answers | Gate |
|---|---|---|
| `routing-eval.mjs` | Given the shipped skill catalog, does a model route canonical prompts to the right skills — including paraphrases, and including knowing when to load NOTHING? | worst-variant recall ≥ baseline − 0.05 AND false-positive rate ≤ baseline + 0.10 |
| `adherence-eval.mjs` | Under the full `instructions.md`, does a model actually emit the gates — in calm requests, multi-turn approval flows, and under pressure/injection? | pass rate ≥ baseline − 0.10 AND **safety scorecard ≥ baseline (zero tolerance)** |
| `scripts/mutation-test.mjs` | Would the suites CATCH a real regression? Seeds gate-deletions/softenings into a temp copy and expects red. | kill rate = 1.0 (any survivor = suite blind spot) |
| `scripts/context-decay.mjs` | Does gate adherence decay as the context fills (~0/30k/90k filler tokens)? | informative curve, not gated |

**Metric definitions.** Routing *recall* (gated) = expected discretionary skills found;
a case with `variants` (paraphrases) scores its WORST variant, so routing must survive
rephrasing, not just the author's wording. *False-positive rate* (gated) = non-force-fire
skills returned that the case didn't expect, per call — negative cases (`expected: []`)
exist purely to measure it. *Precision* (informative) ignores P3.4 force-fire skills
(returning them is obedience). *Paraphrase stability* = fraction of variant-cases where
every phrasing routed perfectly. Adherence cases pass on **majority vote** across
`--repeats N` runs (default 1; baselines use 3); each case carries a *category*
(safety / routing / ceremony / contract / identity) and the summary prints a per-category
scorecard — **safety regressions gate with zero tolerance**, the rest with −0.10. Cases
with `turns` are multi-turn (approval flows, mid-task escalation). Every full run appends
to `eval/history.jsonl` (timestamp + commit + scores) — the trail that makes regressions
bisectable.

## Running

```bash
npm run eval            # both evals
node eval/routing-eval.mjs --cases 5          # quick subset
node eval/adherence-eval.mjs --model claude-sonnet-4-6 --repeats 3
node eval/routing-eval.mjs --update-baseline  # re-baseline after intended changes
```

Backend is auto-detected: `ANTHROPIC_API_KEY` → direct API; otherwise the
`claude` CLI in headless `-p` mode. **This project's workflow is
subscription-first**: baselines are produced locally through the CLI backend
(retry + pacing built in) and committed; CI evals self-skip without a key, so
the deterministic suites stay the CI gate and the committed baselines + history
are the behavioral record. With neither backend, the scripts print `SKIP` and
exit 0.

```bash
npm run eval:mutation   # suite kill-rate (the eval of the eval)
npm run eval:decay      # adherence vs context-fill curve
```

Default model is Haiku-class (`claude-haiku-4-5-20251001`) for cost; pass
`--model` to eval against the model family your consumers actually run.

## Baselines

`baseline.json` is committed, **keyed per model** (`routing.<model-id>`,
`adherence.<model-id>`): Haiku is the cost floor gated on every PR; Sonnet is the
consumer-grade tier (CI `workflow_dispatch` with `full_matrix=true`). Evals compare
against the entry for the model they ran and fail CI on regression beyond tolerance.
After an *intended* change (new skills, rewritten descriptions, instruction edits),
re-run with `--update-baseline` and commit the new numbers — the diff is the
reviewable evidence of behavioral impact.

## Adding cases

- Routing: append to `routing-cases.json`. Expected lists name **discretionary**
  skills only — P3.4 force-fire skills may appear in model output and are never
  penalized.
- Adherence: append to `adherence-cases.json`. Assert observable artifacts
  (exact gate lines, waiver phrases), not vibes; keep `must` patterns anchored
  to text the instructions literally mandate.
