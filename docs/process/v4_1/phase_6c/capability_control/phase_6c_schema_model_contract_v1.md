# Phase 6C Schema Model Contract v1

Status: `P6C_SCHEMA_001_REVIEW_READY_FOR_SCHEMA_CONTROL_IMPLEMENTATION`

## Summary

This contract maps 124/124 Phase 6C planning seeds to proposed minimal schema-control model skeletons. It authorizes schema-control review only; it does not authorize runtime/capability implementation or FFET execution.

## Binding Policies

- All tenant-scoped Phase 6C models require `organization_id`.
- HR, Workspace, and Events role records link to core Person when known and never own global Person identity.
- Metadata JSON is audit/control/extension metadata only and cannot carry source-named business facts.
- Provider integrations are provider-neutral boundaries only; no credentials or real provider adapters.
- Destructive migrations are forbidden.
- Every business field must trace to source docs, accepted decisions, or committed repo model truth; otherwise omit and block.

## Counts

- Seed coverage: `124/124`
- Component groups: `9`
- Proposed model names: `124`
- Capability runtime authorizations: `0`

## Seed to Model Mapping

| Seed | Proposed model | Decision | Tenant isolation |
| --- | --- | --- | --- |
| `seed_6c_001_employee_person_extension` | `Phase6CEmployeePersonExtension` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_002_employee_number_policy` | `Phase6CEmployeeNumberPolicy` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_003_org_department_team_position` | `Phase6COrgDepartmentTeamPosition` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_004_reporting_line_matrix` | `Phase6CReportingLineMatrix` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_005_employment_contract_record` | `Phase6CEmploymentContractRecord` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_006_employee_document_boundary` | `Phase6CEmployeeDocumentBoundary` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_007_compensation_metadata_payroll_evidence` | `Phase6CCompensationMetadataPayrollEvidence` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_008_employee_lifecycle_status_history` | `Phase6CEmployeeLifecycleStatusHistory` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_009_employee_sensitive_field_redaction` | `Phase6CEmployeeSensitiveFieldRedaction` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_010_employee_created_event` | `Phase6CEmployeeCreatedEvent` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_011_applicant_source_linkage` | `Phase6CApplicantSourceLinkage` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_012_recruitment_stage_config` | `Phase6CRecruitmentStageConfig` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_013_scorecard_interview_form` | `Phase6CScorecardInterviewForm` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_014_interview_calendar_event_request` | `Phase6CInterviewCalendarEventRequest` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_015_offer_approval_workflow` | `Phase6COfferApprovalWorkflow` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_016_offer_acceptance_employee_creation_request` | `Phase6COfferAcceptanceEmployeeCreationRequest` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_017_onboarding_task_template` | `Phase6COnboardingTaskTemplate` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_018_access_provisioning_gatekeeper_event` | `Phase6CAccessProvisioningGatekeeperEvent` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_019_background_check_provider_boundary` | `Phase6CBackgroundCheckProviderBoundary` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_020_offer_document_generation` | `Phase6COfferDocumentGeneration` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_021_applicant_staged_deletion` | `Phase6CApplicantStagedDeletion` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_022_applicant_dedup_linkage` | `Phase6CApplicantDedupLinkage` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_023_recruitment_evidence_feed` | `Phase6CRecruitmentEvidenceFeed` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_024_qr_attendance` | `Phase6CQrAttendance` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_025_biometric_device_boundary` | `Phase6CBiometricDeviceBoundary` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_026_rfid_nfc_attendance` | `Phase6CRfidNfcAttendance` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_027_mobile_gps_attendance` | `Phase6CMobileGpsAttendance` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_028_manual_attendance_override` | `Phase6CManualAttendanceOverride` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_029_offline_attendance_queue` | `Phase6COfflineAttendanceQueue` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_030_attendance_exception_detection` | `Phase6CAttendanceExceptionDetection` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_031_shift_roster` | `Phase6CShiftRoster` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_032_holiday_calendar` | `Phase6CHolidayCalendar` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_033_leave_type_registry` | `Phase6CLeaveTypeRegistry` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_034_leave_accrual_engine` | `Phase6CLeaveAccrualEngine` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_035_leave_carryforward_expiry` | `Phase6CLeaveCarryforwardExpiry` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_036_leave_encashment` | `Phase6CLeaveEncashment` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_037_leave_approval_chain` | `Phase6CLeaveApprovalChain` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_038_payroll_input_evidence` | `Phase6CPayrollInputEvidence` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_039_attendance_location_redaction` | `Phase6CAttendanceLocationRedaction` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_040_performance_framework` | `Phase6CPerformanceFramework` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_041_weighted_goal_review_cycle` | `Phase6CWeightedGoalReviewCycle` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_042_at_risk_rules_engine` | `Phase6CAtRiskRulesEngine` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_043_commission_calculation` | `Phase6CCommissionCalculation` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_044_commission_deferred_release` | `Phase6CCommissionDeferredRelease` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_045_commission_clawback_reversal` | `Phase6CCommissionClawbackReversal` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_046_commission_tier_accelerator` | `Phase6CCommissionTierAccelerator` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_047_commission_pool_distribution` | `Phase6CCommissionPoolDistribution` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_048_commission_payroll_batch_event` | `Phase6CCommissionPayrollBatchEvent` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_049_policy_version_library` | `Phase6CPolicyVersionLibrary` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_050_policy_acknowledgement_evidence` | `Phase6CPolicyAcknowledgementEvidence` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_051_offboarding_saga` | `Phase6COffboardingSaga` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_052_offboarding_settlement_step` | `Phase6COffboardingSettlementStep` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_053_offboarding_asset_recovery_step` | `Phase6COffboardingAssetRecoveryStep` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_054_offboarding_workspace_removal_step` | `Phase6COffboardingWorkspaceRemovalStep` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_055_offboarding_access_revocation_gatekeeper` | `Phase6COffboardingAccessRevocationGatekeeper` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_056_offboarding_payroll_closure_step` | `Phase6COffboardingPayrollClosureStep` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_057_workspace_channel_dm` | `Phase6CWorkspaceChannelDm` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_058_message_thread_reaction` | `Phase6CMessageThreadReaction` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_059_message_edit_history` | `Phase6CMessageEditHistory` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_060_message_tombstone_staged_deletion` | `Phase6CMessageTombstoneStagedDeletion` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_061_message_attachment_file_ref` | `Phase6CMessageAttachmentFileRef` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_062_outbound_notification_gateway` | `Phase6COutboundNotificationGateway` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_063_mention_notification_evidence` | `Phase6CMentionNotificationEvidence` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_064_membership_policy` | `Phase6CMembershipPolicy` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_065_private_channel_approval` | `Phase6CPrivateChannelApproval` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_066_cross_module_channel_ref` | `Phase6CCrossModuleChannelRef` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_067_workspace_message_search` | `Phase6CWorkspaceMessageSearch` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_068_moderation_reporting` | `Phase6CModerationReporting` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_069_e2e_encryption_boundary` | `Phase6CE2eEncryptionBoundary` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_070_task_record` | `Phase6CTaskRecord` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_071_task_status_config` | `Phase6CTaskStatusConfig` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_072_project_record` | `Phase6CProjectRecord` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_073_project_dependency_engine` | `Phase6CProjectDependencyEngine` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_074_project_budget_evidence_ref` | `Phase6CProjectBudgetEvidenceRef` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_075_wiki_page_versioning` | `Phase6CWikiPageVersioning` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_076_wiki_restore` | `Phase6CWikiRestore` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_077_document_folder_file_ref` | `Phase6CDocumentFolderFileRef` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_078_time_log_evidence` | `Phase6CTimeLogEvidence` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_079_task_reminder_gateway` | `Phase6CTaskReminderGateway` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_080_project_template` | `Phase6CProjectTemplate` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_081_tenant_authored_knowledge` | `Phase6CTenantAuthoredKnowledge` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_082_task_project_calendar_event` | `Phase6CTaskProjectCalendarEvent` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_083_provider_neutral_calendar_entry` | `Phase6CProviderNeutralCalendarEntry` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_084_calendar_provider_sync_boundary` | `Phase6CCalendarProviderSyncBoundary` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_085_conferencing_provider_boundary` | `Phase6CConferencingProviderBoundary` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_086_room_booking_conflict` | `Phase6CRoomBookingConflict` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_087_resource_capacity_equipment` | `Phase6CResourceCapacityEquipment` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_088_announcement_gateway` | `Phase6CAnnouncementGateway` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_089_mandatory_notice_classification` | `Phase6CMandatoryNoticeClassification` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_090_reminder_quiet_hours` | `Phase6CReminderQuietHours` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_091_recurring_event_rule` | `Phase6CRecurringEventRule` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_092_calendar_origin_event_ref` | `Phase6CCalendarOriginEventRef` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_093_meeting_attendance_evidence` | `Phase6CMeetingAttendanceEvidence` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_094_sync_failure_degradation` | `Phase6CSyncFailureDegradation` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_095_announcement_ack_evidence` | `Phase6CAnnouncementAckEvidence` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_096_event_configuration` | `Phase6CEventConfiguration` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_097_event_session_track` | `Phase6CEventSessionTrack` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_098_speaker_honorarium_ref` | `Phase6CSpeakerHonorariumRef` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_099_ticket_type_capacity` | `Phase6CTicketTypeCapacity` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_100_registration_form_config` | `Phase6CRegistrationFormConfig` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_101_waitlist_rule` | `Phase6CWaitlistRule` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_102_waitlist_auto_promotion_timer` | `Phase6CWaitlistAutoPromotionTimer` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_103_ticket_claim_deadline` | `Phase6CTicketClaimDeadline` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_104_approval_required_registration` | `Phase6CApprovalRequiredRegistration` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_105_event_calendar_schedule_ref` | `Phase6CEventCalendarScheduleRef` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_106_attendee_crm_lead_link` | `Phase6CAttendeeCrmLeadLink` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_107_event_lead_handoff` | `Phase6CEventLeadHandoff` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_108_registration_invoice_saga` | `Phase6CRegistrationInvoiceSaga` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_109_registration_attempt_evidence` | `Phase6CRegistrationAttemptEvidence` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_110_cancellation_refund_delegation` | `Phase6CCancellationRefundDelegation` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_111_qr_ticket_issuing` | `Phase6CQrTicketIssuing` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_112_signed_ticket_token` | `Phase6CSignedTicketToken` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_113_checkin_time_window` | `Phase6CCheckinTimeWindow` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_114_kiosk_mode_checkin` | `Phase6CKioskModeCheckin` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_115_session_level_checkin` | `Phase6CSessionLevelCheckin` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_116_manual_checkin_override` | `Phase6CManualCheckinOverride` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_117_duplicate_checkin_exception` | `Phase6CDuplicateCheckinException` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_118_offline_checkin_queue` | `Phase6COfflineCheckinQueue` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_119_badge_export` | `Phase6CBadgeExport` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_120_post_event_feedback_form` | `Phase6CPostEventFeedbackForm` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_121_feedback_identity_policy` | `Phase6CFeedbackIdentityPolicy` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_122_post_event_resource_file_ref` | `Phase6CPostEventResourceFileRef` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_123_event_lead_handoff_evidence` | `Phase6CEventLeadHandoffEvidence` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
| `seed_6c_124_attendance_certificate_evidence` | `Phase6CAttendanceCertificateEvidence` | `CREATE_MINIMAL_SOURCE_GROUNDED_RELATION_SKELETON` | `organization_id_required` |
