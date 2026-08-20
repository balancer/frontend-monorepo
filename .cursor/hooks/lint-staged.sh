#!/bin/bash
# Cloud Agents override core.hooksPath, so husky's pre-commit never runs.
# This beforeShellExecution hook is the same gate: pnpm lint-staged.
#
# The hook fires BEFORE the shell command, so `git add && git commit` still
# has an empty index here. Deny that case and tell the agent to add first
# (docs: agent_message). Do not re-run git add from this script.

cat > /dev/null

if git diff --cached --quiet; then
  echo '{"permission":"deny","agent_message":"Stage files in a separate Shell call before git commit. This hook runs before the command, so lint-staged cannot see files added in the same call."}'
  exit 0
fi

if pnpm lint-staged; then
  echo '{"permission":"allow"}'
  exit 0
fi

echo '{"permission":"deny","user_message":"lint-staged failed. Fix the reported issues and retry the commit."}'
exit 0
