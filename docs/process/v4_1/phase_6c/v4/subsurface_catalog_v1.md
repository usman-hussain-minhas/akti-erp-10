# Phase 6C Subsurface Catalog v1

Status: `PHASE_6C_V1_PLANNING_SCHEMA_AND_SCAFFOLD_CONTROL_REQUIRED`

Seed count: 124

| Order | Seed | Component | Objective |
| --- | --- | --- | --- |
| 1 | seed_6c_001_employee_person_extension | 6C.01 | Employee role extension linked to core Person |
| 2 | seed_6c_002_employee_number_policy | 6C.01 | Stable UUID plus configurable employee display number policy |
| 3 | seed_6c_003_org_department_team_position | 6C.01 | Configurable departments, teams, positions, grades, and assignments |
| 4 | seed_6c_004_reporting_line_matrix | 6C.01 | Single or matrix reporting line model |
| 5 | seed_6c_005_employment_contract_record | 6C.01 | Configurable employment contract records |
| 6 | seed_6c_006_employee_document_boundary | 6C.01 | Employee documents through 6A file service |
| 7 | seed_6c_007_compensation_metadata_payroll_evidence | 6C.01 | Compensation metadata emits payroll evidence without owning payroll |
| 8 | seed_6c_008_employee_lifecycle_status_history | 6C.01 | Minimal hard lifecycle anchors and configurable status labels |
| 9 | seed_6c_009_employee_sensitive_field_redaction | 6C.01 | Sensitive HR field redaction and support-window policy |
| 10 | seed_6c_010_employee_created_event | 6C.01 | Employee creation evidence/event for Workspace and payroll foundation |
| 11 | seed_6c_011_applicant_source_linkage | 6C.02 | Applicant source linkage from CRM lead or direct HR form |
| 12 | seed_6c_012_recruitment_stage_config | 6C.02 | Configurable recruitment lifecycle stages |
| 13 | seed_6c_013_scorecard_interview_form | 6C.02 | Scorecards and interview forms through Configuration Engine |
| 14 | seed_6c_014_interview_calendar_event_request | 6C.02 | Interview calendar request via events when Workspace active |
| 15 | seed_6c_015_offer_approval_workflow | 6C.02 | Configurable offer approval workflow |
| 16 | seed_6c_016_offer_acceptance_employee_creation_request | 6C.02 | Offer acceptance recommends employee creation as explicit step |
| 17 | seed_6c_017_onboarding_task_template | 6C.02 | Configurable onboarding task templates |
| 18 | seed_6c_018_access_provisioning_gatekeeper_event | 6C.02 | Access provisioning event routed through Gatekeeper |
| 19 | seed_6c_019_background_check_provider_boundary | 6C.02 | Provider-neutral background-check boundary only |
| 20 | seed_6c_020_offer_document_generation | 6C.02 | Offer documents through 6A file service |
| 21 | seed_6c_021_applicant_staged_deletion | 6C.02 | Applicant staged deletion and protection rules |
| 22 | seed_6c_022_applicant_dedup_linkage | 6C.02 | Applicant duplicate detection using CRM dedup patterns |
| 23 | seed_6c_023_recruitment_evidence_feed | 6C.02 | Recruitment evidence for later performance/optimization |
| 24 | seed_6c_024_qr_attendance | 6C.03 | Geofenced time-windowed QR attendance |
| 25 | seed_6c_025_biometric_device_boundary | 6C.03 | Provider-neutral biometric device boundary |
| 26 | seed_6c_026_rfid_nfc_attendance | 6C.03 | RFID/NFC attendance method family |
| 27 | seed_6c_027_mobile_gps_attendance | 6C.03 | Mobile GPS attendance with configurable liveness photo |
| 28 | seed_6c_028_manual_attendance_override | 6C.03 | Manual attendance override with reason and approval defaults |
| 29 | seed_6c_029_offline_attendance_queue | 6C.03 | Offline attendance queue and replay evidence |
| 30 | seed_6c_030_attendance_exception_detection | 6C.03 | Duplicate, clock-skew, late, and missing-checkout exceptions |
| 31 | seed_6c_031_shift_roster | 6C.03 | Shift and roster model |
| 32 | seed_6c_032_holiday_calendar | 6C.03 | Organization or branch holiday calendar |
| 33 | seed_6c_033_leave_type_registry | 6C.03 | Configurable leave types |
| 34 | seed_6c_034_leave_accrual_engine | 6C.03 | Leave accrual rule engine |
| 35 | seed_6c_035_leave_carryforward_expiry | 6C.03 | Leave carry-forward and expiry logic |
| 36 | seed_6c_036_leave_encashment | 6C.03 | Leave encashment evidence boundary |
| 37 | seed_6c_037_leave_approval_chain | 6C.03 | Configurable leave approval chains |
| 38 | seed_6c_038_payroll_input_evidence | 6C.03 | Attendance/leave payroll input evidence |
| 39 | seed_6c_039_attendance_location_redaction | 6C.03 | Sensitive attendance location redaction |
| 40 | seed_6c_040_performance_framework | 6C.04 | Configurable performance framework |
| 41 | seed_6c_041_weighted_goal_review_cycle | 6C.04 | Weighted goals and review cycles |
| 42 | seed_6c_042_at_risk_rules_engine | 6C.04 | At-risk rules via Rules Engine |
| 43 | seed_6c_043_commission_calculation | 6C.04 | Commission calculation from CRM/payment evidence refs |
| 44 | seed_6c_044_commission_deferred_release | 6C.04 | Deferred commission release scheduler |
| 45 | seed_6c_045_commission_clawback_reversal | 6C.04 | Commission clawback reversal handler |
| 46 | seed_6c_046_commission_tier_accelerator | 6C.04 | Commission tier accelerator evaluator |
| 47 | seed_6c_047_commission_pool_distribution | 6C.04 | Commission pool distribution surface |
| 48 | seed_6c_048_commission_payroll_batch_event | 6C.04 | Approved commission batch event to payroll |
| 49 | seed_6c_049_policy_version_library | 6C.04 | Versioned policy library |
| 50 | seed_6c_050_policy_acknowledgement_evidence | 6C.04 | Immutable policy acknowledgement evidence |
| 51 | seed_6c_051_offboarding_saga | 6C.04 | Offboarding Saga coordinator |
| 52 | seed_6c_052_offboarding_settlement_step | 6C.04 | Offboarding final settlement step |
| 53 | seed_6c_053_offboarding_asset_recovery_step | 6C.04 | Offboarding asset recovery step |
| 54 | seed_6c_054_offboarding_workspace_removal_step | 6C.04 | Offboarding Workspace removal step |
| 55 | seed_6c_055_offboarding_access_revocation_gatekeeper | 6C.04 | Offboarding access revocation through Gatekeeper |
| 56 | seed_6c_056_offboarding_payroll_closure_step | 6C.04 | Offboarding payroll closure event |
| 57 | seed_6c_057_workspace_channel_dm | 6C.05 | Workspace channels and DMs |
| 58 | seed_6c_058_message_thread_reaction | 6C.05 | Threads, mentions, reactions, read receipts |
| 59 | seed_6c_059_message_edit_history | 6C.05 | Immutable message edit history |
| 60 | seed_6c_060_message_tombstone_staged_deletion | 6C.05 | Message tombstone and staged deletion |
| 61 | seed_6c_061_message_attachment_file_ref | 6C.05 | Message attachments via 6A file refs |
| 62 | seed_6c_062_outbound_notification_gateway | 6C.05 | Outbound Workspace notifications through gateway |
| 63 | seed_6c_063_mention_notification_evidence | 6C.05 | Mention notification evidence |
| 64 | seed_6c_064_membership_policy | 6C.05 | Membership policy from Access Core roles and employee teams |
| 65 | seed_6c_065_private_channel_approval | 6C.05 | Configurable private-channel approval |
| 66 | seed_6c_066_cross_module_channel_ref | 6C.05 | Cross-module channels through registered refs |
| 67 | seed_6c_067_workspace_message_search | 6C.05 | Workspace message search via 6A Search/File layer |
| 68 | seed_6c_068_moderation_reporting | 6C.05 | Workspace moderation/reporting |
| 69 | seed_6c_069_e2e_encryption_boundary | 6C.05 | Optional E2E encryption scaffold boundary |
| 70 | seed_6c_070_task_record | 6C.06 | Task record with full task fields |
| 71 | seed_6c_071_task_status_config | 6C.06 | Configurable task status with hard anchors |
| 72 | seed_6c_072_project_record | 6C.06 | Project record and metadata |
| 73 | seed_6c_073_project_dependency_engine | 6C.06 | Project dependency engine without UI Gantt |
| 74 | seed_6c_074_project_budget_evidence_ref | 6C.06 | Read-only 6B Finance budget evidence refs |
| 75 | seed_6c_075_wiki_page_versioning | 6C.06 | Wiki page version history |
| 76 | seed_6c_076_wiki_restore | 6C.06 | Wiki/document restore rules |
| 77 | seed_6c_077_document_folder_file_ref | 6C.06 | Document folder and file refs |
| 78 | seed_6c_078_time_log_evidence | 6C.06 | Time log evidence for future billing dimensions |
| 79 | seed_6c_079_task_reminder_gateway | 6C.06 | Task reminders through gateway |
| 80 | seed_6c_080_project_template | 6C.06 | Configurable project templates |
| 81 | seed_6c_081_tenant_authored_knowledge | 6C.06 | Tenant-authored knowledge pages |
| 82 | seed_6c_082_task_project_calendar_event | 6C.06 | Task/project events consumable by Calendar |
| 83 | seed_6c_083_provider_neutral_calendar_entry | 6C.07 | Provider-neutral calendar entry runtime |
| 84 | seed_6c_084_calendar_provider_sync_boundary | 6C.07 | Google/Outlook adapter boundary only |
| 85 | seed_6c_085_conferencing_provider_boundary | 6C.07 | Meet/Zoom conferencing adapter boundary only |
| 86 | seed_6c_086_room_booking_conflict | 6C.07 | Room/resource booking conflict detection |
| 87 | seed_6c_087_resource_capacity_equipment | 6C.07 | Room/resource capacity and equipment metadata |
| 88 | seed_6c_088_announcement_gateway | 6C.07 | Announcements through Communication Gateway |
| 89 | seed_6c_089_mandatory_notice_classification | 6C.07 | Mandatory vs opt-out notice classification |
| 90 | seed_6c_090_reminder_quiet_hours | 6C.07 | Reminder quiet-hour enforcement |
| 91 | seed_6c_091_recurring_event_rule | 6C.07 | Recurring calendar event rules |
| 92 | seed_6c_092_calendar_origin_event_ref | 6C.07 | Calendar origin event refs from HR/tasks/events/LMS later |
| 93 | seed_6c_093_meeting_attendance_evidence | 6C.07 | Meeting attendance Workspace evidence |
| 94 | seed_6c_094_sync_failure_degradation | 6C.07 | Calendar sync failure degradation |
| 95 | seed_6c_095_announcement_ack_evidence | 6C.07 | Announcement acknowledgement evidence |
| 96 | seed_6c_096_event_configuration | 6C.08 | Event configuration baseline |
| 97 | seed_6c_097_event_session_track | 6C.08 | Multi-track session model |
| 98 | seed_6c_098_speaker_honorarium_ref | 6C.08 | Speaker and honorarium refs |
| 99 | seed_6c_099_ticket_type_capacity | 6C.08 | Ticket-type capacity rules |
| 100 | seed_6c_100_registration_form_config | 6C.08 | Registration forms through Configuration Engine |
| 101 | seed_6c_101_waitlist_rule | 6C.08 | Configurable waitlist rules |
| 102 | seed_6c_102_waitlist_auto_promotion_timer | 6C.08 | Waitlist auto-promotion timer |
| 103 | seed_6c_103_ticket_claim_deadline | 6C.08 | Ticket claim deadlines |
| 104 | seed_6c_104_approval_required_registration | 6C.08 | Approval-required registration workflow |
| 105 | seed_6c_105_event_calendar_schedule_ref | 6C.08 | Event scheduling via Workspace Calendar refs |
| 106 | seed_6c_106_attendee_crm_lead_link | 6C.08 | Attendee to CRM lead linkage where applicable |
| 107 | seed_6c_107_event_lead_handoff | 6C.08 | Event lead handoff events, not CRM direct writes |
| 108 | seed_6c_108_registration_invoice_saga | 6C.08 | Registration invoice/payment/ticket Saga |
| 109 | seed_6c_109_registration_attempt_evidence | 6C.08 | Evidence for every registration attempt |
| 110 | seed_6c_110_cancellation_refund_delegation | 6C.08 | Cancellation state with refund delegated to Finance/payment |
| 111 | seed_6c_111_qr_ticket_issuing | 6C.09 | QR ticket issuing from registration/payment state |
| 112 | seed_6c_112_signed_ticket_token | 6C.09 | Cryptographic signed ticket tokens |
| 113 | seed_6c_113_checkin_time_window | 6C.09 | Check-in time-window enforcement |
| 114 | seed_6c_114_kiosk_mode_checkin | 6C.09 | Kiosk-mode check-in |
| 115 | seed_6c_115_session_level_checkin | 6C.09 | Session-level check-in |
| 116 | seed_6c_116_manual_checkin_override | 6C.09 | Manual check-in override with reason and approval |
| 117 | seed_6c_117_duplicate_checkin_exception | 6C.09 | Duplicate check-in blocked and recorded as exception |
| 118 | seed_6c_118_offline_checkin_queue | 6C.09 | Offline check-in queue |
| 119 | seed_6c_119_badge_export | 6C.09 | Badge export |
| 120 | seed_6c_120_post_event_feedback_form | 6C.09 | Post-event feedback form |
| 121 | seed_6c_121_feedback_identity_policy | 6C.09 | Anonymous or identified feedback policy |
| 122 | seed_6c_122_post_event_resource_file_ref | 6C.09 | Post-event resources through file refs |
| 123 | seed_6c_123_event_lead_handoff_evidence | 6C.09 | Event lead handoff evidence |
| 124 | seed_6c_124_attendance_certificate_evidence | 6C.09 | Attendance certificate evidence only, LMS certification deferred |
