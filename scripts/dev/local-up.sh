#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RUNTIME_DIR="${ESBLA_LOCAL_RUNTIME_DIR:-/tmp/esbla-spark-phase4a-local}"
LOG_DIR="$RUNTIME_DIR/logs"
PID_DIR="$RUNTIME_DIR/pids"

DB_HOST="${ESBLA_LOCAL_DB_HOST:-127.0.0.1}"
DB_PORT="${ESBLA_LOCAL_DB_PORT:-55432}"
DB_USER="${ESBLA_LOCAL_DB_USER:-esbla_local}"
DB_NAME="${ESBLA_LOCAL_DB_NAME:-esbla_phase4a_local}"
API_PORT="${ESBLA_LOCAL_API_PORT:-3101}"
WEB_PORT="${ESBLA_LOCAL_WEB_PORT:-3003}"
DATABASE_URL="${DATABASE_URL:-postgresql://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME}?schema=public}"
API_URL="http://127.0.0.1:${API_PORT}"
WEB_URL="http://127.0.0.1:${WEB_PORT}"
SCREEN_PREFIX="${ESBLA_LOCAL_SCREEN_PREFIX:-esbla-phase4a-local}"
API_SCREEN="${SCREEN_PREFIX}-api"
WEB_SCREEN="${SCREEN_PREFIX}-web"

fail() {
  echo "local-up failed: $*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "required command '$1' is not available"
}

wait_for_url() {
  local url="$1"
  local label="$2"
  local attempts="${3:-60}"
  for _ in $(seq 1 "$attempts"); do
    if curl -fsS "$url" >/dev/null 2>&1; then
      echo "$label is ready at $url"
      return 0
    fi
    sleep 1
  done
  fail "$label did not become ready at $url"
}

case "$DATABASE_URL" in
  postgresql://*@127.0.0.1:55432/esbla_phase4a_local*|postgresql://*@localhost:55432/esbla_phase4a_local*) ;;
  *) fail "DATABASE_URL must target the Phase 4A local database on 127.0.0.1:55432/esbla_phase4a_local" ;;
esac

require_command docker
require_command pnpm
require_command curl

mkdir -p "$LOG_DIR" "$PID_DIR"
cd "$ROOT_DIR"

screen_is_running() {
  command -v screen >/dev/null 2>&1 && screen -list | grep -q "[.]$1[[:space:]]"
}

start_detached_with_screen() {
  local session_name="$1"
  shift
  screen -dmS "$session_name" bash -lc "$*"
}

start_postgres_with_docker() {
  echo "Starting Phase 4A local PostgreSQL with Docker Compose on ${DB_HOST}:${DB_PORT}"
  docker compose -f docker-compose.local.yml up -d postgres

  echo "Waiting for PostgreSQL health"
  for _ in $(seq 1 60); do
    if docker compose -f docker-compose.local.yml exec -T postgres pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null 2>&1; then
      return 0
    fi
    sleep 1
  done
  docker compose -f docker-compose.local.yml exec -T postgres pg_isready -U "$DB_USER" -d "$DB_NAME" >/dev/null
}

start_postgres_with_local_pg() {
  require_command initdb
  require_command pg_ctl
  require_command psql
  require_command createuser
  require_command createdb

  local pgdata="$RUNTIME_DIR/pgdata"
  if [ ! -f "$pgdata/PG_VERSION" ]; then
    echo "Initializing disposable local PostgreSQL data directory at $pgdata"
    initdb -A trust --encoding=UTF8 --locale=C -D "$pgdata" >"$LOG_DIR/initdb.log" 2>&1
  fi

  if ! pg_ctl -D "$pgdata" status >/dev/null 2>&1; then
    echo "Starting disposable local PostgreSQL on ${DB_HOST}:${DB_PORT}"
    pg_ctl -D "$pgdata" -l "$LOG_DIR/postgres.log" -o "-p ${DB_PORT} -h ${DB_HOST}" start >"$LOG_DIR/pg_ctl-start.log" 2>&1
  fi

  for _ in $(seq 1 60); do
    if pg_isready -h "$DB_HOST" -p "$DB_PORT" >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done
  pg_isready -h "$DB_HOST" -p "$DB_PORT" >/dev/null

  if ! psql -h "$DB_HOST" -p "$DB_PORT" -d postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='${DB_USER}'" | grep -q 1; then
    createuser -h "$DB_HOST" -p "$DB_PORT" "$DB_USER"
  fi

  if ! psql -h "$DB_HOST" -p "$DB_PORT" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'" | grep -q 1; then
    createdb -h "$DB_HOST" -p "$DB_PORT" -O "$DB_USER" "$DB_NAME"
  fi
}

if docker info >/dev/null 2>&1; then
  start_postgres_with_docker
else
  echo "Docker daemon is unavailable; falling back to disposable local PostgreSQL."
  start_postgres_with_local_pg
fi

echo "Running committed Prisma migrations"
DATABASE_URL="$DATABASE_URL" pnpm exec prisma migrate deploy --schema prisma/schema.prisma --config prisma.config.ts
DATABASE_URL="$DATABASE_URL" pnpm exec prisma generate --schema prisma/schema.prisma

if screen_is_running "$API_SCREEN"; then
  echo "API already running in screen session $API_SCREEN"
elif [ -f "$PID_DIR/api.pid" ] && kill -0 "$(cat "$PID_DIR/api.pid")" >/dev/null 2>&1; then
  echo "API already running with pid $(cat "$PID_DIR/api.pid")"
else
  echo "Starting API on $API_URL"
  DATABASE_URL="$DATABASE_URL" pnpm --filter @akti/api build >"$LOG_DIR/api-build.log" 2>&1
  if command -v screen >/dev/null 2>&1; then
    start_detached_with_screen "$API_SCREEN" "cd '$ROOT_DIR' && DATABASE_URL='$DATABASE_URL' PORT='$API_PORT' AKTI_AUTH_SESSION_SECRET='local-placeholder-session-secret' AKTI_AUTH_SESSION_MAX_AGE_SECONDS='3600' AKTI_CORS_ALLOWED_ORIGINS='http://localhost:${WEB_PORT},http://127.0.0.1:${WEB_PORT}' AKTI_SECURITY_HEADERS_ENABLED='true' AKTI_RATE_LIMIT_WINDOW_MS='60000' AKTI_RATE_LIMIT_MAX_REQUESTS='120' AKTI_TRUST_PROXY_HEADERS='false' pnpm --filter @akti/api start >'$LOG_DIR/api.log' 2>&1"
    echo "$API_SCREEN" > "$PID_DIR/api.screen"
  else
    nohup env \
      DATABASE_URL="$DATABASE_URL" \
      PORT="$API_PORT" \
      AKTI_AUTH_SESSION_SECRET="local-placeholder-session-secret" \
      AKTI_AUTH_SESSION_MAX_AGE_SECONDS="3600" \
      AKTI_CORS_ALLOWED_ORIGINS="http://localhost:${WEB_PORT},http://127.0.0.1:${WEB_PORT}" \
      AKTI_SECURITY_HEADERS_ENABLED="true" \
      AKTI_RATE_LIMIT_WINDOW_MS="60000" \
      AKTI_RATE_LIMIT_MAX_REQUESTS="120" \
      AKTI_TRUST_PROXY_HEADERS="false" \
      pnpm --filter @akti/api start >"$LOG_DIR/api.log" 2>&1 &
    echo "$!" > "$PID_DIR/api.pid"
  fi
fi
wait_for_url "$API_URL/health" "API"

if screen_is_running "$WEB_SCREEN"; then
  echo "Web already running in screen session $WEB_SCREEN"
elif [ -f "$PID_DIR/web.pid" ] && kill -0 "$(cat "$PID_DIR/web.pid")" >/dev/null 2>&1; then
  echo "Web already running with pid $(cat "$PID_DIR/web.pid")"
else
  echo "Starting Web on $WEB_URL"
  if command -v screen >/dev/null 2>&1; then
    start_detached_with_screen "$WEB_SCREEN" "cd '$ROOT_DIR' && NEXT_PUBLIC_API_BASE_URL='$API_URL' pnpm --filter @akti/web exec next dev --hostname 127.0.0.1 --port '$WEB_PORT' >'$LOG_DIR/web.log' 2>&1"
    echo "$WEB_SCREEN" > "$PID_DIR/web.screen"
  else
    nohup env \
      NEXT_PUBLIC_API_BASE_URL="$API_URL" \
      pnpm --filter @akti/web exec next dev --hostname 127.0.0.1 --port "$WEB_PORT" >"$LOG_DIR/web.log" 2>&1 &
    echo "$!" > "$PID_DIR/web.pid"
  fi
fi
wait_for_url "$WEB_URL/" "Web"

cat <<EOF
Esbla Spark Phase 4A local runtime is up.
API: $API_URL
Web: $WEB_URL
Runtime logs: $LOG_DIR
EOF
