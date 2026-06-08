import { createHash } from 'node:crypto';

export const PHASE_6B_PAYROLL_RUN_STATE_MACHINE_SEED_ID = 'seed_6b_14_payroll_run_state_machine' as const;
export const PHASE_6B_FINANCE_PAYROLL_FOUNDATION_COMPONENT_ID = '6B.14' as const;
export const PAYROLL_RUN_STATE_MACHINE_EVENT = 'phase_6b.finance_payroll.run_state_transitioned' as const;

export type PayrollRunState = 'DRAFT' | 'CALCULATED' | 'REVIEW_READY' | 'APPROVED' | 'LOCKED' | 'DISBURSEMENT_READY' | 'CANCELLED';

export type PayrollRunStateTransitionInput = {
  transition_ref: string;
  from_state: PayrollRunState;
  to_state: PayrollRunState;
  actor_user_id: string;
  transition_reason: string;
  evidence_ref: string;
  transitioned_at: string;
};

export type PayrollRunStateMachineInput = {
  organization_id: string;
  service_manifest_contract_id: string;
  source_seed_id: typeof PHASE_6B_PAYROLL_RUN_STATE_MACHINE_SEED_ID;
  payroll_batch_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  person_identity_scope_ref: string;
  initial_state: PayrollRunState;
  transitions: PayrollRunStateTransitionInput[];
  evaluated_by_user_id: string;
  evaluated_at: string;
  payout_creation_requested?: boolean;
  tax_calculation_requested?: boolean;
  formula_calculation_requested?: boolean;
  disbursement_file_requested?: boolean;
  journal_posting_requested?: boolean;
  hr_record_mutation_requested?: boolean;
  payment_allocation_requested?: boolean;
  irreversible_action_requested?: boolean;
};

export type PayrollRunStateMachineReceipt = {
  seed_id: typeof PHASE_6B_PAYROLL_RUN_STATE_MACHINE_SEED_ID;
  component_id: typeof PHASE_6B_FINANCE_PAYROLL_FOUNDATION_COMPONENT_ID;
  event_name: typeof PAYROLL_RUN_STATE_MACHINE_EVENT;
  organization_id: string;
  service_manifest_contract_id: string;
  phase_6b_payroll_batch_model: 'Phase6BPayrollBatch';
  phase_6b_payroll_payout_model: 'Phase6BPayrollPayout';
  phase_6b_payee_model: 'Phase6BPayee';
  source_seed_id: typeof PHASE_6B_PAYROLL_RUN_STATE_MACHINE_SEED_ID;
  payroll_batch_ref: string;
  payment_allocation_balance_ref: string;
  chart_version_ref: string;
  person_identity_scope_ref: string;
  initial_state: PayrollRunState;
  current_state: PayrollRunState;
  transition_count: number;
  transitions: PayrollRunStateTransitionInput[];
  lock_state_reached: boolean;
  disbursement_ready: boolean;
  payout_created: false;
  tax_calculated: false;
  formula_calculated: false;
  disbursement_file_generated: false;
  journal_posted: false;
  hr_record_mutated: false;
  payment_allocation_performed: false;
  irreversible_action_allowed: false;
  state_machine_evidence_ref: string;
  state_machine_digest: string;
  evaluated_by_user_id: string;
  evaluated_at: string;
};

const STATES: readonly PayrollRunState[] = ['DRAFT', 'CALCULATED', 'REVIEW_READY', 'APPROVED', 'LOCKED', 'DISBURSEMENT_READY', 'CANCELLED'] as const;
const ALLOWED_TRANSITIONS: Readonly<Record<PayrollRunState, readonly PayrollRunState[]>> = {
  DRAFT: ['CALCULATED', 'CANCELLED'],
  CALCULATED: ['REVIEW_READY', 'DRAFT', 'CANCELLED'],
  REVIEW_READY: ['APPROVED', 'CALCULATED', 'CANCELLED'],
  APPROVED: ['LOCKED', 'REVIEW_READY', 'CANCELLED'],
  LOCKED: ['DISBURSEMENT_READY'],
  DISBURSEMENT_READY: [],
  CANCELLED: [],
};

function requireNonEmpty(value: string | undefined, field: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) throw new Error(`${field} is required for payroll run state machine.`);
  return value.trim();
}

function requireTimestamp(value: string, field: string): string {
  const normalized = requireNonEmpty(value, field);
  if (!Number.isFinite(Date.parse(normalized))) throw new Error(`${field} must be a valid ISO-compatible timestamp for payroll run state machine.`);
  return normalized;
}

function requireSourceSeed(value: string): typeof PHASE_6B_PAYROLL_RUN_STATE_MACHINE_SEED_ID {
  const sourceSeedId = requireNonEmpty(value, 'source_seed_id');
  if (sourceSeedId !== PHASE_6B_PAYROLL_RUN_STATE_MACHINE_SEED_ID) throw new Error('source_seed_id must match seed_6b_14_payroll_run_state_machine.');
  return PHASE_6B_PAYROLL_RUN_STATE_MACHINE_SEED_ID;
}

function requireState(value: PayrollRunState, field: string): PayrollRunState {
  if (!STATES.includes(value)) throw new Error(`${field} is not supported for payroll run state machine.`);
  return value;
}

function normalizeTransition(transition: PayrollRunStateTransitionInput): PayrollRunStateTransitionInput {
  return {
    transition_ref: requireNonEmpty(transition.transition_ref, 'transitions.transition_ref'),
    from_state: requireState(transition.from_state, 'transitions.from_state'),
    to_state: requireState(transition.to_state, 'transitions.to_state'),
    actor_user_id: requireNonEmpty(transition.actor_user_id, 'transitions.actor_user_id'),
    transition_reason: requireNonEmpty(transition.transition_reason, 'transitions.transition_reason'),
    evidence_ref: requireNonEmpty(transition.evidence_ref, 'transitions.evidence_ref'),
    transitioned_at: requireTimestamp(transition.transitioned_at, 'transitions.transitioned_at'),
  };
}

function normalizeTransitions(transitions: PayrollRunStateTransitionInput[]): PayrollRunStateTransitionInput[] {
  if (!Array.isArray(transitions) || transitions.length === 0) throw new Error('transitions must include at least one transition for payroll run state machine.');
  const normalized = transitions.map(normalizeTransition);
  const refs = normalized.map((transition) => transition.transition_ref);
  if (new Set(refs).size !== refs.length) throw new Error('transitions must not repeat transition_ref for payroll run state machine.');
  return normalized;
}

function applyTransitions(initialState: PayrollRunState, transitions: PayrollRunStateTransitionInput[]): PayrollRunState {
  let currentState = initialState;
  let previousTime = 0;
  for (const transition of transitions) {
    if (transition.from_state !== currentState) throw new Error('transition.from_state must match current payroll run state.');
    if (!ALLOWED_TRANSITIONS[currentState].includes(transition.to_state)) throw new Error('transition is not allowed for payroll run state machine.');
    const transitionTime = Date.parse(transition.transitioned_at);
    if (transitionTime < previousTime) throw new Error('transitions must be chronological for payroll run state machine.');
    previousTime = transitionTime;
    currentState = transition.to_state;
  }
  return currentState;
}

function digestStateMachine(receiptWithoutDigest: Omit<PayrollRunStateMachineReceipt, 'state_machine_digest'>): string {
  return createHash('sha256').update(JSON.stringify(receiptWithoutDigest)).digest('hex');
}

export function evaluatePayrollRunStateMachine(input: PayrollRunStateMachineInput): PayrollRunStateMachineReceipt {
  if (input.payout_creation_requested === true) throw new Error('payroll run state machine must not create payroll payouts.');
  if (input.tax_calculation_requested === true) throw new Error('payroll run state machine must not calculate payroll tax.');
  if (input.formula_calculation_requested === true) throw new Error('payroll run state machine must not calculate allowance or deduction formulas.');
  if (input.disbursement_file_requested === true) throw new Error('payroll run state machine must not generate disbursement files.');
  if (input.journal_posting_requested === true) throw new Error('payroll run state machine must not post journals.');
  if (input.hr_record_mutation_requested === true) throw new Error('payroll run state machine must not mutate HR records.');
  if (input.payment_allocation_requested === true) throw new Error('payroll run state machine must not perform payment allocation math.');
  if (input.irreversible_action_requested === true) throw new Error('payroll run state machine must not perform irreversible actions.');

  const payrollBatchRef = requireNonEmpty(input.payroll_batch_ref, 'payroll_batch_ref');
  const initialState = requireState(input.initial_state, 'initial_state');
  const transitions = normalizeTransitions(input.transitions);
  const currentState = applyTransitions(initialState, transitions);

  const receiptWithoutDigest: Omit<PayrollRunStateMachineReceipt, 'state_machine_digest'> = {
    seed_id: PHASE_6B_PAYROLL_RUN_STATE_MACHINE_SEED_ID,
    component_id: PHASE_6B_FINANCE_PAYROLL_FOUNDATION_COMPONENT_ID,
    event_name: PAYROLL_RUN_STATE_MACHINE_EVENT,
    organization_id: requireNonEmpty(input.organization_id, 'organization_id'),
    service_manifest_contract_id: requireNonEmpty(input.service_manifest_contract_id, 'service_manifest_contract_id'),
    phase_6b_payroll_batch_model: 'Phase6BPayrollBatch',
    phase_6b_payroll_payout_model: 'Phase6BPayrollPayout',
    phase_6b_payee_model: 'Phase6BPayee',
    source_seed_id: requireSourceSeed(input.source_seed_id),
    payroll_batch_ref: payrollBatchRef,
    payment_allocation_balance_ref: requireNonEmpty(input.payment_allocation_balance_ref, 'payment_allocation_balance_ref'),
    chart_version_ref: requireNonEmpty(input.chart_version_ref, 'chart_version_ref'),
    person_identity_scope_ref: requireNonEmpty(input.person_identity_scope_ref, 'person_identity_scope_ref'),
    initial_state: initialState,
    current_state: currentState,
    transition_count: transitions.length,
    transitions,
    lock_state_reached: transitions.some((transition) => transition.to_state === 'LOCKED') || currentState === 'LOCKED' || currentState === 'DISBURSEMENT_READY',
    disbursement_ready: currentState === 'DISBURSEMENT_READY',
    payout_created: false,
    tax_calculated: false,
    formula_calculated: false,
    disbursement_file_generated: false,
    journal_posted: false,
    hr_record_mutated: false,
    payment_allocation_performed: false,
    irreversible_action_allowed: false,
    state_machine_evidence_ref: `payroll_run_state_machine:${payrollBatchRef}:evaluated`,
    evaluated_by_user_id: requireNonEmpty(input.evaluated_by_user_id, 'evaluated_by_user_id'),
    evaluated_at: requireTimestamp(input.evaluated_at, 'evaluated_at'),
  };

  return { ...receiptWithoutDigest, state_machine_digest: digestStateMachine(receiptWithoutDigest) };
}
