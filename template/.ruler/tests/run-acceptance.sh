#!/usr/bin/env bash
# run-acceptance.sh — acceptance tests for the project-agnostic FULLSTACK harness.
#
# Validates the SHIPPED template tree (skills + agents + instructions.md + ruler.toml)
# directly — it does NOT require `ruler apply` to have run. This is the package's own
# regression gate: it proves the harness stays structurally sound, ships BOTH tiers'
# guidance (React frontend + NestJS backend + shared-contract seam), AND stays free of
# coupling to any specific project (no "velocity" project names, no hardcoded ADR
# citations, no project-specific symbols leaking into the generic skills/agents).
#
# Run from anywhere:  bash <path>/template/.ruler/tests/run-acceptance.sh
# In the package repo: bash template/.ruler/tests/run-acceptance.sh

set -uo pipefail

# RULER_DIR = the .ruler/ tree this script ships inside (tests/ is one level down).
RULER_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SKILLS="$RULER_DIR/skills"
AGENTS="$RULER_DIR/agents"
INSTRUCTIONS="$RULER_DIR/instructions.md"

for tool in bash grep awk sed find wc; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "PRE-FAIL: required tool '$tool' not found on PATH" >&2
    exit 2
  fi
done

PASS=0
FAIL=0
FAILED_TESTS=""

assert_true() {
  local name="$1" cmd="$2"
  if eval "$cmd" >/dev/null 2>&1; then
    echo "PASS: $name"; PASS=$((PASS+1))
  else
    echo "FAIL: $name (command failed: $cmd)"
    FAIL=$((FAIL+1)); FAILED_TESTS="$FAILED_TESTS $name"
  fi
}

# The canonical skills shipped by this fullstack harness (union of both stacks).
# Process / shared:
SKILL_LIST="async-error-handling bug-investigation code-simplifier cross-repo-workspace \
cyclomatic-complexity decision-rules design-review documentation-and-adrs \
failure-mode-analysis git-workflow js-performance-patterns meta-skill-hygiene plan-mode \
pushback-templates quality-gates repo-conventions rlm-explore tdd-workflow typescript-advanced-types \
\
accessibility ai-ui-patterns bundle-size compound-pattern frontend-security hoc-pattern \
hooks-pattern mixin-pattern module-pattern playwright-best-practices \
presentational-container-pattern provider-pattern proxy-pattern react-2026 \
react-composition-2026 react-data-fetching react-forms react-patterns react-performance \
react-render-optimization react-routing react-state-management react-testing \
render-props-pattern shadcn tailwind-v4-shadcn vite vitest \
\
database-transactions db-write-protocol nestjs-best-practices nestjs-clean-architecture \
nestjs-patterns nodejs-best-practices"

AGENT_LIST="architect-reviewer code-reviewer qa-validator security-reviewer lessons-curator"

# ---------------------------------------------------------------------------
echo "=== T1: Structure — instructions, ruler config, every skill + agent present ==="
assert_true "T1: instructions.md exists" "test -f '$INSTRUCTIONS'"
assert_true "T1: ruler.toml exists" "test -f '$RULER_DIR/ruler.toml'"
for s in $SKILL_LIST; do
  assert_true "T1: skill '$s' has SKILL.md" "test -f '$SKILLS/$s/SKILL.md'"
done
for a in $AGENT_LIST; do
  assert_true "T1: agent '$a' exists" "test -f '$AGENTS/$a.md'"
done

# ---------------------------------------------------------------------------
echo
echo "=== T2: Project-agnostic — NO coupling to any specific project (the headline) ==="
SEARCH_PATHS="$SKILLS $AGENTS $INSTRUCTIONS"
assert_true "T2: no 'spa-velocity' / 'api-velocity' references" \
  "! grep -rniE 'spa-velocity|api-velocity' $SEARCH_PATHS"
assert_true "T2: no project-specific token-contract symbol (localStorage.bearer_token)" \
  "! grep -rnE 'bearer_token' $SEARCH_PATHS"
assert_true "T2: no project-specific RBAC symbols (resolveOrgScope/PermissionsGuard/RoleService)" \
  "! grep -rnE 'resolveOrgScope|PermissionsGuard|\\bRoleService\\b' $SEARCH_PATHS"
# Numbered ADR citations must not appear as real citations. Allowed: generic placeholders
# (<repo-a>/<repo-b>), illustrative markers (ADR-00X / ADR-NNN), and the cross-repo example.
assert_true "T2: no hardcoded numbered ADR citations (only generic/illustrative allowed)" \
  "! grep -rnE 'ADR-0[0-9][0-9]' $SEARCH_PATHS | grep -vE 'repo-a|repo-b|illustrative|substitute|ambiguous in workspace|ADR-00[XY]'"
assert_true "T2: no 'in this repo, X already exists / established pattern here' assertions" \
  "! grep -rniE 'already in this repo|established pattern (in this repo|here)|tokens in this repo' $SEARCH_PATHS"

# ---------------------------------------------------------------------------
echo
echo "=== T3: instructions.md structure (priority profile P0..P9, fullstack title) ==="
assert_true "T3: title is generic (not '(spa-velocity)'/'(api-velocity)')" \
  "! grep -qE '^# .*\\((spa|api)-velocity\\)' '$INSTRUCTIONS'"
assert_true "T3: title declares Fullstack" "grep -qiE '^# .*Fullstack' '$INSTRUCTIONS'"
assert_true "T3: title names BOTH frameworks (NestJS + React)" \
  "grep -qiE '^# .*NestJS' '$INSTRUCTIONS' && grep -qiE '^# .*React' '$INSTRUCTIONS'"
for p in "P0" "P3" "P5" "P8" "P9"; do
  assert_true "T3: has section $p" "grep -qE '## $p ' '$INSTRUCTIONS'"
done
assert_true "T3: uses MUST/SHOULD/MAY normative language" \
  "grep -q 'MUST' '$INSTRUCTIONS' && grep -q 'SHOULD' '$INSTRUCTIONS' && grep -q 'MAY' '$INSTRUCTIONS'"
assert_true "T3: has Skill Pointers table" "grep -qiE '## skill[ -]pointers' '$INSTRUCTIONS'"
assert_true "T3: has Workflow chains table" "grep -qiE '## workflow chains' '$INSTRUCTIONS'"
assert_true "T3: P0 keeps the no-AI-attribution rule" \
  "grep -qiE 'Co-Authored-By: Claude|AI-attribution' '$INSTRUCTIONS'"
assert_true "T3: P0 keeps BOTH deploy gate AND DB-write gate (fullstack)" \
  "grep -qiE 'npm publish|vercel deploy' '$INSTRUCTIONS' && grep -qiE 'db-write-protocol|DB writes' '$INSTRUCTIONS'"

# ---------------------------------------------------------------------------
echo
echo "=== T4: Frontmatter well-formed (every skill + agent has name + description) ==="
for s in $SKILL_LIST; do
  f="$SKILLS/$s/SKILL.md"
  assert_true "T4: skill '$s' has name:" "grep -qE '^name:' '$f'"
  assert_true "T4: skill '$s' has description:" "grep -qE '^description:' '$f'"
done
for a in $AGENT_LIST; do
  f="$AGENTS/$a.md"
  assert_true "T4: agent '$a' has name:" "grep -qE '^name:' '$f'"
  assert_true "T4: agent '$a' has description:" "grep -qE '^description:' '$f'"
done

# ---------------------------------------------------------------------------
echo
echo "=== T5: Consumer-fill-in skeleton (repo-conventions) covers BOTH tiers + seam ==="
RC="$SKILLS/repo-conventions/SKILL.md"
assert_true "T5: repo-conventions is a fill-in skeleton (has FILL IN placeholders)" \
  "grep -qi 'FILL IN' '$RC'"
assert_true "T5: repo-conventions keeps the FRONTEND scaffold (state + routing + auth)" \
  "grep -qiE 'state' '$RC' && grep -qiE 'rout' '$RC' && grep -qiE 'auth' '$RC'"
assert_true "T5: repo-conventions keeps the BACKEND scaffold (RBAC/authz + persistence + errors)" \
  "grep -qiE 'RBAC|authz' '$RC' && grep -qiE 'persistence|repository' '$RC' && grep -qiE 'error' '$RC'"
assert_true "T5: repo-conventions documents the shared-contract seam (packages/contracts)" \
  "grep -qiE 'packages/contracts|shared contract' '$RC'"
assert_true "T5: cross-repo-workspace is generic (repo-a/repo-b placeholders or FILL IN)" \
  "grep -qiE '<repo-a>|<repo-b>|FILL IN' '$SKILLS/cross-repo-workspace/SKILL.md'"

# ---------------------------------------------------------------------------
echo
echo "=== T6: BOTH tiers' generic knowledge retained ==="
# Frontend
assert_true "T6(FE): react-patterns + react-state-management + react-routing present" \
  "test -f '$SKILLS/react-patterns/SKILL.md' && test -f '$SKILLS/react-state-management/SKILL.md' && test -f '$SKILLS/react-routing/SKILL.md'"
assert_true "T6(FE): frontend-security keeps XSS + env-leak teaching" \
  "grep -qiE 'dangerouslySetInnerHTML|XSS' '$SKILLS/frontend-security/SKILL.md' && grep -qiE 'VITE_|env' '$SKILLS/frontend-security/SKILL.md'"
assert_true "T6(FE): react-state-management keeps the four-layer model" \
  "grep -qiE 'four[ -]layer' '$SKILLS/react-state-management/SKILL.md'"
assert_true "T6(FE): testing skills present (react-testing + playwright + vitest)" \
  "test -f '$SKILLS/react-testing/SKILL.md' && test -f '$SKILLS/playwright-best-practices/SKILL.md' && test -f '$SKILLS/vitest/SKILL.md'"
# Backend
NCA="$SKILLS/nestjs-clean-architecture/SKILL.md"
assert_true "T6(BE): clean-architecture keeps the 4-layer split" \
  "grep -qiE 'domain' '$NCA' && grep -qiE 'application' '$NCA' && grep -qiE 'infrastructure' '$NCA'"
assert_true "T6(BE): clean-architecture keeps the dependency rule" \
  "grep -qiE 'dependency rule|domain .* infrastructure' '$NCA'"
assert_true "T6(BE): nestjs-patterns covers cross-cutting + mixins" \
  "test -f '$SKILLS/nestjs-patterns/patterns/cross-cutting.md' && test -f '$SKILLS/nestjs-patterns/patterns/mixins.md'"
assert_true "T6(BE): nestjs-best-practices retains rule files" \
  "[ \$(find '$SKILLS/nestjs-best-practices/rules' -name '*.md' | wc -l) -ge 10 ]"

# ---------------------------------------------------------------------------
echo
echo "=== T7: Dual-tier review agents — each covers frontend AND backend surfaces ==="
SR="$AGENTS/security-reviewer.md"
assert_true "T7: security-reviewer keeps FRONTEND surfaces (XSS / VITE_)" \
  "grep -qiE 'dangerouslySetInnerHTML|XSS' '$SR' && grep -qiE 'VITE_' '$SR'"
assert_true "T7: security-reviewer keeps BACKEND surfaces (SQL injection / OWASP / guards)" \
  "grep -qiE 'SQL|injection' '$SR' && grep -qiE 'OWASP' '$SR'"
CR="$AGENTS/code-reviewer.md"
assert_true "T7: code-reviewer references BOTH a react-* skill AND a nestjs-* skill" \
  "grep -qE 'react-' '$CR' && grep -qE 'nestjs-' '$CR'"
assert_true "T7: lessons-curator domain map lists BOTH stacks" \
  "grep -qiE 'react-' '$AGENTS/lessons-curator.md' && grep -qiE 'nestjs-' '$AGENTS/lessons-curator.md'"

# ---------------------------------------------------------------------------
echo
echo "=== T8: Skill-pointer cross-reference integrity (named skills exist) ==="
for s in tdd-workflow design-review plan-mode repo-conventions react-patterns \
         react-state-management react-routing frontend-security nestjs-best-practices \
         nestjs-clean-architecture nestjs-patterns database-transactions decision-rules; do
  assert_true "T8: instructions.md references '$s' AND its skill dir exists" \
    "grep -q '$s' '$INSTRUCTIONS' && test -d '$SKILLS/$s'"
done

# ---------------------------------------------------------------------------
echo
echo "=== T9: No stray dev artifacts in the shipped template ==="
assert_true "T9: no *.bak files under .ruler/" "[ \$(find '$RULER_DIR' -name '*.bak' | wc -l) -eq 0 ]"

# ---------------------------------------------------------------------------
echo
echo "==========================="
echo "Acceptance results: $PASS passed, $FAIL failed"
if [ "$FAIL" -gt 0 ]; then
  echo "Failed:$FAILED_TESTS"
  exit 1
fi
exit 0
