-- Phase 6C schema control baseline
-- Additive schema-control migration only. No destructive operations.

CREATE TABLE "Phase6CEmployeePersonExtension" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "person_ref" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C001_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C001_org_id_key" ON "Phase6CEmployeePersonExtension"("organization_id", "id");
CREATE INDEX "P6C001_org_idx" ON "Phase6CEmployeePersonExtension"("organization_id");
CREATE INDEX "P6C001_seed_idx" ON "Phase6CEmployeePersonExtension"("organization_id", "source_seed_id");
CREATE INDEX "P6C001_person_idx" ON "Phase6CEmployeePersonExtension"("organization_id", "person_ref");
ALTER TABLE "Phase6CEmployeePersonExtension" ADD CONSTRAINT "P6C001_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CEmployeeNumberPolicy" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "person_ref" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C002_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C002_org_id_key" ON "Phase6CEmployeeNumberPolicy"("organization_id", "id");
CREATE INDEX "P6C002_org_idx" ON "Phase6CEmployeeNumberPolicy"("organization_id");
CREATE INDEX "P6C002_seed_idx" ON "Phase6CEmployeeNumberPolicy"("organization_id", "source_seed_id");
CREATE INDEX "P6C002_person_idx" ON "Phase6CEmployeeNumberPolicy"("organization_id", "person_ref");
ALTER TABLE "Phase6CEmployeeNumberPolicy" ADD CONSTRAINT "P6C002_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6COrgDepartmentTeamPosition" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C003_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C003_org_id_key" ON "Phase6COrgDepartmentTeamPosition"("organization_id", "id");
CREATE INDEX "P6C003_org_idx" ON "Phase6COrgDepartmentTeamPosition"("organization_id");
CREATE INDEX "P6C003_seed_idx" ON "Phase6COrgDepartmentTeamPosition"("organization_id", "source_seed_id");
ALTER TABLE "Phase6COrgDepartmentTeamPosition" ADD CONSTRAINT "P6C003_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CReportingLineMatrix" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C004_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C004_org_id_key" ON "Phase6CReportingLineMatrix"("organization_id", "id");
CREATE INDEX "P6C004_org_idx" ON "Phase6CReportingLineMatrix"("organization_id");
CREATE INDEX "P6C004_seed_idx" ON "Phase6CReportingLineMatrix"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CReportingLineMatrix" ADD CONSTRAINT "P6C004_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CEmploymentContractRecord" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C005_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C005_org_id_key" ON "Phase6CEmploymentContractRecord"("organization_id", "id");
CREATE INDEX "P6C005_org_idx" ON "Phase6CEmploymentContractRecord"("organization_id");
CREATE INDEX "P6C005_seed_idx" ON "Phase6CEmploymentContractRecord"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CEmploymentContractRecord" ADD CONSTRAINT "P6C005_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CEmployeeDocumentBoundary" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "person_ref" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C006_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C006_org_id_key" ON "Phase6CEmployeeDocumentBoundary"("organization_id", "id");
CREATE INDEX "P6C006_org_idx" ON "Phase6CEmployeeDocumentBoundary"("organization_id");
CREATE INDEX "P6C006_seed_idx" ON "Phase6CEmployeeDocumentBoundary"("organization_id", "source_seed_id");
CREATE INDEX "P6C006_person_idx" ON "Phase6CEmployeeDocumentBoundary"("organization_id", "person_ref");
ALTER TABLE "Phase6CEmployeeDocumentBoundary" ADD CONSTRAINT "P6C006_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CCompensationMetadataPayrollEvidence" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C007_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C007_org_id_key" ON "Phase6CCompensationMetadataPayrollEvidence"("organization_id", "id");
CREATE INDEX "P6C007_org_idx" ON "Phase6CCompensationMetadataPayrollEvidence"("organization_id");
CREATE INDEX "P6C007_seed_idx" ON "Phase6CCompensationMetadataPayrollEvidence"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CCompensationMetadataPayrollEvidence" ADD CONSTRAINT "P6C007_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CEmployeeLifecycleStatusHistory" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "person_ref" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C008_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C008_org_id_key" ON "Phase6CEmployeeLifecycleStatusHistory"("organization_id", "id");
CREATE INDEX "P6C008_org_idx" ON "Phase6CEmployeeLifecycleStatusHistory"("organization_id");
CREATE INDEX "P6C008_seed_idx" ON "Phase6CEmployeeLifecycleStatusHistory"("organization_id", "source_seed_id");
CREATE INDEX "P6C008_person_idx" ON "Phase6CEmployeeLifecycleStatusHistory"("organization_id", "person_ref");
ALTER TABLE "Phase6CEmployeeLifecycleStatusHistory" ADD CONSTRAINT "P6C008_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CEmployeeSensitiveFieldRedaction" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "person_ref" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C009_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C009_org_id_key" ON "Phase6CEmployeeSensitiveFieldRedaction"("organization_id", "id");
CREATE INDEX "P6C009_org_idx" ON "Phase6CEmployeeSensitiveFieldRedaction"("organization_id");
CREATE INDEX "P6C009_seed_idx" ON "Phase6CEmployeeSensitiveFieldRedaction"("organization_id", "source_seed_id");
CREATE INDEX "P6C009_person_idx" ON "Phase6CEmployeeSensitiveFieldRedaction"("organization_id", "person_ref");
ALTER TABLE "Phase6CEmployeeSensitiveFieldRedaction" ADD CONSTRAINT "P6C009_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CEmployeeCreatedEvent" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "person_ref" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C010_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C010_org_id_key" ON "Phase6CEmployeeCreatedEvent"("organization_id", "id");
CREATE INDEX "P6C010_org_idx" ON "Phase6CEmployeeCreatedEvent"("organization_id");
CREATE INDEX "P6C010_seed_idx" ON "Phase6CEmployeeCreatedEvent"("organization_id", "source_seed_id");
CREATE INDEX "P6C010_person_idx" ON "Phase6CEmployeeCreatedEvent"("organization_id", "person_ref");
ALTER TABLE "Phase6CEmployeeCreatedEvent" ADD CONSTRAINT "P6C010_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CApplicantSourceLinkage" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "person_ref" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C011_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C011_org_id_key" ON "Phase6CApplicantSourceLinkage"("organization_id", "id");
CREATE INDEX "P6C011_org_idx" ON "Phase6CApplicantSourceLinkage"("organization_id");
CREATE INDEX "P6C011_seed_idx" ON "Phase6CApplicantSourceLinkage"("organization_id", "source_seed_id");
CREATE INDEX "P6C011_person_idx" ON "Phase6CApplicantSourceLinkage"("organization_id", "person_ref");
ALTER TABLE "Phase6CApplicantSourceLinkage" ADD CONSTRAINT "P6C011_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CRecruitmentStageConfig" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C012_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C012_org_id_key" ON "Phase6CRecruitmentStageConfig"("organization_id", "id");
CREATE INDEX "P6C012_org_idx" ON "Phase6CRecruitmentStageConfig"("organization_id");
CREATE INDEX "P6C012_seed_idx" ON "Phase6CRecruitmentStageConfig"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CRecruitmentStageConfig" ADD CONSTRAINT "P6C012_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CScorecardInterviewForm" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C013_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C013_org_id_key" ON "Phase6CScorecardInterviewForm"("organization_id", "id");
CREATE INDEX "P6C013_org_idx" ON "Phase6CScorecardInterviewForm"("organization_id");
CREATE INDEX "P6C013_seed_idx" ON "Phase6CScorecardInterviewForm"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CScorecardInterviewForm" ADD CONSTRAINT "P6C013_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CInterviewCalendarEventRequest" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C014_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C014_org_id_key" ON "Phase6CInterviewCalendarEventRequest"("organization_id", "id");
CREATE INDEX "P6C014_org_idx" ON "Phase6CInterviewCalendarEventRequest"("organization_id");
CREATE INDEX "P6C014_seed_idx" ON "Phase6CInterviewCalendarEventRequest"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CInterviewCalendarEventRequest" ADD CONSTRAINT "P6C014_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6COfferApprovalWorkflow" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C015_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C015_org_id_key" ON "Phase6COfferApprovalWorkflow"("organization_id", "id");
CREATE INDEX "P6C015_org_idx" ON "Phase6COfferApprovalWorkflow"("organization_id");
CREATE INDEX "P6C015_seed_idx" ON "Phase6COfferApprovalWorkflow"("organization_id", "source_seed_id");
ALTER TABLE "Phase6COfferApprovalWorkflow" ADD CONSTRAINT "P6C015_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6COfferAcceptanceEmployeeCreationRequest" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "person_ref" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C016_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C016_org_id_key" ON "Phase6COfferAcceptanceEmployeeCreationRequest"("organization_id", "id");
CREATE INDEX "P6C016_org_idx" ON "Phase6COfferAcceptanceEmployeeCreationRequest"("organization_id");
CREATE INDEX "P6C016_seed_idx" ON "Phase6COfferAcceptanceEmployeeCreationRequest"("organization_id", "source_seed_id");
CREATE INDEX "P6C016_person_idx" ON "Phase6COfferAcceptanceEmployeeCreationRequest"("organization_id", "person_ref");
ALTER TABLE "Phase6COfferAcceptanceEmployeeCreationRequest" ADD CONSTRAINT "P6C016_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6COnboardingTaskTemplate" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C017_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C017_org_id_key" ON "Phase6COnboardingTaskTemplate"("organization_id", "id");
CREATE INDEX "P6C017_org_idx" ON "Phase6COnboardingTaskTemplate"("organization_id");
CREATE INDEX "P6C017_seed_idx" ON "Phase6COnboardingTaskTemplate"("organization_id", "source_seed_id");
ALTER TABLE "Phase6COnboardingTaskTemplate" ADD CONSTRAINT "P6C017_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CAccessProvisioningGatekeeperEvent" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C018_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C018_org_id_key" ON "Phase6CAccessProvisioningGatekeeperEvent"("organization_id", "id");
CREATE INDEX "P6C018_org_idx" ON "Phase6CAccessProvisioningGatekeeperEvent"("organization_id");
CREATE INDEX "P6C018_seed_idx" ON "Phase6CAccessProvisioningGatekeeperEvent"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CAccessProvisioningGatekeeperEvent" ADD CONSTRAINT "P6C018_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CBackgroundCheckProviderBoundary" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C019_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C019_org_id_key" ON "Phase6CBackgroundCheckProviderBoundary"("organization_id", "id");
CREATE INDEX "P6C019_org_idx" ON "Phase6CBackgroundCheckProviderBoundary"("organization_id");
CREATE INDEX "P6C019_seed_idx" ON "Phase6CBackgroundCheckProviderBoundary"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CBackgroundCheckProviderBoundary" ADD CONSTRAINT "P6C019_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6COfferDocumentGeneration" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C020_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C020_org_id_key" ON "Phase6COfferDocumentGeneration"("organization_id", "id");
CREATE INDEX "P6C020_org_idx" ON "Phase6COfferDocumentGeneration"("organization_id");
CREATE INDEX "P6C020_seed_idx" ON "Phase6COfferDocumentGeneration"("organization_id", "source_seed_id");
ALTER TABLE "Phase6COfferDocumentGeneration" ADD CONSTRAINT "P6C020_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CApplicantStagedDeletion" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "person_ref" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C021_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C021_org_id_key" ON "Phase6CApplicantStagedDeletion"("organization_id", "id");
CREATE INDEX "P6C021_org_idx" ON "Phase6CApplicantStagedDeletion"("organization_id");
CREATE INDEX "P6C021_seed_idx" ON "Phase6CApplicantStagedDeletion"("organization_id", "source_seed_id");
CREATE INDEX "P6C021_person_idx" ON "Phase6CApplicantStagedDeletion"("organization_id", "person_ref");
ALTER TABLE "Phase6CApplicantStagedDeletion" ADD CONSTRAINT "P6C021_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CApplicantDedupLinkage" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "person_ref" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C022_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C022_org_id_key" ON "Phase6CApplicantDedupLinkage"("organization_id", "id");
CREATE INDEX "P6C022_org_idx" ON "Phase6CApplicantDedupLinkage"("organization_id");
CREATE INDEX "P6C022_seed_idx" ON "Phase6CApplicantDedupLinkage"("organization_id", "source_seed_id");
CREATE INDEX "P6C022_person_idx" ON "Phase6CApplicantDedupLinkage"("organization_id", "person_ref");
ALTER TABLE "Phase6CApplicantDedupLinkage" ADD CONSTRAINT "P6C022_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CRecruitmentEvidenceFeed" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C023_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C023_org_id_key" ON "Phase6CRecruitmentEvidenceFeed"("organization_id", "id");
CREATE INDEX "P6C023_org_idx" ON "Phase6CRecruitmentEvidenceFeed"("organization_id");
CREATE INDEX "P6C023_seed_idx" ON "Phase6CRecruitmentEvidenceFeed"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CRecruitmentEvidenceFeed" ADD CONSTRAINT "P6C023_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CQrAttendance" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C024_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C024_org_id_key" ON "Phase6CQrAttendance"("organization_id", "id");
CREATE INDEX "P6C024_org_idx" ON "Phase6CQrAttendance"("organization_id");
CREATE INDEX "P6C024_seed_idx" ON "Phase6CQrAttendance"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CQrAttendance" ADD CONSTRAINT "P6C024_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CBiometricDeviceBoundary" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C025_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C025_org_id_key" ON "Phase6CBiometricDeviceBoundary"("organization_id", "id");
CREATE INDEX "P6C025_org_idx" ON "Phase6CBiometricDeviceBoundary"("organization_id");
CREATE INDEX "P6C025_seed_idx" ON "Phase6CBiometricDeviceBoundary"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CBiometricDeviceBoundary" ADD CONSTRAINT "P6C025_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CRfidNfcAttendance" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C026_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C026_org_id_key" ON "Phase6CRfidNfcAttendance"("organization_id", "id");
CREATE INDEX "P6C026_org_idx" ON "Phase6CRfidNfcAttendance"("organization_id");
CREATE INDEX "P6C026_seed_idx" ON "Phase6CRfidNfcAttendance"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CRfidNfcAttendance" ADD CONSTRAINT "P6C026_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CMobileGpsAttendance" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C027_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C027_org_id_key" ON "Phase6CMobileGpsAttendance"("organization_id", "id");
CREATE INDEX "P6C027_org_idx" ON "Phase6CMobileGpsAttendance"("organization_id");
CREATE INDEX "P6C027_seed_idx" ON "Phase6CMobileGpsAttendance"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CMobileGpsAttendance" ADD CONSTRAINT "P6C027_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CManualAttendanceOverride" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C028_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C028_org_id_key" ON "Phase6CManualAttendanceOverride"("organization_id", "id");
CREATE INDEX "P6C028_org_idx" ON "Phase6CManualAttendanceOverride"("organization_id");
CREATE INDEX "P6C028_seed_idx" ON "Phase6CManualAttendanceOverride"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CManualAttendanceOverride" ADD CONSTRAINT "P6C028_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6COfflineAttendanceQueue" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C029_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C029_org_id_key" ON "Phase6COfflineAttendanceQueue"("organization_id", "id");
CREATE INDEX "P6C029_org_idx" ON "Phase6COfflineAttendanceQueue"("organization_id");
CREATE INDEX "P6C029_seed_idx" ON "Phase6COfflineAttendanceQueue"("organization_id", "source_seed_id");
ALTER TABLE "Phase6COfflineAttendanceQueue" ADD CONSTRAINT "P6C029_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CAttendanceExceptionDetection" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C030_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C030_org_id_key" ON "Phase6CAttendanceExceptionDetection"("organization_id", "id");
CREATE INDEX "P6C030_org_idx" ON "Phase6CAttendanceExceptionDetection"("organization_id");
CREATE INDEX "P6C030_seed_idx" ON "Phase6CAttendanceExceptionDetection"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CAttendanceExceptionDetection" ADD CONSTRAINT "P6C030_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CShiftRoster" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C031_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C031_org_id_key" ON "Phase6CShiftRoster"("organization_id", "id");
CREATE INDEX "P6C031_org_idx" ON "Phase6CShiftRoster"("organization_id");
CREATE INDEX "P6C031_seed_idx" ON "Phase6CShiftRoster"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CShiftRoster" ADD CONSTRAINT "P6C031_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CHolidayCalendar" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C032_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C032_org_id_key" ON "Phase6CHolidayCalendar"("organization_id", "id");
CREATE INDEX "P6C032_org_idx" ON "Phase6CHolidayCalendar"("organization_id");
CREATE INDEX "P6C032_seed_idx" ON "Phase6CHolidayCalendar"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CHolidayCalendar" ADD CONSTRAINT "P6C032_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CLeaveTypeRegistry" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C033_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C033_org_id_key" ON "Phase6CLeaveTypeRegistry"("organization_id", "id");
CREATE INDEX "P6C033_org_idx" ON "Phase6CLeaveTypeRegistry"("organization_id");
CREATE INDEX "P6C033_seed_idx" ON "Phase6CLeaveTypeRegistry"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CLeaveTypeRegistry" ADD CONSTRAINT "P6C033_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CLeaveAccrualEngine" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C034_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C034_org_id_key" ON "Phase6CLeaveAccrualEngine"("organization_id", "id");
CREATE INDEX "P6C034_org_idx" ON "Phase6CLeaveAccrualEngine"("organization_id");
CREATE INDEX "P6C034_seed_idx" ON "Phase6CLeaveAccrualEngine"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CLeaveAccrualEngine" ADD CONSTRAINT "P6C034_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CLeaveCarryforwardExpiry" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C035_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C035_org_id_key" ON "Phase6CLeaveCarryforwardExpiry"("organization_id", "id");
CREATE INDEX "P6C035_org_idx" ON "Phase6CLeaveCarryforwardExpiry"("organization_id");
CREATE INDEX "P6C035_seed_idx" ON "Phase6CLeaveCarryforwardExpiry"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CLeaveCarryforwardExpiry" ADD CONSTRAINT "P6C035_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CLeaveEncashment" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C036_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C036_org_id_key" ON "Phase6CLeaveEncashment"("organization_id", "id");
CREATE INDEX "P6C036_org_idx" ON "Phase6CLeaveEncashment"("organization_id");
CREATE INDEX "P6C036_seed_idx" ON "Phase6CLeaveEncashment"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CLeaveEncashment" ADD CONSTRAINT "P6C036_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CLeaveApprovalChain" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C037_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C037_org_id_key" ON "Phase6CLeaveApprovalChain"("organization_id", "id");
CREATE INDEX "P6C037_org_idx" ON "Phase6CLeaveApprovalChain"("organization_id");
CREATE INDEX "P6C037_seed_idx" ON "Phase6CLeaveApprovalChain"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CLeaveApprovalChain" ADD CONSTRAINT "P6C037_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CPayrollInputEvidence" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C038_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C038_org_id_key" ON "Phase6CPayrollInputEvidence"("organization_id", "id");
CREATE INDEX "P6C038_org_idx" ON "Phase6CPayrollInputEvidence"("organization_id");
CREATE INDEX "P6C038_seed_idx" ON "Phase6CPayrollInputEvidence"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CPayrollInputEvidence" ADD CONSTRAINT "P6C038_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CAttendanceLocationRedaction" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C039_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C039_org_id_key" ON "Phase6CAttendanceLocationRedaction"("organization_id", "id");
CREATE INDEX "P6C039_org_idx" ON "Phase6CAttendanceLocationRedaction"("organization_id");
CREATE INDEX "P6C039_seed_idx" ON "Phase6CAttendanceLocationRedaction"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CAttendanceLocationRedaction" ADD CONSTRAINT "P6C039_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CPerformanceFramework" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C040_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C040_org_id_key" ON "Phase6CPerformanceFramework"("organization_id", "id");
CREATE INDEX "P6C040_org_idx" ON "Phase6CPerformanceFramework"("organization_id");
CREATE INDEX "P6C040_seed_idx" ON "Phase6CPerformanceFramework"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CPerformanceFramework" ADD CONSTRAINT "P6C040_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CWeightedGoalReviewCycle" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C041_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C041_org_id_key" ON "Phase6CWeightedGoalReviewCycle"("organization_id", "id");
CREATE INDEX "P6C041_org_idx" ON "Phase6CWeightedGoalReviewCycle"("organization_id");
CREATE INDEX "P6C041_seed_idx" ON "Phase6CWeightedGoalReviewCycle"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CWeightedGoalReviewCycle" ADD CONSTRAINT "P6C041_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CAtRiskRulesEngine" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C042_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C042_org_id_key" ON "Phase6CAtRiskRulesEngine"("organization_id", "id");
CREATE INDEX "P6C042_org_idx" ON "Phase6CAtRiskRulesEngine"("organization_id");
CREATE INDEX "P6C042_seed_idx" ON "Phase6CAtRiskRulesEngine"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CAtRiskRulesEngine" ADD CONSTRAINT "P6C042_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CCommissionCalculation" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C043_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C043_org_id_key" ON "Phase6CCommissionCalculation"("organization_id", "id");
CREATE INDEX "P6C043_org_idx" ON "Phase6CCommissionCalculation"("organization_id");
CREATE INDEX "P6C043_seed_idx" ON "Phase6CCommissionCalculation"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CCommissionCalculation" ADD CONSTRAINT "P6C043_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CCommissionDeferredRelease" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C044_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C044_org_id_key" ON "Phase6CCommissionDeferredRelease"("organization_id", "id");
CREATE INDEX "P6C044_org_idx" ON "Phase6CCommissionDeferredRelease"("organization_id");
CREATE INDEX "P6C044_seed_idx" ON "Phase6CCommissionDeferredRelease"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CCommissionDeferredRelease" ADD CONSTRAINT "P6C044_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CCommissionClawbackReversal" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C045_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C045_org_id_key" ON "Phase6CCommissionClawbackReversal"("organization_id", "id");
CREATE INDEX "P6C045_org_idx" ON "Phase6CCommissionClawbackReversal"("organization_id");
CREATE INDEX "P6C045_seed_idx" ON "Phase6CCommissionClawbackReversal"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CCommissionClawbackReversal" ADD CONSTRAINT "P6C045_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CCommissionTierAccelerator" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C046_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C046_org_id_key" ON "Phase6CCommissionTierAccelerator"("organization_id", "id");
CREATE INDEX "P6C046_org_idx" ON "Phase6CCommissionTierAccelerator"("organization_id");
CREATE INDEX "P6C046_seed_idx" ON "Phase6CCommissionTierAccelerator"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CCommissionTierAccelerator" ADD CONSTRAINT "P6C046_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CCommissionPoolDistribution" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C047_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C047_org_id_key" ON "Phase6CCommissionPoolDistribution"("organization_id", "id");
CREATE INDEX "P6C047_org_idx" ON "Phase6CCommissionPoolDistribution"("organization_id");
CREATE INDEX "P6C047_seed_idx" ON "Phase6CCommissionPoolDistribution"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CCommissionPoolDistribution" ADD CONSTRAINT "P6C047_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CCommissionPayrollBatchEvent" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C048_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C048_org_id_key" ON "Phase6CCommissionPayrollBatchEvent"("organization_id", "id");
CREATE INDEX "P6C048_org_idx" ON "Phase6CCommissionPayrollBatchEvent"("organization_id");
CREATE INDEX "P6C048_seed_idx" ON "Phase6CCommissionPayrollBatchEvent"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CCommissionPayrollBatchEvent" ADD CONSTRAINT "P6C048_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CPolicyVersionLibrary" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C049_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C049_org_id_key" ON "Phase6CPolicyVersionLibrary"("organization_id", "id");
CREATE INDEX "P6C049_org_idx" ON "Phase6CPolicyVersionLibrary"("organization_id");
CREATE INDEX "P6C049_seed_idx" ON "Phase6CPolicyVersionLibrary"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CPolicyVersionLibrary" ADD CONSTRAINT "P6C049_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CPolicyAcknowledgementEvidence" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C050_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C050_org_id_key" ON "Phase6CPolicyAcknowledgementEvidence"("organization_id", "id");
CREATE INDEX "P6C050_org_idx" ON "Phase6CPolicyAcknowledgementEvidence"("organization_id");
CREATE INDEX "P6C050_seed_idx" ON "Phase6CPolicyAcknowledgementEvidence"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CPolicyAcknowledgementEvidence" ADD CONSTRAINT "P6C050_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6COffboardingSaga" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C051_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C051_org_id_key" ON "Phase6COffboardingSaga"("organization_id", "id");
CREATE INDEX "P6C051_org_idx" ON "Phase6COffboardingSaga"("organization_id");
CREATE INDEX "P6C051_seed_idx" ON "Phase6COffboardingSaga"("organization_id", "source_seed_id");
ALTER TABLE "Phase6COffboardingSaga" ADD CONSTRAINT "P6C051_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6COffboardingSettlementStep" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C052_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C052_org_id_key" ON "Phase6COffboardingSettlementStep"("organization_id", "id");
CREATE INDEX "P6C052_org_idx" ON "Phase6COffboardingSettlementStep"("organization_id");
CREATE INDEX "P6C052_seed_idx" ON "Phase6COffboardingSettlementStep"("organization_id", "source_seed_id");
ALTER TABLE "Phase6COffboardingSettlementStep" ADD CONSTRAINT "P6C052_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6COffboardingAssetRecoveryStep" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C053_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C053_org_id_key" ON "Phase6COffboardingAssetRecoveryStep"("organization_id", "id");
CREATE INDEX "P6C053_org_idx" ON "Phase6COffboardingAssetRecoveryStep"("organization_id");
CREATE INDEX "P6C053_seed_idx" ON "Phase6COffboardingAssetRecoveryStep"("organization_id", "source_seed_id");
ALTER TABLE "Phase6COffboardingAssetRecoveryStep" ADD CONSTRAINT "P6C053_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6COffboardingWorkspaceRemovalStep" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C054_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C054_org_id_key" ON "Phase6COffboardingWorkspaceRemovalStep"("organization_id", "id");
CREATE INDEX "P6C054_org_idx" ON "Phase6COffboardingWorkspaceRemovalStep"("organization_id");
CREATE INDEX "P6C054_seed_idx" ON "Phase6COffboardingWorkspaceRemovalStep"("organization_id", "source_seed_id");
ALTER TABLE "Phase6COffboardingWorkspaceRemovalStep" ADD CONSTRAINT "P6C054_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6COffboardingAccessRevocationGatekeeper" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C055_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C055_org_id_key" ON "Phase6COffboardingAccessRevocationGatekeeper"("organization_id", "id");
CREATE INDEX "P6C055_org_idx" ON "Phase6COffboardingAccessRevocationGatekeeper"("organization_id");
CREATE INDEX "P6C055_seed_idx" ON "Phase6COffboardingAccessRevocationGatekeeper"("organization_id", "source_seed_id");
ALTER TABLE "Phase6COffboardingAccessRevocationGatekeeper" ADD CONSTRAINT "P6C055_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6COffboardingPayrollClosureStep" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C056_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C056_org_id_key" ON "Phase6COffboardingPayrollClosureStep"("organization_id", "id");
CREATE INDEX "P6C056_org_idx" ON "Phase6COffboardingPayrollClosureStep"("organization_id");
CREATE INDEX "P6C056_seed_idx" ON "Phase6COffboardingPayrollClosureStep"("organization_id", "source_seed_id");
ALTER TABLE "Phase6COffboardingPayrollClosureStep" ADD CONSTRAINT "P6C056_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CWorkspaceChannelDm" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C057_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C057_org_id_key" ON "Phase6CWorkspaceChannelDm"("organization_id", "id");
CREATE INDEX "P6C057_org_idx" ON "Phase6CWorkspaceChannelDm"("organization_id");
CREATE INDEX "P6C057_seed_idx" ON "Phase6CWorkspaceChannelDm"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CWorkspaceChannelDm" ADD CONSTRAINT "P6C057_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CMessageThreadReaction" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C058_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C058_org_id_key" ON "Phase6CMessageThreadReaction"("organization_id", "id");
CREATE INDEX "P6C058_org_idx" ON "Phase6CMessageThreadReaction"("organization_id");
CREATE INDEX "P6C058_seed_idx" ON "Phase6CMessageThreadReaction"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CMessageThreadReaction" ADD CONSTRAINT "P6C058_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CMessageEditHistory" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C059_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C059_org_id_key" ON "Phase6CMessageEditHistory"("organization_id", "id");
CREATE INDEX "P6C059_org_idx" ON "Phase6CMessageEditHistory"("organization_id");
CREATE INDEX "P6C059_seed_idx" ON "Phase6CMessageEditHistory"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CMessageEditHistory" ADD CONSTRAINT "P6C059_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CMessageTombstoneStagedDeletion" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C060_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C060_org_id_key" ON "Phase6CMessageTombstoneStagedDeletion"("organization_id", "id");
CREATE INDEX "P6C060_org_idx" ON "Phase6CMessageTombstoneStagedDeletion"("organization_id");
CREATE INDEX "P6C060_seed_idx" ON "Phase6CMessageTombstoneStagedDeletion"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CMessageTombstoneStagedDeletion" ADD CONSTRAINT "P6C060_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CMessageAttachmentFileRef" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C061_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C061_org_id_key" ON "Phase6CMessageAttachmentFileRef"("organization_id", "id");
CREATE INDEX "P6C061_org_idx" ON "Phase6CMessageAttachmentFileRef"("organization_id");
CREATE INDEX "P6C061_seed_idx" ON "Phase6CMessageAttachmentFileRef"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CMessageAttachmentFileRef" ADD CONSTRAINT "P6C061_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6COutboundNotificationGateway" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C062_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C062_org_id_key" ON "Phase6COutboundNotificationGateway"("organization_id", "id");
CREATE INDEX "P6C062_org_idx" ON "Phase6COutboundNotificationGateway"("organization_id");
CREATE INDEX "P6C062_seed_idx" ON "Phase6COutboundNotificationGateway"("organization_id", "source_seed_id");
ALTER TABLE "Phase6COutboundNotificationGateway" ADD CONSTRAINT "P6C062_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CMentionNotificationEvidence" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C063_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C063_org_id_key" ON "Phase6CMentionNotificationEvidence"("organization_id", "id");
CREATE INDEX "P6C063_org_idx" ON "Phase6CMentionNotificationEvidence"("organization_id");
CREATE INDEX "P6C063_seed_idx" ON "Phase6CMentionNotificationEvidence"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CMentionNotificationEvidence" ADD CONSTRAINT "P6C063_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CMembershipPolicy" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C064_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C064_org_id_key" ON "Phase6CMembershipPolicy"("organization_id", "id");
CREATE INDEX "P6C064_org_idx" ON "Phase6CMembershipPolicy"("organization_id");
CREATE INDEX "P6C064_seed_idx" ON "Phase6CMembershipPolicy"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CMembershipPolicy" ADD CONSTRAINT "P6C064_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CPrivateChannelApproval" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C065_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C065_org_id_key" ON "Phase6CPrivateChannelApproval"("organization_id", "id");
CREATE INDEX "P6C065_org_idx" ON "Phase6CPrivateChannelApproval"("organization_id");
CREATE INDEX "P6C065_seed_idx" ON "Phase6CPrivateChannelApproval"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CPrivateChannelApproval" ADD CONSTRAINT "P6C065_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CCrossModuleChannelRef" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C066_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C066_org_id_key" ON "Phase6CCrossModuleChannelRef"("organization_id", "id");
CREATE INDEX "P6C066_org_idx" ON "Phase6CCrossModuleChannelRef"("organization_id");
CREATE INDEX "P6C066_seed_idx" ON "Phase6CCrossModuleChannelRef"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CCrossModuleChannelRef" ADD CONSTRAINT "P6C066_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CWorkspaceMessageSearch" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C067_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C067_org_id_key" ON "Phase6CWorkspaceMessageSearch"("organization_id", "id");
CREATE INDEX "P6C067_org_idx" ON "Phase6CWorkspaceMessageSearch"("organization_id");
CREATE INDEX "P6C067_seed_idx" ON "Phase6CWorkspaceMessageSearch"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CWorkspaceMessageSearch" ADD CONSTRAINT "P6C067_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CModerationReporting" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C068_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C068_org_id_key" ON "Phase6CModerationReporting"("organization_id", "id");
CREATE INDEX "P6C068_org_idx" ON "Phase6CModerationReporting"("organization_id");
CREATE INDEX "P6C068_seed_idx" ON "Phase6CModerationReporting"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CModerationReporting" ADD CONSTRAINT "P6C068_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CE2eEncryptionBoundary" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C069_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C069_org_id_key" ON "Phase6CE2eEncryptionBoundary"("organization_id", "id");
CREATE INDEX "P6C069_org_idx" ON "Phase6CE2eEncryptionBoundary"("organization_id");
CREATE INDEX "P6C069_seed_idx" ON "Phase6CE2eEncryptionBoundary"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CE2eEncryptionBoundary" ADD CONSTRAINT "P6C069_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CTaskRecord" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C070_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C070_org_id_key" ON "Phase6CTaskRecord"("organization_id", "id");
CREATE INDEX "P6C070_org_idx" ON "Phase6CTaskRecord"("organization_id");
CREATE INDEX "P6C070_seed_idx" ON "Phase6CTaskRecord"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CTaskRecord" ADD CONSTRAINT "P6C070_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CTaskStatusConfig" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C071_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C071_org_id_key" ON "Phase6CTaskStatusConfig"("organization_id", "id");
CREATE INDEX "P6C071_org_idx" ON "Phase6CTaskStatusConfig"("organization_id");
CREATE INDEX "P6C071_seed_idx" ON "Phase6CTaskStatusConfig"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CTaskStatusConfig" ADD CONSTRAINT "P6C071_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CProjectRecord" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C072_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C072_org_id_key" ON "Phase6CProjectRecord"("organization_id", "id");
CREATE INDEX "P6C072_org_idx" ON "Phase6CProjectRecord"("organization_id");
CREATE INDEX "P6C072_seed_idx" ON "Phase6CProjectRecord"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CProjectRecord" ADD CONSTRAINT "P6C072_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CProjectDependencyEngine" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C073_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C073_org_id_key" ON "Phase6CProjectDependencyEngine"("organization_id", "id");
CREATE INDEX "P6C073_org_idx" ON "Phase6CProjectDependencyEngine"("organization_id");
CREATE INDEX "P6C073_seed_idx" ON "Phase6CProjectDependencyEngine"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CProjectDependencyEngine" ADD CONSTRAINT "P6C073_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CProjectBudgetEvidenceRef" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C074_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C074_org_id_key" ON "Phase6CProjectBudgetEvidenceRef"("organization_id", "id");
CREATE INDEX "P6C074_org_idx" ON "Phase6CProjectBudgetEvidenceRef"("organization_id");
CREATE INDEX "P6C074_seed_idx" ON "Phase6CProjectBudgetEvidenceRef"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CProjectBudgetEvidenceRef" ADD CONSTRAINT "P6C074_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CWikiPageVersioning" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C075_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C075_org_id_key" ON "Phase6CWikiPageVersioning"("organization_id", "id");
CREATE INDEX "P6C075_org_idx" ON "Phase6CWikiPageVersioning"("organization_id");
CREATE INDEX "P6C075_seed_idx" ON "Phase6CWikiPageVersioning"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CWikiPageVersioning" ADD CONSTRAINT "P6C075_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CWikiRestore" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C076_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C076_org_id_key" ON "Phase6CWikiRestore"("organization_id", "id");
CREATE INDEX "P6C076_org_idx" ON "Phase6CWikiRestore"("organization_id");
CREATE INDEX "P6C076_seed_idx" ON "Phase6CWikiRestore"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CWikiRestore" ADD CONSTRAINT "P6C076_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CDocumentFolderFileRef" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C077_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C077_org_id_key" ON "Phase6CDocumentFolderFileRef"("organization_id", "id");
CREATE INDEX "P6C077_org_idx" ON "Phase6CDocumentFolderFileRef"("organization_id");
CREATE INDEX "P6C077_seed_idx" ON "Phase6CDocumentFolderFileRef"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CDocumentFolderFileRef" ADD CONSTRAINT "P6C077_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CTimeLogEvidence" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C078_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C078_org_id_key" ON "Phase6CTimeLogEvidence"("organization_id", "id");
CREATE INDEX "P6C078_org_idx" ON "Phase6CTimeLogEvidence"("organization_id");
CREATE INDEX "P6C078_seed_idx" ON "Phase6CTimeLogEvidence"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CTimeLogEvidence" ADD CONSTRAINT "P6C078_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CTaskReminderGateway" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C079_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C079_org_id_key" ON "Phase6CTaskReminderGateway"("organization_id", "id");
CREATE INDEX "P6C079_org_idx" ON "Phase6CTaskReminderGateway"("organization_id");
CREATE INDEX "P6C079_seed_idx" ON "Phase6CTaskReminderGateway"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CTaskReminderGateway" ADD CONSTRAINT "P6C079_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CProjectTemplate" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C080_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C080_org_id_key" ON "Phase6CProjectTemplate"("organization_id", "id");
CREATE INDEX "P6C080_org_idx" ON "Phase6CProjectTemplate"("organization_id");
CREATE INDEX "P6C080_seed_idx" ON "Phase6CProjectTemplate"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CProjectTemplate" ADD CONSTRAINT "P6C080_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CTenantAuthoredKnowledge" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C081_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C081_org_id_key" ON "Phase6CTenantAuthoredKnowledge"("organization_id", "id");
CREATE INDEX "P6C081_org_idx" ON "Phase6CTenantAuthoredKnowledge"("organization_id");
CREATE INDEX "P6C081_seed_idx" ON "Phase6CTenantAuthoredKnowledge"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CTenantAuthoredKnowledge" ADD CONSTRAINT "P6C081_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CTaskProjectCalendarEvent" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C082_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C082_org_id_key" ON "Phase6CTaskProjectCalendarEvent"("organization_id", "id");
CREATE INDEX "P6C082_org_idx" ON "Phase6CTaskProjectCalendarEvent"("organization_id");
CREATE INDEX "P6C082_seed_idx" ON "Phase6CTaskProjectCalendarEvent"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CTaskProjectCalendarEvent" ADD CONSTRAINT "P6C082_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CProviderNeutralCalendarEntry" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C083_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C083_org_id_key" ON "Phase6CProviderNeutralCalendarEntry"("organization_id", "id");
CREATE INDEX "P6C083_org_idx" ON "Phase6CProviderNeutralCalendarEntry"("organization_id");
CREATE INDEX "P6C083_seed_idx" ON "Phase6CProviderNeutralCalendarEntry"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CProviderNeutralCalendarEntry" ADD CONSTRAINT "P6C083_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CCalendarProviderSyncBoundary" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C084_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C084_org_id_key" ON "Phase6CCalendarProviderSyncBoundary"("organization_id", "id");
CREATE INDEX "P6C084_org_idx" ON "Phase6CCalendarProviderSyncBoundary"("organization_id");
CREATE INDEX "P6C084_seed_idx" ON "Phase6CCalendarProviderSyncBoundary"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CCalendarProviderSyncBoundary" ADD CONSTRAINT "P6C084_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CConferencingProviderBoundary" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C085_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C085_org_id_key" ON "Phase6CConferencingProviderBoundary"("organization_id", "id");
CREATE INDEX "P6C085_org_idx" ON "Phase6CConferencingProviderBoundary"("organization_id");
CREATE INDEX "P6C085_seed_idx" ON "Phase6CConferencingProviderBoundary"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CConferencingProviderBoundary" ADD CONSTRAINT "P6C085_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CRoomBookingConflict" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C086_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C086_org_id_key" ON "Phase6CRoomBookingConflict"("organization_id", "id");
CREATE INDEX "P6C086_org_idx" ON "Phase6CRoomBookingConflict"("organization_id");
CREATE INDEX "P6C086_seed_idx" ON "Phase6CRoomBookingConflict"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CRoomBookingConflict" ADD CONSTRAINT "P6C086_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CResourceCapacityEquipment" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C087_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C087_org_id_key" ON "Phase6CResourceCapacityEquipment"("organization_id", "id");
CREATE INDEX "P6C087_org_idx" ON "Phase6CResourceCapacityEquipment"("organization_id");
CREATE INDEX "P6C087_seed_idx" ON "Phase6CResourceCapacityEquipment"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CResourceCapacityEquipment" ADD CONSTRAINT "P6C087_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CAnnouncementGateway" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C088_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C088_org_id_key" ON "Phase6CAnnouncementGateway"("organization_id", "id");
CREATE INDEX "P6C088_org_idx" ON "Phase6CAnnouncementGateway"("organization_id");
CREATE INDEX "P6C088_seed_idx" ON "Phase6CAnnouncementGateway"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CAnnouncementGateway" ADD CONSTRAINT "P6C088_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CMandatoryNoticeClassification" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C089_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C089_org_id_key" ON "Phase6CMandatoryNoticeClassification"("organization_id", "id");
CREATE INDEX "P6C089_org_idx" ON "Phase6CMandatoryNoticeClassification"("organization_id");
CREATE INDEX "P6C089_seed_idx" ON "Phase6CMandatoryNoticeClassification"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CMandatoryNoticeClassification" ADD CONSTRAINT "P6C089_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CReminderQuietHours" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C090_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C090_org_id_key" ON "Phase6CReminderQuietHours"("organization_id", "id");
CREATE INDEX "P6C090_org_idx" ON "Phase6CReminderQuietHours"("organization_id");
CREATE INDEX "P6C090_seed_idx" ON "Phase6CReminderQuietHours"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CReminderQuietHours" ADD CONSTRAINT "P6C090_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CRecurringEventRule" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C091_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C091_org_id_key" ON "Phase6CRecurringEventRule"("organization_id", "id");
CREATE INDEX "P6C091_org_idx" ON "Phase6CRecurringEventRule"("organization_id");
CREATE INDEX "P6C091_seed_idx" ON "Phase6CRecurringEventRule"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CRecurringEventRule" ADD CONSTRAINT "P6C091_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CCalendarOriginEventRef" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C092_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C092_org_id_key" ON "Phase6CCalendarOriginEventRef"("organization_id", "id");
CREATE INDEX "P6C092_org_idx" ON "Phase6CCalendarOriginEventRef"("organization_id");
CREATE INDEX "P6C092_seed_idx" ON "Phase6CCalendarOriginEventRef"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CCalendarOriginEventRef" ADD CONSTRAINT "P6C092_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CMeetingAttendanceEvidence" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C093_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C093_org_id_key" ON "Phase6CMeetingAttendanceEvidence"("organization_id", "id");
CREATE INDEX "P6C093_org_idx" ON "Phase6CMeetingAttendanceEvidence"("organization_id");
CREATE INDEX "P6C093_seed_idx" ON "Phase6CMeetingAttendanceEvidence"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CMeetingAttendanceEvidence" ADD CONSTRAINT "P6C093_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CSyncFailureDegradation" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C094_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C094_org_id_key" ON "Phase6CSyncFailureDegradation"("organization_id", "id");
CREATE INDEX "P6C094_org_idx" ON "Phase6CSyncFailureDegradation"("organization_id");
CREATE INDEX "P6C094_seed_idx" ON "Phase6CSyncFailureDegradation"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CSyncFailureDegradation" ADD CONSTRAINT "P6C094_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CAnnouncementAckEvidence" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C095_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C095_org_id_key" ON "Phase6CAnnouncementAckEvidence"("organization_id", "id");
CREATE INDEX "P6C095_org_idx" ON "Phase6CAnnouncementAckEvidence"("organization_id");
CREATE INDEX "P6C095_seed_idx" ON "Phase6CAnnouncementAckEvidence"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CAnnouncementAckEvidence" ADD CONSTRAINT "P6C095_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CEventConfiguration" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C096_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C096_org_id_key" ON "Phase6CEventConfiguration"("organization_id", "id");
CREATE INDEX "P6C096_org_idx" ON "Phase6CEventConfiguration"("organization_id");
CREATE INDEX "P6C096_seed_idx" ON "Phase6CEventConfiguration"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CEventConfiguration" ADD CONSTRAINT "P6C096_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CEventSessionTrack" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C097_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C097_org_id_key" ON "Phase6CEventSessionTrack"("organization_id", "id");
CREATE INDEX "P6C097_org_idx" ON "Phase6CEventSessionTrack"("organization_id");
CREATE INDEX "P6C097_seed_idx" ON "Phase6CEventSessionTrack"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CEventSessionTrack" ADD CONSTRAINT "P6C097_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CSpeakerHonorariumRef" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C098_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C098_org_id_key" ON "Phase6CSpeakerHonorariumRef"("organization_id", "id");
CREATE INDEX "P6C098_org_idx" ON "Phase6CSpeakerHonorariumRef"("organization_id");
CREATE INDEX "P6C098_seed_idx" ON "Phase6CSpeakerHonorariumRef"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CSpeakerHonorariumRef" ADD CONSTRAINT "P6C098_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CTicketTypeCapacity" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C099_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C099_org_id_key" ON "Phase6CTicketTypeCapacity"("organization_id", "id");
CREATE INDEX "P6C099_org_idx" ON "Phase6CTicketTypeCapacity"("organization_id");
CREATE INDEX "P6C099_seed_idx" ON "Phase6CTicketTypeCapacity"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CTicketTypeCapacity" ADD CONSTRAINT "P6C099_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CRegistrationFormConfig" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C100_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C100_org_id_key" ON "Phase6CRegistrationFormConfig"("organization_id", "id");
CREATE INDEX "P6C100_org_idx" ON "Phase6CRegistrationFormConfig"("organization_id");
CREATE INDEX "P6C100_seed_idx" ON "Phase6CRegistrationFormConfig"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CRegistrationFormConfig" ADD CONSTRAINT "P6C100_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CWaitlistRule" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C101_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C101_org_id_key" ON "Phase6CWaitlistRule"("organization_id", "id");
CREATE INDEX "P6C101_org_idx" ON "Phase6CWaitlistRule"("organization_id");
CREATE INDEX "P6C101_seed_idx" ON "Phase6CWaitlistRule"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CWaitlistRule" ADD CONSTRAINT "P6C101_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CWaitlistAutoPromotionTimer" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C102_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C102_org_id_key" ON "Phase6CWaitlistAutoPromotionTimer"("organization_id", "id");
CREATE INDEX "P6C102_org_idx" ON "Phase6CWaitlistAutoPromotionTimer"("organization_id");
CREATE INDEX "P6C102_seed_idx" ON "Phase6CWaitlistAutoPromotionTimer"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CWaitlistAutoPromotionTimer" ADD CONSTRAINT "P6C102_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CTicketClaimDeadline" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C103_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C103_org_id_key" ON "Phase6CTicketClaimDeadline"("organization_id", "id");
CREATE INDEX "P6C103_org_idx" ON "Phase6CTicketClaimDeadline"("organization_id");
CREATE INDEX "P6C103_seed_idx" ON "Phase6CTicketClaimDeadline"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CTicketClaimDeadline" ADD CONSTRAINT "P6C103_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CApprovalRequiredRegistration" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C104_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C104_org_id_key" ON "Phase6CApprovalRequiredRegistration"("organization_id", "id");
CREATE INDEX "P6C104_org_idx" ON "Phase6CApprovalRequiredRegistration"("organization_id");
CREATE INDEX "P6C104_seed_idx" ON "Phase6CApprovalRequiredRegistration"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CApprovalRequiredRegistration" ADD CONSTRAINT "P6C104_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CEventCalendarScheduleRef" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C105_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C105_org_id_key" ON "Phase6CEventCalendarScheduleRef"("organization_id", "id");
CREATE INDEX "P6C105_org_idx" ON "Phase6CEventCalendarScheduleRef"("organization_id");
CREATE INDEX "P6C105_seed_idx" ON "Phase6CEventCalendarScheduleRef"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CEventCalendarScheduleRef" ADD CONSTRAINT "P6C105_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CAttendeeCrmLeadLink" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "person_ref" TEXT,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C106_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C106_org_id_key" ON "Phase6CAttendeeCrmLeadLink"("organization_id", "id");
CREATE INDEX "P6C106_org_idx" ON "Phase6CAttendeeCrmLeadLink"("organization_id");
CREATE INDEX "P6C106_seed_idx" ON "Phase6CAttendeeCrmLeadLink"("organization_id", "source_seed_id");
CREATE INDEX "P6C106_person_idx" ON "Phase6CAttendeeCrmLeadLink"("organization_id", "person_ref");
ALTER TABLE "Phase6CAttendeeCrmLeadLink" ADD CONSTRAINT "P6C106_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CEventLeadHandoff" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C107_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C107_org_id_key" ON "Phase6CEventLeadHandoff"("organization_id", "id");
CREATE INDEX "P6C107_org_idx" ON "Phase6CEventLeadHandoff"("organization_id");
CREATE INDEX "P6C107_seed_idx" ON "Phase6CEventLeadHandoff"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CEventLeadHandoff" ADD CONSTRAINT "P6C107_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CRegistrationInvoiceSaga" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C108_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C108_org_id_key" ON "Phase6CRegistrationInvoiceSaga"("organization_id", "id");
CREATE INDEX "P6C108_org_idx" ON "Phase6CRegistrationInvoiceSaga"("organization_id");
CREATE INDEX "P6C108_seed_idx" ON "Phase6CRegistrationInvoiceSaga"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CRegistrationInvoiceSaga" ADD CONSTRAINT "P6C108_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CRegistrationAttemptEvidence" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C109_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C109_org_id_key" ON "Phase6CRegistrationAttemptEvidence"("organization_id", "id");
CREATE INDEX "P6C109_org_idx" ON "Phase6CRegistrationAttemptEvidence"("organization_id");
CREATE INDEX "P6C109_seed_idx" ON "Phase6CRegistrationAttemptEvidence"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CRegistrationAttemptEvidence" ADD CONSTRAINT "P6C109_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CCancellationRefundDelegation" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C110_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C110_org_id_key" ON "Phase6CCancellationRefundDelegation"("organization_id", "id");
CREATE INDEX "P6C110_org_idx" ON "Phase6CCancellationRefundDelegation"("organization_id");
CREATE INDEX "P6C110_seed_idx" ON "Phase6CCancellationRefundDelegation"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CCancellationRefundDelegation" ADD CONSTRAINT "P6C110_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CQrTicketIssuing" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C111_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C111_org_id_key" ON "Phase6CQrTicketIssuing"("organization_id", "id");
CREATE INDEX "P6C111_org_idx" ON "Phase6CQrTicketIssuing"("organization_id");
CREATE INDEX "P6C111_seed_idx" ON "Phase6CQrTicketIssuing"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CQrTicketIssuing" ADD CONSTRAINT "P6C111_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CSignedTicketToken" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C112_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C112_org_id_key" ON "Phase6CSignedTicketToken"("organization_id", "id");
CREATE INDEX "P6C112_org_idx" ON "Phase6CSignedTicketToken"("organization_id");
CREATE INDEX "P6C112_seed_idx" ON "Phase6CSignedTicketToken"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CSignedTicketToken" ADD CONSTRAINT "P6C112_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CCheckinTimeWindow" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C113_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C113_org_id_key" ON "Phase6CCheckinTimeWindow"("organization_id", "id");
CREATE INDEX "P6C113_org_idx" ON "Phase6CCheckinTimeWindow"("organization_id");
CREATE INDEX "P6C113_seed_idx" ON "Phase6CCheckinTimeWindow"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CCheckinTimeWindow" ADD CONSTRAINT "P6C113_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CKioskModeCheckin" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C114_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C114_org_id_key" ON "Phase6CKioskModeCheckin"("organization_id", "id");
CREATE INDEX "P6C114_org_idx" ON "Phase6CKioskModeCheckin"("organization_id");
CREATE INDEX "P6C114_seed_idx" ON "Phase6CKioskModeCheckin"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CKioskModeCheckin" ADD CONSTRAINT "P6C114_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CSessionLevelCheckin" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C115_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C115_org_id_key" ON "Phase6CSessionLevelCheckin"("organization_id", "id");
CREATE INDEX "P6C115_org_idx" ON "Phase6CSessionLevelCheckin"("organization_id");
CREATE INDEX "P6C115_seed_idx" ON "Phase6CSessionLevelCheckin"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CSessionLevelCheckin" ADD CONSTRAINT "P6C115_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CManualCheckinOverride" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C116_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C116_org_id_key" ON "Phase6CManualCheckinOverride"("organization_id", "id");
CREATE INDEX "P6C116_org_idx" ON "Phase6CManualCheckinOverride"("organization_id");
CREATE INDEX "P6C116_seed_idx" ON "Phase6CManualCheckinOverride"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CManualCheckinOverride" ADD CONSTRAINT "P6C116_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CDuplicateCheckinException" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C117_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C117_org_id_key" ON "Phase6CDuplicateCheckinException"("organization_id", "id");
CREATE INDEX "P6C117_org_idx" ON "Phase6CDuplicateCheckinException"("organization_id");
CREATE INDEX "P6C117_seed_idx" ON "Phase6CDuplicateCheckinException"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CDuplicateCheckinException" ADD CONSTRAINT "P6C117_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6COfflineCheckinQueue" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C118_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C118_org_id_key" ON "Phase6COfflineCheckinQueue"("organization_id", "id");
CREATE INDEX "P6C118_org_idx" ON "Phase6COfflineCheckinQueue"("organization_id");
CREATE INDEX "P6C118_seed_idx" ON "Phase6COfflineCheckinQueue"("organization_id", "source_seed_id");
ALTER TABLE "Phase6COfflineCheckinQueue" ADD CONSTRAINT "P6C118_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CBadgeExport" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C119_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C119_org_id_key" ON "Phase6CBadgeExport"("organization_id", "id");
CREATE INDEX "P6C119_org_idx" ON "Phase6CBadgeExport"("organization_id");
CREATE INDEX "P6C119_seed_idx" ON "Phase6CBadgeExport"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CBadgeExport" ADD CONSTRAINT "P6C119_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CPostEventFeedbackForm" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C120_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C120_org_id_key" ON "Phase6CPostEventFeedbackForm"("organization_id", "id");
CREATE INDEX "P6C120_org_idx" ON "Phase6CPostEventFeedbackForm"("organization_id");
CREATE INDEX "P6C120_seed_idx" ON "Phase6CPostEventFeedbackForm"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CPostEventFeedbackForm" ADD CONSTRAINT "P6C120_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CFeedbackIdentityPolicy" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C121_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C121_org_id_key" ON "Phase6CFeedbackIdentityPolicy"("organization_id", "id");
CREATE INDEX "P6C121_org_idx" ON "Phase6CFeedbackIdentityPolicy"("organization_id");
CREATE INDEX "P6C121_seed_idx" ON "Phase6CFeedbackIdentityPolicy"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CFeedbackIdentityPolicy" ADD CONSTRAINT "P6C121_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CPostEventResourceFileRef" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C122_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C122_org_id_key" ON "Phase6CPostEventResourceFileRef"("organization_id", "id");
CREATE INDEX "P6C122_org_idx" ON "Phase6CPostEventResourceFileRef"("organization_id");
CREATE INDEX "P6C122_seed_idx" ON "Phase6CPostEventResourceFileRef"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CPostEventResourceFileRef" ADD CONSTRAINT "P6C122_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CEventLeadHandoffEvidence" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C123_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C123_org_id_key" ON "Phase6CEventLeadHandoffEvidence"("organization_id", "id");
CREATE INDEX "P6C123_org_idx" ON "Phase6CEventLeadHandoffEvidence"("organization_id");
CREATE INDEX "P6C123_seed_idx" ON "Phase6CEventLeadHandoffEvidence"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CEventLeadHandoffEvidence" ADD CONSTRAINT "P6C123_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE TABLE "Phase6CAttendanceCertificateEvidence" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "source_seed_id" TEXT NOT NULL,
    "control_metadata" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "P6C124_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "P6C124_org_id_key" ON "Phase6CAttendanceCertificateEvidence"("organization_id", "id");
CREATE INDEX "P6C124_org_idx" ON "Phase6CAttendanceCertificateEvidence"("organization_id");
CREATE INDEX "P6C124_seed_idx" ON "Phase6CAttendanceCertificateEvidence"("organization_id", "source_seed_id");
ALTER TABLE "Phase6CAttendanceCertificateEvidence" ADD CONSTRAINT "P6C124_org_fk" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
