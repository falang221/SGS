#!/usr/bin/env bash
set -euo pipefail

schema_path="${1:-../../packages/shared/prisma/schema.prisma}"

if [[ -z "${DATABASE_URL:-}" ]]; then
  echo "DATABASE_URL is required."
  echo "Set DATABASE_URL before running Prisma migrations."
  exit 1
fi

# Common pitfall: unescaped @ in password breaks URL parsing.
if [[ "${DATABASE_URL}" =~ ://[^:/?#]+:[^/?#]*@[^/?#]*@ ]]; then
  echo "DATABASE_URL appears invalid: unescaped '@' detected in credentials."
  echo "URL-encode special characters in password (example: @ -> %40)."
  exit 1
fi

if [[ "${PRISMA_MIGRATE_MODE:-}" == "deploy" || "${CI:-}" == "true" || ! -t 1 ]]; then
  echo "Running non-interactive migration: prisma migrate deploy"
  pnpm exec prisma migrate deploy --schema="${schema_path}"
  exit 0
fi

echo "Running interactive migration: prisma migrate dev"
pnpm exec prisma migrate dev --schema="${schema_path}"
