# Eval harness

Live-model evals for the shipped template — the measured counterpart to the
deterministic suites (`npm test`, `npm run test:harness`). Zero dependencies:
plain `node`, `fetch`, and regex assertions. See `docs/IMPROVEMENT-PLAN.md` § P1
for the rationale and the tooling decision (hand-rolled now; promptfoo only at
the future outcome-eval milestone).

| Script | Question it answers | Gate |
|---|---|---|
| `routing-eval.mjs` | Given the shipped skill catalog, does a model route canonical prompts to the right skills? | mean recall ≥ baseline − 0.05 |
| `adherence-eval.mjs` | Under the full `instructions.md`, does a model actually emit the gates (approval pause, waiver phrase, tier routing, path declaration)? | pass rate ≥ baseline − 0.10 |

## Running

```bash
npm run eval            # both evals
node eval/routing-eval.mjs --cases 5          # quick subset
node eval/adherence-eval.mjs --model claude-sonnet-4-6
node eval/routing-eval.mjs --update-baseline  # re-baseline after intended changes
```

Backend is auto-detected: `ANTHROPIC_API_KEY` → direct API (used in CI);
otherwise the `claude` CLI in headless `-p` mode (local runs, billed to your
session). With neither, the scripts print `SKIP` and exit 0 — the keyword-based
`simulate-prompts.sh` remains the zero-cost fallback gate.

Default model is Haiku-class (`claude-haiku-4-5-20251001`) for cost; pass
`--model` to eval against the model family your consumers actually run.

## Baselines

`baseline.json` is committed. Evals compare against it and fail CI on
regression beyond tolerance. After an *intended* change (new skills, rewritten
descriptions, instruction edits), re-run with `--update-baseline` and commit the
new numbers — the diff is the reviewable evidence of behavioral impact.

## Adding cases

- Routing: append to `routing-cases.json`. Expected lists name **discretionary**
  skills only — P3.4 force-fire skills may appear in model output and are never
  penalized.
- Adherence: append to `adherence-cases.json`. Assert observable artifacts
  (exact gate lines, waiver phrases), not vibes; keep `must` patterns anchored
  to text the instructions literally mandate.
