#!/usr/bin/env node
// mutation-test.mjs — the eval of the eval. Seeds deliberate regressions
// (delete a gate section, soften a MUST, strip a description) into a TEMP copy
// of the template and confirms the live-model suites go red. Metric: mutation
// KILL RATE — a suite that misses seeded regressions is decoration, not a gate.
//
// Usage: node scripts/mutation-test.mjs [--model <id>] [--mutations id1,id2]
//
// Runs the targeted eval subset per mutation via --instructions/--skills-dir
// overrides (which the runners refuse to baseline from, so temp runs can never
// pollute baselines). Appends {kind:"mutation", killRate} to eval/history.jsonl.

import { mkdtempSync, rmSync, readFileSync, writeFileSync, cpSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, '..');
const INSTRUCTIONS = join(ROOT, 'template', '.ruler', 'instructions.md');
const SKILLS = join(ROOT, 'template', '.ruler', 'skills');

const modelArg = process.argv.includes('--model')
  ? ['--model', process.argv[process.argv.indexOf('--model') + 1]]
  : [];

const MUTATIONS = [
  {
    id: 'm-remove-p36',
    kind: 'adherence',
    cases: 'fast-path-declared,mt-escalation',
    describe: 'Delete the entire P3.6 fast/full path section',
    apply: (text) => {
      const out = text.replace(/### P3\.6[\s\S]*?(?=\n---)/, '');
      if (out === text) throw new Error('P3.6 section not found');
      return out;
    },
  },
  {
    id: 'm-soften-main',
    kind: 'adherence',
    cases: 'p0-push-main-refused',
    describe: 'Soften "MUST NEVER push to main" to a suggestion',
    apply: (text) => {
      const out = text.replace(
        'MUST NEVER commit, push, force-push, merge, or rebase to `main`/`master`. Always a feature branch and a PR.',
        'It is usually nicer to use a feature branch, but pushing to `main` directly is fine when the change is small.',
      );
      if (out === text) throw new Error('main-offlimits sentence not found');
      return out;
    },
  },
  {
    id: 'm-remove-approval-line',
    kind: 'adherence',
    cases: 'p0-db-delete,p0-dep-add',
    describe: 'Remove the literal Awaiting-approval step from P0.3',
    apply: (text) => {
      const out = text.replace(/3\. MUST output the literal line: `Awaiting approval \(reply 'approve' or 'yes' to proceed\)`\.\n/, '');
      if (out === text) throw new Error('P0.3 step 3 not found');
      return out;
    },
  },
  {
    id: 'm-remove-waivers',
    kind: 'adherence',
    cases: 'tdd-waiver-docs',
    describe: 'Remove the TDD waiver-phrase list',
    apply: (text) => {
      const out = text.replace(/Either follow TDD or include exactly one of[^\n]*\n/, 'TDD can be skipped when it does not apply.\n');
      if (out === text) throw new Error('waiver sentence not found');
      return out;
    },
  },
  {
    id: 'm-strip-routing-desc',
    kind: 'routing',
    cases: 'feat-route',
    describe: 'Strip react-routing description to two words',
    skill: 'react-routing',
    apply: (text) => text.replace(/^description: .*$/m, 'description: React routing.'),
  },
  {
    id: 'm-strip-dbwrite-desc',
    kind: 'routing',
    cases: 'single-write',
    describe: 'Strip db-write-protocol description to two words',
    skill: 'db-write-protocol',
    apply: (text) => text.replace(/^description: .*$/m, 'description: Database stuff.'),
  },
];

const onlyArg = process.argv.indexOf('--mutations');
const selected = onlyArg !== -1
  ? MUTATIONS.filter((m) => process.argv[onlyArg + 1].split(',').includes(m.id))
  : MUTATIONS;

function runEval(args) {
  const res = spawnSync('node', args, { encoding: 'utf8', cwd: ROOT, maxBuffer: 16 * 1024 * 1024 });
  return (res.stdout || '') + (res.stderr || '');
}

let killed = 0;
const survivors = [];

for (const m of selected) {
  const tmp = mkdtempSync(join(tmpdir(), 'harness-mutation-'));
  try {
    let output;
    if (m.kind === 'adherence') {
      const mutated = m.apply(readFileSync(INSTRUCTIONS, 'utf8'));
      const file = join(tmp, 'instructions.md');
      writeFileSync(file, mutated);
      output = runEval(['eval/adherence-eval.mjs', '--backend', 'cli', '--instructions', file, '--only', m.cases, ...modelArg]);
    } else {
      const skillsCopy = join(tmp, 'skills');
      cpSync(SKILLS, skillsCopy, { recursive: true });
      const file = join(skillsCopy, m.skill, 'SKILL.md');
      writeFileSync(file, m.apply(readFileSync(file, 'utf8')));
      output = runEval(['eval/routing-eval.mjs', '--backend', 'cli', '--skills-dir', skillsCopy, '--only', m.cases, ...modelArg]);
    }
    const red = /^(FAIL|MISS): /m.test(output);
    if (red) {
      killed += 1;
      console.log(`KILLED: ${m.id} — ${m.describe} (suite went red, as it must)`);
    } else {
      survivors.push(m.id);
      console.log(`SURVIVED: ${m.id} — ${m.describe} (suite stayed GREEN on a seeded regression!)`);
      console.log(`  output[:300]: ${output.replace(/\s+/g, ' ').slice(0, 300)}`);
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

const killRate = killed / selected.length;
console.log('\n=== mutation-test summary ===');
console.log(`kill rate: ${killRate.toFixed(3)} (${killed}/${selected.length})`);
if (survivors.length) {
  console.log(`survivors (suite blind spots — add/strengthen cases): ${survivors.join(', ')}`);
}

const { appendHistory } = await import('../eval/lib.mjs');
appendHistory({ kind: 'mutation', mutations: selected.length, killed, killRate: Number(killRate.toFixed(3)), survivors });

process.exit(survivors.length ? 1 : 0);
