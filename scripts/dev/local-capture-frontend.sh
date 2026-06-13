#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ARTIFACT_DIR="${ESBLA_LOCAL_CAPTURE_ARTIFACT_DIR:-docs/audits/local/phase4a_local_demo_staging/ticket_artifacts/p4a_009}"
SCREENSHOT_DIR="$ARTIFACT_DIR/screenshots"
API_PORT="${ESBLA_LOCAL_API_PORT:-3101}"
WEB_PORT="${ESBLA_LOCAL_WEB_PORT:-3003}"
API_URL="${ESBLA_LOCAL_API_URL:-http://127.0.0.1:${API_PORT}}"
WEB_URL="${ESBLA_LOCAL_WEB_URL:-http://127.0.0.1:${WEB_PORT}}"

ROUTES=(
  "/"
  "/app"
  "/setup/organization"
  "/lead-desk/inbox"
  "/lead-desk/create"
  "/lead-desk/leads/not-a-real-lead"
  "/lead-desk/leads/not-a-real-lead/actions"
  "/app/settings"
)

fail() {
  echo "local-capture-frontend failed: $*" >&2
  echo "Cleanup: run 'bash scripts/dev/local-down.sh' to stop any local proof services." >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "required command '$1' is not available"
}

ensure_runtime_up() {
  if curl -fsS "$API_URL/health" >/dev/null 2>&1 && curl -fsS "$WEB_URL/" >/dev/null 2>&1; then
    echo "Using existing Esbla Spark Phase 4A local runtime."
    return
  fi

  echo "Local runtime is not fully reachable. Starting it with scripts/dev/local-up.sh."
  bash scripts/dev/local-up.sh
}

write_browser_url_log() {
  {
    echo "# P4A-009 Browser URL Log"
    echo
    echo "API URL: $API_URL"
    echo "Web URL: $WEB_URL"
    echo "Screenshot directory: $SCREENSHOT_DIR"
    echo
    echo "## Routes"
    for route in "${ROUTES[@]}"; do
      echo "- ${WEB_URL}${route}"
    done
    echo
    echo "## Capture Procedure"
    echo
    echo "1. Run: bash scripts/dev/local-capture-frontend.sh"
    echo "2. Use the Codex in-app Browser or another already-approved local browser tool."
    echo "3. Capture screenshots into: $SCREENSHOT_DIR"
    echo "4. Do not install Playwright, Puppeteer, Selenium, or other browser dependencies without approval."
    echo "5. Run screenshot/log redaction review before accepting evidence."
    echo "6. Run: bash scripts/dev/local-down.sh when browser inspection is complete."
  } > "$ARTIFACT_DIR/browser-url-log.txt"
}

write_capture_matrix() {
  {
    echo "# P4A-009 Screenshot Capture Matrix"
    echo
    echo "| Route | Purpose | Required evidence | Redaction focus |"
    echo "| --- | --- | --- | --- |"
    echo "| / | Root scaffold | Desktop screenshot | No secret/token/session values |"
    echo "| /app | Portal shell / current work surface | Desktop screenshot | No raw production data |"
    echo "| /setup/organization | Setup/onboarding form | Desktop screenshot | No credential values |"
    echo "| /lead-desk/inbox | Lead Desk inbox current accessible state | Desktop screenshot | No bearer token or real session value |"
    echo "| /lead-desk/create | Lead creation current accessible state | Desktop screenshot | No bearer token or production customer data |"
    echo "| /lead-desk/leads/not-a-real-lead | Route-accessible detail/error state | Desktop screenshot | No stack traces or real IDs |"
    echo "| /lead-desk/leads/not-a-real-lead/actions | Route-accessible actions/error state | Desktop screenshot | No stack traces or real IDs |"
    echo "| /app/settings | Missing planned settings route | Desktop screenshot | No stack traces |"
    echo
    echo "Capture may use the Codex in-app Browser. Screenshots are evidence; they must be paired with route inventory, redaction review, and validation logs."
  } > "$ARTIFACT_DIR/screenshot-capture-matrix.md"
}

main() {
  cd "$ROOT_DIR"
  require_command bash
  require_command curl
  require_command mkdir

  mkdir -p "$SCREENSHOT_DIR"
  ensure_runtime_up
  write_browser_url_log
  write_capture_matrix

  echo "Esbla Spark Phase 4A frontend capture support is ready."
  echo "Browser URL: $WEB_URL"
  echo "Screenshot directory: $SCREENSHOT_DIR"
  echo "Route matrix: $ARTIFACT_DIR/screenshot-capture-matrix.md"
  echo "Cleanup expectation: run 'bash scripts/dev/local-down.sh' when local browser inspection is complete."
}

main "$@"
