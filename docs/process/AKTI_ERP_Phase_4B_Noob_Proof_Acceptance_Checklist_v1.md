# AKTI ERP Phase 4B Noob-Proof Acceptance Checklist v1

**Status:** PRODUCT_ACCEPTANCE_CHECKLIST
**Rule:** Phase 4B cannot close unless every applicable item is PASS.

## Binary Checklist

| Check | Pass / Fail |
| --- | --- |
| Every screen has a visible page title | PASS/FAIL |
| Primary action is obvious | PASS/FAIL |
| Navigation shows current location | PASS/FAIL |
| Every empty state has a clear message and next action where safe | PASS/FAIL |
| Every error is plain English | PASS/FAIL |
| No normal-user stack traces, raw API errors, or debug wording | PASS/FAIL |
| Every form field has a label | PASS/FAIL |
| Every loading state is visible | PASS/FAIL |
| Destructive or high-risk actions require confirmation | PASS/FAIL |
| Manual bearer token textarea is hidden from normal operators | PASS/FAIL |
| No raw bearer tokens are visible to normal users | PASS/FAIL |
| No raw actor/org/user/lead IDs are visible to normal users by default | PASS/FAIL |
| Advanced Diagnostics is hidden from normal operators by default | PASS/FAIL |
| Keyboard/focus basics work for shell, settings, command palette, drawers, and forms | PASS/FAIL |
| Text is readable at common desktop and mobile sizes | PASS/FAIL |
| Visual QA screenshots show no unreadable layouts | PASS/FAIL |
| Visual QA screenshots show no missing empty/loading/error states | PASS/FAIL |
| Visual QA screenshots show no raw token/ID exposure | PASS/FAIL |
| Visual QA screenshots show no API/debug wording for normal users | PASS/FAIL |

## Closure Gate

Visual QA is a pass/fail gate, not merely an audit artifact.

If browser screenshots reveal raw token/ID exposure, unreadable layouts, missing empty states, keyboard traps, or API/debug wording, Phase 4B cannot close.
