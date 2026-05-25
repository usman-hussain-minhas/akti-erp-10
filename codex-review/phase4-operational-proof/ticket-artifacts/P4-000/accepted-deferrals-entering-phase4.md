# P4-000 Accepted Deferrals Entering Phase 4

- Production deployment: Phase 4 input, not implicit production launch.
- Production auth/session provider and credentials: provisioning path only; no real credentials.
- Production WhatsApp credentials and real outbound WhatsApp: separately approved production decisions.
- Fresh empty-database bootstrap proof: Phase 4 input.
- DB-level RLS / tenant transaction context: later-phase input unless operational proof shows service-level isolation is insufficient.
- Browser-rendered frontend tests: Phase 4 input.
- Distributed/infrastructure route limiting: Phase 4 input; app limiter preserved.
