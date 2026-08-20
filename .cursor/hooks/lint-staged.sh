#!/usr/bin/env bash
# Cursor Cloud Agent overrides core.hooksPath, so the repo's husky/lint-staged
# pre-commit never runs on `git commit`. This beforeShellExecution hook
# re-applies the same gate.
#
# Important: beforeShellExecution runs BEFORE the whole shell command. Agents
# often send `git add … && git commit …` in one call, so nothing is staged yet
# when this hook starts. We apply safe staging subcommands from that compound
# command first, then run lint-staged. If there is still nothing staged, deny.

set -euo pipefail

INPUT="$(cat)"
COMMAND="$(printf '%s' "$INPUT" | jq -r '.command // empty')"

# Apply `git add|rm|mv` segments that appear before `git commit` in && / ;
# chained commands so lint-staged sees the files about to be committed.
if [[ -n "$COMMAND" ]]; then
  COMMAND="$COMMAND" python3 - <<'PY'
import os, re, shlex, subprocess

cmd = os.environ.get("COMMAND", "")
parts = re.split(r"\s*(?:&&|;)\s*", cmd)
staging: list[str] = []
for part in parts:
    stripped = part.strip()
    if not stripped:
        continue
    if re.match(r"git\s+commit\b", stripped):
        break
    if re.match(r"git\s+(add|rm|mv)\b", stripped):
        staging.append(stripped)

for segment in staging:
    try:
        argv = shlex.split(segment)
    except ValueError:
        continue
    if len(argv) < 2 or argv[0] != "git" or argv[1] not in ("add", "rm", "mv"):
        continue
    subprocess.run(argv, check=False)
PY
fi

if git diff --cached --quiet; then
  jq -n '{
    permission: "deny",
    user_message: "Commit blocked: no staged files when the lint-staged hook ran.",
    agent_message: "beforeShellExecution ran lint-staged before anything was staged. Stage files first (separate `git add` Shell call, or include `git add` before `git commit` in the same command), fix any lint-staged failures, then commit."
  }'
  exit 0
fi

if pnpm lint-staged; then
  jq -n '{permission: "allow"}'
  exit 0
else
  jq -n '{
    permission: "deny",
    user_message: "lint-staged failed. Fix the reported issues and retry the commit.",
    agent_message: "pnpm lint-staged failed on staged files. Fix the lint/typecheck/format issues, re-stage, and retry `git commit`."
  }'
  exit 0
fi
