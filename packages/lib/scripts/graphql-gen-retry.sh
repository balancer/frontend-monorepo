#!/usr/bin/env bash
set -euo pipefail

max_attempts="${GRAPHQL_CODEGEN_MAX_ATTEMPTS:-3}"
sleep_seconds="${GRAPHQL_CODEGEN_RETRY_DELAY_SECONDS:-5}"

attempt=1
while [ "$attempt" -le "$max_attempts" ]; do
  echo "GraphQL codegen attempt ${attempt}/${max_attempts}..."
  if pnpm graphql:gen; then
    exit 0
  fi

  if [ "$attempt" -lt "$max_attempts" ]; then
    echo "GraphQL codegen failed. Retrying in ${sleep_seconds}s..."
    sleep "$sleep_seconds"
  fi

  attempt=$((attempt + 1))
done

echo "GraphQL codegen failed after ${max_attempts} attempts."
exit 1
