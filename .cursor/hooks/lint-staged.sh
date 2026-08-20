#!/bin/bash
# Cloud Agents override core.hooksPath, so husky's pre-commit never runs.
# This beforeShellExecution hook is the same gate: pnpm lint-staged.
#
# The hook fires BEFORE the shell command, so `git add && git commit` still
# has an empty index here. Deny that case and tell the agent to add first
# (docs: agent_message). Do not re-run git add from this script.
#
# stdout must be JSON only. lint-staged prints to stdout; if that mixes with
# {"permission":"deny"}, Cursor treats it as invalid JSON and fail-opens
# (exit 0 + bad JSON = allow). Send lint-staged to stderr, and use exit 2
# to deny (docs: exit 2 == permission deny even without JSON).
#
# Did this hook run?  tail /tmp/cursor-lint-staged-hook.log

LOG=/tmp/cursor-lint-staged-hook.log
log() { printf '%s %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*" | tee -a "$LOG" >&2; }

input=$(cat)
log "ran ${input}"

if git diff --cached --quiet; then
  log "deny empty-index"
  echo '{"permission":"deny","agent_message":"Stage files in a separate Shell call before git commit. This hook runs before the command, so lint-staged cannot see files added in the same call."}'
  exit 2
fi

if pnpm lint-staged >&2; then
  log "allow"
  echo '{"permission":"allow"}'
  exit 0
fi

log "deny lint-staged"
echo '{"permission":"deny","user_message":"lint-staged failed. Fix the reported issues and retry the commit."}'
exit 2
