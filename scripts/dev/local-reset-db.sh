#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RUNTIME_DIR="${ESBLA_LOCAL_RUNTIME_DIR:-/tmp/esbla-spark-phase4a-local}"
DB_HOST="${ESBLA_LOCAL_DB_HOST:-127.0.0.1}"
DB_PORT="${ESBLA_LOCAL_DB_PORT:-55432}"
DB_NAME="${ESBLA_LOCAL_DB_NAME:-esbla_phase4a_local}"

case "$DB_HOST:$DB_PORT/$DB_NAME" in
  127.0.0.1:55432/esbla_phase4a_local|localhost:55432/esbla_phase4a_local) ;;
  *)
    echo "local-reset-db failed: refusing to reset non-Phase-4A database target $DB_HOST:$DB_PORT/$DB_NAME" >&2
    exit 1
    ;;
esac

cd "$ROOT_DIR"

bash scripts/dev/local-down.sh

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  docker compose -f docker-compose.local.yml down -v --remove-orphans
fi

rm -rf "$RUNTIME_DIR/pgdata"

echo "Esbla Spark Phase 4A local database reset is complete for $DB_HOST:$DB_PORT/$DB_NAME."
