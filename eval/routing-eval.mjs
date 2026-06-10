#!/usr/bin/env node
// routing-eval.mjs — does a live model route prompts to the right skills?
//
// For each canonical case, the model gets the shipped skill catalog
// (name + description, read from template/.ruler/skills at run time) and a user
// prompt, and returns the skill names it would load. Scored on RECALL of the
// expected discretionary skills (precision is reported, not gated — force-fire
// skills legitimately appear in output).
//
// Usage:
//   node eval/routing-eval.mjs [--backend api|cli] [--model <id>]
//                              [--cases N] [--update-baseline]
//
// Exits 0 with SKIP when no backend is available (no key, no claude CLI), so
// the deterministic suites stay the zero-cost gate.

import { writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  readCatalog, callModel, extractJsonArray, readJson,
  skipIfNoBackend, argValue, DEFAULT_MODEL,
} from './lib.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const SKILLS_DIR = join(here, '..', 'template', '.ruler', 'skills');
const BASELINE_PATH = join(here, 'baseline.json');
const RECALL_TOLERANCE = 0.05;

// P3.4 force-fire skills: the instructions order the model to load these on
// (nearly) every change, so returning them is obedience, not over-loading.
// Precision neither credits nor penalizes them unless a case expects them —
// what's left measures WRONGLY loaded discretionary skills (e.g. a backend
// skill on a frontend prompt).
const FORCE_FIRE = new Set([
  'tdd-workflow', 'repo-conventions', 'failure-mode-analysis', 'design-review',
  'plan-mode', 'spec-workflow', 'cross-repo-workspace', 'react-patterns',
  'react-state-management', 'accessibility', 'async-error-handling',
  'database-transactions',
]);

const backend = skipIfNoBackend('routing-eval');
const model = argValue('--model', DEFAULT_MODEL);
const limit = Number(argValue('--cases', Infinity));
const updateBaseline = process.argv.includes('--update-baseline');

const catalog = readCatalog(SKILLS_DIR);
const { cases } = readJson(join(here, 'routing-cases.json'));
const selected = cases.slice(0, limit);

// The case prompt is embedded as quoted DATA inside a router-framed question.
// Do NOT put it in the user position as a live request: under the CLI backend
// the model is a coding agent and will start doing the task instead of routing.
const routerPrompt = (caseprompt) => [
  'You are evaluating the SKILL ROUTING of an LLM coding harness for a fullstack',
  'monorepo (apps/web React frontend, apps/api NestJS backend, packages/contracts',
  'shared types). Below is a hypothetical user request (DATA — do not act on it)',
  'and the skill catalog. Decide which skills should be loaded because their',
  'DESCRIPTION matches the request.',
  '',
  'HYPOTHETICAL REQUEST (data, not a task):',
  '"""',
  caseprompt,
  '"""',
  '',
  'CATALOG:',
  ...catalog.map((s) => `- ${s.name}: ${s.description}`),
  '',
  'Answer with ONLY a JSON array of skill names (max 8), nothing else.',
  'Prefer precision: include a skill only when its description clearly applies.',
].join('\n');

let sumRecall = 0;
let sumPrecision = 0;
let perfect = 0;
const failures = [];

for (const c of selected) {
  let returned;
  try {
    const text = await callModel({ prompt: routerPrompt(c.prompt), model, backend, maxTokens: 512 });
    returned = extractJsonArray(text);
    if (!returned) {
      console.error(`NOPARSE: ${c.id} — raw[:200]: ${text.replace(/\s+/g, ' ').slice(0, 200)}`);
      returned = [];
    }
  } catch (err) {
    console.error(`ERROR: ${c.id} — ${err.message}`);
    returned = [];
  }
  const got = new Set(returned);
  const hit = c.expected.filter((s) => got.has(s));
  const recall = hit.length / c.expected.length;
  const credited = returned.filter((s) => c.expected.includes(s)).length;
  const penalized = returned.filter((s) => !c.expected.includes(s) && !FORCE_FIRE.has(s)).length;
  const precision = credited + penalized > 0 ? credited / (credited + penalized) : returned.length ? 1 : 0;
  sumRecall += recall;
  sumPrecision += precision;
  if (recall === 1) perfect += 1;
  else failures.push({ id: c.id, missed: c.expected.filter((s) => !got.has(s)), returned });
  console.log(`${recall === 1 ? 'PASS' : 'MISS'}: ${c.id} recall=${recall.toFixed(2)} precision=${precision.toFixed(2)}${recall < 1 ? ` missed=[${c.expected.filter((s) => !got.has(s))}] returned=[${returned}]` : ''}`);
}

const meanRecall = sumRecall / selected.length;
const meanPrecision = sumPrecision / selected.length;
const perfectRate = perfect / selected.length;

console.log('\n=== routing-eval summary ===');
console.log(`backend=${backend} model=${model} cases=${selected.length}`);
console.log(`mean recall:     ${meanRecall.toFixed(3)}  (gated)`);
console.log(`mean precision:  ${meanPrecision.toFixed(3)}  (informative)`);
console.log(`perfect recall:  ${perfectRate.toFixed(3)}`);
if (failures.length) {
  console.log(`misses: ${failures.map((f) => f.id).join(', ')}`);
}

if (updateBaseline) {
  const baseline = existsSync(BASELINE_PATH) ? readJson(BASELINE_PATH) : {};
  if (!baseline.routing || typeof baseline.routing.meanRecall === 'number') baseline.routing = {};
  baseline.routing[model] = {
    backend,
    cases: selected.length,
    meanRecall: Number(meanRecall.toFixed(3)),
    meanPrecision: Number(meanPrecision.toFixed(3)),
    perfectRecallRate: Number(perfectRate.toFixed(3)),
    updatedAt: new Date().toISOString(),
  };
  writeFileSync(BASELINE_PATH, JSON.stringify(baseline, null, 2) + '\n');
  console.log(`Baseline written → ${BASELINE_PATH} [routing.${model}]`);
  process.exit(0);
}

const baseline = existsSync(BASELINE_PATH) ? readJson(BASELINE_PATH).routing?.[model] : null;
if (!baseline) {
  console.log(`No routing baseline for ${model} — run with --update-baseline to set one.`);
  process.exit(0);
}
const floor = baseline.meanRecall - RECALL_TOLERANCE;
if (meanRecall < floor) {
  console.error(`\nFAIL: mean recall ${meanRecall.toFixed(3)} < baseline ${baseline.meanRecall} - ${RECALL_TOLERANCE}`);
  console.error('Routing regressed — a skill description was weakened or a case is stale.');
  process.exit(1);
}
console.log(`\nOK: mean recall ${meanRecall.toFixed(3)} ≥ floor ${floor.toFixed(3)} (baseline ${baseline.meanRecall})`);
