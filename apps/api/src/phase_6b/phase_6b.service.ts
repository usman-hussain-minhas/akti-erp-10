import { Injectable } from '@nestjs/common';

export type Phase6BScaffoldReadiness = {
  phase: '6B';
  status: 'scaffold_control_only';
  surface_count: number;
  model_count: number;
  capability_implementation_allowed: false;
  business_behavior_implemented: false;
  runtime_adapter_implemented: false;
  ticket_generation_allowed: false;
};

export type Phase6BRuntimeSurface = {
  surface_key: string;
  source_ffet: string;
  source_surface: string;
  capability_surface: string;
  activation_required: true;
  active: boolean;
  provider_runtime_allowed: false;
  runtime_exposure: 'status_only_until_foundry_and_gatekeeper_enforced';
};

export type Phase6BRuntimeCapabilityStatus = {
  phase: '6B';
  status: 'runtime_surface_declared_activation_pending';
  activation_authority: 'foundry_runtime_authority';
  billing_gatekeeper_required: true;
  caller_controlled_activation_allowed: false;
  active_surface_count: number;
  inactive_surface_count: number;
  surfaces: Phase6BRuntimeSurface[];
};

export type Phase6BActivationSnapshot = {
  activeCapabilitySurfaces?: readonly string[];
};

const PHASE_6B_SURFACE_COUNT = 15;
const PHASE_6B_MODEL_COUNT = 47;

const PHASE_6B_RUNTIME_SURFACES = [
  ["marketplace_transaction_infrastructure", "S1-6A6C-FFET-009", "marketplace transaction infrastructure", "phase_6b.marketplace_transaction_infrastructure"],
  ["payout_rails", "S1-6A6C-FFET-010", "payout rails", "phase_6b.payout_rails"],
  ["cross_tenant_invoicing", "S1-6A6C-FFET-011", "cross-tenant invoicing", "phase_6b.cross_tenant_invoicing"],
  ["billing_honesty_surfaces", "S1-6A6C-FFET-012", "billing honesty surfaces", "phase_6b.billing_honesty_surfaces"],
  ["pricing_presentations", "S1-6A6C-FFET-013", "pricing presentations", "phase_6b.pricing_presentations"],
] as const;

@Injectable()
export class Phase6BService {
  getScaffoldReadiness(): Phase6BScaffoldReadiness {
    return {
      phase: '6B',
      status: 'scaffold_control_only',
      surface_count: PHASE_6B_SURFACE_COUNT,
      model_count: PHASE_6B_MODEL_COUNT,
      capability_implementation_allowed: false,
      business_behavior_implemented: false,
      runtime_adapter_implemented: false,
      ticket_generation_allowed: false,
    };
  }

  getRuntimeCapabilityStatus(snapshot: Phase6BActivationSnapshot = {}): Phase6BRuntimeCapabilityStatus {
    const activeCapabilitySurfaces = new Set(snapshot.activeCapabilitySurfaces ?? []);
    const surfaces = PHASE_6B_RUNTIME_SURFACES.map(
      ([surface_key, source_ffet, source_surface, capability_surface]): Phase6BRuntimeSurface => ({
        surface_key,
        source_ffet,
        source_surface,
        capability_surface,
        activation_required: true,
        active: activeCapabilitySurfaces.has(capability_surface),
        provider_runtime_allowed: false,
        runtime_exposure: 'status_only_until_foundry_and_gatekeeper_enforced',
      }),
    );

    return {
      phase: '6B',
      status: 'runtime_surface_declared_activation_pending',
      activation_authority: 'foundry_runtime_authority',
      billing_gatekeeper_required: true,
      caller_controlled_activation_allowed: false,
      active_surface_count: surfaces.filter((surface) => surface.active).length,
      inactive_surface_count: surfaces.filter((surface) => !surface.active).length,
      surfaces,
    };
  }
}
