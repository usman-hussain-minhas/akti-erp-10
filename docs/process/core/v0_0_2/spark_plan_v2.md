# Spark Platform — Complete Build Specification v2

**Status:** `GENESIS_PLAN_INPUT_READY`
**Architecture:** Cloud-native first. Desktop and mobile apps after cloud stabilises.
**Scale target:** Every module designed for the largest conceivable operator in its category. Any operator uses the subset they need.
**Tone:** Platform-neutral. No operator-specific references. Genesis determines sequencing and granularity.
**ADL references:** High-risk irreversible decisions are recorded separately in `docs/architecture/decisions/ADL-*.md`. Genesis reads ADL files as constraints, not as buildable items.

---

## Cross-Cutting Concerns (Apply to Every Module and Every Level)

### Custom Fields System

Every entity in every module supports custom fields. Platform-level capability, not per-module configuration.

Field types: Text (single line), Long text, Rich text, Number (integer), Number (decimal), Currency (with selector), Percentage, Date, DateTime, Date range, Time, Phone (country code validated), Email, URL, Dropdown (single select), Multi-select, Boolean (toggle), Rating (1–5), File attachment (type and size limits configurable), Signature (drawn, stored as image), Location (address with geocoding), Lookup (reference to another record in same or different module), Calculated (formula builder from other fields), Barcode/QR (scan to populate), Colour picker, JSON (for technical integrations).

Configuration per field: label, help text, placeholder, required/optional with conditional override, conditional visibility (show only when another field has specific value), validation rules (min, max, regex, custom), default value (static or formula), read-only conditions, field group and position, permissions (who can view vs edit), field history (every value change logged), export inclusion, search index inclusion, API response inclusion.

Custom fields apply to: leads, contacts, companies, invoices, payments, expenses, employees, students, batches, events, registrations, products, orders, assets, and any other record type across all modules.

### Multi-Account and Multi-Branch Integration

Every external integration supports decentralised connection ownership. No integration is forced to be organisation-wide.

Connection ownership levels: Organisation-wide (one shared connection, cost borne by organisation), Branch-level (each branch connects independently, manages own credentials and costs), Hybrid (organisation sets default, branches override with own connection).

Services supporting multi-account at every level: WhatsApp Business API, Meta Ads, Google Ads, TikTok Business, email sending domain, payment gateways (JazzCash, EasyPaisa, Stripe, RAAST, bank accounts), Google Analytics, Google Tag Manager, Google Meet, Zoom, SMS gateway, biometric device networks, any webhook endpoint.

Credential management: encrypted at rest using org encryption key, stored separately per branch, rotation wizard, health monitoring (expired/rate-limited/errored connections alerted immediately), credential audit log, branch admin manages own without seeing others, organisation admin has read access to all branch integration statuses.

### Fluid Workflow Architecture

Nothing that could vary between organisations or programmes is hardcoded in any module. Every business rule lives in the Configuration Engine.

What must never be hardcoded in module code: stage names and transitions, threshold values (attendance %, grade pass marks, credit hours required), alert conditions, deadline policies, escalation chains, approval chains, commission rules, attendance marking policies, at-risk definitions, certificate eligibility criteria, admission requirements, grading weight formulas, fee structures, discount rules, leave policies, probation policies, recruitment stages, performance review criteria, any logic a different operator might do differently.

### Global Opt-Out Registry

Platform service. Not CRM-owned. Not module-owned. Enforced at the Communication Gateway before any message is sent on any channel.

Registry indexed by: person_id + channel (WhatsApp, email, SMS, push). Opt-out on any channel in any module (CRM, LMS, Events, Finance reminders) blocks that channel everywhere. Opt-out event logged. Only explicit re-opt-in removes opt-out. Communication Gateway checks registry before routing every outbound message. No module bypasses the gateway.

### Idempotency (Cross-Module Rule)

All write APIs require an idempotency key (X-Idempotency-Key header). Client generates UUID v4. Server deduplicates within 24-hour window using an idempotency_keys table with TTL cleanup. Duplicate within window: return original response without re-executing. Outside window: treat as new request.

All event consumers must be idempotent. At-least-once delivery from the event bus means any event may be delivered more than once. Every consumer checks whether the event has already been processed before acting. See ADL for consumer idempotency implementation pattern.

### Time Zone and Localisation

All timestamps stored in UTC universally. Displayed in authenticated user's configured timezone. Scheduling actions use recipient's timezone or user's timezone (configurable per action type). API responses always return ISO 8601 dates and raw numbers. Number and date formatting (DD/MM/YYYY vs MM/DD/YYYY, comma vs period as decimal separator) is a display-layer concern configurable per organisation locale. i18n architecture integrated from day one even if only English ships initially. RTL layout support for Urdu and Arabic (Nastaliq script). String externalisation: no hardcoded UI strings anywhere.

### Backward Compatibility

APIs: new response fields are always safe (additive). Removing or changing field types is a breaking change requiring a new API version. Old API versions supported for minimum 6 months after new version ships.

Event schemas: changes are additive only. All consumers implement tolerant reader pattern (ignore unknown fields). Event payload includes schema_version field. Schema stored in packages/schemas/ in the repository.

Module contracts: new optional fields in interfaces are safe. Required new fields are breaking and require all consumers to be updated first.

Zero-downtime database migrations: every migration is backward-compatible with the running application version. Columns removed in a separate deployment after the code no longer references them. No migration adds NOT NULL without a default in a single step.

---

## Security Layer (Platform-Wide)

### Infrastructure Security (Rent from Cloudflare and AWS)

SSL/TLS: all traffic HTTPS enforced, HTTP redirects to HTTPS, TLS 1.3 minimum, HSTS with preload, certificate auto-renewal via Cloudflare, mTLS for service-to-service, certificate transparency monitoring.

DDoS mitigation (Cloudflare): Magic Transit for volumetric attacks, Layer 3/4/7 protection, rate limiting per IP and per API key, geographic blocking (configurable), bot management, adaptive thresholds, real-time attack dashboard.

WAF (Cloudflare): OWASP Core Rule Set, custom rules for platform-specific patterns, SQL injection, XSS, remote file inclusion, command injection, path traversal blocking at edge, rule tuning to reduce false positives.

Centralised logging and monitoring: all logs to centralised aggregator (managed service), structured JSON logging (timestamp, service, level, trace_id, org_id, event_type), 90-day hot retention, 1-year cold retention, real-time alerting on error rate spikes, auth failures, unusual data access, high-value record changes, anomaly detection, SIEM integration, on-call alerting integration.

### Application Security (Build — Core Capability)

Input validation and sanitisation: server-side validation on every endpoint, schema validation before processing, parameterised queries only (no SQL string interpolation), file upload validation via magic bytes (not extension only), virus scanning on upload (ClamAV or cloud equivalent, configurable fallback policy if scanner unavailable: block uploads or quarantine with retroactive scan), rich text sanitised via server-side allowlist.

Output encoding and XSS prevention: context-aware encoding (HTML, JavaScript, URL contexts), strict Content Security Policy (nonce-based, no inline event handlers), DOMPurify or equivalent server-side for rich text, template auto-escaping.

Security HTTP headers: Strict-Transport-Security (preload), Content-Security-Policy (strict), X-Frame-Options (DENY default), X-Content-Type-Options (nosniff), Referrer-Policy (strict-origin-when-cross-origin), Permissions-Policy, Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy, Cache-Control (no-store for sensitive data).

Secure cookies: HttpOnly, Secure, SameSite=Strict for session cookies, short-lived access tokens (15 minutes), refresh tokens (7 days, rotated on use), cryptographically secure generation, token binding to device fingerprint.

Server-side access control: Gatekeeper capability check on every API endpoint before data access, tenant isolation at ORM level (every query scoped to org_id), no frontend-only access control, privilege escalation prevention, horizontal privilege escalation prevention, admin operation audit, time-limited privilege elevation for support operations, CORS explicit allowlist, dynamic CORS per tenant for Website Builder published domains.

MFA: available on all accounts, required for Super Admin, Billing Authority, and financial capability holders. Methods: TOTP (authenticator apps), WhatsApp OTP, SMS OTP, email OTP. Backup codes (hashed, shown once, stored hashed). Trusted devices (configurable period). No password-only fallback for MFA-required users. MFA reset via secondary channel verification.

Data encryption: AES-256-GCM at rest (SVFS for local/desktop, S3 SSE for cloud), TLS 1.3 in transit, field-level encryption for highest-sensitivity fields (national IDs, payment credentials), org-level encryption key never stored on platform servers in plaintext, key rotation zero-downtime wizard, backup encryption with 2-of-3 key recovery (Shamir's Secret Sharing), log sanitisation (sensitive fields redacted before shipping to aggregator).

Password policy: configurable per organisation. Defaults: minimum 12 characters, at least one uppercase, lowercase, number, special character. Cannot contain username or organisation name. Checked against common password list. Configurable maximum age (NIST recommends against forced expiry without breach detection — no expiry is a valid default). Password history: last 5 hashed passwords stored, reuse rejected.

Brute force protection: progressive delay (3 failures: 30-second wait, 5 failures: 5-minute wait, 10 failures: account temporarily locked), CAPTCHA challenge after 5 failures, lockout notification to user's registered contact, admin can unlock manually, automated unlock after configurable period.

Password reset: rate-limited (max 3 requests per hour per account), token expires in 15 minutes, single-use token (invalidated on use whether successful or not), old tokens invalidated when new one is requested.

Session management: idle timeout configurable per organisation (default 2 hours), warning shown N minutes before timeout with extend option, shorter timeout enforced for financial capability holders. Session termination on any capability change (not only role changes). Global logout from "My Sessions" page (view all active sessions with device, approximate location, last activity; terminate any or all). Session audit log (all logins, logouts, and terminations with device and IP).

No default credentials: first-run setup requires creating admin account with new password. No admin/admin, no hardcoded defaults.

Terms of service: versioned acceptance record per user (user_id, tos_version, timestamp, IP address). Cannot be deleted. New ToS version: existing users shown on next login and must accept before continuing.

Consent logging: marketing opt-in records (explicit checkbox, not pre-checked), logs consent_type, timestamp, form_version, IP address, user_id or email. GDPR and PECA compliant.

### Security Operations

Automated vulnerability scanning: SAST in CI/CD (blocks merge on high-severity findings), DAST weekly against staging, dependency scanning on every build (CVE databases), container image scanning, infrastructure-as-code scanning, secrets detection (pre-commit + CI), results dashboard with remediation SLA tracking.

Dependency and patch management: full SBOM per release, automated dependency update PRs, patch SLA (critical 24 hours, high 7 days, medium 30 days), dependency review for new additions, license compliance scanning (SPDX list, blocked licenses configurable), deprecated dependency alerts.

Independent penetration testing: annual third-party test, full scope (web app, API, infrastructure, social engineering), CVSS-scored findings, remediation tracked, re-test after remediation, bug bounty programme when scale justifies.

Regulatory compliance: GDPR (data subject rights — access, rectification, erasure, portability — lawful basis documentation, data protection impact assessments, GDPR data portability export in JSON within 30 days of request), PCI-DSS (scope minimisation via tokenisation, SAQ-A or SAQ-D as appropriate), ISO 27001 (planned when revenue supports audit cost), ISO 9001 (planned alongside), PECA — Pakistan Prevention of Electronic Crimes Act (data localisation option maintained even if not currently required, content removal procedures for valid law enforcement orders, reporting obligations, reviewed annually as legislation evolves), invoice retention 6 years (FBR Pakistan requirement, separate retention lifecycle from general operational data, applies even after account closure).

---

## Redundancy and Failure Modes

### P2P Sync (Optional Mode, Not Default)

Default mode is centralised cloud sync with local cache. P2P is an opt-in advanced mode for desktop app users and operators requiring local-first deployment or data sovereignty.

P2P mode details: requires explicit opt-in per device, NAT traversal via discovery server plus TURN relay fallback with configurable bandwidth and cost limits, version enforcement (device must have minimum platform version to sync; stale devices fall back to centralised), user controls (WiFi-only upload, bandwidth caps, sync pause), organisation encryption key never stored on discovery server (distributed via authenticated central service, not P2P protocol).

### Database

Split-brain prevention: consensus-based failover (Raft via PostgreSQL Patroni or equivalent). Automated failover must not create two primaries under any circumstances.

Cross-region live replica: at least one warm standby in a secondary region, automated failover tested quarterly.

RTO/RPO targets: RTO (Recovery Time Objective) 4 hours for full restore from cold backup including verification time. RPO (Recovery Point Objective) near-zero via continuous WAL archiving for database; object storage replication lag may be minutes (documented and accepted). Cold backup restore tested quarterly.

### Object Storage

Read-after-write consistency: strong consistency for all metadata operations (file listings, version queries). Eventual consistency acceptable for content delivery after 5 seconds. Users may see latency before consistency on cross-region reads.

Multi-region replication: asynchronous, last-write-wins conflict resolution, replication lag documented.

### Event Bus

Persistent queue: all events persisted to disk before acknowledgement. Broker crash after accepting but before delivering does not lose the event.

At-least-once delivery: guaranteed. Consumers must be idempotent (mandatory design rule, enforced in code review and module acceptance criteria).

Dead letter queue: admin UI for inspection (event type, payload, failure reason, retry count, last attempt), replay (single event or all), discard. Admin alerted on dead letter queue growth above threshold.

### Kubernetes

Pod anti-affinity: two replicas of the same service never scheduled on the same node. Required for all services with more than one replica.

Cluster rebuild runbook: full restore from infrastructure-as-code (Terraform, Helm) plus database restore, tested quarterly, results documented.

etcd backup: regular snapshots stored in a separate region.

### External Services — Circuit Breakers and Graceful Degradation

Circuit breaker on every external service call (Meta API, WhatsApp API, SendGrid, AI APIs, payment gateways, biometric device APIs). States: closed (normal), open (fail fast after N failures or X% error rate in Y seconds), half-open (one test request after Z seconds). Thresholds configurable per service.

Graceful degradation per service:
- WhatsApp API unavailable: queue messages locally, send when restored, show "messages queued" to user, all other features unaffected.
- AI API unavailable: AI features show "temporarily unavailable", all non-AI features continue.
- Payment gateway unavailable: manual payment recording continues, payment links show fallback instructions, all other finance features continue.
- Search index unavailable: search returns empty with "temporarily unavailable" message, all record views and filters continue via database queries.
- Event bus unavailable: writes continue to primary module database, cross-module triggers queued for replay on recovery, user sees current module working with cross-module effects delayed.

### DNS and Edge

Secondary DNS provider: Cloudflare primary plus secondary provider (e.g., AWS Route 53) with automated failover. Monthly failover testing with documented propagation delay expectations.

### CI/CD

Manual deployment fallback: documented procedure using kubectl and helm from a trusted engineer's machine if CI/CD system is unavailable. Procedure tested annually. Trusted engineers have accessible kubeconfig and credentials outside CI/CD system.

### Human Redundancy

Critical roles (platform admin, database admin, security lead): at least two people each. No single person holds the only copy of any encryption key or recovery password.

On-call rotation by phase: launch phase covers 9 AM – 9 PM PKT, two engineers minimum. After-hours best-effort only. Enterprise SLA applies during covered hours only (stated to customers). Growth phase expands to 24/7 with at least two engineers per shift.

### Runbook Catalogue

Required at launch: database primary failover, event bus backlog growing, AI API rate limit exceeded, payment gateway circuit breaker tripped, WhatsApp API blocked or suspended, Kubernetes node failure, SSL certificate expiry warning, backup verification failure, unusual data access pattern (security), high error rate on API endpoints, storage approaching per-tenant capacity, DLQ growth above threshold.

### Chaos Engineering

Planned for growth phase. Scheduled chaos experiments in staging: random pod termination, network partition simulation, external API failure simulation. Validates that failure modes behave as designed. Results documented. Annual full disaster recovery drill: complete primary region failover simulation, validates runbooks, human response, and actual RTO vs target.

---

## Feature Flags and Incremental Rollout

Feature flags: enable/disable functionality per organisation, per branch, per user role without deployment. Platform-wide and per-tenant flags. Flag audit log (who enabled what and when).

Phased rollout: percentage-based gradual rollout with automated rollback trigger on error rate spike. Configurable rollout percentage, rollback threshold, and monitoring window.

Opt-in beta: organisations can choose to enable experimental features before general availability.

Hot-reloadable configuration: some settings change without pod restart (log level, feature flags, rate limit thresholds). These are accessed via a config provider abstraction polled every 30 seconds or pushed via webhook. Cold configuration (database connection string, port, TLS certificates) read at startup only.

---

## Testing Strategy (Cross-Cutting)

Unit tests: all services, utilities, components. Coverage target 80%.

Integration tests: API endpoints, workflow engine, event bus, payment gateway integrations.

End-to-end tests: critical user journeys run in staging before every deployment.

Security tests: SAST, DAST, dependency scanning, container scanning, secrets detection — all CI/CD gates.

Performance tests: load testing for key APIs, database query profiling, frontend Core Web Vitals budgets. Performance regression: any PR causing measurable degradation is blocked.

Test data management: seeded anonymised test data for realistic scenarios, edge cases (records with maximum data volumes, all at-risk flags triggered simultaneously), regression scenarios (specific scenarios that have caused bugs before). Development environment seeding separate from customer demo data. Ability to reset test environment.

Test mode data isolation: when simulation or dry-run mode is active, workflow execution does not write to real audit logs (tagged as test_run and excluded from operational audit view), notifications shown as previews not sent, no real records created or modified. Test run data isolated and clearable.

Validation commands: pnpm test:unit, pnpm test:integration, pnpm test:e2e, pnpm test:security, pnpm test:performance.

Module sandbox: separate sandbox tenant (org_id) per organisation for testing. is_sandbox flag on org record propagates to all data. Billing does not apply to sandbox tenants. Sandbox data excluded from all collective intelligence aggregations. Sandbox can be reset without affecting production. Not separate infrastructure — same database, separate tenant.

---

## Architecture Decision Log (ADL) — Required Before Implementation

The following decisions must have completed ADL records in docs/architecture/decisions/ before the relevant levels are built. This list is not exhaustive — these are the confirmed high-risk items. Genesis must check ADL status before generating tickets for affected areas.

High-priority ADLs (must exist before Level 4 — Platform Services):
- ADL: Cross-module transaction boundary (Saga pattern with compensating actions — no distributed 2-phase commit)
- ADL: Event versioning and schema registry (schema in packages/schemas/, version field in every event, outbox table stores schema_version)
- ADL: Idempotency key generation (client generates UUID v4, server deduplicates in idempotency_keys table, 24-hour window)
- ADL: Global opt-out registry (platform service, communication gateway enforcement, cross-module scope)

High-priority ADLs (must exist before Level 5 — Configuration Engine):
- ADL: Module dependency cycle detection (topological sort in Foundry, required dependencies hard error, optional dependencies warning)
- ADL: Module uninstall cleanup (two-phase: deactivate then purge, purge is explicit Super Admin action with 30-day window)
- ADL: Module upgrade rollback (two-phase deploy, backward-compatible migrations, rollback by re-activating previous version)
- ADL: Module sandbox (separate tenant, is_sandbox flag, billing exempt, excluded from collective intelligence)
- ADL: Module performance contract (declared in manifest, validated by Foundry, monitored against actuals)
- ADL: Core interface versioning (core services declare semantic versions, modules declare required_core version in manifest)
- ADL: Configuration reload without restart (hot-reloadable vs cold configuration categories)

High-priority ADLs (must exist before Level 8 — Finance):
- ADL: Quote to invoice conversion (quote becomes read-only on conversion, status: converted, terminal state)
- ADL: Partial invoice payment handling (amount_remaining computed not stored, payment_allocation records, installment tracking)
- ADL: Refund to original payment method (method-specific reversal APIs, fallback to account credit, documented reason required)
- ADL: Discount stacking rules (explicit order: product-level → coupon → volume → tax, all applied discounts as invoice line items)
- ADL: Multi-currency exchange rate timing (rate locked at invoice creation, payment-time rate stored separately, exchange gain/loss posted to GL)
- ADL: Invoice number gaps (gaps acceptable, no reuse on cancellation, FBR compliant)
- ADL: Tax rounding policy (per-line or per-invoice, configurable per organisation, default: per-invoice)
- ADL: Tier change proration (upgrades: credit unused days apply to next cycle; downgrades: take effect end of current cycle, no refund)
- ADL: Invoice retention period (6 years per FBR, separate retention lifecycle from general data, survives account closure)

High-priority ADLs (must exist before Level 7 — CRM):
- ADL: Lead source immutability (source enum immutable after creation, Super Admin correction with audit entry)
- ADL: Automated merge rules (exact phone match auto-merge, email + name similarity threshold propose merge, all else create separate)

High-priority ADLs (must exist before Level 12 — Events):
- ADL: Waitlist auto-promotion claim deadline (configurable window, next-in-queue on expiry)
- ADL: Check-in time window (configurable ±N minutes from event start, outside window: check-in rejected)

---

## Level 0 — Foundation (Core v0.0.1 — Already Built)

Already exists: Gatekeeper, Foundry, tenant model, capability system, module registry, event bus (stub), file service (stub), search (stub), notifications (stub), workflow engine, communication gateway (stub), data controls (stub), AI proxy (stub), platform shell (Phase 5C), lead desk shell (Phase 5C).

Cloud-native deployment of the existing core is the first infrastructure task. Nothing in Core v0.0.1 is rebuilt. Extensions only.

---

## Level 1 — Cloud Infrastructure and Deployment

Container platform: Docker, Kubernetes (managed: GKE, EKS, or AKS), Helm charts, horizontal and vertical pod autoscaling, pod disruption budgets, pod anti-affinity (no two replicas on same node), liveness and readiness probes, graceful shutdown (in-flight requests complete before pod termination), resource quotas per namespace.

Database: PostgreSQL managed service, read replicas for analytics queries, PgBouncer connection pooling, per-tenant connection pool limits (one large report cannot exhaust shared pool), automated backups (30-day retention), point-in-time recovery, encrypted storage, consensus-based automatic failover (Raft), cross-region warm standby tested quarterly. Zero-downtime migrations: forward-only, backward-compatible, two-phase column removal, no NOT NULL without default in single step, rollback script required for every migration.

Object storage: S3 or equivalent, lifecycle policies (hot → warm → cold by age), versioning enabled, server-side encryption, no public access by default (signed URLs for temporary access), multi-region asynchronous replication.

CDN: Cloudflare, static asset caching with invalidation on deployment, edge caching for public pages, geographic routing, Core Web Vitals monitoring.

API gateway: rate limiting (per API key, per IP, per user, per tenant), request/response logging, auth verification at gateway, SSL termination, load balancing, health-check routing, idempotency key validation for all write endpoints, API version routing, CORS policy per tenant (dynamic allowlist for website builder published domains), sunset headers on deprecated endpoints (RFC 8594).

CI/CD: GitHub Actions or equivalent. Pipeline: lint → unit test → integration test → security scan → build → staging deploy → e2e test → production deploy. Blue-green deployments. Automated rollback on failed health check. Environment promotion only (dev → staging → production, no direct production deploys). Secrets management via vault (never in environment variables or source code). Deploy audit log. Manual deployment fallback procedure documented and tested annually.

Observability: distributed tracing (trace_id propagated through all services), RED metrics per service per endpoint, structured JSON logging, dashboards (service health, error rates, latency percentiles, throughput, business metrics), SLO tracking (uptime, latency, error rate), incident management with runbooks catalogue, on-call alerting integration.

DNS: Cloudflare primary, secondary provider (AWS Route 53) with automated failover, monthly failover testing.

etcd: regular snapshots stored in separate region.

Kubernetes cluster rebuild runbook: full restore from Terraform and Helm plus database restore, tested quarterly.

Chaos engineering (growth phase): scheduled experiments in staging (random pod termination, network partitions, external API failures). Annual full disaster recovery drill (complete primary region failover).

Feature flags infrastructure: flag store accessible without application restart, per-organisation and per-user flag evaluation, flag audit log.

---

## Level 2 — Storage and Sync

### SVFS — Spark Vault File System

Content-addressed immutable object store: every object identified by SHA3-256 hash of its content. Written once, never modified. New version = new object + new hash. Ref store maps entity IDs to current version hash pointer. Version tree: complete history per entity, unlimited depth. Rollback: update ref to any previous hash. Old objects remain accessible.

Audit chain: append-only, hash-chained (each entry hashes the previous), tamper detection on read, stored in SVFS, replicated.

Soft delete (operational): deleted_at timestamp set. Record hidden from normal views immediately. Restorable by any authorised user without approval. Instant restore. Audit entry includes: who deleted, when, from which session (session_id). Use case: accidental deletion recovery.

Staged permanent deletion (compliance): Super Admin only. 30-day cancellable window. Double confirmation required. Impact assessment shown (linked records affected). After 30 days: permanent deletion executes. Audit entry (who, when, reason) retained permanently after deletion. Use case: GDPR erasure request, legal requirement.

These two mechanisms are distinct, have separate permission levels, separate UX flows, and separate audit trails.

Encryption: AES-256-GCM for all content. Organisation encryption key generated by admin, never stored on platform servers in plaintext. Cloud deployments: client-side encryption before upload. Key hierarchy: org master key → per-sensitivity data encryption keys. Key rotation: zero-downtime wizard.

Cloud-native sync: delta sync only (changes, not full records). Packet structure includes: sequence number, entity type, action, content hash, timestamp, cryptographic signature. Seven-layer verification before any change applied: signature, hash, sequence, timestamp, schema, business rules, rate limit. CRDT conflict resolution. Real-time delivery via WebSocket push. At-least-once delivery with idempotent application (duplicate packet detection via sequence number).

P2P mode (opt-in, desktop/mobile app only): every device is seeder and leecher simultaneously. Discovery server provides peer addresses only (never stores data). TURN relay fallback for NAT traversal. Bandwidth cost on user's internet. Packet-based resumable sync (resume from failed packet, not from beginning). Offline: full read of locally synced data, queued writes on reconnect. Org encryption key distributed via authenticated central service, never via P2P protocol. Version enforcement: stale devices fall back to centralised sync.

Backup engine: incremental after first full backup. Compression (zstd, ~7:1 on structured data). Client-side encryption before upload. Upload verification (hash before and after). Resumable uploads. Bandwidth throttling. Schedules: continuous (configurable minimum tier), daily (all paid tiers), weekly, manual. Cloud object storage with two geographic regions. 90-day version retention. 2-of-3 Shamir's Secret Sharing for key recovery (Part 1: cloud encrypted with recovery password, Part 2: printed QR code, Part 3: password manager export). Monthly automated backup test (sample download, decrypt, verify, report). Quarterly full restore drill to separate environment with data consistency verification. Immediate alert if backup verification fails.

### Image Processing Pipeline

Accept: JPEG, PNG, GIF, HEIC, HEIF, BMP, TIFF, WebP, RAW camera formats. Convert all non-WebP to WebP on upload. Mobile devices convert HEIC/JPEG to WebP on device before upload (bandwidth saving). EXIF stripped (no GPS, device info, or timestamps in output).

WebP sizes generated: Thumbnail 50×50px, Small 200×200px, Medium 600×400px, Full 1200×800px, Original preserved in storage (download only, never loaded in UI). Smart cropping (face detection for person photos). Aspect ratio preserved (letterbox with neutral background, never stretch). Lossy WebP for photos, lossless for logos and graphics (entropy analysis determines which).

Serving: right size for context (automatic). Website pages: WebP primary, JPEG fallback via `<picture>` element for old browsers. CDN-cached per variant. Lazy loading for all below-fold images. Progressive loading (blur-up placeholder while full image loads).

---

## Level 3 — Authentication and Identity

Authentication: username + password with password policy enforcement. MFA (TOTP authenticator apps, WhatsApp OTP, SMS OTP, email OTP). Backup codes (hashed, shown once on setup). Trusted devices (remember for configurable period). Suspicious login detection (new device, new location, impossible travel). Login history per user (last 20 sessions). Force re-authentication for sensitive operations (delete, payroll, billing, bulk export).

Session management: access tokens 15 minutes, refresh tokens 7 days (rotated on use). Session termination on any capability change (not only role changes). Session invalidation on org membership change. Global logout ("My Sessions" page: view all active sessions with device type, approximate location, IP, last activity; terminate any individual session or all except current). Session idle timeout (configurable per organisation, default 2 hours). Warning shown before idle timeout with option to extend. Session audit log.

Password security: history of last 5 hashed passwords (reuse rejected), brute force protection (progressive delay and CAPTCHA), rate-limited reset flow (max 3 requests per hour, 15-minute expiry, single-use token), common password list check.

Organisation identity: org profile (legal name, NTN, STRN, address, contact, branding, tax settings, fiscal year, timezone, locale). Branch/location hierarchy (head office → regional → branch, unlimited depth). Per-branch settings (hours, bank accounts, contact, integrations).

User management: invite via email or WhatsApp, role assignment, custom capability override per user, status management (active, inactive, suspended), bulk import (CSV), login activity per user, password reset (admin-initiated and self-service).

Role management: built-in roles (cannot be deleted), custom roles (any combination from capability namespace), role hierarchy (child inherits parent capabilities), per-user capability override, role audit report.

API key management: named keys, scoped to specific capabilities, configurable expiry (default 1 year), renewal notifications (30 days, 7 days, day of), auto-renewal option with 7-day overlap, expired key returns 401 with clear error pointing to key management, rotation on demand, request log per key.

Access revocation: offboarding completion publishes event to platform event bus, Gatekeeper receives event, all capabilities revoked, all active sessions invalidated, login attempt returns "Account deactivated — contact HR."

No default credentials: first-run setup requires creating admin account with new password. No hardcoded defaults of any kind.

Terms of service: versioned acceptance record (user_id, tos_version, timestamp, IP address), cannot be deleted, new version requires acceptance on next login before access is granted.

Consent logging: marketing opt-in records explicit checkbox (not pre-checked), logs consent_type, timestamp, form_version, IP address, user_id or email. GDPR and PECA compliant.

---

## Level 4 — Platform Services

### Event Bus (Extend Core v0.0.1)

Full implementation replacing the stub. Persistent queue (events persisted to disk before acknowledgement). At-least-once delivery guaranteed (mandatory consumer idempotency — enforced in module development guidelines and code review). Dead letter queue with admin inspection UI (view event type, payload, failure reason, retry count, last attempt), replay (single or all), discard, admin alert on DLQ growth threshold.

Event structure: event_id (UUID), event_name (namespaced: module.entity.action), schema_version, org_id, published_at, published_by (user_id or system), payload (JSON, schema-versioned), correlation_id (for tracing event chains).

Event schema storage: packages/schemas/ in repository. Every schema versioned. Consumers implement tolerant reader pattern (ignore unknown fields). Schema_version included in every event payload. Outbox table stores: event_type, schema_version, payload, created_at, published_at. See ADL for schema registry decision.

Cross-module transaction boundary: Saga pattern with compensating actions. No distributed two-phase commit. Each workflow step publishes a domain event. On step failure, orchestrator emits compensation events for previously completed steps. Compensation failure → dead letter queue + admin alert + manual intervention possible. See ADL for full Saga implementation specification.

Subscription management: modules declare subscriptions in manifest, registered at install via Foundry, deregistered at uninstall. Subscriptions versioned (module can declare which event schema versions it supports).

Event replay: replay events from a specific timestamp for debugging or recovery. Replay respects idempotency (consumers must handle replayed events without side effects).

Module dependency cycle detection: Foundry performs topological sort on required dependencies at install time. Cycle detected → installation rejected with error showing the cycle path. Optional dependency cycle → warning logged, installation proceeds with degraded capability declared.

### Notification Engine (Extend Core v0.0.1)

All channels: in-app (badge, list, click-to-navigate), WhatsApp (template-based), email (transactional via SendGrid/SES), SMS, push (mobile app). Every channel checked against global opt-out registry before sending. Per-user preferences per notification type and per channel. Quiet hours (configurable per user). Daily digest option (aggregate non-urgent notifications).

Delivery failure handling: retry with exponential backoff (immediate → 5 minutes → 30 minutes → 2 hours → 8 hours → 24 hours, max 6 attempts per channel). After max attempts: event to dead letter queue, admin alerted, notification status visible to admin. Per-channel failure logged with reason.

Email bounce handling: hard bounce (address does not exist) → mark email invalid immediately, remove from all future sends, flag in record. Soft bounce (temporary failure) → retry 3 times over 48 hours → treat as hard bounce if all fail. Bounce data feeds global opt-out registry.

Notification history: 90-day retention, queryable by user and type.

### Communication Gateway (Extend Core v0.0.1 — Promoted to Full Enforcement Layer)

All outbound communications (WhatsApp, email, SMS, push) must route through the Communication Gateway. No module sends communications bypassing it. Gateway checks the global opt-out registry before routing any message. Gateway enforces rate limits per recipient per channel per time window. Gateway logs every communication attempt (sent, blocked by opt-out, rate limited, failed). Circuit breaker per external service provider. Queue messages when provider is unavailable, send on recovery.

### Search (Extend Core v0.0.1)

Full-text search across all entity types in all modules. Field-level indexing control per entity type. Result ranking by relevance and recency. Filter by entity type. Search suggestions (as-you-type). Recent searches per user (last 10). Advanced field-specific search. Search analytics (what users search for, what returns no results). Index updated near-real-time on record change. Graceful degradation when search index unavailable (returns empty with "temporarily unavailable", all other functionality continues).

### File Service (Extend Core v0.0.1)

Upload, download, preview (PDF inline, images inline), time-limited share links (24h, 7d, 30d, permanent options), version management (upload new version, all versions preserved), archive (soft delete, restorable). Virus scanning on upload (configurable fallback: block uploads or quarantine with retroactive scan). Metadata per file: filename, size, MIME type, uploaded_by, uploaded_at, entity_type, entity_id, tags, description, version_number, thumbnail. Storage usage tracking per org, per module, per entity type. Alerts at 70%, 85%, 95%, 100% of plan storage allocation. Billing Authority receives alerts (not general team). Bulk operations (archive multiple, download as ZIP). Image pipeline integration (automatic on image upload).

### AI Proxy (Extend Core v0.0.1)

Model routing: query classified by complexity, routed to cheapest model that handles the query type (efficient tier, standard tier, complex tier, advanced tier). User can set preferred model in settings (override routing). User can set per-organisation monthly AI cost cap (hard enforcement, not just alert — AI features pause when cap reached, alert at 80% consumed, Billing Authority can raise or temporarily override).

Credit system: credits consumed per query by type (efficient: 1 credit, standard: 3 credits, complex: 10 credits, workflow generation: 20 credits, full business review: 50 credits). Credit balance visible in real time. Alert at configurable threshold. Purchase additional credits via any payment method.

Data classification enforcement: every AI query checked against classification (readable, restricted with per-session consent, prohibited — AI must never process). Classification defined in module manifests. Proxy enforces, cannot be bypassed by any prompt. Context cleared on session end. No cross-org context leakage.

### Audit Log (Platform-Wide)

Append-only, hash-chained (each entry hashes the previous), tamper-evident. Every record state change, every auth event, every admin action, every billing event, every configuration change, every AI query (category and timestamp only, not content), every communication attempt logged. Cannot be deleted by anyone. Queryable by admin with filter (user, date range, action type, entity type). Export for compliance periods. Hash chain verification on read — chain break triggers immediate alert. Audit log retention cost warning sent to Billing Authority when projected size or cost exceeds configurable threshold.

### Webhook Management

Outbound webhooks: any event to customer's configured URL. Webhook secret for request signature verification (HMAC-SHA256). Test payload on demand. Delivery log (success, failure, retry history per event per webhook). Retry with exponential backoff (same schedule as notification retry). Max retry attempts configurable. Dead letter for persistently failing webhooks with admin alert.

### API Gateway (Full Implementation)

Rate limiting: per API key, per IP, per user, per tenant (fairness across tenants). Idempotency key validation for all write endpoints. Auth verification at gateway before routing. Versioned endpoint routing (v1, v2 etc.). CORS allowlist management (static per deployment plus dynamic per tenant for website builder). Sunset headers on deprecated endpoints (RFC 8594). API key validation and scoping. Request/response structured logging. Health check routing (remove unhealthy pods automatically).

Health check endpoint: /health returns composite status (healthy, degraded, unhealthy) with per-component breakdown (database read/write, cache, object storage, event bus). Responds within 500ms or treated as unhealthy. Read-only checks only (no side effects). HTTP 200 for healthy, 207 for degraded, 503 for unhealthy. Kubernetes readiness probe uses /health. Kubernetes liveness probe uses /alive (simpler process check only).

API version deprecation policy: minimum 6-month notice before retiring any API version. Deprecation and Sunset response headers on deprecated endpoints from day of announcement. Breaking changes always require new version. Old versions supported for full notice period.

---

## Level 5 — Configuration Engine

### Visual Workflow Builder

Canvas: drag-and-drop with block types: Trigger (green), Condition (yellow, diamond shape), Action (blue), Wait (clock — delay by time or until condition), Approval Gate (pause until human approves), Split (launch parallel branches), Merge (wait for all branches), Loop (repeat until condition), Webhook (POST to external URL), AI Step (evaluate or generate content within workflow), Sub-workflow (embed another workflow as a step).

Triggers (every module exposes its own): record created, record updated, stage changed (from specific stage to specific stage), field value changed (any field, any condition), score threshold crossed, time elapsed since event (last activity, created date, due date, any timestamped field), date reached (specific date or relative to a field value), form submitted, payment event (recorded, verified, overdue, gate cleared), attendance event (marked, threshold crossed, consecutive misses), grade event (released, below threshold), calendar event (class starting, event starting), inventory threshold, order event (placed, fulfilled, returned, cancelled), external webhook received, manual trigger (user clicks run on a record), scheduled (cron-style, every day at X time, weekly, monthly), API trigger (external system calls trigger endpoint).

Conditions: field comparisons (equals, not equals, contains, starts with, ends with, is empty, is not empty, is in list, is not in list), numeric comparisons (greater than, less than, between), date comparisons (before, after, between, within N days, is overdue), tag conditions (includes, excludes), stage conditions (is in, is not in), score conditions (above, below, between), relationship conditions (exists, does not exist, count), cross-module conditions (payment verified, attendance above threshold, grade released), AND / OR / NOT operators, nested condition groups with unlimited depth.

Actions (every module exposes its own): send WhatsApp (template, variable personalization), send email (template, variable personalization), send SMS, send in-app notification, create task (full task with all fields), change stage, update field value, add tag, remove tag, assign to user (direct, round-robin pool, rule-based), enroll in email sequence, enroll in WhatsApp sequence, create invoice, record attendance, generate certificate, create calendar event, post to Workspace channel, trigger sub-workflow, call webhook (POST with configurable payload), call AI (evaluate, classify, generate text), score adjustment, archive record, create linked record in any module, emit custom event to event bus.

Workflow safety and governance: activation gate (starts as Draft, explicit Activate required, affected record count warning shown), test run/simulation mode (run against single test record, actions are previews not real, no real audit log entries, no real notifications sent, test data isolated and clearable), conflict detection (warn if two workflows fire on same trigger and create conflicting actions), infinite loop detection (before activation and during execution monitoring), rate limit enforcement (prevent workflows from exceeding external API limits), opt-out path validation (warn if communication workflow has no opt-out mechanism), pause/resume (any live workflow, in-flight records preserved), undo window (bulk action rollback within configurable seconds — toast: "Workflow sent 47 messages — Undo?"), execution log (every run logged: trigger, condition evaluations, actions executed, failures, duration), real-time execution animation (watch historical run replay with block-by-block highlighting and evaluated condition values shown).

Workflow version history: every save creates a version (who saved, when, what changed in diff format). Revert to any previous version (creates new version marked as "reverted from version N"). Audit trail for every configuration change (who changed what, when, old value, new value) stored in platform audit log with same tamper-evident guarantees.

### Lifecycle Builder

Configure stage names, colours, icons per entity type per module. Allowed transitions (from stage A, can move to B or C — not D). Forward-only enforcement option. Transitions requiring approval (named approver must confirm before stage change executes). Automated transitions (system moves record when condition met without human action). Transition-triggered workflow (specific workflow fires when this transition occurs). Transition hooks (pre-validation: check required fields, check related record state, check payment status). Stage history preserved in audit log (every change: from, to, by, reason, timestamp, session_id).

### Rules Engine

Synchronous enforcement runs before state transitions complete. Rule types: field validation (required, format, range, custom regex), cross-field dependency (if field A has value X, field B must have value Y), date constraints (cannot schedule in past, must be before related date), amount constraints (cannot exceed budget, must be positive), relationship requirements (must have linked record, linked record must be in specific state), capacity constraints (must have available seats, user must have capacity), approval requirements (amount above threshold requires specific approver role), completion criteria (must meet multiple conditions before stage advance), custom conditions (any combination using condition builder from workflow engine).

Rule violation message shown to user before action is blocked. Rule bypass: Super Admin only with logged reason. Rule testing: dry-run against existing records to see which would be affected before activation. Rules exported and imported as part of template packages.

### Form Builder

All custom field types available. Conditional visibility per field. Multi-step wizard forms with configurable step names and progress indicator. Preview mode (see as respondent sees it, with real conditional logic). Embeddable via JavaScript snippet on external websites. Submission routing (configurable: which module, which entity type, field mapping, deduplication rules). Submission notification (to configured users on submission). Submission approval option (submissions held for human review before creating records). Duplicate detection on submission (match by configurable fields, offer merge or create). Form analytics (submission count, drop-off rate per step, field completion rates, time to complete). Form version history. Spam protection (honeypot field, rate limiting per IP per form, optional CAPTCHA/hCaptcha integration for high-risk public forms).

### AI Configuration Wizard

Natural language description → workflow assembly in real time. AI uses only declared module capabilities (cannot invent triggers, conditions, or actions that do not exist). Visual: blocks appear on canvas as AI builds. Conversational refinement ("change the wait to 1 hour", "add a branch for score above 70", "what if they came from Meta?"). AI self-checks before generating: validates against module architecture rules (no circular triggers, rate limit compliance, opt-out path present, capacity limits respected). Risk identification: AI flags potential issues before user activates (high message volume, capacity overload, missing exit conditions). Projection mode: AI can answer "how many records would this have affected last month?" using real org data with user permission. Human approval required before activation — AI cannot activate workflows autonomously. Learning user preferences: over time AI learns which templates are customised, which suggestions are accepted or rejected, preferred communication tone and timing.

### Template Library

Template structure: complete configuration package (lifecycle stages, rules, workflows, forms, message templates, task templates, report definitions). Applied in one operation. Individual components can be accepted or skipped. All components are editable after application.

Template quality lifecycle: community rating (stars and reviews), platform-verified badge (reviewed and tested by platform team), usage count, version history (breaking changes require explicit opt-in migration from existing users), conflict detection (shows what the template would change before applying, flags conflicts), preview before apply (see all components without installing), save as template (any configuration an organisation creates can be saved), share to community library (optional, with anonymised usage data).

### Architectural Decisions for Configuration Engine (Locked)

Configuration Engine is a platform service, not a module. It sits between Core and the module layer. Every module must implement four provider interfaces (Lifecycle, Rules, Workflow, Forms) before it is considered complete. AI wizard generates WorkflowDefinition JSON only using declared module capabilities — it cannot generate code. All configuration is tenant-scoped, no configuration crosses tenant boundaries. Templates are versioned — breaking changes require explicit opt-in migration. Execution animation reads from the actual execution log (not cosmetic). Every AI suggestion requires human approval before activation.

---

## Level 6 — Products and Catalogue

Product types: training programme (scheduled, batch-based), online course (self-paced), physical product (inventory-tracked, shippable), digital product (downloadable or licence key), service (per-unit, per-hour, or project), subscription (recurring access), event ticket (linked to Events module), bundle (multiple products together at combined price), gift card or voucher.

Product record: name, code, description (rich text), short description, category, sub-category, tags, type, format (for educational: online, in-person, hybrid), status (draft, active, inactive, archived — archive not delete, preserves historical invoices), images (WebP gallery), attachments, SEO fields, visibility (internal only, public, on-request), custom fields (unlimited), branch or org ownership. Price change history maintained on product record: old price, new price, effective date, changed by. Historical invoices retain price at time of issue (not a reference to current price — stored as actual value on invoice line item). Product archive is terminal for the catalogue but all historical references remain valid.

Physical products: SKU, barcode (EAN, UPC, custom), weight, dimensions, variants (any attribute combination with independent stock per variant).

Batches (for educational products): name, code, start date, end date, session schedule, venue or video link, status (open, full, closed, in progress, completed), seat management (total, reserved, confirmed, available, waitlist count), configurable seat hold duration (how long a reserved seat is held before release to next waitlist position), multiple concurrent batches per programme.

Pricing engine: fixed price, tiered (different prices at quantity thresholds), volume (unit price drops at volume), per-unit, per-hour, per-period (subscription), dynamic (by date, demand, or rule). Price types per product: base, early bird (with configurable deadline), scholarship or discounted (approval required above configurable threshold), referral (flat or percentage), group (for N or more from same organisation), corporate rate, loyalty rate (returning customers), branch-specific override.

Installment plans: multiple plans per product, configurable splits (percentages) and due dates, due date types (fixed calendar date, relative to enrollment date, relative to batch start date). See ADL for installment plan payment allocation implementation.

Discount engine: types (percentage, flat amount, free shipping, free item). Triggers (coupon code, automatic rule-based, manual officer application). Rules (minimum purchase, specific product or category, specific user segment, date range, first purchase only, nth purchase). Stacking rules configurable per organisation. See ADL for discount application order. All applied discounts listed as separate line items on invoice for full transparency. Discount approval workflow for discounts above configurable threshold. Discount audit log.

Inventory management: stock levels per product per location (warehouse, branch, store), stock movements with reason codes (purchase, sale, return, adjustment, transfer, write-off), lot and batch tracking (expiry dates for perishables), serial number tracking (for individual high-value items), multiple storage locations per organisation, purchase orders (create, approve, receive, partial receive), stock transfers between locations, stocktaking (count sheets, variance recording, adjustment approval), reorder points and quantity recommendations, supplier lead time tracking. Reports: current stock levels, movement history, valuation (FIFO, LIFO, or weighted average — configurable), slow-moving and dead stock, reorder report, shrinkage and write-off.

Currency: primary currency per organisation. Multi-currency display (show price in customer's preferred currency, transact in base currency). Exchange rate management (manual entry or API-sourced). See ADL for exchange rate timing at invoice vs payment.

---

## Level 7 — CRM

### Lead Intake

Unified intake: all sources create the same lead record structure. Source tracking via structured enum (meta_lead_form, meta_whatsapp, tiktok_lead_gen, google_ads, google_business, facebook_form, web_form, manual, csv_import, api, event_attendance, referral, whatsapp_inbound, sms_inbound, chatbot, live_chat, email_inquiry, phone_call, walk_in, and any operator-defined custom source). Lead source is immutable after creation (see ADL). Super Admin correction requires a separate audit log entry documenting the reason.

Source integrations: Meta Lead Forms (Marketing API webhook, real-time, field mapping wizard, campaign and ad metadata captured), Meta WhatsApp (Business API webhook, first message from unknown number creates lead, phone normalised, opt-in consent flagged), TikTok Lead Gen (API webhook), Google Ads (Lead Form Extensions, Google Business Messages), Facebook Forms (page forms, Messenger bot), Web forms (embeddable JavaScript snippet, configurable field mapping), Manual entry (required fields enforced), CSV/Excel import (field mapping wizard, deduplication preview before commit, import batch ID on all records, rollback by batch ID), API intake (authenticated endpoint, documented schema), Referral tracking (referrer linked to any person record, discount and commission rules triggered).

Deduplication engine: match on normalised phone (strip all country code variations), email (case-insensitive), name plus phone fuzzy match above configurable threshold. Automated merge rules (see ADL): exact phone match auto-merges silently with audit log; email plus name similarity above threshold prompts human merge decision; all else creates separately. Manual merge always available. Merge preserves complete timeline from both records. Merge event logged.

### Lead and Contact Record

Fields: complete identity (name, phone primary and secondary and tertiary, email primary and secondary, date of birth, gender, nationality, photo), contact details (address, city, area, country), organisation name, designation, industry. Source (immutable), source campaign ID, source form ID, capture timestamp. Assigned user, assigned team, assigned branch. Tags (multi-select). Lead type (individual, organisation, referral). Language preference. Communication preference (WhatsApp, email, SMS, phone, any). Custom fields (unlimited, org-defined).

Commercial: product or service interests (array, multiple allowed), pipeline ID, stage ID, lead score (0–100, computed), score tier, expected value, currency.

Immutable timeline: every event appended, never edited. Complete record of every interaction and every change. Includes: all intake events, all stage transitions (from, to, by, reason, session_id), all WhatsApp sent and received and opted-out and opted-in, all emails sent and opened and clicked and bounced, all calls logged, all notes, all tasks, all score changes, all workflow triggers, all assignments, all tag changes, all file attachments, all form submissions, all meeting logs, all invoice and payment events, all enrollment events, all custom field changes (old value, new value), all merge events, all comment events.

Internal comments: threaded, @mention any team member, file attachments, internal only (never visible to the lead), edit within configurable window then locked, archive (soft delete with restore). Replaces ad-hoc group chat for internal sales coordination.

Communication panel (in-record): send WhatsApp (template or free-form within 24-hour window), send email, schedule message, quick call log. All communications auto-logged to timeline on send.

Linked records: many-to-many between any entity types (lead ↔ contact, lead ↔ company, lead ↔ deal, lead ↔ lead for family and referral chains, lead ↔ student on enrollment).

### WhatsApp Engine

Per-branch or org-wide connection (multi-account model). Template management (create, submit for Meta approval, track approval status, categories: utility, authentication, marketing, template variables from connected record schema, template versioning). Inbound routing (match to record → attach and notify; no match → create lead and assign). Outbound (free-form within 24-hour window, template outside). Rich media (images, documents, location, interactive buttons, list messages). Conversation view (full thread in record, real-time, reply without navigating away). Broadcast engine (Meta-compliant template, audience segmentation from any module, preview with real data, rate limit compliance, per-recipient tracking: sent/delivered/read/replied/failed/opted-out, pause or stop mid-send, abandoned broadcast recoverable). Auto-reply (outside hours, initial acknowledgment, keyword triggers with configurable actions). Global opt-out registry checked before every send.

### Email Engine

Connected inbox per user or per team or per branch (Gmail OAuth2, Outlook OAuth2, custom SMTP). Multiple connections per organisation at any level. Email matched to records by sender/recipient email and auto-logged to timeline. Transactional sending via SendGrid or AWS SES. Custom sending domain per branch (DKIM, SPF, DMARC wizard). Open tracking (1×1 pixel), click tracking (link wrapping), bounce handling (hard: mark invalid immediately; soft: retry 3 times then treat as hard), unsubscribe management (legal compliance, feeds global opt-out registry). Templates (rich text editor, dynamic variables from record schema, categories, versioning, preview, test send, mobile preview). Sequences (multi-step, configurable delay between steps, pause on reply from any channel, exit conditions, A/B testing per step, sequence analytics). Shared inbox (team-level address, assignment, collision detection, SLA tracking, multiple per organisation and per branch).

### Pipeline and Kanban

Unlimited pipelines per organisation. Per-branch pipelines. Lifecycle Builder defines all stages. Views: Kanban (drag between columns, card shows configurable fields, quick actions from card), List (all columns configurable, sortable, filterable, bulk actions), Timeline (expected close on bar chart), Map (by location for field sales), Calendar (due tasks and close dates on calendar). Bulk actions from any view: reassign, tag, stage move, pipeline move, workflow enrol, sequence enrol, archive, export, send bulk message. Won/Lost tracking (reason codes, competitor notes for Lost, re-engage date).

### Lead Scoring Engine

Score range 0–100. Tiers: Hot (80–100), Warm (50–79), Nurturing (25–49), Cold (0–24). All signal weights configurable per org and optionally per pipeline. Recalculated on every relevant event. Positive signals include (configurable): source type, email opens and clicks, WhatsApp reply received, form submissions, stage advancement, custom field completion, fast initial response, event attendance, meeting held, website visit (if tracking connected), referral source, product interest attached. Negative signals include (configurable): inactivity by age (tiered thresholds), email bounce, WhatsApp opt-out, stage moved backward, marked unqualified, unfavourable call outcome. Manual override (add or subtract with required reason, logged to timeline).

### Follow-Up System

Task system: title, description, type (call, WhatsApp, email, meeting, visit, document, custom), assignee(s), due date, priority, tags, checklist, time tracking (timer and manual), recurring option, template-based creation, cross-module creation from any record.

Follow-up queue: personal view showing overdue tasks, hot leads without follow-up today, leads inactive above threshold, stage-specific follow-up requirements. Configurable sort and filter.

Follow-up cadences: per-stage configurable task chains. Pause on any response (WhatsApp, email, call log). Manager compliance view (overdue tasks per user, average response time to new leads, leads gone dark, follow-up rate).

Daily digest: configurable time and content sections, delivery via WhatsApp or email (user preference).

### Company and Contact Management

Company records: all fields, document vault, associated contacts and leads, aggregate activity feed (all interactions across all associated people). Contact records: converted from lead on Won event, full history preserved, linked to company, can have multiple active deals.

### CRM Reporting

Standard reports: pipeline summary, conversion funnel, leads by source, activity per user, team performance, follow-up compliance, score distribution, won/lost analysis, time to conversion, revenue attribution. Custom report builder: any field, any filter, any grouping, scheduled delivery, export CSV or Excel.

---

## Level 8 — Finance

### Invoicing and Collections

Invoice types: from CRM lead (product interest pre-fills), from E-Commerce order, from LMS enrollment trigger, manual standalone, recurring (scheduled auto-generation for subscriptions), proforma, quote (convertible to invoice on acceptance). See ADL for quote-to-invoice conversion behaviour.

Invoice record: auto-sequential number (immutable, never reused after gap, FBR compliant — see ADL), multi-line items (description, quantity, unit price, discount, tax, subtotal), multiple tax lines (GST, WHT, any applicable), currency with exchange rate at time of issue (locked — see ADL), payment terms (net 7, net 30, due on receipt, installment plan), unique payment link per invoice, FBR-compliant format (NTN, STRN, tax breakdown), status lifecycle (draft → sent → partial → paid → overdue → cancelled). Price stored on line item at time of issue, not referenced from current product price.

Tax handling: tax rounding policy configurable per organisation (per-line or per-invoice — see ADL). Tax types configurable. GST, WHT applicable per product or per transaction type. Tax amounts shown as separate line items.

Payment recording: all methods (bank transfer, JazzCash, EasyPaisa, RAAST, cash, cheque, card via gateway, any custom method). Per-method reversal and refund capability (see ADL for refund to original payment method policy). Verification workflow (pending → verified by manager). Receipt image upload. Installment tracking (which installment this covers). Partial payment recording with balance computed not stored (see ADL). Over-payment: credit to account or refund (Billing Authority decision).

Payment gateway integrations (multi-account: per branch or org-wide): JazzCash (merchant account, auto-debit mandate, manual send), EasyPaisa (same), RAAST (RAAST ID, instant verification), JS Bank or QuickPay (shadow account model, webhook notifications, per-branch accounts), Stripe (international cards, 3D Secure), Wise (international bank transfers), any gateway via webhook or manual reconciliation.

Payment gate (configurable per product and per batch): 100% required, first installment only, minimum percentage of total, manager override with documented reason. Gate cleared → event published to event bus (admission confirmed, enrollment triggered).

Overdue management: configurable reminder schedule, reminder templates, escalation to manager, seat release trigger for educational batches.

Refund approval workflow: Finance officer initiates, Finance manager or owner approves above configurable threshold, refund processed, notification to customer. Refund goes to original payment method where technically possible (see ADL). If original method unavailable: account credit with Billing Authority notification.

Invoice storage retention: 6 years per FBR Pakistan requirement. Separate retention lifecycle from general operational data. Survives account closure.

### Expense Management

All expense types (standard, mileage, per diem). Multi-currency with exchange rate. Project and budget line code tracking. Threshold-based approval workflow (configurable: below threshold auto-approved, above requires manager, above higher threshold requires owner or CFO). Sequential or parallel approval chains. Approval via WhatsApp or in-app. Deadline with escalation. Vendor management (profile, performance rating, document vault, approved vendor list, payment terms). Purchase orders (create, approval, receive, partial receive, 3-way match: PO vs receipt vs vendor invoice).

Budget management: by department, by project, by period, by expense category. Real-time vs actual tracking. Alerts at configurable consumption percentages. Budget approval for overspend. Mid-period reforecast.

### General Ledger

Configurable chart of accounts (Pakistani business defaults, IFRS templates, any market). Account types (asset, liability, equity, revenue, expense, cost of goods sold), account codes (numeric hierarchy, configurable depth), tax treatment per account. Journal entries: automated from all modules (invoices, payments, expenses, payroll, purchase orders, inventory movements, order fulfilment), manual with approval, recurring, reversing. Period management: monthly soft close (restrict editing prior periods), annual hard close (finalise year-end entries). Multi-period comparison in all reports.

### Banking and Reconciliation

Multiple accounts per organisation (per branch). All account types. Transaction import (CSV per bank format configurable, API integrations where available, manual entry). Auto-match transactions to records (amount, date, reference matching with confidence scoring). Manual match with override. Unmatched flagged on both sides. Reconciliation report. Period lock after reconciliation.

### Financial Reports

Profit and loss (by period, by product or programme, by department, by branch), balance sheet, cash flow statement, revenue reports (by product, by batch, by agent, by payment method, by branch), expense reports (by category, by department, by vendor, by project), outstanding aging (30, 60, 90, 90+ day buckets), collection efficiency, budget vs actual, tax reports (GST summary, WHT, FBR-compatible export format), bank reconciliation report, audit trail report. Custom report builder. Scheduled delivery. Export CSV, Excel, PDF.

### Payroll

Salary structures: base salary, configurable allowances (HRA, transport, medical, fuel, mobile, any custom), configurable deductions (EOBI, PESSI, income tax FBR slab-based updated each fiscal year, loan recovery, advance recovery, any custom). Leave without pay deduction. Overtime calculation (see ADL for threshold configuration). Payroll run: calculate → review → approve → disburse. PDF payslips (branded, FBR-compliant). Bank transfer file export (IBFT batch format for Pakistani banks). Payroll history and audit trail. Commission amounts pulled from HR module approved batch. Bonus and one-time payments. Payroll approval workflow.

### Platform Billing

Prepaid balance model. Daily platform fee deducted (plan fee ÷ 30). Service charges deducted immediately on use (AI queries, WhatsApp, email, payroll run, extra storage, backup). Minimum top-up PKR 100. Balance alerts (user-configurable threshold and auto top-up amount and trigger). All payment methods first-class. Service pauses on day 20 of zero balance. Billing date never moves regardless of payment timing. Maximum debt one billing cycle (no new invoice generated while previous unpaid). Reactivation: pay outstanding plus pro-rated current period, billing date unchanged. Emergency credit (2 days, once per 6 months, any operator can request via support).

Billing privacy: Billing Authority (first registered user by default, transferable) always receives all billing communications. Non-billing users see only "Contact your administrator." Delegates configurable with granular permissions (notifications, view balance, view history, add credit, change payment method, manage auto top-up). Multiple delegates allowed.

Tier change proration: upgrades credit unused days of current tier and apply to first cycle of new tier. Downgrades take effect at end of current cycle with no refund (see ADL).

FBR-compliant invoices on all billing. Sales tax registration number and NTN on all invoices.

---

## Level 9 — HR

### Employee Records and Organisational Structure

Employee profile: personal details (full name, preferred name, CNIC, passport, date of birth, gender, nationality, languages spoken, emergency contacts, photo), contact (phone multiple, email work and personal, address), employment (employee ID, designation, job title, department, team, branch, reporting manager, employment type, join date, probation end, confirmation date, current status), contract (type, start, end, notice period, document), compensation (current base, grade or band, last revision date, next review due), bank details (multiple bank accounts supported), education and qualifications, skills and competencies, document vault (all documents versioned and expiry-tracked), custom fields.

Organisational structure: departments (multi-level hierarchy), teams within departments, job grades and bands, positions with headcount planning. Org chart (visual, interactive, PDF export). Reporting lines (direct and dotted-line). Branch assignment (employee assigned to one or more branches, primary branch defined). Employment history: all role changes, promotions, department transfers, salary revisions logged chronologically with effective date, change type, details, recorded by.

### Recruitment

Fully configurable pipeline stages via Lifecycle Builder. Requisition → approval → job description → posting → applications → configurable stages → offer → acceptance → onboarding. Applicant tracking (configurable application form via Form Builder, resume field extraction, evaluation scorecard with weighted criteria, interview scheduling with calendar integration, candidate comparison side-by-side, candidate portal for application status tracking). Offer letter generation (PDF, template-based). Configured onboarding checklist triggers platform access provisioning via Gatekeeper event on completion.

### Attendance and Time Tracking

Methods (all configurable per location and programme, all route to cloud API directly without dedicated local PC):

Geofenced time-windowed QR code: QR changes every configurable period (e.g., 15 minutes), valid only when scanner device is within GPS radius of the registered location (geofence verified server-side, not client-side), scan from outside geofence is rejected with specific error, supervisor-scan mode (supervisor scans employee's QR) and self-scan mode (employee scans a fixed display QR at entrance) both supported, anti-spoofing via server-side GPS coordinate verification of the scanning device.

Network-connected biometric device (fingerprint, face recognition): device connects via IP (ethernet or WiFi) directly to cloud API endpoint, no dedicated local PC required, device sends attendance event to platform API on successful recognition, supported protocols (TCP/IP socket, REST API, vendor SDK adapters per brand — ZKTeco, ESSL, Suprema, HikVision adapters as examples), offline buffering (events queued on device when connection lost, synced to platform when connection restored), device management dashboard (register devices per branch, monitor online status, view pending sync queue).

RFID/NFC card: networked reader (same direct cloud API model as biometric), tap to check in, multi-tap prevention within configurable window.

Mobile GPS check-in: must be within geofence radius of registered location, must be during scheduled class or shift hours, photo capture option with liveness detection, works offline (queued and submitted when connection restored).

Manual entry: always available as override, requires reason text, optional approval workflow, logged with who entered and when.

Shift management: multiple shifts per day per location, fixed, rotating, and flexible assignment, shift templates, overtime thresholds configurable (daily: hours after X per day; weekly: hours after Y per week; overtime rate multiplier configurable per grade), leave without pay deduction per day rate.

Leave management: fully configurable types, accrual rules, carry-forward rules (including expiry date for carried forward leave — configurable per type: use by specific date or forfeit, expiry notification N days before), encashment rules, application and multi-level approval workflow, balance tracking (real time), holiday calendar (national plus branch-specific custom), leave reports and team leave calendar.

### Performance Management

OKR and KPI frameworks (configurable per department). Goal periods. Goal cascading (org → department → team → individual). Configurable review cycles and review forms (Form Builder). Self-assessment, manager assessment, peer feedback (360), skip-level feedback. Calibration sessions. Configurable rating scales and distributions. At-risk flags: configured entirely in Rules Engine (any combination of performance rating, attendance, goal progress, check-in misses, disciplinary events, custom conditions triggers configurable workflow — nothing hardcoded). PIP (Performance Improvement Plan) with milestones, check-ins, and outcomes.

### Commission and Incentive Schemes

Scheme types: flat per conversion, percentage of collected amount, tiered rates with different thresholds, accelerators (rate increases above target), team commission pool distributed by configurable rule, deferred commission (earned now paid after retention condition), clawback rules (commission reversed if sale reverses). Per-scheme calculation trigger (on first installment verified, on full payment, on manager confirmation). Commission period management (monthly or bi-monthly). Batch approval workflow. Commission statement per employee. Leaderboard (opt-in per organisation, configurable visibility).

### Policies, Offboarding

Policy library (versioned, mandatory acknowledgment with deadline, compliance report, whistleblower anonymous submission channel, disciplinary records access-controlled). Offboarding (configurable checklist, exit interview, asset recovery, knowledge transfer tasks, final settlement calculation including gratuity where applicable, access revocation via Gatekeeper event — automatic on completion, alumni record maintained with rehire eligibility flag).

---

## Level 10 — Workspace

### Messaging

Direct messages (1:1, real-time). Group channels (by team, project, cohort, branch, topic). Channel types: public (anyone can join), private (invite only), shared (cross-branch or cross-organisation collaboration), external (limited-access guest users). Thread replies. Pin messages. @mention, @here, @channel. Emoji reactions. Voice messages (waveform preview, playback speed control). Video messages (short clips). File sharing (SVFS). Link previews. Message edit history (original content always visible alongside edits with timestamps). Archive (soft delete with restore). Forward. Bookmark. Read receipts. Typing indicators. Status (online, away, do not disturb, invisible, custom message text). Notification preferences per channel. Announcement channels (admin-post-only, all members read). Search (full text, all accessible messages, filter by channel, user, date range, has attachment). End-to-end encryption option for sensitive channels.

### Tasks and Projects

Tasks: title, description, assignee(s), due date, priority, tags, checklist with sub-items, time tracking (timer and manual entry), project link, status, dependencies (this task blocks or is blocked by), files, comments with @mentions. Recurring tasks. Task templates. Cross-module creation from any record in any module (task links back to originating record). Time tracking report by user, by project, by period, billable vs non-billable.

Project views: Board (Kanban by status), List (sortable, filterable), Calendar (by due date), Gantt timeline (with dependency visualisation and drag-to-reschedule). Project members with roles. Milestones. Project budget vs actual (linked to Finance). Project templates. Project portfolio view for executives.

### Documents and Knowledge Base

Hierarchical wiki (unlimited depth). Rich editor (all formatting types, tables, code blocks with syntax highlighting, callouts, embeds, page links, @mentions). Real-time collaborative editing (CRDT). Version history per page (restore any version — restoring creates a new version, all previous versions remain accessible). Document folders (team, personal, org-wide, access-controlled). All file types, preview, version management, time-limited secure sharing links. Document templates. Search (filenames plus PDF content full-text). File version restore (restore creates new version, old versions remain).

### Calendar, Meetings, and Rooms

Personal, team, org-wide calendars. All event types from all modules visible on team calendar (configurable). Conflict detection on scheduling. Attendee availability view. RSVP. Recurring events. Google Calendar two-way sync. Outlook two-way sync. iCal subscribe URL. Google Meet link generation from event (one click). Zoom link generation. Meeting recording link attachment post-meeting. Meeting notes form per event. Room and resource booking (conference rooms, equipment, any physical resource).

### Announcements and Reminders

Announcements (org-wide and team-level, priority levels: normal, important, urgent, read confirmation tracking, scheduled publishing, expiry date). Reminders (personal and team, linked to any record in any module, or standalone, delivery via in-app and WhatsApp and email per user preference, snooze options, recurrence). Notification history (90 days, queryable).

---

## Level 11 — LMS

Designed for any educational institution at any scale: small training centre, large corporate training department, school, college, multi-campus university, professional certification body. All stage names, requirements, thresholds, and processes are configured via the Configuration Engine. Nothing is hardcoded.

### Student Lifecycle (All Stages Configurable via Lifecycle Builder)

Inquiry and Application: configurable application form (Form Builder), configurable required documents per programme, application status tracking portal for applicants, evaluation workflow with configurable criteria and scoring, entrance test (online quiz engine or manual entry for external test results), interview scheduling and feedback, merit list generation ranked by configurable criteria, offer or waitlist or rejection with automated communications.

Admission Confirmation: conditional on configurable requirements (payment gate, documents verified, test result above threshold, any combination). Admission letter generation (PDF, branded). Document verification checklist. Payment gate enforced (see Finance).

Enrollment and Onboarding: student profile creation (from applicant record or new). Student number generation (configurable format per institution). LMS account provisioning. Welcome communication. Orientation materials. Pre-course assessment (baseline). Cohort channel creation in Workspace (students and teachers auto-added). Class credentials distributed.

Pre-Class Preparation: configurable pre-reading, pre-viewing, pre-assignment. Prerequisites check (must complete earlier requirement before advancing). Orientation session. Equipment and materials list. Student acknowledgment of programme terms.

Active Learning: timetable, classes, attendance, assignments, assessments, content library, student portal, teacher dashboard, coordinator dashboard — all covered in sections below.

Mid-Programme Checkpoints: configurable progress reviews, academic warning trigger (configured via Rules Engine, any condition combination), financial hold behaviour (configurable: block access entirely, show warning and allow access, flag only — never hardcoded), progression requirements (student must complete stage N requirements before accessing stage N+1 content), credit hour tracking (for university programmes), academic standing calculation (configurable formula).

Assessment: final examinations (online via quiz engine and in-person), practical assessments (marking criteria, evidence upload, assessor assignment), portfolio submission, project presentations (scheduling, panel assignment, marks entry), external exam coordination (link to external body, result entry), grade appeal process (student-initiated review workflow configurable).

Completion and Certification: completion criteria check (configurable combination of attendance threshold, grade threshold, credit hours, custom conditions — nothing hardcoded), certificate generation, convocation event (linked to Events module), transcript generation.

Alumni: CRM record updated to alumni status, alumni network access, continuing education (easy re-enrollment with history pre-filled), testimonial pipeline, career outcome tracking, alumni events.

### Timetable and Class Management

Session properties: day(s) of week, time, duration, recurrence pattern, room or video link (Google Meet auto-generated or manual, Zoom), session type (lecture, tutorial, lab, exam, guest, field trip, makeup), teacher(s), teaching assistants. Bulk schedule generation (recurring pattern across entire programme duration). Conflict detection (teacher, room, student cross-batch). Room and resource booking. Schedule publishing to student portal, teacher dashboard, parent notifications, Workspace team calendar. Substitution management (assign substitute, automated student notification). Delivery modes: in-person, online synchronous, online asynchronous (recorded content only), hybrid (some in-person some online simultaneously), field trip, lab session.

### Attendance System

All methods configurable per location and programme. No method is hardcoded as the only option.

Geofenced time-windowed QR: same as HR attendance but applied to students. QR changes every configurable period. Geofence verified server-side. Scanning outside geofence or outside time window rejected. Both supervisor-scan and entrance-display self-scan modes.

Network-connected biometric: same as HR. Device → cloud API directly. No dedicated PC required.

RFID/NFC and mobile GPS check-in: same as HR attendance.

Manual entry: always available, requires reason, optional approval.

All attendance rules configured via Rules Engine and workflow engine (minimum threshold percentage, late threshold minutes, consecutive absence trigger, verification window duration, retroactive marking policy, makeup class rules, excused absence handling and documentation, parent notification conditions). At-risk flags: any combination of conditions (attendance, assignment submission, quiz performance, grade, login activity, any custom metric) triggers configurable workflow (notify coordinator, notify parent, create task, send student reminder, send teacher alert). Nothing hardcoded.

Parent/guardian attendance notifications: configurable frequency (every absence, daily summary, weekly summary). Parent portal shows child's attendance record.

### Assignments and Submissions

Assignment properties: title, instructions (rich text), due date, extension policy (automatic or teacher-approved), submission type (file upload, text, link, combined), allowed file types, size limits, grading criteria, total marks, weight in final grade, visibility date (scheduled publish), group or individual, late submission policy (configurable penalty or rejection), allowed resubmission count (unlimited, N maximum, teacher unlock required per student — configurable), plagiarism detection API integration (Turnitin or Copyleaks), peer review option, rubric-based grading, document annotation on submitted PDFs, written feedback plus numeric score, grade release control. Cheating detection log: per submission records tab switch events (count and timestamps), copy-paste events, focus loss events (window switched), paste into protected field — teacher reviews alongside submission.

### Assessments and Examinations

Online quiz engine: question types (MCQ single, MCQ multiple, true/false, short answer, numeric, essay, matching, ordering, fill-in-the-blank, image-based, calculated with random variables). Question bank (tagged, reusable). Randomisation (question order and option order). Time limits (countdown, auto-submit). Attempt limits. Lockdown browser option (restrict tab switching). Tab-switch and copy-paste detection during online assessments. Partial credit options. Answer reveal control (immediately, after deadline, never). Academic integrity log.

In-person examination management: exam timetable, seating arrangement (configurable and printable), invigilator assignment, answer book tracking, manual result entry or CSV import, moderation workflow (second examiner review).

Grading: configurable formula per programme (any component combination and any weight distribution). Grade scales (percentage, letter, GPA, pass/fail, distinction, custom). Auto-calculation from components. Grade release control (teacher marks as released before student can see). Grade appeal workflow. Transcript generation (official record PDF, stamped, signed, configurable template).

### Content Library

Organisation: by week, module, topic, type — configurable per programme. Content types: video (SVFS-hosted or external URL), PDF, presentation, audio, image gallery, external link, SCORM 1.2 and SCORM 2004 packages, xAPI/Tin Can content, H5P interactive content, embedded simulation or iframe. SCORM and xAPI runtime with learning record store (LRS). Completion status, score, and progress tracked from SCORM/xAPI content. Progress tracking per content item (video watch time percentage, read confirmation, completion status feeding into overall progress calculation).

### Portals

Student portal: dashboard (today's class with join link, pending assignments with countdown, recent grades, overall progress bar, attendance summary, outstanding fee with payment link, cohort channel quick-access), complete sections (schedule, class recordings and notes, all assignments with submission interface and feedback view, all assessments, grades, resources, payment history, direct messages with teachers, profile, certificate download, career outcomes for university programmes). Student sees only their own data.

Teacher dashboard: today's classes with roster and attendance marking interface, pending grading queue, batch roster with progress overview, assignment management (create, grade, feedback), assessment management (quiz builder, results analytics), communication tools (message batch channel, send announcement), resource upload and organisation, schedule view, substitution notifications, recording upload after class.

Academic coordinator dashboard: all programmes and batches with health indicators (attendance %, progress %, at-risk student count), all teachers (schedule load, pending grading, performance data), all at-risk students across all batches with all flag types, escalation queue, bulk communication tools (message any filter of students or teachers), timetable oversight with conflict detection, examination coordination.

Parent/guardian portal: separate login, linked to one or more student records, configurable view permissions per institution (what parents can see and cannot see), optional sections (attendance, grades, fee status, schedule, announcements), notifications (configurable type and frequency: every absence, daily summary, weekly summary), communication channel (message teacher or coordinator), fee payment from portal.

### Certificates

Template designer (upload custom design, map field positions). Per-programme and per-institution templates. Certificate fields: student full name exactly as in profile, programme name, batch code, completion date, credential ID (unique, immutable, cryptographically generated UUID). Multiple authorised signatures. Institutional seal or stamp. Bulk generation for graduating cohort. Delivery: WhatsApp PDF plus email plus student portal download. Verification URL: public, no authentication required, shows name, programme, institution, date, current status. Certificate revocation: admin action with required reason text and revoking user logged; verification URL shows "Revoked" with reason code immediately; full reason in audit log. Transcript generation: official academic record PDF with all grade components.

### University-Scale Extensions

Academic hierarchy: faculties → departments → programmes → courses → sections (unlimited depth, configurable names). Multi-year programme management (semesters, academic years, sessions). Credit hour system (configurable credits per course). Prerequisite enforcement (must pass course A before registering for course B). Course registration by student (select electives within programme requirements). Programme requirements tracking and degree audit (which courses required, which completed, which remaining, whether graduation requirements met). Academic standing (configurable thresholds: good standing, warning, probation, suspension, dismissal). GPA calculation (configurable scale: 4.0, 5.0, or custom). Accreditation body reporting. Outcome-based education tracking (course outcomes mapped to programme outcomes). Continuous quality improvement documentation. Thesis and dissertation management (supervisor assignment, milestones, committee management, defence scheduling). Research and publication tracking.

---

## Level 12 — Events Management

Event types: conference, seminar, workshop, webinar, training session, product launch, networking event, graduation ceremony, orientation, open day, exhibition, sports event, cultural event, fundraiser, hackathon, corporate away-day, any custom type.

Event configuration: all properties configurable (name, type, category, description, agenda in rich text, speakers and presenters, date, time, timezone, duration, venue or meeting link, capacity, waitlist threshold, visibility, registration settings, ticket settings, branch cost allocation). Multi-track and multi-session events (parallel tracks, per-session room and capacity, attendee session selection at registration, per-session check-in). Speakers: internal (linked to HR employee) and external (standalone profile with bio, photo, social links). Honorarium tracking linked to Finance.

Registration: configurable form (Form Builder), multiple ticket types (free, paid, VIP, group, press, speaker, staff, any custom), discount codes, capacity per ticket type, registration approval option (automatic or manual review), group registration (one person registers multiple attendees), waitlist with auto-promotion (configurable claim deadline — next in queue on expiry), registration deadline (auto-close at specified time), QR code ticket per registrant.

Check-in: configurable time window (±N minutes from event start, outside window rejected), QR code scanner (mobile app, camera), kiosk mode (tablet at entrance for self check-in), manual check-in, session-level check-in for multi-session events, badge printing export, certificate of attendance (auto-generated PDF, sent post-event).

Post-event: automated feedback collection (configurable form, sent N hours after event end), recording and resources distribution, all attendees created as CRM leads (source tagged to specific event), CRM follow-up workflow triggered (configurable), expense capture, event report (registrations, attendance, feedback NPS, leads generated, conversion rate).

---

## Level 13 — Campaigns

Email campaigns: drag-and-drop template editor with connected blocks (live data from Products, Events, E-Commerce), dynamic variables from audience segment fields, desktop and mobile preview, A/B testing (subject line, content, send time), timezone-aware scheduling (recipient's local time). Audience segmentation from any entity in any module (AND/OR/NOT, dynamic recalculation at send time). Suppression list (import emails or phones that must never receive communications regardless of opt-in). Global unsubscribe (unsubscribing from one email campaign unsubscribes from all email campaigns from this organisation — feeds global opt-out registry). Analytics (delivery, open, click, unsubscribe, bounce, spam complaint, per-link click counts, revenue attribution per campaign, campaign comparison).

WhatsApp campaigns: template-based broadcast (Meta-compliant), same segmentation engine, per-recipient status tracking, rate limit compliance, opt-out management, global opt-out registry enforced.

SMS campaigns: gateway integration (Twilio, local Pakistani gateways — configurable per branch or org-wide), template management, delivery tracking, opt-out management, global opt-out registry enforced.

Meta Ads: ad account connection (per branch or org-wide multi-account), campaign types (Lead Gen, Traffic, Awareness, Retargeting), ad creative management, lead form setup with real-time CRM push, audience management (custom from CRM segments, lookalike), UTM parameter auto-management, performance dashboard, account health alerts.

Automation sequences: multi-channel multi-step (WhatsApp → email → SMS → task → wait → condition branch). All trigger types from Configuration Engine. Pause on reply from any channel. Exit conditions. Re-enrollment policies. Per-step A/B testing. Sequence analytics (per-step funnel, conversion tracking).

Push notifications (mobile app users): rich notifications (image, action buttons), user opt-in management, same segmentation as other channels.

Attribution: lead source attribution (campaign → lead → conversion chain), multi-touch attribution (first touch, last touch, linear, time-decay — configurable), revenue attributed to campaigns, cross-channel comparison, campaign ROI calculation.

---

## Level 14 — E-Commerce

Multiple stores per organisation (different brands or markets). Per-store settings (currency, tax, shipping origins, payment methods, branding). Storefront integrated with Website Builder.

Product listing: category hierarchy (unlimited depth), collections (curated groupings), search and filtering, product recommendations (related, frequently bought together, recently viewed), stock availability display, variant selectors with stock per variant, product reviews and ratings, Q&A section.

Cart and checkout: persistent cart (across sessions and devices), guest checkout option, cart abandonment recovery (email or WhatsApp after configurable delay, maximum N messages per abandoned cart — configurable, default 2), upsell and cross-sell at checkout, coupon code application, tax and shipping calculation, inventory reservation on cart add (configurable hold duration, default 15 minutes, expires and releases stock if order not completed, reservation visible in inventory management), gift options, order notes.

Payment: all methods from Finance module, payment confirmation (WhatsApp plus email immediately), fraud detection (IP reputation, velocity checks, device fingerprinting), 3D Secure for card payments, buy now pay later (installment plan from Products pricing engine), deposit and balance payment.

Order management: fully configurable order lifecycle via Lifecycle Builder. Cancellation workflow (with refund or credit trigger). Return merchandise authorisation workflow. Exchange workflow. Order operations (pick list, pack list, shipping label, partial fulfilment for available items, back-order management with customer notification on restock, bulk order processing). Customer communications (automated sequence: confirmation, payment confirmed, processing, shipped with tracking, delivered, review request — all configurable templates). Order notes, tagging, export.

Shipping: methods (fixed rate, weight-based, dimension-based, free shipping above threshold, local pickup, flat rate per zone, real-time carrier rates via API). Carrier integrations (TCS, Leopards, M&P, DHL, FedEx — SDK adapters, print labels, tracking webhooks, multi-package orders). Multiple fulfilment locations with intelligent routing. 3PL API integration (push order, receive tracking). Split shipment across locations.

Returns and refunds: return request initiation (customer portal or customer service), reason codes, inspection checklist per product category, return status lifecycle, resolution options (refund to original method, exchange, store credit — see ADL for refund-to-original-method policy), restocking on inspection pass.

Marketplace (optional, configurable): vendor onboarding and approval, vendor storefronts within main store, commission structure (configurable per vendor or per category), vendor payouts (batch after commission deduction), vendor performance metrics, vendor disputes, vendor dashboard.

Analytics: sales dashboard (revenue, orders, AOV, conversion rate, units sold), product performance (best sellers, slow movers, margin per product), customer analytics (new vs returning, cohort LTV, order frequency), channel attribution, abandoned cart analysis, geographic sales map, inventory vs sales forecast, promotion performance.

---

## Level 15 — Website and App Builder

Visual editor: drag-and-drop canvas (sections → columns → blocks). Global styles linked to design tokens (change once, updates everywhere on site). Responsive editing per breakpoint (desktop, tablet, mobile — independent). Undo/redo (50-step persistent history). Version history (every publish creates a named version, restore any previous in one click). Real-time collaborative editing. Template library (pages and sections). Scheduled publishing (specific date and time). Rollback to any previous published version. Preview mode (shareable preview link for unpublished pages). Password-protected pages. Published vs draft state: unpublished pages return 404 to unauthenticated users; authenticated editors access via time-limited token.

Block library: standard blocks (hero, text, image, video, button, divider, spacer, form, pricing table, testimonial, FAQ accordion, team grid, gallery, countdown timer, progress bar, icon block, map embed, social links, HTML embed, blog feed, stats counter, banner/notice) plus connected blocks (live data, no manual update required): programme catalog (from Products), event listing (from Events), product listing (from E-Commerce), lead capture form (CRM intake, source tagged to specific page and form), job posting list (from HR), testimonials (from LMS alumni with approval), pricing table (from Products pricing engine), batch countdown (to Products batch start date), seats remaining (live from Products), staff directory (from HR, configurable who appears), portfolio or gallery (from SVFS media).

Form submission spam protection: honeypot field (invisible to humans, filled by bots — submission discarded), rate limiting per IP per form (configurable), optional CAPTCHA or hCaptcha integration for high-risk public forms.

Multi-site: unlimited sites, per-site domain, brand settings, navigation. Site-level access control. Cross-site template sharing. Site cloning. Custom domain with SSL auto-provisioning (Let's Encrypt). Subdomain option. www redirect management.

SEO: meta title, description, OG image per page, structured data (Schema.org: Organisation, Course, Event, Product, FAQ, Article), sitemap XML (auto-generated and auto-updated on publish), robots.txt, canonical URLs, redirect management (301 builder), Google Analytics, Google Tag Manager, Meta Pixel integration, Core Web Vitals monitoring.

Blog: post editor (rich text, images, video, code blocks), categories, tags, series, authors (linked to HR or external), featured image, post scheduling, comment moderation option, RSS feed, social sharing buttons, SEO per post.

Progressive Web App builder: same block system extended for mobile-first layouts. Student portal app, employee self-service app (leave, payslip, attendance, tasks), customer app (order tracking, loyalty). Brand-customisable per organisation. Offline support (cached data). Push notifications (via Campaigns module). Home screen installation prompt.

---

## Level 16 — AI Business Consultant

Individual intelligence: continuous monitoring of all connected module data. Proactive alerts without user asking (cash flow risk, margin erosion, revenue concentration, receivables aging, payroll risk, growth trajectory signals). Alerts include specific numbers, specific cause, specific options to act. Conversational advisor (any business question answered from real data, plain language, confidence level shown, data source transparent, data freshness indicator showing "based on data as of [date and time]" and warning if data is more than 24 hours old). Guided decision support (complex decisions walked through step by step, AI asks clarifying questions, retrieves data, presents options with tradeoffs, makes recommendation with reasoning, human makes final decision, decision logged with context for later outcome tracking).

Prediction maturity model (honest confidence levels tied to data age): Month 1–3 observation only (no predictions, risk detection only). Month 3–6 (4–6 week horizon, 55–65% confidence). Month 6–12 (2-month horizon, 65–75% confidence). Year 1–2 (6-month horizon, 75–82% confidence). Year 2–5 (12-month horizon, 82–88% confidence). Year 5+ (36–60 month horizon, 85–90% for 12 months, 60–70% for 5 years). Confidence label always shown with every prediction. "Insufficient data for reliable prediction" shown honestly when data age is below minimum threshold. Never claims certainty it does not have.

After-action reviews: triggered when performance deviates significantly from trend in either direction. AI lists observed data changes. AI asks about qualitative decisions operator made that data cannot see. Answers stored alongside quantitative data and used to build causal model. Progressive financial literacy curriculum triggered by real events (not generic lessons), calibrated to operator's current understanding level, always contextual to their actual situation.

Business health dashboard: configurable health scores (financial, growth, operational, team). AI Insights feed (top priority insights, not all possible — quality over quantity). Value dashboard (tangible value delivered this period: time saved, money collected via automation, money saved via alerts; value ratio: value delivered ÷ subscription cost, target 20× minimum).

Collective intelligence (opt-in per category, per user): opt-in per data category (granular, independently revocable, per-user not only org-level). Differential privacy applied. Minimum cohort of 30 before any pattern surfaces. Ratios and rates only, never amounts or identities. Anonymisation is cryptographic not policy-only. Outputs: benchmarking against anonymised peer organisations, failure pattern warnings, recovery playbooks, seasonality intelligence, counterintuitive discoveries.

AI hard limits (infrastructure level, cannot be bypassed by any prompt): classification layer runs before every AI response. Hard limits: tax advice requiring professional certification, legal advice, investment advice, medical advice, mental health therapy or counselling, audit or assurance opinions, guarantee of any business outcome. Mental health protocol: if serious distress expressed, crisis resources provided immediately before any other response, business conversation does not continue until operator redirects. Per-organisation monthly AI cost hard cap (not just alert — AI features pause when cap reached, Billing Authority alerted at 80% consumed, can raise or temporarily override).

---

## Level 17 — Admin, Onboarding, and Support

Organisation management: org profile, branch hierarchy management, user management (invite via WhatsApp or email, role assignment, status management, bulk import, login activity), role management (built-in and custom, capability namespace based, hierarchy, per-user override), API key management (scoped, expiry, rotation, audit log), webhook management, integration hub (all connections, health status, per-branch credentials), data management (export always available in JSON and CSV, all tiers, import wizards per module with field mapping and validation, GDPR data portability within 30 days, per-user data portability, data retention configuration, staged permanent deletion workflow, audit log viewer filterable and exportable).

Default admin: no default credentials on any deployment. First-run setup wizard requires creating admin account with new password before any access is granted.

AI Concierge (onboarding): activates on first login. Natural language business description → automated configuration. Animated setup with user approval before applying. Guided first meaningful action (demonstrates immediate platform value within 5 minutes). Role-based onboarding tours (different paths for admin, sales representative, teacher, student, finance staff). Progress checklist (set up organisation, invite teammate, create first record, process first transaction, etc.). Contextual tooltips on first visit to each screen (configurable dismiss, never shown again after dismiss). Sample data seeding option (demo records for exploration, easy purge with one click — purges all seeded data without affecting real data). Welcome communication sequence (guided messages over first 3 days). 7-day independence target: platform should require no support contact after 7 days of use; any contact in first 7 days is treated as a product improvement signal.

Data migration for new customers: per-module import wizards (CSV and Excel field mapping, validation preview, batch import with rollback on error), deduplication during import (merge rules, preview conflicts, human decision required for ambiguous matches), API import endpoint (authenticated, programmatic ingestion for large migrations), simple data transformation during import (concatenate fields, split fields, reformat dates).

Support channels: Free (community forum and AI help 24/7, no human support). Starter (WhatsApp primary, email secondary, 24-hour first response SLA, business hours). Business (WhatsApp, in-app chat, 4-hour first response SLA, business hours expanding to 24/7 as team grows). Enterprise (dedicated named support person, immediate acknowledgment, phone call within 1 hour, in-office visits, personalised onboarding session). All tiers: AI answers first (target 80%+ resolution without human escalation), human escalation for remainder. SLA tracked per ticket, breach triggers internal escalation alert, monthly SLA report to Billing Authority.

Support ticket SLA definition: Starter first response 24 hours, Business first response 4 hours, Enterprise first response 1 hour. SLA measured from ticket creation to first substantive human response. SLA applies during covered hours only (clearly stated to customers per tier). SLA breach: internal escalation alert sent, tracked and reported.

Documentation: written docs (searchable, structured by module, always current — updated same day as any feature change), video tutorials (screen-recorded walkthroughs, Urdu and English narration), community forum (registered users only, moderated, platform team answers every thread in early phase, accepted answers marked, upvote system), API documentation (auto-generated from OpenAPI spec, always current), developer documentation (module development guide, ADR index, onboarding for new team members). User documentation, API docs, and developer docs are separate deliverables.

Audit log retention cost warning: alert to Billing Authority when projected audit log storage cost exceeds configurable monthly threshold. Alert shows current size, growth rate, projected cost in 90 days, available options (export and archive older entries, adjust retention period for non-compliance-critical log types).

---

## Level 18 — Design System and Frontend

Design tokens defined before any frontend component is built. All visual values as CSS variables applied universally.

Colour palette: brand primary, brand secondary, accent (interactive elements), semantic tokens (success, warning, error, info), neutral scale (9 shades: 50–900), surface and background variants (light and dark modes), border (default, focused, error states), text (primary, secondary, disabled, inverse).

Typography: display font (distinctive, not generic), body font (readable, with system font fallback), mono font (for code, IDs, invoice numbers), complete scale (display XL 48/700 through caption 12/400, all size and weight combinations defined).

Spacing: 4-base scale (xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px, 2xl: 48px, 3xl: 64px, 4xl: 96px).

Border radius: none (0), sm (4px), md (8px), lg (12px), xl (16px), full (9999px).

Shadows: sm through xl, focus ring (offset and colour token).

Breakpoints: mobile (0–639px), tablet (640–1023px), desktop (1024px+).

Transition timing: fast (100ms ease), normal (200ms ease), slow (300ms ease).

i18n: RTL layout support for Urdu and Arabic from day one (layout mirroring, directional icon variants, text alignment). String externalisation (no hardcoded UI strings anywhere in codebase). Even if only English ships initially, the architecture supports adding languages without structural changes.

Component contracts library: each component contract must be written before that module's frontend begins. Contracts stored in packages/ui/contracts. Contract format specifies: dimensions and sizing behaviour, spacing (which tokens), typography (which token for each text element), colours (which token for each surface, text, border), all states (default, hover, active, focused, disabled, loading, error, empty, skeleton), all variants, responsive behaviour per breakpoint, accessibility requirements (keyboard navigation, ARIA attributes, colour contrast ratio — WCAG 2.1 AA minimum), animation (if any: timing token, property, trigger).

Required component categories: navigation (sidebar, topbar, breadcrumb, tabs, mobile bottom nav), layout (page wrapper, section, grid, card, panel, modal, drawer, sheet, tooltip, popover), forms (all input types — text, number, date, phone, email, currency, rich text, file upload, all selection types — dropdown, multi-select, checkbox, radio, toggle — validation feedback, loading states), buttons (primary, secondary, ghost, destructive, link, icon-only, all size variants, all states), data display (table with sort/filter/pagination, virtual list — all long lists must use virtual rendering, kanban card, avatar, badge, tag, stat card, chart containers), communication (chat bubble, timeline event, comment thread, notification item), charts (line, bar, donut, funnel — using consistent charting library), feedback (toast notifications, inline alerts, empty states, skeleton loaders, error boundary with friendly fallback and reload/report, loading states on all async actions, duplicate submission prevention — button disables on click until response received), entity cards (generic card template customisable per module entity type), specialised (pipeline column, kanban board, calendar cell, timetable grid, certificate preview, QR code display, storage usage bar, score visualisation, balance indicator).

Frontend-wide requirements: focus management after modal or drawer close (return focus to element that triggered the open — WCAG 2.1 AA required). Scroll restoration on back navigation. Auto-save drafts for all long forms (configurable interval, draft recovery shown on next visit with restore or discard option, draft cleared on successful submission). Truncated long text in tables with expand tooltip. Mobile-responsive wide tables (horizontal scroll within table container, sticky first column with primary identifier, card view option for mobile). Error boundaries on every route and major component (never a blank screen, always a friendly fallback with reload and report options).

---

## Dependency Ordering for Genesis

This ordering defines build sequence. Level N may depend on any level below N. Level N must not require anything from levels above N. Genesis uses this to verify each level is self-contained before the next begins.

**Level 0** — Already built. Core v0.0.1: Gatekeeper, Foundry, tenant model, capability system, module registry, event bus (stub), workflow engine (stub), platform shell. No external dependencies beyond database and basic server runtime.

**Level 1** — Cloud Infrastructure and Security. Cloud deployment (Kubernetes, CI/CD, observability, secrets management), all security infrastructure (WAF, DDoS, TLS, logging and monitoring, vulnerability scanning, brute force protection). Depends on: Level 0 (the thing being deployed and secured).

**Level 2** — Storage and Sync. SVFS (cloud-native mode), PostgreSQL full schema (unified person and financial models), object storage, image processing pipeline, delta sync engine (cloud mode), backup engine, soft delete and staged deletion infrastructure. Depends on: Level 1 (cloud infrastructure to deploy on).

**Level 3** — Authentication and Identity. MFA, session management (including termination on capability changes and global logout), user management API, organisation profile API, branch management API, password policy enforcement, brute force protection, API key management, terms of service acceptance, consent logging. Depends on: Level 1, Level 2.

**Level 4** — Platform Services. Event bus (full implementation replacing stub — at-least-once delivery, persistent queue, DLQ with admin UI), communication gateway (full enforcement layer replacing stub — global opt-out registry, circuit breakers, send logging), notification engine (all channels with failure handling and retry), search (all entity types), file service (full with virus scanning), AI proxy (full with classification and cost cap enforcement), audit log (full append-only tamper-evident), webhook management, API gateway (full with idempotency keys, rate limiting per tenant, CORS per tenant, API versioning). Depends on: Level 1, 2, 3.

**Level 5** — Configuration Engine. Visual Workflow Builder, Lifecycle Builder, Rules Engine, Form Builder, AI Configuration Wizard, Template Library, Custom Fields system (all provider interfaces that modules implement). Depends on: Level 1, 2, 3, 4.

**Level 6** — Products and Catalogue. Product catalogue (all types), pricing engine, inventory management, batch management, discount engine. Depends on: Level 1, 2, 3, 4, 5.

**Level 7** — CRM. Lead intake (all sources), lead record (immutable timeline, communication panel, internal comments), WhatsApp engine, email engine, pipeline and kanban, lead scoring, follow-up system, company and contact management, reporting. Depends on: Level 1, 2, 3, 4, 5, 6.

**Level 8** — Finance. Invoicing (all types including recurring), payment recording and gateway integrations, expense management and purchase orders, budget management, general ledger, banking and reconciliation, financial reports, payroll calculation, platform billing (full prepaid model with proration, delegation, FBR compliance). Depends on: Level 1, 2, 3, 4, 5, 6, 7.

**Level 9** — HR. Employee records and organisational structure, recruitment pipeline, attendance (all methods including geofenced QR and network-connected biometric), leave management with carry-forward expiry, performance management, commission schemes, policies and offboarding. Depends on: Level 1, 2, 3, 4, 5, 6, 7, 8.

**Level 10** — Workspace. Messaging (all channel types), tasks and projects, documents and knowledge base, calendar and meeting management, announcements and reminders. Depends on: Level 1, 2, 3, 4, 5, 6, 7, 8, 9 (all modules route notifications through Workspace, calendar integrates LMS and Events, HR leave appears on team calendar).

**Level 11** — LMS. Complete student lifecycle (all configurable stages, all education levels), timetable, attendance (all methods), assignments and submissions (with cheating detection log, resubmission limits), assessments (online and in-person), content library (including SCORM and xAPI), portals (student, teacher, coordinator, parent and guardian), certificate generation and verification, university-scale extensions. Depends on: Level 1–10.

**Level 12** — Events Management. Full event lifecycle (all event types), multi-track multi-session support, registration and ticketing, geofenced or time-windowed check-in, CRM lead capture from all attendees, post-event reporting. Depends on: Level 1–10.

**Level 13** — Campaigns. Email campaigns, WhatsApp campaigns, SMS campaigns, Meta Ads management, automation sequences, push notifications, global unsubscribe and suppression list enforcement, attribution and analytics. Depends on: Level 1–12 (needs all modules as audience sources and trigger/action targets).

**Level 14** — E-Commerce. Store management, product listing with inventory reservation on cart, cart and checkout, payment processing (reuses Finance), order management and fulfilment, shipping and carrier integrations, returns and refunds, optional marketplace. Depends on: Level 1–13.

**Level 15** — Website and App Builder. Visual editor, all standard and connected blocks (connected blocks require Level 6–14 for live data), multi-site management, blog, SEO infrastructure, spam protection, published vs draft enforcement, PWA app builder. Depends on: Level 1–14.

**Level 16** — AI Business Consultant. Individual intelligence, proactive monitoring, health dashboard, after-action reviews, collective intelligence with per-user opt-out, hard limits at infrastructure level, monthly cost cap enforcement. Depends on: Level 1–15 (needs data from all modules for meaningful intelligence).

**Level 17** — Admin, Onboarding, and Support. Organisation management tools, data migration wizards, AI Concierge onboarding system (role-based tours, sample data seeding), support ticketing, documentation platform, community forum, compliance tools (GDPR data portability, PECA procedures). Depends on: Level 1–16.

**Level 18** — Design System and Frontend (parallel track, special rules).
- 18a: Design tokens — defined before any frontend code is written. Depends on: brand identity decisions only, no backend dependency.
- 18b: Component library — after 18a. Depends on: design tokens, shadcn/ui base components.
- 18c–18r: Module frontends — one per level (6 through 17), in the same order as backend levels. Each module frontend begins when that module's backend reaches stability. Frontend for Level N can run in parallel with backend Level N+1. Component contracts must be written for a module before that module's frontend begins.

---

**Status:** `GENESIS_PLAN_INPUT_READY_V2`

**Note to Genesis:** Read all ADL files in `docs/architecture/decisions/` as constraints before generating tickets for any level. ADL records are read-only planning authority. Do not implement from ADL files. Generate tickets from this plan document, constrained by ADL decisions. When you encounter an ADL gap (a decision marked PROPOSED with no resolution), stop and surface it for human decision before proceeding with the affected level.

