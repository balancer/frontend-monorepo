#!/bin/bash

# Exit on error
set -e

# 1. Get the commit range
# Vercel provides environment variables for the previous and current commit
# See: https://vercel.com/docs/deployments/git/environment-variables#system-environment-variables
# Note: For the first deployment or non-git deployments, VERCEL_GIT_PREVIOUS_SHA might be empty or zero-like.
# Adjust the base commit reference as needed for your branching strategy.
# Using 'HEAD~1' as a fallback if VERCEL_GIT_PREVIOUS_SHA is unusable.
BASE_COMMIT=${VERCEL_GIT_PREVIOUS_SHA:-HEAD~1}
CURRENT_COMMIT=${VERCEL_GIT_COMMIT_SHA:-HEAD}

# Fallback for initial deployments where PREVIOUS_SHA might be the zero hash
if [[ "$BASE_COMMIT" =~ ^0+$ ]]; then
  BASE_COMMIT="HEAD~1"
fi

echo "Comparing changes between $BASE_COMMIT and $CURRENT_COMMIT"

# 2. List changed files in packages/lib within that range
# Create a temporary file to store the list
CHANGED_FILES_LIST=$(mktemp)
# Use git diff to find changed files and filter for those within packages/lib
# The `|| true` prevents the script from exiting if git diff returns a non-zero code (e.g., no differences)
git diff --name-only $BASE_COMMIT $CURRENT_COMMIT -- packages/lib > "$CHANGED_FILES_LIST" || true

# Check if any files were changed in packages/lib
if [ ! -s "$CHANGED_FILES_LIST" ]; then
  echo "No changes detected in packages/lib between $BASE_COMMIT and $CURRENT_COMMIT. Skipping build."
  rm "$CHANGED_FILES_LIST" # Clean up temp file
  exit 0 # Exit code 0 tells Vercel to SKIP the build
fi

echo "Changed files in packages/lib found:"
cat "$CHANGED_FILES_LIST"
echo "---"

# 3. Run the Node.js analysis script, passing the path to the changed files list
# Use node directly. Ensure Node.js is available in the Vercel build environment.
# The script check-impact.mjs will exit with 0 (skip) or 1 (build).
node scripts/check-impact.mjs "$CHANGED_FILES_LIST"
EXIT_CODE=$?

# 4. Clean up the temporary file
rm "$CHANGED_FILES_LIST"

# 5. Exit with the code from the Node script
echo "Node script exited with code $EXIT_CODE. $( [ $EXIT_CODE -eq 0 ] && echo 'Skipping build.' || echo 'Proceeding with build.' )"
exit $EXIT_CODE
