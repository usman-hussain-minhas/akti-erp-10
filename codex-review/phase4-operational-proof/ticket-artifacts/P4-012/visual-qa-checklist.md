# P4-012 Visual QA Checklist

Status: PASS

This checklist records browser-rendered evidence for the Phase 4 controlled local staging/demo proof. Screenshots are evidence only; closure also depends on behavior assertions, DOM/token scans, responsive viewport checks, and validation command results.

## Environment

- API: `http://127.0.0.1:3103`
- Web: `http://127.0.0.1:3003`
- Database: disposable local PostgreSQL on port `55434`
- Data classification: disposable local demo data only
- Secrets: no production secrets or credentials used
- Session token handling: local bearer token stored only in ignored runtime context, entered through UI, cleared before screenshots

## Required Screens

| Screen | Desktop | Mobile | Behavior checked | Evidence |
| --- | --- | --- | --- | --- |
| Setup organization empty state | PASS | PASS | Browser route renders empty setup form. | `screenshots/setup-organization-empty-desktop.png`, `screenshots/setup-organization-empty-mobile.png`, `browser-setup-log.txt` |
| Setup organization validation/success/conflict | PASS | Not required after desktop proof | Browser form validation, setup success, and conflict state after duplicate submit. | `screenshots/setup-organization-success-desktop.png`, `screenshots/setup-organization-conflict-desktop.png`, `browser-setup-log.txt` |
| Portal shell/dashboard | PASS | PASS | `/app` route renders expected shell text. | `screenshots/app-shell-desktop.png`, `screenshots/app-shell-mobile.png`, `browser-test-log.txt` |
| Lead Desk list | PASS | PASS | Bearer session context applied, inbox loaded, fixture lead visible. | `screenshots/lead-inbox-loaded-desktop.png`, `screenshots/lead-inbox-loaded-mobile.png`, `browser-test-log.txt` |
| Lead Desk create | PASS | PASS | Form renders, existing create action submits, success state visible. | `screenshots/lead-create-form-desktop.png`, `screenshots/lead-create-form-mobile.png`, `screenshots/lead-create-success-desktop.png`, `browser-test-log.txt` |
| Lead Desk detail | PASS | PASS | Scoped lead detail route loads fixture lead. | `screenshots/lead-detail-loaded-desktop.png`, `screenshots/lead-detail-loaded-mobile.png`, `browser-test-log.txt` |
| Lead Desk actions | PASS | PASS | Status update and assignment action submit through existing screen. | `screenshots/lead-actions-updated-desktop.png`, `screenshots/lead-actions-loaded-mobile.png`, `browser-test-log.txt` |
| Error/empty state | PASS | Not required after desktop proof | Missing lead route renders unavailable state. | `screenshots/lead-detail-not-found-desktop.png`, `browser-test-log.txt` |

## Redaction And Visual Review

- No actual bearer token appears in committed artifact text files: PASS.
- DOM scans show `htmlHasToken=false` and `textHasToken=false`: PASS.
- DOM scans show no `x-actor-user-id` text: PASS.
- Token textareas were cleared before screenshots: PASS.
- Screenshot PNG strings scan found no matching secret/token terms: PASS.
- Manual visual spot-check of key screenshots found no visible secret/token value: PASS.

## Notes

- The current frontend visual presentation is sparse, but the P4-012 requirement is operational proof of browser-rendered behavior and redacted visual evidence, not a redesign.
- Browser tests verified behavior before screenshots; screenshots alone were not treated as validation.
