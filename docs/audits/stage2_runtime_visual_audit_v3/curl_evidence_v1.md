# Stage 2 visual audit v3 curl evidence

## /health
{"service":"api","status":"healthy"}
HTTP 200

## /platform/phase-6a/runtime/status
{"phase":"6A","status":"runtime_surface_declared_activation_pending","activation_authority":"foundry_runtime_authority","caller_controlled_activation_allowed":false,"active_surface_count":0,"inactive_surface_count":8,"surfaces":[{"surface_key":"person_graph_multi_participant","source_ffet":"S1-6A6C-FFET-001","source_surface":"person graph","capability_surface":"phase_6a.person_graph_multi_participant","activation_required":true,"active":false,"runtime_exposure":"status_only_until_foundry_enforced"},{"surface_key":"tiered_verification","source_ffet":"S1-6A6C-FFET-002","source_surface":"tiered verification","capability_surface":"phase_6a.tiered_verification","activation_required":true,"active":false,"runtime_exposure":"status_only_until_foundry_enforced"},{"surface_key":"evidence_ledger_hardening","source_ffet":"S1-6A6C-FFET-003","source_surface":"evidence ledger","capability_surface":"phase_6a.evidence_ledger_hardening","activation_required":true,"active":false,"runtime_exposure":"status_only_until_foundry_enforced"},{"surface_key":"reputation_interpretation_service","source_ffet":"S1-6A6C-FFET-004","source_surface":"reputation interpretation","capability_surface":"phase_6a.reputation_interpretation_service","activation_required":true,"active":false,"runtime_exposure":"status_only_until_foundry_enforced"},{"surface_key":"communication_gateway","source_ffet":"S1-6A6C-FFET-005","source_surface":"communication gateway","capability_surface":"phase_6a.communication_gateway","activation_required":true,"active":false,"runtime_exposure":"status_only_until_foundry_enforced"},{"surface_key":"configuration_constraints","source_ffet":"S1-6A6C-FFET-006","source_surface":"configuration constraints","capability_surface":"phase_6a.configuration_constraints","activation_required":true,"active":false,"runtime_exposure":"status_only_until_foundry_enforced"},{"surface_key":"ai_proxy_dual_plane","source_ffet":"S1-6A6C-FFET-007","source_surface":"AI proxy dual plane","capability_surface":"phase_6a.ai_proxy_dual_plane","activation_required":true,"active":false,"runtime_exposure":"status_only_until_foundry_enforced"},{"surface_key":"foundry_cross_tenant_activation","source_ffet":"S1-6A6C-FFET-008","source_surface":"Foundry cross-tenant activation","capability_surface":"phase_6a.foundry_cross_tenant_activation","activation_required":true,"active":false,"runtime_exposure":"status_only_until_foundry_enforced"}]}
HTTP 200

## /platform/phase-6b/runtime/status
{"phase":"6B","status":"runtime_surface_declared_activation_pending","activation_authority":"foundry_runtime_authority","billing_gatekeeper_required":true,"caller_controlled_activation_allowed":false,"active_surface_count":0,"inactive_surface_count":5,"surfaces":[{"surface_key":"marketplace_transaction_infrastructure","source_ffet":"S1-6A6C-FFET-009","source_surface":"marketplace transaction infrastructure","capability_surface":"phase_6b.marketplace_transaction_infrastructure","activation_required":true,"active":false,"provider_runtime_allowed":false,"runtime_exposure":"status_only_until_foundry_and_gatekeeper_enforced"},{"surface_key":"payout_rails","source_ffet":"S1-6A6C-FFET-010","source_surface":"payout rails","capability_surface":"phase_6b.payout_rails","activation_required":true,"active":false,"provider_runtime_allowed":false,"runtime_exposure":"status_only_until_foundry_and_gatekeeper_enforced"},{"surface_key":"cross_tenant_invoicing","source_ffet":"S1-6A6C-FFET-011","source_surface":"cross-tenant invoicing","capability_surface":"phase_6b.cross_tenant_invoicing","activation_required":true,"active":false,"provider_runtime_allowed":false,"runtime_exposure":"status_only_until_foundry_and_gatekeeper_enforced"},{"surface_key":"billing_honesty_surfaces","source_ffet":"S1-6A6C-FFET-012","source_surface":"billing honesty surfaces","capability_surface":"phase_6b.billing_honesty_surfaces","activation_required":true,"active":false,"provider_runtime_allowed":false,"runtime_exposure":"status_only_until_foundry_and_gatekeeper_enforced"},{"surface_key":"pricing_presentations","source_ffet":"S1-6A6C-FFET-013","source_surface":"pricing presentations","capability_surface":"phase_6b.pricing_presentations","activation_required":true,"active":false,"provider_runtime_allowed":false,"runtime_exposure":"status_only_until_foundry_and_gatekeeper_enforced"}]}
HTTP 200

## /platform/phase-6c/runtime/status
{"phase":"6C","status":"runtime_surface_declared_activation_pending","activation_authority":"foundry_runtime_authority","tenant_isolation_required":true,"caller_controlled_activation_allowed":false,"active_surface_count":0,"inactive_surface_count":6,"surfaces":[{"surface_key":"workspace_level_working_copy","source_ffet":"S1-6A6C-FFET-014","source_surface":"workspace-level working copy","capability_surface":"phase_6c.workspace_level_working_copy","activation_required":true,"active":false,"tenant_isolation_required":true,"runtime_exposure":"status_only_until_foundry_gatekeeper_and_tenant_isolation_enforced"},{"surface_key":"structured_agreements","source_ffet":"S1-6A6C-FFET-015","source_surface":"structured agreements","capability_surface":"phase_6c.structured_agreements","activation_required":true,"active":false,"tenant_isolation_required":true,"runtime_exposure":"status_only_until_foundry_gatekeeper_and_tenant_isolation_enforced"},{"surface_key":"ai_verification_hooks","source_ffet":"S1-6A6C-FFET-016","source_surface":"AI verification hooks","capability_surface":"phase_6c.ai_verification_hooks","activation_required":true,"active":false,"tenant_isolation_required":true,"runtime_exposure":"status_only_until_foundry_gatekeeper_and_tenant_isolation_enforced"},{"surface_key":"employment_reputation_linkage","source_ffet":"S1-6A6C-FFET-017","source_surface":"employment-reputation linkage","capability_surface":"phase_6c.employment_reputation_linkage","activation_required":true,"active":false,"tenant_isolation_required":true,"runtime_exposure":"status_only_until_foundry_gatekeeper_and_tenant_isolation_enforced"},{"surface_key":"dispute_appeals_scaffolding","source_ffet":"S1-6A6C-FFET-018","source_surface":"disputes and appeals scaffolding","capability_surface":"phase_6c.dispute_appeals_scaffolding","activation_required":true,"active":false,"tenant_isolation_required":true,"runtime_exposure":"status_only_until_foundry_gatekeeper_and_tenant_isolation_enforced"},{"surface_key":"cross_tenant_scheduling_recruitment","source_ffet":"S1-6A6C-FFET-019","source_surface":"cross-tenant scheduling and recruitment","capability_surface":"phase_6c.cross_tenant_scheduling_recruitment","activation_required":true,"active":false,"tenant_isolation_required":true,"runtime_exposure":"status_only_until_foundry_gatekeeper_and_tenant_isolation_enforced"}]}
HTTP 200

## /app HEAD
HTTP/1.1 200 OK
Vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch, Accept-Encoding
Cache-Control: no-store, must-revalidate
X-Powered-By: Next.js
Content-Type: text/html; charset=utf-8
Date: Sat, 13 Jun 2026 19:37:19 GMT
Connection: keep-alive
Keep-Alive: timeout=5


## /app/phase-6/runtime-capabilities HEAD
HTTP/1.1 404 Not Found
Cache-Control: no-store, must-revalidate
Vary: rsc, next-router-state-tree, next-router-prefetch, next-router-segment-prefetch, Accept-Encoding
X-Powered-By: Next.js
Content-Type: text/html; charset=utf-8
Date: Sat, 13 Jun 2026 19:37:21 GMT
Connection: keep-alive
Keep-Alive: timeout=5


## /platform/foundry/phase-6a-6c/runtime-activation/preflight
{"decision_id":"foundry_phase_6a_6c_activation_6bdb667db8b175b8","decision_hash":"6bdb667db8b175b8f29186a2203d2e6fb582a198b76ae9dae8c23a843658db3a","organization_id":"org-stage2-visual","requested_capability_surface":"phase_6a.person_graph_multi_participant","phase":"phase_6a","activation_authority":"foundry_runtime_authority","trusted_foundry_snapshot_required":true,"caller_controlled_activation_allowed":false,"active_capability_surface_count":1,"active":true,"allowed":true,"business_logic_execution_allowed":true,"unavailable_response":null,"http_status_when_inactive":null,"reason":"capability_surface_active_in_foundry_snapshot","stage_2_runtime_boundary":{"persistence_required_for_production":true,"route_publication_deferred_to_runtime_wiring":true,"audit_evidence_required":true},"route_publication_scope":"stage_2_foundry_activation_preflight"}
HTTP 201
