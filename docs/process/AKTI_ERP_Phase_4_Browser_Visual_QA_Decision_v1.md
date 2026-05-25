# AKTI ERP Phase 4 Browser-rendered Frontend and Visual QA Decision v1

**Status:** ACCEPTED_FOR_PHASE_4_EXECUTION
**Ticket:** P4-005

## Decision

Phase 4 will use existing repo capabilities and localhost rendering for browser/visual QA. No Playwright/Puppeteer/Selenium dependency is approved by this ticket. If a new browser automation dependency becomes required, execution must stop for explicit approval.

## Tool/Path

- Use existing Next.js build/start for rendered pages.
- Use available local browser or platform browser tooling for screenshots if available without package changes.
- Use existing web tests and curl/DOM/source evidence as fallback for behavior where browser automation is unavailable.
- Screenshots are evidence, not validation by themselves.

## Routes/Screens

# P4-005 Browser Visual QA Matrix

| Route/screen | Purpose | Required state | Data fixture | Expected visual state | Expected API calls | Viewports | Screenshot? | Redaction? | Pass/fail criteria |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `/setup/organization` | Initial organization setup proof | Empty DB before setup; conflict state after setup | Phase 4 demo organization payload | Form, validation, success, and conflict/error states render | POST `/platform/setup/organization` | 390x844, 1366x768 | Yes | Yes | Form visible; validation works; success/conflict message visible; no secrets. |
| `/app` | Portal shell/dashboard if present | Web process running | None | Portal shell or scaffold route loads | none or app bootstrap calls | 390x844, 1366x768 | Yes | Yes | Route responds and renders without crash. |
| `/lead-desk/inbox` | Lead Desk list | Staging/demo API available and operator context from P4-008 | Existing seeded/demo data or empty state | Empty/list state renders per screen contract | Lead Desk list API | 390x844, 1366x768 | Yes | Yes | Uses bearer/session context; no x-actor-user-id regression. |
| `/lead-desk/create` | Lead creation screen | Same as Lead Desk list | Demo form values | Form renders; submit behavior tested if API state allows | Lead create API | 390x844, 1366x768 | Yes | Yes | Existing form submits or failure is classified. |
| `/lead-desk/leads/[leadId]` | Lead detail/actions | A demo lead exists if available | Demo lead ID | Detail/actions render or empty/not-found state classified | Lead detail/action APIs | 390x844, 1366x768 | Yes | Yes | Screen contract behavior verified where data exists. |
| Engagement Gateway surfaced state | Stub boundary proof | If surfaced by web | Gateway stub data if available | Stub-only messaging visible or classified not surfaced | Gateway stub API if route exists | 1366x768 | Optional | Yes | No direct WhatsApp/Meta coupling. |
| Auth/session/operator context flow | Trusted session proof | P4-008 staging-safe auth | Placeholder session token | API calls carry bearer/session context | API calls from web client | 1366x768 | Evidence log | Yes | No caller-controlled x-actor-user-id trusted ingress. |
| Error/empty states | Resilience proof | Missing/empty data | None | Empty/error copy renders | relevant route/API | 390x844, 1366x768 | Yes | Yes | No crash; no secrets in DOM/logs. |

## Evidence Handling

Screenshots, DOM dumps, browser logs, and network logs must be redacted. Any token, database URL, credential, private key, session value, or production data is a stop unless proven to be a placeholder.

## Stop Conditions

- New browser test dependency is required.
- Screenshots/logs expose real secret/token/session values.
- Visual QA requires UX redesign or new screen contracts.
- Production auth/provider credentials are required.
