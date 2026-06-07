export const webFormIntakeConnectorModuleManifest = {
  seed_id: 'seed_6b_04_web_form_intake_connector',
  component_id: '6B.04',
  capability_surface: 'crm_lead_intake.web_form_intake_connector',
  source_system: 'WEB_FORM_INTAKE',
  activation_lifecycle_required: true,
  person_identity_graph_required: true,
  access_core_gatekeeper_required: true,
  visual_workflow_builder_required: true,
  product_record_authority_required: true,
  conditional_dependencies: {
    global_opt_out_registry: 'observed_at_intake_not_hard_send_gate',
  },
  owned_data: [
    'web_form_id',
    'web_form_submission_id',
    'form_origin_reference',
    'intake_mapping',
    'lead_record_authority_reference',
  ],
  forbidden_behaviors: [
    'direct_provider_messaging',
    'provider_callback_processing',
    'credential_material_storage',
    'communication_send',
    'frontend_screen',
    'shared_scaffold_mutation',
  ],
} as const;
