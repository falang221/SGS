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

has_src_index_change=0
if echo "${staged_files}" | grep -q '^packages/shared/src/index\.ts$'; then
  has_src_index_change=1
fi

has_dist_js=0
if echo "${staged_files}" | grep -q '^packages/shared/dist/index\.js$'; then
  has_dist_js=1
fi

has_dist_dts=0
if echo "${staged_files}" | grep -q '^packages/shared/dist/index\.d\.ts$'; then
  has_dist_dts=1
fi

if [[ "${has_dist_js}" -ne "${has_dist_dts}" ]]; then
  echo "packages/shared/dist/index.js and packages/shared/dist/index.d.ts must be staged together."
  exit 1
fi

if [[ "${has_src_index_change}" -eq 1 ]] && [[ "${has_dist_js}" -eq 0 || "${has_dist_dts}" -eq 0 ]]; then
  echo "packages/shared/src/index.ts changed without synced dist artifacts."
  echo "Run: pnpm -F @school-mgmt/shared build"
  echo "Then stage: packages/shared/dist/index.js and packages/shared/dist/index.d.ts"
  exit 1
fi

echo "Staged files verification passed."
