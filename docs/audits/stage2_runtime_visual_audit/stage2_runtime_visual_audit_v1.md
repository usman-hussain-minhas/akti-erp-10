---
document_id: stage2_runtime_visual_audit_v1
status: visual_audit_blocked_runtime_endpoint_failure
created: 2026-06-13
updated: 2026-06-13
owner: Usman Hussain
---

# Stage 2 Runtime Visual Audit v1

Status: `VISUAL_AUDIT_BLOCKED_RUNTIME_ENDPOINTS_RETURN_500`

Final target achieved: `false`

The committed API and web scripts were executed locally. The web app served `/app` and the browser captured real screenshots. The API process started only after local-only runtime environment values were provided, but API-backed runtime endpoints returned `500`, so the full visual proof set could not be completed honestly.

## Runtime start evidence

| Target | Command | Result |
| --- | --- | --- |
| API | `pnpm --filter @akti/api start:dev` | Blocked: `AKTI_AUTH_SESSION_SECRET must be configured outside source control` |
| API | `AKTI_AUTH_SESSION_SECRET=local_stage2_visual_secret_12345 AKTI_CORS_ALLOWED_ORIGINS=http://localhost:3000 pnpm --filter @akti/api start:dev` | Blocked: `DATABASE_URL is required to initialize PrismaService` |
| API | `AKTI_AUTH_SESSION_SECRET=local_stage2_visual_secret_12345 AKTI_CORS_ALLOWED_ORIGINS=http://localhost:3000 DATABASE_URL='postgresql://postgres:postgres@localhost:5432/akti_stage2_visual?schema=public' pnpm --filter @akti/api start:dev` | Started, but runtime endpoints returned `500` |
| Web | `NEXT_PUBLIC_API_BASE_URL=http://localhost:3001 pnpm --filter @akti/web dev` | Started; `/app` returned HTTP `200` |

## Captured screenshots

| ID | Path | Assertion | Result |
| --- | --- | --- | --- |
| VIS-001 | `docs/audits/stage2_runtime_visual_audit/screenshots/01_web_app_shell.png` | Web app shell loads and displays Phase 6 runtime shell with runtime-gated bundle disclosure. | PASS_VISUAL |
| VIS-002 | `docs/audits/stage2_runtime_visual_audit/screenshots/04_inactive_direct_route_unavailable.png` | Direct inactive/unsupported frontend route is unavailable. | PASS_VISUAL |

## API runtime blocker evidence

- `curl -I http://localhost:3000/app`: HTTP `200`
- `curl http://localhost:3001/health`: HTTP `500`, body `{"statusCode":500,"message":"Internal server error"}`
- `curl http://localhost:3001/platform/phase-6a/runtime/status`: HTTP `500`, body `{"statusCode":500,"message":"Internal server error"}`
- `curl http://localhost:3001/platform/modules`: HTTP `401`, body indicates bearer session is required.

Server log excerpts:

```text
TypeError: Cannot read properties of undefined (reading 'getHealth') at AppController.getHealth
TypeError: Cannot read properties of undefined (reading 'getRuntimeCapabilityStatus') at Phase6AController.getRuntimeStatus
TypeError: Cannot read properties of undefined (reading 'getRuntimeCapabilityStatus') at Phase6BController.getRuntimeStatus
TypeError: Cannot read properties of undefined (reading 'getRuntimeCapabilityStatus') at Phase6CController.getRuntimeStatus
```

## Required visual assertions

| Assertion | Visual result | Notes |
| --- | --- | --- |
| Activated tenant shows approved 6A-6C availability | BLOCKED_RUNTIME_API_500 | Runtime status endpoints fail before tenant activation can render. |
| Inactive tenant navigation hides or blocks disabled services | PARTIAL_VISUAL_BLOCKED_RUNTIME_API_500 | Web shell states inactive services are not rendered as openable links, but API-backed tenant scenario is blocked. |
| Inactive service direct route returns 404/unavailable | PASS_VISUAL | Frontend route screenshot shows 404. Server-side proof remains automated. |
| Cross-tenant deny | BLOCKED_VISUAL_AUTOMATED_PASS | Automated `S2-RI-013` proof passes; browser scenario blocked by runtime/API state. |
| Opt-out send blocked | BLOCKED_VISUAL_AUTOMATED_PASS | Automated `S2-RI-013` proof passes; browser scenario blocked by runtime/API state. |
| Failed-KYC restricted/T1 path | BLOCKED_VISUAL_AUTOMATED_PASS | Automated `S2-RI-013` proof passes; browser scenario blocked by runtime/API state. |
| Failed-payment correctable invoice path | BLOCKED_VISUAL_AUTOMATED_PASS | Automated `S2-RI-013` proof passes; browser scenario blocked by runtime/API state. |
| Audit/evidence proof surface | BLOCKED_VISUAL_AUTOMATED_PASS | Automated evidence construction passes; no browser-visible evidence surface is reproducible in this local run. |
| Gatekeeper allow/deny/approval/stop evidence | BLOCKED_VISUAL_AUTOMATED_PASS | Automated Gatekeeper matrix passes; no browser-visible scenario is reproducible in this local run. |

## Conclusion

Visual audit result: `BLOCKED_BY_RUNTIME_ENDPOINT_FAILURE`

Final status: `PHASE_6A_6C_RUNTIME_INTEGRATION_EXECUTED_BUT_NOT_VISUALLY_VERIFIED`

Required follow-up: create a runtime repair FFET for controller/service injection failures in `AppController` and Phase 6A/6B/6C runtime status controllers, then rerun the final visual audit.

No screenshots were faked. No production credentials were used.
