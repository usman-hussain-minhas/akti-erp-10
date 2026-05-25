import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { safeParseModuleManifest } from "../module-manifest.schema.ts";
import {
  LeadDeskAssignLeadInputSchema,
  LeadDeskAssignLeadOutputSchema,
  LeadDeskCreateLeadInputSchema,
  LeadDeskCreateLeadOutputSchema,
  LeadDeskGetLeadDetailInputSchema,
  LeadDeskGetLeadDetailOutputSchema,
  LeadDeskLeadAssignedEventSchema,
  LeadDeskLeadCreatedEventSchema,
  LeadDeskStatusSchema,
  LeadDeskLeadStatusUpdatedEventSchema,
  LeadDeskListLeadsInputSchema,
  LeadDeskListLeadsOutputSchema,
  LeadDeskUpdateLeadStatusInputSchema,
  LeadDeskUpdateLeadStatusOutputSchema,
  sampleLeadDeskCreateLeadInput,
  sampleLeadDeskCreateLeadOutput,
} from "../lead-desk-core.contract.ts";
import { leadDeskCoreModuleManifest } from "../lead-desk-core.module-manifest.contract.ts";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const contractsRoot = resolve(scriptDir, "..");
const contractPath = resolve(contractsRoot, "lead-desk-core.contract.ts");
const manifestPath = resolve(contractsRoot, "lead-desk-core.module-manifest.contract.ts");

const EXPECTED_MODULE_KEY = "lead.desk";
const ALLOWED_CAPABILITIES = new Set([
  "lead.intake.create",
  "lead.inbox.view",
  "lead.detail.view",
  "lead.status.update",
  "lead.inbox.assign",
]);

const FORBIDDEN_PATTERNS = [
  ["meta", /(^|[^a-z0-9])meta([^a-z0-9]|$)/],
  ["whats" + "app", /(^|[^a-z0-9])whatsapp([^a-z0-9]|$)/],
  ["campaign", /(^|[^a-z0-9])campaign([^a-z0-9]|$)/],
  ["finance", /(^|[^a-z0-9])finance([^a-z0-9]|$)/],
  ["lms", /(^|[^a-z0-9])lms([^a-z0-9]|$)/],
  ["hr", /(^|[^a-z0-9])hr([^a-z0-9]|$)/],
  ["certification", /(^|[^a-z0-9])certification([^a-z0-9]|$)/],
  ["provider-sdk", /(^|[^a-z0-9])provider-sdk([^a-z0-9]|$)/],
];

function setEquals(actual, expected) {
  if (actual.size !== expected.size) {
    return false;
  }
  for (const item of actual) {
    if (!expected.has(item)) {
      return false;
    }
  }
  return true;
}

function main() {
  const failures = [];

  const manifestParse = safeParseModuleManifest(leadDeskCoreModuleManifest);
  if (!manifestParse.success) {
    failures.push(`Lead Desk manifest parse failed: ${manifestParse.error.message}`);
  }

  const sampleChecks = [
    ["create input", LeadDeskCreateLeadInputSchema.safeParse(sampleLeadDeskCreateLeadInput)],
    ["create output", LeadDeskCreateLeadOutputSchema.safeParse(sampleLeadDeskCreateLeadOutput)],
    [
      "list input",
      LeadDeskListLeadsInputSchema.safeParse({
        organization_id: "organization_alpha",
        actor_user_id: "actor_alpha",
        status: "new",
        limit: 50,
      }),
    ],
    [
      "list output",
      LeadDeskListLeadsOutputSchema.safeParse({
        items: [
          {
            lead_id: "lead_alpha",
            organization_id: "organization_alpha",
            full_name: "Lead Alpha",
            phone_e164: "+923001234567",
            source_ref: "source_alpha",
            status: "new",
            assigned_user_id: null,
            created_at: "2026-05-24T10:00:00.000Z",
            updated_at: "2026-05-24T10:00:00.000Z",
          },
        ],
        next_cursor: null,
      }),
    ],
    [
      "detail input",
      LeadDeskGetLeadDetailInputSchema.safeParse({
        organization_id: "organization_alpha",
        actor_user_id: "actor_alpha",
        lead_id: "lead_alpha",
      }),
    ],
    [
      "detail output",
      LeadDeskGetLeadDetailOutputSchema.safeParse({
        lead_id: "lead_alpha",
        organization_id: "organization_alpha",
        full_name: "Lead Alpha",
        phone_e164: "+923001234567",
        source_ref: "source_alpha",
        status: "contacted",
        assigned_user_id: "actor_alpha",
        created_at: "2026-05-24T10:00:00.000Z",
        updated_at: "2026-05-24T11:00:00.000Z",
      }),
    ],
    [
      "status update input",
      LeadDeskUpdateLeadStatusInputSchema.safeParse({
        organization_id: "organization_alpha",
        actor_user_id: "actor_alpha",
        lead_id: "lead_alpha",
        status: "qualified",
        requested_at: "2026-05-24T11:00:00.000Z",
      }),
    ],
    [
      "status update output",
      LeadDeskUpdateLeadStatusOutputSchema.safeParse({
        lead_id: "lead_alpha",
        organization_id: "organization_alpha",
        status: "qualified",
        updated_at: "2026-05-24T11:00:01.000Z",
      }),
    ],
    [
      "assign input",
      LeadDeskAssignLeadInputSchema.safeParse({
        organization_id: "organization_alpha",
        actor_user_id: "actor_alpha",
        lead_id: "lead_alpha",
        assigned_user_id: "actor_beta",
        requested_at: "2026-05-24T11:00:02.000Z",
      }),
    ],
    [
      "assign output",
      LeadDeskAssignLeadOutputSchema.safeParse({
        lead_id: "lead_alpha",
        organization_id: "organization_alpha",
        assigned_user_id: "actor_beta",
        updated_at: "2026-05-24T11:00:03.000Z",
      }),
    ],
    [
      "created event",
      LeadDeskLeadCreatedEventSchema.safeParse({
        event_type: "lead.desk.lead.created",
        version: "0.1.0",
        organization_id: "organization_alpha",
        lead_id: "lead_alpha",
        actor_user_id: "actor_alpha",
        created_at: "2026-05-24T10:00:01.000Z",
      }),
    ],
    [
      "status event",
      LeadDeskLeadStatusUpdatedEventSchema.safeParse({
        event_type: "lead.desk.lead.status.updated",
        version: "0.1.0",
        organization_id: "organization_alpha",
        lead_id: "lead_alpha",
        actor_user_id: "actor_alpha",
        status: "qualified",
        updated_at: "2026-05-24T11:00:01.000Z",
      }),
    ],
    [
      "assigned event",
      LeadDeskLeadAssignedEventSchema.safeParse({
        event_type: "lead.desk.lead.assigned",
        version: "0.1.0",
        organization_id: "organization_alpha",
        lead_id: "lead_alpha",
        actor_user_id: "actor_alpha",
        assigned_user_id: "actor_beta",
        updated_at: "2026-05-24T11:00:03.000Z",
      }),
    ],
  ];

  for (const [label, parseResult] of sampleChecks) {
    if (!parseResult.success) {
      failures.push(`Sample ${label} parse failed: ${parseResult.error.message}`);
    }
  }

  if (!LeadDeskStatusSchema.safeParse("new").success) {
    failures.push("Lead status enum must include new");
  }

  const manifest = manifestParse.success ? manifestParse.data : null;
  if (manifest) {
    if (manifest.module_key !== EXPECTED_MODULE_KEY) {
      failures.push(`Manifest module_key must be ${EXPECTED_MODULE_KEY}`);
    }

    const capabilityKeys = new Set(manifest.capabilities.map((item) => item.key));
    if (!setEquals(capabilityKeys, ALLOWED_CAPABILITIES)) {
      failures.push("Lead Desk capabilities must match approved intake/list/detail/status/assignment boundary");
    }

    const routePaths = manifest.api_routes.map((route) => route.path);
    if (routePaths.some((path) => !path.startsWith("/api/lead-desk/organizations/:organization_id/leads"))) {
      failures.push("Lead Desk routes must remain within /api/lead-desk/organizations/:organization_id/leads boundary");
    }

    if (manifest.events_consumed.length !== 0) {
      failures.push("Lead Desk contracts must not consume external events at this boundary stage");
    }
  }

  const contractSource = readFileSync(contractPath, "utf8").toLowerCase();
  const manifestSource = readFileSync(manifestPath, "utf8").toLowerCase();
  for (const [label, pattern] of FORBIDDEN_PATTERNS) {
    if (pattern.test(contractSource) || pattern.test(manifestSource)) {
      failures.push(`Forbidden scope token detected in Lead Desk contracts: ${label}`);
    }
  }

  if (failures.length > 0) {
    for (const failure of failures) {
      console.error(`FAIL: ${failure}`);
    }
    process.exit(1);
  }

  console.log("Lead Desk contract validation passed.");
}

main();
