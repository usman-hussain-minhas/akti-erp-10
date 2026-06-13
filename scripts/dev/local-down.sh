#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RUNTIME_DIR="${ESBLA_LOCAL_RUNTIME_DIR:-/tmp/esbla-spark-phase4a-local}"
PID_DIR="$RUNTIME_DIR/pids"
DB_PORT="${ESBLA_LOCAL_DB_PORT:-55432}"
API_PORT="${ESBLA_LOCAL_API_PORT:-3101}"
WEB_PORT="${ESBLA_LOCAL_WEB_PORT:-3003}"
SCREEN_PREFIX="${ESBLA_LOCAL_SCREEN_PREFIX:-esbla-phase4a-local}"

stop_screen() {
  local session_name="$1"
  if command -v screen >/dev/null 2>&1 && screen -list | grep -q "[.]${session_name}[[:space:]]"; then
    screen -S "$session_name" -X quit >/dev/null 2>&1 || true
  fi
}

stop_pid_file() {
  local file="$1"
  if [ -f "$file" ]; then
    local pid
    pid="$(cat "$file")"
    if [ -n "$pid" ] && kill -0 "$pid" >/dev/null 2>&1; then
      kill "$pid" >/dev/null 2>&1 || true
    fi
    rm -f "$file"
  fi
}

kill_listener_on_port() {
  local port="$1"
  local pids
  pids="$(lsof -tiTCP:"$port" -sTCP:LISTEN 2>/dev/null || true)"
  if [ -n "$pids" ]; then
    kill $pids >/dev/null 2>&1 || true
  fi
}

cd "$ROOT_DIR"

stop_screen "${SCREEN_PREFIX}-api"
stop_screen "${SCREEN_PREFIX}-web"

stop_pid_file "$PID_DIR/api.pid"
stop_pid_file "$PID_DIR/web.pid"

sleep 2
kill_listener_on_port "$API_PORT"
kill_listener_on_port "$WEB_PORT"

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  docker compose -f docker-compose.local.yml stop postgres >/dev/null 2>&1 || true
fi

if [ -d "$RUNTIME_DIR/pgdata" ] && command -v pg_ctl >/dev/null 2>&1; then
  pg_ctl -D "$RUNTIME_DIR/pgdata" stop -m fast >/dev/null 2>&1 || true
fi

sleep 1

if lsof -nP -iTCP:"$API_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "local-down failed: API port $API_PORT still has a listener" >&2
  exit 1
fi

if lsof -nP -iTCP:"$WEB_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "local-down failed: Web port $WEB_PORT still has a listener" >&2
  exit 1
fi

if lsof -nP -iTCP:"$DB_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "local-down failed: DB port $DB_PORT still has a listener" >&2
  exit 1
fi

echo "Esbla Spark Phase 4A local runtime is down."
