#!/usr/bin/env bash
set -euo pipefail

staged_files="$(git diff --cached --name-only --diff-filter=ACMR)"

if [[ -z "${staged_files}" ]]; then
  echo "No staged files to verify."
  exit 0
fi

forbidden_pattern='(^|/)(node_modules|dist|\.vite)/|(^|/)\.DS_Store$'
allowed_dist_pattern='^packages/shared/dist/index\.(js|d\.ts)$'

forbidden_matches="$(
  echo "${staged_files}" \
    | grep -E "${forbidden_pattern}" \
    | grep -Ev "${allowed_dist_pattern}" \
    || true
)"
if [[ -n "${forbidden_matches}" ]]; then
  echo "Forbidden generated files detected in staged changes:"
  echo "${forbidden_matches}"
  exit 1
fi

invalid_migration_files="$(
  echo "${staged_files}" \
    | grep '^packages/shared/prisma/migrations/' \
    | grep -Ev '^packages/shared/prisma/migrations/[^/]+/migration\.sql$|^packages/shared/prisma/migrations/migration_lock\.toml$' \
    || true
)"

if [[ -n "${invalid_migration_files}" ]]; then
  echo "Unexpected Prisma migration file names detected:"
  echo "${invalid_migration_files}"
  echo "Only migration.sql is expected inside migration folders."
  exit 1
fi

echo "Staged files verification passed."
