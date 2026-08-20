#!/bin/bash
# Cursor Cloud Agent overrides core.hooksPath, so the repo's husky/lint-staged
# pre-commit never runs on `git commit`. This hook re-applies the same gate:
# run lint-staged on the staged files, then block the commit if it fails.
# lint-staged re-stages its fixes, so the following `git commit` picks them up.
# Send lint-staged to stderr so stdout stays JSON. Did it run? tail /tmp/cursor-lint-staged-hook.log

# Consume stdin (hook input JSON) so the shell doesn't wait on it.
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $(cat)" >> /tmp/cursor-lint-staged-hook.log

if git diff --cached --quiet; then
  echo '{"permission": "deny", "user_message": "Stage files in a separate Shell call before git commit."}'
  exit 0
fi

if pnpm lint-staged >&2; then
  echo '{"permission": "allow"}'
  exit 0
else
  echo '{"permission": "deny", "user_message": "lint-staged failed. Fix the reported issues and retry the commit."}'
  exit 0
fi
