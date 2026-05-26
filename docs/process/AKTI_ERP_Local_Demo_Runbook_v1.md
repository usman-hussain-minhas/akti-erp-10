# AKTI ERP Local Demo Runbook v1

Status: Phase 4A local/demo runbook

This runbook explains how to run, reset, smoke-test, inspect, and shut down AKTI ERP in the Phase 4A local/demo environment.

Phase 4A is local/demo only. It is not production launch, production deployment, cloud/VPS provisioning, production secret access, real WhatsApp production behavior, Foundry/module installer implementation, platform AI runtime, Phase 4B frontend redesign, Phase 5, or Phase 6 work.

## Quick Start

From the repo root:

```bash
bash scripts/dev/local-up.sh
```

Expected output includes:

- API URL: `http://127.0.0.1:3101`
- Web URL: `http://127.0.0.1:3003`
- Runtime logs: `/tmp/akti-erp-phase4a-local/logs`

Open the app in a browser:

```text
http://127.0.0.1:3003
```

Run the local smoke test:

```bash
bash scripts/dev/local-smoke.sh
```

Stop all local proof services:

```bash
bash scripts/dev/local-down.sh
```

Reset the local demo database:

```bash
bash scripts/dev/local-reset-db.sh
```

After reset, run `local-up.sh` again before browser inspection or smoke tests.

## Runtime Model

The validated Phase 4A runtime path is hybrid local mode:

- PostgreSQL runs as local/demo data only:
  - Docker Compose Postgres is used when the Docker daemon is available.
  - Disposable local PostgreSQL fallback is used when the Docker daemon is unavailable.
- API runs locally on `127.0.0.1:3101`.
- Web runs locally on `127.0.0.1:3003`.
- Prisma uses committed migrations through `prisma migrate deploy`.
- `db push` is not accepted as final proof.

## Node And pnpm

Recommended local posture:

- Node 22 LTS.
- Corepack-managed `pnpm@10.12.1`, matching `package.json`.
- Avoid casual package, lockfile, or dependency changes.

If pnpm is unavailable, enable Corepack and activate the repo package manager before running the scripts:

```bash
corepack enable
corepack prepare pnpm@10.12.1 --activate
```

Do not modify `package.json` or `pnpm-lock.yaml` as a local run workaround.

## Environment Files

Use non-secret templates only:

- `.env.local.example`
- `.env.demo.example`

Real `.env` files, local secret-bearing env files, production credential files, production database URLs, private keys, and real session/token values must not be committed or included in evidence.

The local scripts use placeholder local/demo values only. They do not require production credentials.

## Startup Details

Run:

```bash
bash scripts/dev/local-up.sh
```

What it does:

1. Verifies the local database target is the Phase 4A local database.
2. Starts local/demo PostgreSQL.
3. Runs committed Prisma migrations with `prisma migrate deploy`.
4. Runs Prisma client generation.
5. Builds and starts the API.
6. Starts the Web app.
7. Waits for API `/health` and Web root to respond.

Important ports:

| Service | URL or port |
| --- | --- |
| API | `http://127.0.0.1:3101` |
| Web | `http://127.0.0.1:3003` |
| Local DB | `127.0.0.1:55432` |

If a port is already in use, run:

```bash
bash scripts/dev/local-down.sh
```

Then retry startup. Do not point local scripts at staging, production, or persistent non-demo databases.

## Smoke Test

Run:

```bash
bash scripts/dev/local-smoke.sh
```

The smoke script verifies:

- API `/health` returns healthy status.
- Web root responds with AKTI ERP content.
- `POST /platform/setup/organization` completes bootstrap on clean local data or returns an expected already-completed local conflict.
- Allowed local CORS and API security headers are present.

Failure messages include a classification and a remediation hint. If local proof data is stale, reset only the local demo database:

```bash
bash scripts/dev/local-reset-db.sh
bash scripts/dev/local-up.sh
bash scripts/dev/local-smoke.sh
```

## Browser Inspection And Screenshots

Prepare browser capture support:

```bash
bash scripts/dev/local-capture-frontend.sh
```

Then open:

```text
http://127.0.0.1:3003
```

Current route inventory for local inspection:

- `/`
- `/app`
- `/setup/organization`
- `/lead-desk/inbox`
- `/lead-desk/create`
- `/lead-desk/leads/not-a-real-lead`
- `/lead-desk/leads/not-a-real-lead/actions`
- `/app/settings`

Use the Codex in-app Browser or another already-approved local browser tool. Do not install Playwright, Puppeteer, Selenium, or any other browser dependency without explicit approval.

Screenshot/log evidence must be redacted. Stop if screenshots or logs contain a real secret, token, credential, production database URL, private key, production credential, or real session value.

Visible labels such as `Phase 3 session token` are expected current frontend state. Real token values must not be entered for Phase 4A capture.

## Shutdown

Run:

```bash
bash scripts/dev/local-down.sh
```

The shutdown script stops local API/Web proof processes and local/demo database processes, then checks that no listeners remain on the proof ports:

- `3101`
- `3003`
- `55432`

If shutdown reports a remaining listener, inspect and stop only the local proof process using that port. Do not kill unrelated production or system services.

## Reset

Run:

```bash
bash scripts/dev/local-reset-db.sh
```

The reset script refuses non-Phase-4A database targets. It only resets:

```text
127.0.0.1:55432/akti_phase4a_local
```

or the equivalent `localhost` target.

After reset, run:

```bash
bash scripts/dev/local-up.sh
```

## Full Docker Compose Status

Full Docker Compose API/Web/Postgres mode is explicitly deferred by P4A-011.

Current state:

- `docker-compose.local.yml` validates for the local Postgres service.
- Docker CLI and Docker Compose CLI are installed.
- Docker daemon was unavailable during P4A-011.
- API/Web Dockerfiles and full Compose API/Web services were not added because they could not be built, started, smoke-tested, or browser-tested in this execution environment.

This is not silent hybrid-only closure. It is an explicit evidence-backed deferral.

A later approved ticket may implement full Compose API/Web/Postgres mode only when daemon-backed validation is available and the ticket can prove:

- Compose config passes.
- API/Web/Postgres build and start.
- committed migrations run with `prisma migrate deploy`.
- local smoke passes against the Compose runtime.
- browser inspection and screenshot capture work.
- no package/lockfile drift, production secrets, production launch, cloud/VPS deployment, Phase 4B redesign, Phase 5, Foundry, AI runtime, or business-module scope is introduced.

## Troubleshooting

| Symptom | Likely cause | Local fix |
| --- | --- | --- |
| `local-up failed: DATABASE_URL must target...` | The script is pointed at a non-local DB | Use only the default local/demo database target |
| API does not become ready | API build/start failed or DB is unreachable | Check `/tmp/akti-erp-phase4a-local/logs/api-build.log` and `api.log` |
| Web does not become ready | Web dev server failed | Check `/tmp/akti-erp-phase4a-local/logs/web.log` |
| Smoke setup returns unexpected status | Local demo DB contains unexpected proof data | Run `local-reset-db.sh`, then `local-up.sh`, then `local-smoke.sh` |
| CORS smoke fails | Local Web origin is not configured for API | Confirm local-up uses `http://127.0.0.1:3003` and `http://localhost:3003` |
| Docker Compose full mode is requested | Full Compose API/Web/Postgres is deferred | Use hybrid local mode until a later approved full Compose ticket exists |

## Evidence Rules

Allowed evidence:

- local/demo command logs;
- local/demo screenshots;
- redaction reviews;
- route inventories;
- smoke results;
- validation summaries.

Forbidden evidence:

- real production secrets;
- production credentials;
- production database URLs;
- private keys;
- real session/token values;
- production WhatsApp behavior;
- cloud/VPS deployment output unless separately approved.

## Closure Expectations

P4A closure must include:

- validated startup/shutdown/reset/smoke evidence;
- browser URL and screenshot evidence;
- redaction/no-secret review;
- explicit P4A-011 full Compose deferral;
- accepted deferrals and remaining risks;
- final external audit package from committed branch HEAD.
