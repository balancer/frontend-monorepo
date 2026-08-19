#!/bin/bash
# Cursor Cloud Agent overrides core.hooksPath, so the repo's husky/lint-staged
# pre-commit never runs on `git commit`. This hook re-applies the same gate:
# run lint-staged on the staged files, then block the commit if it fails.
# lint-staged re-stages its fixes, so the following `git commit` picks them up.

# Consume stdin (hook input JSON) so the shell doesn't wait on it.
cat > /dev/null

if pnpm lint-staged; then
  echo '{"permission": "allow"}'
  exit 0
else
  echo '{"permission": "deny", "user_message": "lint-staged failed. Fix the reported issues and retry the commit."}'
  exit 0
fi
