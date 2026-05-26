#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RUNTIME_DIR="${AKTI_LOCAL_RUNTIME_DIR:-/tmp/akti-erp-phase4a-local}"
API_PORT="${AKTI_LOCAL_API_PORT:-3101}"
WEB_PORT="${AKTI_LOCAL_WEB_PORT:-3003}"
API_URL="${AKTI_LOCAL_API_URL:-http://127.0.0.1:${API_PORT}}"
WEB_URL="${AKTI_LOCAL_WEB_URL:-http://127.0.0.1:${WEB_PORT}}"
SETUP_SLUG="${AKTI_LOCAL_SMOKE_SETUP_SLUG:-phase4a-smoke}"
SETUP_DOMAIN="${AKTI_LOCAL_SMOKE_SETUP_DOMAIN:-phase4a-smoke.example}"
SETUP_NAME="${AKTI_LOCAL_SMOKE_SETUP_NAME:-Phase 4A Smoke Organization}"

pass_count=0

fail_case() {
  local smoke_case="$1"
  local classification="$2"
  local hint="$3"
  echo "FAIL [$classification] $smoke_case"
  echo "Hint: $hint"
  echo "Cleanup: run 'bash scripts/dev/local-down.sh' to stop any local proof services."
  exit 1
}

pass_case() {
  local smoke_case="$1"
  pass_count=$((pass_count + 1))
  echo "PASS $smoke_case"
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail_case \
    "required command '$1' is available" \
    "local_tooling_missing" \
    "Install or expose '$1' locally, then rerun this smoke script."
}

require_contains() {
  local value="$1"
  local expected="$2"
  local smoke_case="$3"
  local classification="$4"
  local hint="$5"
  if [[ "$value" != *"$expected"* ]]; then
    fail_case "$smoke_case" "$classification" "$hint"
  fi
}

curl_body() {
  local url="$1"
  curl -fsS "$url"
}

ensure_runtime_up() {
  if curl -fsS "$API_URL/health" >/dev/null 2>&1 && curl -fsS "$WEB_URL/" >/dev/null 2>&1; then
    echo "Using existing AKTI ERP Phase 4A local runtime."
    return
  fi

  echo "Local runtime is not fully reachable. Starting it with scripts/dev/local-up.sh."
  bash scripts/dev/local-up.sh
}

check_api_health() {
  local body
  body="$(curl_body "$API_URL/health")" || fail_case \
    "API health endpoint responds" \
    "api_unreachable" \
    "Start the local runtime with 'bash scripts/dev/local-up.sh' and check $RUNTIME_DIR/logs/api.log."
  require_contains "$body" '"status":"healthy"' "API health endpoint returns healthy status" "api_health_unhealthy" \
    "The API responded, but not with the expected healthy status body."
  pass_case "API /health is healthy at $API_URL/health"
}

check_web_root() {
  local body
  body="$(curl_body "$WEB_URL/")" || fail_case \
    "Web root responds" \
    "web_unreachable" \
    "Start the local runtime with 'bash scripts/dev/local-up.sh' and check $RUNTIME_DIR/logs/web.log."
  if [ -z "$body" ]; then
    fail_case "Web root returns HTML" "web_empty_response" "The Web server returned an empty body."
  fi
  require_contains "$body" 'AKTI' "Web root contains AKTI content" "web_unexpected_response" \
    "The Web server responded, but the body did not look like the AKTI ERP app."
  pass_case "Web root responds at $WEB_URL/"
}

check_setup_organization() {
  local payload response_file body status
  response_file="$(mktemp)"
  payload="{\"slug\":\"${SETUP_SLUG}\",\"display_name\":\"${SETUP_NAME}\",\"status\":\"active\",\"domain\":\"${SETUP_DOMAIN}\",\"is_primary\":true}"

  status="$(
    curl -sS -o "$response_file" -w '%{http_code}' \
      -X POST "$API_URL/platform/setup/organization" \
      -H 'Content-Type: application/json' \
      --data "$payload"
  )" || {
    rm -f "$response_file"
    fail_case "Setup organization path responds" "setup_unreachable" \
      "Check that the API is running locally and that committed migrations were applied."
  }

  body="$(cat "$response_file")"
  rm -f "$response_file"

  case "$status" in
    201)
      require_contains "$body" '"setup_state":"completed"' "Setup organization completes" "setup_unexpected_response" \
        "The setup endpoint returned 201, but the body did not confirm completed setup."
      pass_case "Setup organization path completed local bootstrap"
      ;;
    409)
      if [[ "$body" == *"organization setup already completed"* || "$body" == *"organization slug or domain already exists"* ]]; then
        pass_case "Setup organization path is reachable and reports local setup already completed"
      else
        fail_case "Setup organization conflict is explainable" "setup_conflict_unexpected" \
          "The setup endpoint returned 409, but not with an expected local setup completion message."
      fi
      ;;
    *)
      fail_case "Setup organization path returns 201 or expected 409" "setup_failed" \
        "Unexpected HTTP $status from setup endpoint. Check API logs and reset the local DB with 'bash scripts/dev/local-reset-db.sh' if this is local proof data."
      ;;
  esac
}

check_cors_and_security_headers() {
  local headers_file
  headers_file="$(mktemp)"
  curl -fsS -D "$headers_file" -o /dev/null \
    -H "Origin: http://127.0.0.1:${WEB_PORT}" \
    "$API_URL/health" || {
      rm -f "$headers_file"
      fail_case "Allowed local CORS health request responds" "cors_probe_failed" \
        "The API health endpoint did not respond to the local Web origin probe."
    }

  if ! grep -qi '^access-control-allow-origin: http://127.0.0.1:'"$WEB_PORT"'[[:space:]]*$' "$headers_file"; then
    rm -f "$headers_file"
    fail_case "Allowed local CORS origin is echoed" "cors_header_missing" \
      "Confirm AKTI_CORS_ALLOWED_ORIGINS includes http://127.0.0.1:${WEB_PORT} in scripts/dev/local-up.sh."
  fi

  if ! grep -qi '^x-content-type-options: nosniff[[:space:]]*$' "$headers_file"; then
    rm -f "$headers_file"
    fail_case "Security headers are present" "security_header_missing" \
      "Confirm AKTI_SECURITY_HEADERS_ENABLED remains true for the local API process."
  fi

  rm -f "$headers_file"
  pass_case "Allowed local CORS and security headers are present"
}

main() {
  cd "$ROOT_DIR"
  require_command bash
  require_command curl
  require_command grep
  require_command mktemp

  echo "AKTI ERP Phase 4A local smoke starting."
  echo "API URL: $API_URL"
  echo "Web URL: $WEB_URL"
  echo "Runtime directory: $RUNTIME_DIR"

  ensure_runtime_up
  check_api_health
  check_web_root
  check_setup_organization
  check_cors_and_security_headers

  echo "PASS Phase 4A local smoke completed with $pass_count checks."
  echo "Browser URL: $WEB_URL"
  echo "Cleanup expectation: run 'bash scripts/dev/local-down.sh' when local inspection is complete."
}

main "$@"
