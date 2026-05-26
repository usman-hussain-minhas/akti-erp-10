# P4A-002 Local Port Map

| Service | Host | Port | Purpose | Notes |
| --- | --- | ---: | --- | --- |
| PostgreSQL | 127.0.0.1 | 55432 | Local/demo database | Disposable local DB only; never production/staging. |
| API | 127.0.0.1 | 3101 | NestJS API | Uses placeholder non-secret env values. |
| Web | 127.0.0.1 | 3003 | Next.js web app | Browser inspection target. |

Port conflict handling: scripts must detect/listen failures and print clear failure messages instead of silently switching to production-like ports.
