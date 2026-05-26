## Repair attempt 1

Docker daemon was unavailable. Repaired scripts/dev/local-up.sh to fall back to disposable local PostgreSQL using initdb/pg_ctl when Docker cannot be reached.

## Repair attempt 2

Replaced psql heredoc role/database setup with createuser/createdb guarded by local catalog checks.

## Repair attempt 3

Changed local-up.sh to build and run the compiled API instead of tsx watch because /health failed under the watch runtime.

## Approved repair continuation - process lifetime repair

Changed local-up.sh to use nohup for API/Web processes so they remain available after the startup script exits.

## Approved repair continuation - detached screen repair

Changed local-up.sh to prefer detached screen sessions for API/Web so proof services survive after the startup script exits in Codex shell sessions.
