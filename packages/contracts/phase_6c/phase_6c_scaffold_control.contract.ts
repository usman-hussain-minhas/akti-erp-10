export type Phase6CScaffoldSurface = {
  module_key: string;
  display_name: string;
  owned_model_names: string[];
  capability_implementation_allowed: false;
  business_behavior_allowed: false;
  runtime_adapter_allowed: false;
};

export type Phase6CScaffoldControlSnapshot = {
  phase: '6C';
  status: 'scaffold_control_only';
  ticket_generation_allowed: false;
  capability_execution_allowed: false;
  surfaces: Phase6CScaffoldSurface[];
};

export const phase6CScaffoldSurfaces = [
  {
    "module_key": "phase-6c.hr-employee-records-and-organisation-structure",
    "display_name": "Phase 6C HR Employee Records and Organisation Structure",
    "owned_model_names": [
      "Phase6CEmployeePersonExtension",
      "Phase6CEmployeeNumberPolicy",
      "Phase6COrgDepartmentTeamPosition",
      "Phase6CReportingLineMatrix",
      "Phase6CEmploymentContractRecord",
      "Phase6CEmployeeDocumentBoundary",
      "Phase6CCompensationMetadataPayrollEvidence",
      "Phase6CEmployeeLifecycleStatusHistory",
      "Phase6CEmployeeSensitiveFieldRedaction",
      "Phase6CEmployeeCreatedEvent"
    ]
  },
  {
    "module_key": "phase-6c.hr-recruitment-and-onboarding-pipeline",
    "display_name": "Phase 6C HR Recruitment and Onboarding Pipeline",
    "owned_model_names": [
      "Phase6CApplicantSourceLinkage",
      "Phase6CRecruitmentStageConfig",
      "Phase6CScorecardInterviewForm",
      "Phase6CInterviewCalendarEventRequest",
      "Phase6COfferApprovalWorkflow",
      "Phase6COfferAcceptanceEmployeeCreationRequest",
      "Phase6COnboardingTaskTemplate",
      "Phase6CAccessProvisioningGatekeeperEvent",
      "Phase6CBackgroundCheckProviderBoundary",
      "Phase6COfferDocumentGeneration",
      "Phase6CApplicantStagedDeletion",
      "Phase6CApplicantDedupLinkage",
      "Phase6CRecruitmentEvidenceFeed"
    ]
  },
  {
    "module_key": "phase-6c.hr-attendance-leave-and-time-tracking",
    "display_name": "Phase 6C HR Attendance, Leave, and Time Tracking",
    "owned_model_names": [
      "Phase6CQrAttendance",
      "Phase6CBiometricDeviceBoundary",
      "Phase6CRfidNfcAttendance",
      "Phase6CMobileGpsAttendance",
      "Phase6CManualAttendanceOverride",
      "Phase6COfflineAttendanceQueue",
      "Phase6CAttendanceExceptionDetection",
      "Phase6CShiftRoster",
      "Phase6CHolidayCalendar",
      "Phase6CLeaveTypeRegistry",
      "Phase6CLeaveAccrualEngine",
      "Phase6CLeaveCarryforwardExpiry",
      "Phase6CLeaveEncashment",
      "Phase6CLeaveApprovalChain",
      "Phase6CPayrollInputEvidence",
      "Phase6CAttendanceLocationRedaction"
    ]
  },
  {
    "module_key": "phase-6c.hr-performance-commission-policy-and-offboarding",
    "display_name": "Phase 6C HR Performance, Commission, Policy, and Offboarding",
    "owned_model_names": [
      "Phase6CPerformanceFramework",
      "Phase6CWeightedGoalReviewCycle",
      "Phase6CAtRiskRulesEngine",
      "Phase6CCommissionCalculation",
      "Phase6CCommissionDeferredRelease",
      "Phase6CCommissionClawbackReversal",
      "Phase6CCommissionTierAccelerator",
      "Phase6CCommissionPoolDistribution",
      "Phase6CCommissionPayrollBatchEvent",
      "Phase6CPolicyVersionLibrary",
      "Phase6CPolicyAcknowledgementEvidence",
      "Phase6COffboardingSaga",
      "Phase6COffboardingSettlementStep",
      "Phase6COffboardingAssetRecoveryStep",
      "Phase6COffboardingWorkspaceRemovalStep",
      "Phase6COffboardingAccessRevocationGatekeeper",
      "Phase6COffboardingPayrollClosureStep"
    ]
  },
  {
    "module_key": "phase-6c.workspace-messaging-and-collaboration",
    "display_name": "Phase 6C Workspace Messaging and Collaboration",
    "owned_model_names": [
      "Phase6CWorkspaceChannelDm",
      "Phase6CMessageThreadReaction",
      "Phase6CMessageEditHistory",
      "Phase6CMessageTombstoneStagedDeletion",
      "Phase6CMessageAttachmentFileRef",
      "Phase6COutboundNotificationGateway",
      "Phase6CMentionNotificationEvidence",
      "Phase6CMembershipPolicy",
      "Phase6CPrivateChannelApproval",
      "Phase6CCrossModuleChannelRef",
      "Phase6CWorkspaceMessageSearch",
      "Phase6CModerationReporting",
      "Phase6CE2eEncryptionBoundary"
    ]
  },
  {
    "module_key": "phase-6c.workspace-tasks-projects-documents-and-knowledge",
    "display_name": "Phase 6C Workspace Tasks, Projects, Documents, and Knowledge",
    "owned_model_names": [
      "Phase6CTaskRecord",
      "Phase6CTaskStatusConfig",
      "Phase6CProjectRecord",
      "Phase6CProjectDependencyEngine",
      "Phase6CProjectBudgetEvidenceRef",
      "Phase6CWikiPageVersioning",
      "Phase6CWikiRestore",
      "Phase6CDocumentFolderFileRef",
      "Phase6CTimeLogEvidence",
      "Phase6CTaskReminderGateway",
      "Phase6CProjectTemplate",
      "Phase6CTenantAuthoredKnowledge",
      "Phase6CTaskProjectCalendarEvent"
    ]
  },
  {
    "module_key": "phase-6c.workspace-calendar-meetings-rooms-announcements",
    "display_name": "Phase 6C Workspace Calendar, Meetings, Rooms, Announcements",
    "owned_model_names": [
      "Phase6CProviderNeutralCalendarEntry",
      "Phase6CCalendarProviderSyncBoundary",
      "Phase6CConferencingProviderBoundary",
      "Phase6CRoomBookingConflict",
      "Phase6CResourceCapacityEquipment",
      "Phase6CAnnouncementGateway",
      "Phase6CMandatoryNoticeClassification",
      "Phase6CReminderQuietHours",
      "Phase6CRecurringEventRule",
      "Phase6CCalendarOriginEventRef",
      "Phase6CMeetingAttendanceEvidence",
      "Phase6CSyncFailureDegradation",
      "Phase6CAnnouncementAckEvidence"
    ]
  },
  {
    "module_key": "phase-6c.events-configuration-and-registration-service",
    "display_name": "Phase 6C Events Configuration and Registration Service",
    "owned_model_names": [
      "Phase6CEventConfiguration",
      "Phase6CEventSessionTrack",
      "Phase6CSpeakerHonorariumRef",
      "Phase6CTicketTypeCapacity",
      "Phase6CRegistrationFormConfig",
      "Phase6CWaitlistRule",
      "Phase6CWaitlistAutoPromotionTimer",
      "Phase6CTicketClaimDeadline",
      "Phase6CApprovalRequiredRegistration",
      "Phase6CEventCalendarScheduleRef",
      "Phase6CAttendeeCrmLeadLink",
      "Phase6CEventLeadHandoff",
      "Phase6CRegistrationInvoiceSaga",
      "Phase6CRegistrationAttemptEvidence",
      "Phase6CCancellationRefundDelegation"
    ]
  },
  {
    "module_key": "phase-6c.events-check-in-and-post-event-service",
    "display_name": "Phase 6C Events Check-In and Post-Event Service",
    "owned_model_names": [
      "Phase6CQrTicketIssuing",
      "Phase6CSignedTicketToken",
      "Phase6CCheckinTimeWindow",
      "Phase6CKioskModeCheckin",
      "Phase6CSessionLevelCheckin",
      "Phase6CManualCheckinOverride",
      "Phase6CDuplicateCheckinException",
      "Phase6COfflineCheckinQueue",
      "Phase6CBadgeExport",
      "Phase6CPostEventFeedbackForm",
      "Phase6CFeedbackIdentityPolicy",
      "Phase6CPostEventResourceFileRef",
      "Phase6CEventLeadHandoffEvidence",
      "Phase6CAttendanceCertificateEvidence"
    ]
  }
].map((surface) => ({
  ...surface,
  capability_implementation_allowed: false,
  business_behavior_allowed: false,
  runtime_adapter_allowed: false,
})) satisfies Phase6CScaffoldSurface[];

export const phase6CScaffoldControlSnapshot: Phase6CScaffoldControlSnapshot = {
  phase: '6C',
  status: 'scaffold_control_only',
  ticket_generation_allowed: false,
  capability_execution_allowed: false,
  surfaces: phase6CScaffoldSurfaces,
};

export function assertPhase6CScaffoldControlSnapshot(snapshot: Phase6CScaffoldControlSnapshot): void {
  const seenModuleKeys = new Set<string>();
  const seenModels = new Set<string>();

  for (const surface of snapshot.surfaces) {
    if (seenModuleKeys.has(surface.module_key)) {
      throw new Error('Duplicate Phase 6C scaffold module key: ' + surface.module_key);
    }
    seenModuleKeys.add(surface.module_key);
    if (surface.owned_model_names.length === 0) {
      throw new Error('Phase 6C scaffold surface ' + surface.module_key + ' must own at least one schema model');
    }
    for (const modelName of surface.owned_model_names) {
      if (seenModels.has(modelName)) {
        throw new Error('Duplicate Phase 6C scaffold model ownership: ' + modelName);
      }
      seenModels.add(modelName);
    }
    if (surface.capability_implementation_allowed || surface.business_behavior_allowed || surface.runtime_adapter_allowed) {
      throw new Error('Phase 6C scaffold surface ' + surface.module_key + ' must not authorize capability behavior');
    }
  }

  if (snapshot.ticket_generation_allowed || snapshot.capability_execution_allowed) {
    throw new Error('Phase 6C scaffold control must keep ticket generation and execution disabled');
  }
  if (snapshot.surfaces.length !== 9) {
    throw new Error('Expected 9 Phase 6C scaffold surfaces; got ' + snapshot.surfaces.length);
  }
  if (seenModels.size !== 124) {
    throw new Error('Expected 124 Phase 6C scaffold model owners; got ' + seenModels.size);
  }
}

assertPhase6CScaffoldControlSnapshot(phase6CScaffoldControlSnapshot);
