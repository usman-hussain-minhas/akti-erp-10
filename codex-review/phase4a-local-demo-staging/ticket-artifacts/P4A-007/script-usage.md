# P4A-007 Script Usage

## Start local/demo runtime

```bash
bash scripts/dev/local-up.sh
```

Starts local/demo PostgreSQL, runs committed Prisma migrations, generates Prisma client, starts API, and starts Web.

## Stop local/demo runtime

```bash
bash scripts/dev/local-down.sh
```

Stops API, Web, and local/demo PostgreSQL processes for the Phase 4A runtime.

## Reset local/demo database

```bash
bash scripts/dev/local-reset-db.sh
```

Stops services and removes only the Phase 4A local/demo database state. It refuses non-local/non-Phase-4A targets.
