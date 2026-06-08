import assert from 'node:assert/strict';
import { evaluatePayrollRunStateMachine, type PayrollRunStateMachineInput } from './payroll_run_state_machine.service';

const baseInput: PayrollRunStateMachineInput = {
  organization_id: 'org_demo',
  service_manifest_contract_id: 'smc_finance_payroll_foundation',
  source_seed_id: 'seed_6b_14_payroll_run_state_machine',
  payroll_batch_ref: 'payroll_batch_2026_06',
  payment_allocation_balance_ref: 'payment_allocation_balance_001',
  chart_version_ref: 'coa_2026_v1',
  person_identity_scope_ref: 'person_scope_payroll_2026_06',
  initial_state: 'DRAFT',
  transitions: [
    { transition_ref: 'tr_001', from_state: 'DRAFT', to_state: 'CALCULATED', actor_user_id: 'user_payroll_001', transition_reason: 'Tax and formula evidence available', evidence_ref: 'payroll_run:calculated', transitioned_at: '2026-06-08T00:00:00.000Z' },
    { transition_ref: 'tr_002', from_state: 'CALCULATED', to_state: 'REVIEW_READY', actor_user_id: 'user_payroll_001', transition_reason: 'Ready for review', evidence_ref: 'payroll_run:review_ready', transitioned_at: '2026-06-08T01:00:00.000Z' },
    { transition_ref: 'tr_003', from_state: 'REVIEW_READY', to_state: 'APPROVED', actor_user_id: 'user_payroll_approver_001', transition_reason: 'Approved by finance', evidence_ref: 'payroll_run:approved', transitioned_at: '2026-06-08T02:00:00.000Z' },
    { transition_ref: 'tr_004', from_state: 'APPROVED', to_state: 'LOCKED', actor_user_id: 'user_payroll_approver_001', transition_reason: 'Locked after approval', evidence_ref: 'payroll_run:locked', transitioned_at: '2026-06-08T03:00:00.000Z' },
    { transition_ref: 'tr_005', from_state: 'LOCKED', to_state: 'DISBURSEMENT_READY', actor_user_id: 'user_payroll_approver_001', transition_reason: 'Ready for export ticket', evidence_ref: 'payroll_run:disbursement_ready', transitioned_at: '2026-06-08T04:00:00.000Z' },
  ],
  evaluated_by_user_id: 'user_payroll_controller_001',
  evaluated_at: '2026-06-08T05:00:00.000Z',
};

const receipt = evaluatePayrollRunStateMachine(baseInput);
assert.equal(receipt.seed_id, 'seed_6b_14_payroll_run_state_machine');
assert.equal(receipt.component_id, '6B.14');
assert.equal(receipt.event_name, 'phase_6b.finance_payroll.run_state_transitioned');
assert.equal(receipt.phase_6b_payroll_batch_model, 'Phase6BPayrollBatch');
assert.equal(receipt.phase_6b_payroll_payout_model, 'Phase6BPayrollPayout');
assert.equal(receipt.phase_6b_payee_model, 'Phase6BPayee');
assert.equal(receipt.source_seed_id, 'seed_6b_14_payroll_run_state_machine');
assert.equal(receipt.current_state, 'DISBURSEMENT_READY');
assert.equal(receipt.transition_count, 5);
assert.equal(receipt.lock_state_reached, true);
assert.equal(receipt.disbursement_ready, true);
assert.equal(receipt.payout_created, false);
assert.equal(receipt.tax_calculated, false);
assert.equal(receipt.formula_calculated, false);
assert.equal(receipt.disbursement_file_generated, false);
assert.equal(receipt.journal_posted, false);
assert.equal(receipt.hr_record_mutated, false);
assert.equal(receipt.payment_allocation_performed, false);
assert.equal(receipt.irreversible_action_allowed, false);
assert.equal(receipt.state_machine_evidence_ref, 'payroll_run_state_machine:payroll_batch_2026_06:evaluated');
assert.equal(receipt.state_machine_digest.length, 64);

assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, organization_id: ' ' }), /organization_id is required/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, service_manifest_contract_id: '' }), /service_manifest_contract_id is required/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, source_seed_id: 'seed_other' as never }), /source_seed_id must match/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, payroll_batch_ref: '' }), /payroll_batch_ref is required/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, payment_allocation_balance_ref: '' }), /payment_allocation_balance_ref is required/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, chart_version_ref: '' }), /chart_version_ref is required/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, person_identity_scope_ref: '' }), /person_identity_scope_ref is required/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, initial_state: 'UNKNOWN' as never }), /initial_state is not supported/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, transitions: [] }), /transitions must include at least one transition/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, transitions: [{ ...baseInput.transitions[0], transition_ref: '' }] }), /transitions.transition_ref is required/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, transitions: [{ ...baseInput.transitions[0], from_state: 'UNKNOWN' as never }] }), /transitions.from_state is not supported/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, transitions: [{ ...baseInput.transitions[0], to_state: 'UNKNOWN' as never }] }), /transitions.to_state is not supported/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, transitions: [{ ...baseInput.transitions[0], actor_user_id: '' }] }), /transitions.actor_user_id is required/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, transitions: [{ ...baseInput.transitions[0], transition_reason: '' }] }), /transitions.transition_reason is required/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, transitions: [{ ...baseInput.transitions[0], evidence_ref: '' }] }), /transitions.evidence_ref is required/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, transitions: [{ ...baseInput.transitions[0], transitioned_at: 'not-a-date' }] }), /transitions.transitioned_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, transitions: [baseInput.transitions[0], baseInput.transitions[0]] }), /transitions must not repeat transition_ref/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, transitions: [{ ...baseInput.transitions[0], from_state: 'CALCULATED' }] }), /transition.from_state must match/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, transitions: [{ ...baseInput.transitions[0], to_state: 'APPROVED' }] }), /transition is not allowed/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, transitions: [baseInput.transitions[1], baseInput.transitions[0]] }), /transition.from_state must match/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, evaluated_by_user_id: '' }), /evaluated_by_user_id is required/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, evaluated_at: 'not-a-date' }), /evaluated_at must be a valid ISO-compatible timestamp/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, payout_creation_requested: true }), /must not create payroll payouts/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, tax_calculation_requested: true }), /must not calculate payroll tax/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, formula_calculation_requested: true }), /must not calculate allowance or deduction formulas/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, disbursement_file_requested: true }), /must not generate disbursement files/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, journal_posting_requested: true }), /must not post journals/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, hr_record_mutation_requested: true }), /must not mutate HR records/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, payment_allocation_requested: true }), /must not perform payment allocation math/);
assert.throws(() => evaluatePayrollRunStateMachine({ ...baseInput, irreversible_action_requested: true }), /must not perform irreversible actions/);

console.log('P6B-FFET-096 payroll run state machine service test passed.');
