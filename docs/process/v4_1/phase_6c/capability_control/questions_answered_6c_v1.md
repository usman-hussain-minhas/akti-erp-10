# Phase 6C Management Decision Register — Recommended Answers (for ratification)

**Scope:** Phase 6C (Operations: HR, Workspace, Events — components 6C.01–6C.09).
**Status:** recommended defaults for the architecture owner to ratify. Nothing here authorizes tickets or execution; all ticket/execution flags remain `false` until Gate 3.
**Authority basis:** `6c_operations.md` (phase doc), the locked A–H platform hard-rule doctrine + configurability keystone, the ADL registry, and the 6A/6B FFET method (per-seed FFETs → Gate-2 audit → Gate-3 approval → autonomous run).

---

## Cross-cutting principles applied to every answer
1. **Hard rules stay minimal; everything else is configurable as data.** Lifecycle anchors are hard; labels, stages, forms, methods, frameworks are tenant-configurable.
2. **Provider-neutral first; no real provider credentials/secrets in 6C runtime.** Device/calendar/conferencing integrations are provider-neutral adapter boundaries until separately approved.
3. **Consume 6A/6B via refs + events only — never direct internal writes.** HR/Workspace/Events read 6B Finance/CRM/Product evidence by reference; cross-module mutation is event/Saga-mediated.
4. **All outbound communication routes through the Communication Gateway with global opt-out (ADL-004).** Mandatory operational notices are opt-out-exempt but still gateway-routed and logged.
5. **6A Person is the shared identity anchor.** HR/Workspace/Events link to Person; none own Person identity. HR owns the employee *extension*, not identity.
6. **Evidence even when zero-priced; pricing attaches at each leaf micro-service** and rolls up through 6A/6B billing evidence.
7. **Same FFET discipline as 6A/6B:** one FFET per seed/sub-surface, `adl_hard_rule ⟹ non-empty adl_refs` (no business-logic fallback for a missing ADL), `phase_doc_required` only as raw provenance, flags false until Gate 3, one FFET per PR, self-heal ≤3 inside active files, stop if work needs a file outside the exact plan.
8. **No dependency on Phase 6D/6E/6F.** 6C is downstream of 6A/6B only.

### ⚠️ Scope-creep guard (from the 6B lesson)
During 6B planning a runtime FFET drifted into changing the realtime/schema layer, which had to be reverted and re-captured in the planning docs. **For 6C this is a hard rule:** schema changes happen **only** in the dedicated schema-control PR, never inside a runtime FFET. If a runtime FFET discovers a needed schema change, it **STOPS**, leaves the schema untouched, and the change is captured as a schema-control decision/defect doc — exactly the fix pattern used in 6B. This is why `6C-GLOBAL-009 = SCHEMA_FIRST`, `6C-WORK-MSG-002 = PROVIDER_NEUTRAL_RUNTIME_ONLY`, and `6C-WORK-TASK-008 = VERSIONED_SAVE_ONLY` below.

---

## A. Phase-level execution doctrine
```
6C-GLOBAL-001 = REAL_RUNTIME                      # real runtime after Gate 3 (6C is operations 6B depends-forward-from; not scaffold-only)
6C-GLOBAL-002 = MAXIMUM_WITHIN_SCOPE
6C-GLOBAL-003 = SAME_AS_6B_SEQUENCE               # decision register → schema/control → scaffold/control → FFET pack → Gate-2 → Gate-3 → autonomous
6C-GLOBAL-004 = ONE_FFET_PER_SEED_UNLESS_MERGE_RATIONALE
6C-GLOBAL-005 = FLAGS_FALSE_UNTIL_GATE_3
6C-GLOBAL-006 = YES_PHASE_6C_PLANNING_ROOT        # docs/process/v4_1/phase_6c/
6C-GLOBAL-007 = YES_PHASE_6C_IMPL_ROOTS           # packages/contracts/phase_6c/**, apps/api/src/phase_6c/**
6C-GLOBAL-008 = FORBID_UI_UNTIL_SCREEN_CONTRACTS
6C-GLOBAL-009 = SCHEMA_FIRST                      # Prisma models in schema-control BEFORE runtime FFETs; runtime never edits schema (scope-creep guard)
6C-GLOBAL-010 = PHASE_6_WITH_SUBPHASE_METADATA    # same as 6A/6B
6C-GLOBAL-011 = DIRECT_TSX_COMMANDS_NO_SCRIPT_EDITS  # like 6B v21; do not modify package scripts
6C-GLOBAL-012 = PROVIDER_NEUTRAL_ONLY_UNLESS_APPROVED
6C-GLOBAL-013 = YES_GATEWAY_WITH_OPT_OUT
6C-GLOBAL-014 = YES_FOUNDRY_TOGGLEABLE            # HR, Workspace, Events all tenant-toggleable
6C-GLOBAL-015 = YES_EVIDENCE_EVEN_ZERO_PRICED
6C-GLOBAL-016 = YES_PRICING_AT_LEAF_ROLLUP
6C-GLOBAL-017 = YES_FORBID_6D_6E_6F_DEPENDENCY
6C-GLOBAL-018 = YES_REFS_EVENTS_ONLY_NO_DIRECT_WRITES
6C-GLOBAL-019 = YES_GATEKEEPER_AND_HUMAN_FOR_IRREVERSIBLE
6C-GLOBAL-020 = YES_REQUIRED_ADL_REF_GATE
```

## B. Schema / control decisions
```
6C-SCHEMA-001 = YES_MODEL_CONTRACT_BEFORE_PRISMA
6C-SCHEMA-002 = YES_ADD_HR_WORKSPACE_EVENTS_MODELS
6C-SCHEMA-003 = YES_ORGANIZATION_ID_REQUIRED      # all tenant-scoped tables
6C-SCHEMA-004 = YES_REAL_FK_NOT_JSON              # business relations are FK; JSON never carries a business fact
6C-SCHEMA-005 = METADATA_JSON_ONLY_NOT_BUSINESS
6C-SCHEMA-006 = LINK_EMPLOYEE_TO_PERSON           # employee extends core Person; no own identity
6C-SCHEMA-007 = LINK_APPLICANT_TO_PERSON_WHEN_KNOWN
6C-SCHEMA-008 = ATTENDEE_PERSON_REF_ALLOW_CONTACT_ONLY  # link to Person when known; contact-only before identity resolution
6C-SCHEMA-009 = WORKSPACE_USER_IS_EMPLOYEE_PERSON_REF
6C-SCHEMA-010 = YES_SOFT_DELETE_STAGED_FOR_SENSITIVE
6C-SCHEMA-011 = REFERENCE_6B_INVOICE_PAYMENT_NO_DUP
6C-SCHEMA-012 = REFERENCE_CRM_PAYMENT_EVIDENCE_NO_COPY
6C-SCHEMA-013 = PROVIDER_NEUTRAL_ATTENDANCE_DEVICE_MODELS
6C-SCHEMA-014 = PROVIDER_NEUTRAL_ADAPTER_REFS_FIRST
6C-SCHEMA-015 = NON_DESTRUCTIVE_MIGRATIONS_ONLY
6C-SCHEMA-016 = YES_UPDATE_REGISTRY_METADATA_SAME_PR
6C-SCHEMA-017 = YES_AUDIT_EVIDENCE_FIELDS_SUFFICIENT_FOR_FFET
6C-SCHEMA-018 = PER_COMPONENT_MANIFEST_PLUS_SUBSURFACE_CONTRACTS
6C-SCHEMA-019 = FK_WHEN_AUTHORITY_EXISTS_ELSE_TYPED_STRING_REF
6C-SCHEMA-020 = SCHEMA_AND_SCAFFOLD_SEPARATE_PRS  # as in 6B
```

## C. HR employee records and organisation structure (6C.01)
```
6C-HR-EMP-001 = STABLE_INTERNAL_UUID_PLUS_CONFIGURABLE_DISPLAY_NUMBER
6C-HR-EMP-002 = CONFIGURABLE_DEFAULT_ORGANIZATION_UNIQUE
6C-HR-EMP-003 = CONFIGURABLE_DEFAULT_ONE_ACTIVE     # rehire/extra contracts allowed with history; one active default
6C-HR-EMP-004 = YES_MULTI_POSITION_CONFIGURABLE
6C-HR-EMP-005 = YES_FULLY_CONFIGURABLE              # doc L64: org structures configurable
6C-HR-EMP-006 = MATRIX_ALLOWED_CONFIGURABLE
6C-HR-EMP-007 = YES_CONTRACT_TYPES_CONFIGURABLE
6C-HR-EMP-008 = HARD_MINIMAL_REST_CONFIGURABLE      # hard lifecycle anchors (active/inactive/terminated); other statuses configurable labels
6C-HR-EMP-009 = YES_6A_FILE_SERVICE_ONLY
6C-HR-EMP-010 = SENSITIVE_SET_REDACTED              # compensation, national ID, bank, health, emergency contact, performance, disciplinary
6C-HR-EMP-011 = EMIT_PAYROLL_EVIDENCE_NOT_OWN_PAYROLL  # doc L66: compensation feeds 6B payroll via events
6C-HR-EMP-012 = YES_EMERGENCY_CONTACTS_IN_SCOPE_SENSITIVE
6C-HR-EMP-013 = ASSET_REF_HERE_RECOVERY_IN_OFFBOARDING
6C-HR-EMP-014 = APPROVAL_CONFIGURABLE_REQUIRED_FOR_SENSITIVE
6C-HR-EMP-015 = YES_EMIT_EMPLOYEE_CREATED_EVENT     # for Workspace + payroll foundation
```

## D. Recruitment and onboarding (6C.02)
```
6C-RECRUIT-001 = BOTH_CRM_LEAD_AND_DIRECT_FORM      # doc L74
6C-RECRUIT-002 = RETAIN_AND_LINK_NOT_DESTRUCTIVE_CONVERT  # CRM lead retained; applicant references it
6C-RECRUIT-003 = YES_FULLY_CONFIGURABLE_STAGES
6C-RECRUIT-004 = YES_CONFIGURATION_ENGINE_FORMS
6C-RECRUIT-005 = CALENDAR_WHEN_ACTIVE_ELSE_EVENTS_ONLY  # Workspace is not a hard dep of recruitment (doc L77)
6C-RECRUIT-006 = CONFIGURABLE_RULES_GATEKEEPER_FOR_ACCESS  # offer approval configurable; access provisioning via Gatekeeper
6C-RECRUIT-007 = RECOMMEND_CREATION_NOT_AUTO          # acceptance recommends employee creation; creation is an explicit step
6C-RECRUIT-008 = YES_CONFIGURABLE_TEMPLATES
6C-RECRUIT-009 = EVENTS_AFTER_WORKSPACE_EXISTS        # provision via events, not a build-time dependency
6C-RECRUIT-010 = YES_ALWAYS_GATEKEEPER                # doc L76
6C-RECRUIT-011 = PROVIDER_NEUTRAL_BOUNDARY_ONLY       # background checks: no real provider/credentials in 6C
6C-RECRUIT-012 = YES_OFFER_DOCS_VIA_6A_FILE_SERVICE
6C-RECRUIT-013 = YES_STAGED_DELETION
6C-RECRUIT-014 = YES_REUSE_6B_CRM_DEDUP_PATTERNS
6C-RECRUIT-015 = YES_EVIDENCE_FOR_PERFORMANCE_OPTIMIZATION_LATER  # via events only; no 6D+ dependency
```

## E. Attendance, leave, and time tracking (6C.03)
```
6C-ATT-001 = ALL_FIVE_METHOD_FAMILIES                 # QR, biometric, RFID/NFC, mobile GPS, manual override (doc L83) — as registered capabilities
6C-ATT-002 = YES_PROVIDER_NEUTRAL_ONLY
6C-ATT-003 = NO_REAL_BIOMETRIC_BRANDS_IN_6C           # brand adapters separately approved
6C-ATT-004 = YES_SELF_AND_SUPERVISOR_SCAN
6C-ATT-005 = LIVENESS_PHOTO_CONFIGURABLE
6C-ATT-006 = YES_OFFLINE_QUEUE_IN_SCOPE
6C-ATT-007 = SERVER_AUTHORITATIVE_RECORD_SKEW_TOLERANCE_CONFIGURABLE
6C-ATT-008 = DUPLICATE_DETECTED_RECORDED_AS_EXCEPTION
6C-ATT-009 = MISSING_CHECKOUT_FLAGGED_CONFIGURABLE_AUTO_CLOSE
6C-ATT-010 = YES_OVERRIDE_REQUIRES_REASON             # doc L86
6C-ATT-011 = OVERRIDE_APPROVAL_CONFIGURABLE_DEFAULT_ON
6C-ATT-012 = YES_SHIFTS_ROSTERS_IN_SCOPE
6C-ATT-013 = CONFIGURABLE_ORG_OR_BRANCH
6C-ATT-014 = YES_LEAVE_TYPES_CONFIGURABLE
6C-ATT-015 = YES_ACCRUAL_CARRYFORWARD_EXPIRY_ENCASH_CONFIGURABLE
6C-ATT-016 = YES_LEAVE_APPROVAL_CHAINS_CONFIGURABLE
6C-ATT-017 = YES_EMIT_PAYROLL_INPUT_EVIDENCE          # doc L85
6C-ATT-018 = NO_USE_ADL_024_FOR_TIME_WINDOWS          # ADL-024 (time-window), not ADL-024-mislabel; see L
6C-ATT-019 = YES_DEGRADE_TO_FALLBACK_METHODS          # doc L87
6C-ATT-020 = YES_LOCATION_SENSITIVE_REDACTED
```

## F. Performance, commission, policy, offboarding (6C.04)
```
6C-HR-OPS-001 = YES_FULLY_CONFIGURABLE                # doc L93
6C-HR-OPS-002 = YES_WEIGHTED_GOALS
6C-HR-OPS-003 = CONFIGURABLE_LABELS_MINIMAL_HARD_ANCHORS
6C-HR-OPS-004 = YES_RULES_ENGINE_FOR_AT_RISK
6C-HR-OPS-005 = YES_CONSUME_6B_CRM_PAYMENT_EVIDENCE   # read/ref only (doc L94)
6C-HR-OPS-006 = YES_SEPARATE_FFET_SURFACES            # calc / deferred release / clawback reversal / tier accelerator / pool distribution
6C-HR-OPS-007 = YES_EMIT_COMMISSION_BATCH_TO_6B_PAYROLL  # via events
6C-HR-OPS-008 = YES_CLAWBACK_REQUIRES_GATEKEEPER
6C-HR-OPS-009 = YES_VERSIONED_POLICY_DOCUMENTS
6C-HR-OPS-010 = YES_IMMUTABLE_ACKNOWLEDGEMENT_EVIDENCE
6C-HR-OPS-011 = YES_OFFBOARDING_IS_SAGA               # doc L96 → ADL-001
6C-HR-OPS-012 = MANDATORY_SETTLEMENT_ASSET_WORKSPACE_ACCESS_PAYROLL  # all five mandatory Saga steps
6C-HR-OPS-013 = YES_ACCESS_REVOCATION_VIA_GATEKEEPER  # doc L97
6C-HR-OPS-014 = YES_REVERSIBLE_DEACTIVATION_BEFORE_IRREVERSIBLE
6C-HR-OPS-015 = HUMAN_APPROVAL_FOR_FINAL_SETTLEMENT_AND_IRREVERSIBLE_REVOCATION
```

## G. Workspace messaging and collaboration (6C.05)
```
6C-WORK-MSG-001 = YES_ALL_IN_SCOPE                    # channels, DMs, threads, mentions, reactions, attachments, read receipts
6C-WORK-MSG-002 = PROVIDER_NEUTRAL_RUNTIME_ONLY       # NO real-time transport infra in 6C runtime (scope-creep guard)
6C-WORK-MSG-003 = DEFERRED_SCAFFOLD_BOUNDARY_ONLY     # optional E2E encryption deferred
6C-WORK-MSG-004 = YES_IMMUTABLE_EDIT_HISTORY
6C-WORK-MSG-005 = RETAINED_WITH_TOMBSTONE_THEN_STAGED  # soft-delete + tombstone; staged permanent deletion rules apply
6C-WORK-MSG-006 = YES_6A_FILE_SERVICE_ONLY
6C-WORK-MSG-007 = YES_GATEWAY_FOR_OUTBOUND_NOTIFICATIONS  # doc L105
6C-WORK-MSG-008 = YES_MENTIONS_GENERATE_NOTIFICATION_EVIDENCE
6C-WORK-MSG-009 = YES_USE_IDENTITY_NOT_OWN_RECORDS    # doc L104
6C-WORK-MSG-010 = BOTH_ACCESS_CORE_ROLES_AND_EMPLOYEE_TEAMS
6C-WORK-MSG-011 = PRIVATE_CHANNEL_APPROVAL_CONFIGURABLE
6C-WORK-MSG-012 = YES_CROSS_MODULE_VIA_REGISTERED_REFS
6C-WORK-MSG-013 = YES_6A_SEARCH_FILE_LAYER
6C-WORK-MSG-014 = YES_MODERATION_REPORTING_IN_SCOPE
6C-WORK-MSG-015 = AI_READABLE_LATER_VIA_EVENTS_ONLY   # prohibited fields: message body of private/DM channels, redacted-sensitive content; no 6F dependency now
```

## H. Tasks, projects, documents, knowledge (6C.06)
```
6C-WORK-TASK-001 = YES_CROSS_MODULE_REGISTERED_REFS   # doc L113
6C-WORK-TASK-002 = YES_FULL_TASK_FIELDS
6C-WORK-TASK-003 = CONFIGURABLE_WITH_MINIMAL_HARD_ANCHORS
6C-WORK-TASK-004 = DEPENDENCY_ENGINE_YES_GANTT_VIEW_DEFERRED  # dependency logic in scope; visual Gantt is a screen/UI concern
6C-WORK-TASK-005 = YES_READ_ONLY_6B_FINANCE_EVIDENCE
6C-WORK-TASK-006 = NO_WRITE_TO_FINANCE                # budgets read-only; no direct Finance writes
6C-WORK-TASK-007 = YES_VERSION_HISTORY_AND_RESTORE
6C-WORK-TASK-008 = VERSIONED_SAVE_ONLY                # real-time collaborative editing DEFERRED (scope-creep guard)
6C-WORK-TASK-009 = YES_6A_FILE_SERVICE_ONLY
6C-WORK-TASK-010 = YES_TIME_LOG_EVIDENCE_FOR_BILLING_DIMENSIONS
6C-WORK-TASK-011 = YES_REMINDERS_VIA_GATEWAY
6C-WORK-TASK-012 = YES_CONFIGURABLE_PROJECT_TEMPLATES
6C-WORK-TASK-013 = YES_TENANT_AUTHORED_NEVER_HARDCODED
6C-WORK-TASK-014 = YES_CUSTOMER_FIRST_RESTORE_RULES
6C-WORK-TASK-015 = YES_TASK_PROJECT_EVENTS_CONSUMABLE_BY_CALENDAR
```

## I. Calendar, meetings, rooms, announcements (6C.07)
```
6C-CAL-001 = YES_PROVIDER_NEUTRAL_RUNTIME_FIRST
6C-CAL-002 = ADAPTER_BOUNDARY_ONLY                    # Google/Outlook sync = boundary, no real adapter/credentials in 6C
6C-CAL-003 = ADAPTER_BOUNDARY_ONLY                    # Meet/Zoom link gen = boundary only
6C-CAL-004 = YES_ENFORCE_CONFLICT_DETECTION
6C-CAL-005 = YES_CAPACITY_AND_EQUIPMENT_METADATA
6C-CAL-006 = YES_ANNOUNCEMENTS_VIA_GATEWAY            # doc L125
6C-CAL-007 = YES_DISTINGUISH_MANDATORY_FROM_OPT_OUT   # mandatory notices opt-out-exempt but gateway-routed
6C-CAL-008 = YES_REMINDERS_RESPECT_QUIET_HOURS        # quiet hours configurable (doc L127)
6C-CAL-009 = YES_RECURRING_EVENTS
6C-CAL-010 = YES_ORIGINATE_FROM_HR_TASKS_EVENTS_LMS_VIA_EVENTS_ONLY
6C-CAL-011 = YES_MEETING_ATTENDANCE_FEEDS_WORKSPACE_EVIDENCE
6C-CAL-012 = YES_DEGRADE_GRACEFULLY_ON_SYNC_FAILURE
6C-CAL-013 = CONFIGURABLE_HARD_BLOCK_OR_WARN          # default hard-block on resource conflict, warn on soft overlap
6C-CAL-014 = YES_ANNOUNCEMENT_ACK_EVIDENCE
6C-CAL-015 = YES_EXCLUDE_PROVIDER_CREDENTIALS_FROM_6C  # future adapter credential scope
```

## J. Events configuration and registration (6C.08)
```
6C-EVENT-REG-001 = YES_FULL_EVENT_CONFIG_SET
6C-EVENT-REG-002 = YES_REFERENCE_6B_PRODUCT_CATALOGUE  # doc L133
6C-EVENT-REG-003 = YES_INVOICE_VIA_EVENTS_SAGA_ONLY   # doc L136 → ADL-001
6C-EVENT-REG-004 = YES_CONFIGURATION_ENGINE_FORMS
6C-EVENT-REG-005 = YES_WAITLIST_RULES_CONFIGURABLE
6C-EVENT-REG-006 = YES_ADL_023_WAITLIST_TIMER
6C-EVENT-REG-007 = YES_TICKET_CLAIM_DEADLINES_CONFIGURABLE
6C-EVENT-REG-008 = YES_APPROVAL_REQUIRED_REGISTRATIONS
6C-EVENT-REG-009 = CALENDAR_WHEN_ACTIVE               # Workspace Calendar dependency where present (doc 6C.08 dep on 6C.07)
6C-EVENT-REG-010 = REFERENCE_FINANCE_EXPENSE_VIA_EVENTS  # honorarium references Finance/expense, not duplicated
6C-EVENT-REG-011 = YES_LINK_ATTENDEE_TO_CRM_LEAD_WHERE_APPLICABLE
6C-EVENT-REG-012 = EMIT_EVENT_LEAD_HANDOFF_NOT_DIRECT  # Events never write CRM directly (doc L23)
6C-EVENT-REG-013 = YES_MULTI_TRACK_SESSION_REGISTRATION
6C-EVENT-REG-014 = DELEGATE_REFUND_TO_FINANCE_PAYMENT  # cancellation state in 6C; refund executed by 6B
6C-EVENT-REG-015 = YES_FREE_PAID_APPROVAL_ONLY_TICKET_TYPES
6C-EVENT-REG-016 = ALL_LEVELS_CONFIGURABLE            # event / session / ticket-type capacity, configurable per event
6C-EVENT-REG-017 = YES_FORBID_LMS_CERTIFICATION_OUTPUTS  # LMS is 6D
6C-EVENT-REG-018 = YES_EVIDENCE_FOR_EVERY_REGISTRATION_ATTEMPT  # incl. rejected/waitlisted
```

## K. Events check-in and post-event (6C.09)
```
6C-EVENT-CHECK-001 = YES_REQUIRE_PAYMENT_REGISTRATION_STATE  # doc L143
6C-EVENT-CHECK-002 = CRYPTOGRAPHIC_SIGNED_TOKENS
6C-EVENT-CHECK-003 = YES_ADL_024_CHECKIN_WINDOWS
6C-EVENT-CHECK-004 = YES_KIOSK_MODE_IN_SCOPE
6C-EVENT-CHECK-005 = YES_SESSION_LEVEL_CHECKIN
6C-EVENT-CHECK-006 = YES_OVERRIDE_REQUIRES_REASON_AND_APPROVAL
6C-EVENT-CHECK-007 = DUPLICATE_BLOCKED_RECORDED_AS_EXCEPTION
6C-EVENT-CHECK-008 = YES_OFFLINE_CHECKIN_QUEUE
6C-EVENT-CHECK-009 = YES_BADGE_EXPORT_IN_SCOPE
6C-EVENT-CHECK-010 = YES_CONFIGURATION_ENGINE_FORMS
6C-EVENT-CHECK-011 = CONFIGURABLE_ANON_OR_IDENTIFIED
6C-EVENT-CHECK-012 = YES_6A_FILE_SERVICE
6C-EVENT-CHECK-013 = EMIT_EVENT_LEAD_HANDOFF_EVIDENCE  # update via CRM-owned handler, not direct write
6C-EVENT-CHECK-014 = DEFER_TO_6D_LMS_CERTIFICATES      # attendance certificate ≠ LMS certification
6C-EVENT-CHECK-015 = AI_READABLE_LATER_VIA_EVENTS_ONLY # prohibited: attendee contact PII, payment internals
```

## L. ADL and hard-rule decisions
```
6C-ADL-001 = SAGA_ON_OFFBOARDING_AND_EVENT_REG_INVOICE_PAYMENT_TICKET  # cross-module workflows with compensation
6C-ADL-002 = YES_OFFBOARDING_CARRIES_ADL_001
6C-ADL-003 = YES_EVENT_REG_TO_TICKET_CARRIES_ADL_001
6C-ADL-004 = YES_FAILED_COMPENSATION_TO_DLQ_ADL_002
6C-ADL-005 = YES_EVERY_TIMED_DEADLINE_NEEDS_EXPLICIT_ADL_REFS
6C-ADL-006 = CONFIRMED_ADL_023_WAITLIST_AUTO_PROMOTION_TIMER
6C-ADL-007 = CONFIRMED_ADL_024_ATTENDANCE_AND_CHECKIN_WINDOWS
6C-ADL-008 = YES_ADL_004_ALL_OUTBOUND  # announcements, reminders, recruitment, event, workspace notifications
6C-ADL-009 = YES_MANDATORY_NOTICES_GATEWAY_ROUTED_OPT_OUT_EXEMPT
6C-ADL-010 = YES_MISSING_ADL_REF_BLOCKS_PROMOTION  # no business-logic fallback (matches 6A/6B)
```

## M. Access, privacy, and support
```
6C-SEC-001 = HIGH_RISK = offboarding, access revocation, commission clawback, private-channel access grant, irreversible deletion → Gatekeeper
6C-SEC-002 = SUPPORT_WINDOW_ONLY = compensation, national ID, bank, health, disciplinary, performance
6C-SEC-003 = SUPPORT_WINDOW_ONLY = private channel / DM content
6C-SEC-004 = SUPPORT_WINDOW_ONLY = attendee contact PII + payment state
6C-SEC-005 = YES_MANAGERS_SEE_REPORTING_SCOPE_ONLY
6C-SEC-006 = NO_WORKSPACE_ADMINS_NOT_SEE_PRIVATE_CONTENT_BY_DEFAULT  # only via audited support window
6C-SEC-007 = ORGANIZERS_SEE_CONTACT_AND_PAYMENT_STATE_NOT_RAW_PAYMENT_INTERNALS
6C-SEC-008 = STAGED_REVERSIBLE_THEN_IRREVERSIBLE  # deactivate (reversible) → revoke (irreversible, human-approved)
6C-SEC-009 = YES_OVERRIDE_AUDIT_REASON_AND_ACTOR_EVIDENCE
6C-SEC-010 = YES_TIME_BOUND_AUDITED_SUPPORT_WINDOWS
```

## N. Billing, pricing, and evidence
```
6C-BILL-001 = YES_PRICING_REF_EVEN_ZERO_PRICED
6C-BILL-002 = CONFIGURABLE_PACKAGE_INCLUDED_OR_ZERO_PRICED  # tenant/package decides; must still carry a ref
6C-BILL-003 = YES_USAGE_EVIDENCE_BEARING
6C-BILL-004 = YES_USAGE_EVIDENCE_BEARING
6C-BILL-005 = YES_SEPARATE_PRICING_REFS_BY_METHOD_FAMILY
6C-BILL-006 = YES_ADAPTER_BOUNDARIES_CARRY_PRICING_REFS
6C-BILL-007 = YES_6B_PRODUCT_PRICE_HISTORY_AUTHORITY
6C-BILL-008 = YES_INVOICES_BY_6B_FINANCE_ONLY
6C-BILL-009 = YES_TIME_LOGS_FEED_FUTURE_BILLING_DIMENSIONS
6C-BILL-010 = YES_NAMED_EVIDENCE_ARTIFACTS_IN_TESTS
```

## O. API, endpoint, and runtime shape
```
6C-API-001 = SERVICE_AND_TEST_FIRST_CONTROLLERS_DEFERRED  # like many 6B FFETs; controllers when screen contracts exist
6C-API-002 = EVENT_COMMAND_STYLE_REST_DEFERRED_UNTIL_SCREEN_CONTRACTS
6C-API-003 = YES_ONE_DIRECT_SERVICE_TEST_PER_FFET
6C-API-004 = YES_LOCAL_API_TYPES  # 6B rootDir constraint; do not import contracts into API runtime
6C-API-005 = BOTH_TS_TYPES_AND_ZOD
6C-API-006 = YES_EVENT_PAYLOAD_CONTRACT_PER_EMITTED_EVENT
6C-API-007 = NEST_INJECTABLE_WITH_DETERMINISTIC_CORE  # deterministic functions wrapped in injectable services
6C-API-008 = YES_CROSS_MODULE_WRITES_FORBIDDEN_EVENT_REFS_ONLY
6C-API-009 = YES_TESTS_REJECT_ADJACENT_FORBIDDEN_BEHAVIOR
6C-API-010 = YES_DIRECT_PER_SEED_TSX_PLUS_BROAD_API_TEST
```

## P. Autonomous workflow decisions
```
6C-AUTO-001 = YES_PLANNING_LINEAGE  # v1/v2/v3 like 6A/6B
6C-AUTO-002 = YES_INDEPENDENT_GATE_2_AUDIT
6C-AUTO-003 = YES_ROOT_ARTIFACT_SNAPSHOT_PACKAGE  # like 6A v7 (path + sha256 + commit context)
6C-AUTO-004 = YES_POST_6A_6B_PREFLIGHT
6C-AUTO-005 = YES_READINESS_REPORTS_BEFORE_AUTONOMOUS
6C-AUTO-006 = YES_SAME_CI_SETTLING_POLICY  # 2-minute, 5-check, one-extension
6C-AUTO-007 = YES_ONE_FFET_PER_PR_MANDATORY
6C-AUTO-008 = YES_FORBID_LOW_RISK_BATCHING  # HR/Workspace/Events complexity
6C-AUTO-009 = YES_SELF_HEAL_MAX_3_ACTIVE_FILES_ONLY
6C-AUTO-010 = YES_STOP_IF_FILE_OUTSIDE_PLAN  # incl. any schema change — capture as schema-control doc (scope-creep guard)
6C-AUTO-011 = YES_FINAL_AUDIT_ALL_EXIST_ZERO_MISSING_ZERO_FLIP_MAIN_EQ_ORIGIN
6C-AUTO-012 = YES_6B_IMMUTABLE_EXCEPT_EXPLICIT_SOURCE_TRUTH_DEFECT
```

## Q. Explicit non-scope confirmation
```
6C-NON-001 = CONFIRMED  # LMS out of scope (6D)
6C-NON-002 = CONFIRMED  # Campaigns out of scope (6E)
6C-NON-003 = CONFIRMED  # E-Commerce out of scope
6C-NON-004 = CONFIRMED  # Website/App Builder out of scope
6C-NON-005 = CONFIRMED  # AI Business Consultant out of scope (6F)
6C-NON-006 = CONFIRMED  # advanced admin/support/design polish out of scope (6F)
6C-NON-007 = CONFIRMED  # HR must not own global Person identity
6C-NON-008 = CONFIRMED  # Events must not bypass CRM/Finance/Communication Gateway
6C-NON-009 = CONFIRMED  # Workspace must not own HR employee records
6C-NON-010 = CONFIRMED  # real provider credentials/secrets out of scope unless separately approved
```

---

## Items worth your explicit eye before ratifying
These are the few that are genuine judgment calls rather than direct reads of doctrine/source:
- **6C-HR-EMP-003 / 004** (multiple employment records / simultaneous positions): defaulted to configurable-with-conservative-default; confirm your tenant model.
- **6C-WORK-MSG-005** (deleted message handling) and **6C-WORK-TASK-008 / MSG-002** (real-time deferral): these are the scope-creep-guard calls — I defaulted to the safe, non-realtime, non-destructive options. If you actually want real-time runtime in 6C, that's a deliberate scope expansion and should be its own decision, not a runtime-FFET surprise.
- **6C-CAL-013** (calendar conflict hard-block vs warn): defaulted to hard-block on resource conflict, warn on soft overlap — confirm.
- **6C-EVENT-CHECK-014** (attendance certificate vs LMS certificate): kept attendance certificates in 6C but certification deferred to 6D — confirm the boundary.

Everything else follows directly from the locked doctrine, the 6A/6B precedent, or `6c_operations.md`. I can emit this as `questions_answered_6c.json` (same tokens, machine-readable) if the FFET generator needs the structured form.
