# P4A-009 Screenshot Capture Matrix

| Route | Purpose | Required evidence | Redaction focus |
| --- | --- | --- | --- |
| / | Root scaffold | Desktop screenshot | No secret/token/session values |
| /app | Portal shell / current work surface | Desktop screenshot | No raw production data |
| /setup/organization | Setup/onboarding form | Desktop screenshot | No credential values |
| /lead-desk/inbox | Lead Desk inbox current accessible state | Desktop screenshot | No bearer token or real session value |
| /lead-desk/create | Lead creation current accessible state | Desktop screenshot | No bearer token or production customer data |
| /lead-desk/leads/not-a-real-lead | Route-accessible detail/error state | Desktop screenshot | No stack traces or real IDs |
| /lead-desk/leads/not-a-real-lead/actions | Route-accessible actions/error state | Desktop screenshot | No stack traces or real IDs |
| /app/settings | Missing planned settings route | Desktop screenshot | No stack traces |

Capture may use the Codex in-app Browser. Screenshots are evidence; they must be paired with route inventory, redaction review, and validation logs.
