import { Injectable } from '@nestjs/common';

export type Phase6CScaffoldReadiness = {
  phase: '6C';
  status: 'scaffold_control_only';
  surface_count: number;
  model_count: number;
  capability_implementation_allowed: false;
  business_behavior_implemented: false;
  runtime_adapter_implemented: false;
  ticket_generation_allowed: false;
};

export type Phase6CRuntimeSurface = {
  surface_key: string;
  source_ffet: string;
  source_surface: string;
  capability_surface: string;
  activation_required: true;
  active: boolean;
  tenant_isolation_required: true;
  runtime_exposure: 'status_only_until_foundry_gatekeeper_and_tenant_isolation_enforced';
};

export type Phase6CRuntimeCapabilityStatus = {
  phase: '6C';
  status: 'runtime_surface_declared_activation_pending';
  activation_authority: 'foundry_runtime_authority';
  tenant_isolation_required: true;
  caller_controlled_activation_allowed: false;
  active_surface_count: number;
  inactive_surface_count: number;
  surfaces: Phase6CRuntimeSurface[];
};

export type Phase6CActivationSnapshot = {
  activeCapabilitySurfaces?: readonly string[];
};

const PHASE_6C_RUNTIME_SURFACES = [
  ["workspace_level_working_copy", "S1-6A6C-FFET-014", "workspace-level working copy", "phase_6c.workspace_level_working_copy"],
  ["structured_agreements", "S1-6A6C-FFET-015", "structured agreements", "phase_6c.structured_agreements"],
  ["ai_verification_hooks", "S1-6A6C-FFET-016", "AI verification hooks", "phase_6c.ai_verification_hooks"],
  ["employment_reputation_linkage", "S1-6A6C-FFET-017", "employment-reputation linkage", "phase_6c.employment_reputation_linkage"],
  ["dispute_appeals_scaffolding", "S1-6A6C-FFET-018", "disputes and appeals scaffolding", "phase_6c.dispute_appeals_scaffolding"],
  ["cross_tenant_scheduling_recruitment", "S1-6A6C-FFET-019", "cross-tenant scheduling and recruitment", "phase_6c.cross_tenant_scheduling_recruitment"],
] as const;

@Injectable()
export class Phase6CService {
  getScaffoldReadiness(): Phase6CScaffoldReadiness {
    return {
      phase: '6C',
      status: 'scaffold_control_only',
      surface_count: 9,
      model_count: 124,
      capability_implementation_allowed: false,
      business_behavior_implemented: false,
      runtime_adapter_implemented: false,
      ticket_generation_allowed: false,
    };
  }

  getRuntimeCapabilityStatus(snapshot: Phase6CActivationSnapshot = {}): Phase6CRuntimeCapabilityStatus {
    const activeCapabilitySurfaces = new Set(snapshot.activeCapabilitySurfaces ?? []);
    const surfaces = PHASE_6C_RUNTIME_SURFACES.map(
      ([surface_key, source_ffet, source_surface, capability_surface]): Phase6CRuntimeSurface => ({
        surface_key,
        source_ffet,
        source_surface,
        capability_surface,
        activation_required: true,
        active: activeCapabilitySurfaces.has(capability_surface),
        tenant_isolation_required: true,
        runtime_exposure: 'status_only_until_foundry_gatekeeper_and_tenant_isolation_enforced',
      }),
    );

    return {
      phase: '6C',
      status: 'runtime_surface_declared_activation_pending',
      activation_authority: 'foundry_runtime_authority',
      tenant_isolation_required: true,
      caller_controlled_activation_allowed: false,
      active_surface_count: surfaces.filter((surface) => surface.active).length,
      inactive_surface_count: surfaces.filter((surface) => !surface.active).length,
      surfaces,
    };
  }
}
