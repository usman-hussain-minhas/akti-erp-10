import { BadRequestException, Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';

import {
  WorkflowService,
  type WorkflowApprovalFlowExecutionInput,
  type WorkflowProcessDefinition,
} from './workflow.service';
import {
  type HeaderRecord,
  requireContextBodyMatch,
  resolveTrustedRequestContext,
} from '../security/request-context';

type WorkflowStartBody = {
  organization_id?: unknown;
  actor_user_id?: unknown;
  definition?: unknown;
  subject_type?: unknown;
  subject_id?: unknown;
  current_state?: unknown;
  transition_key?: unknown;
  gatekeeper_outcome?: unknown;
  approval_decision?: unknown;
  evidence_keys_present?: unknown;
  correlation_id?: unknown;
};

type ParsedWorkflowStartBody = Omit<WorkflowApprovalFlowExecutionInput, 'organization_id' | 'actor_user_id'> & {
  organization_id: string;
  actor_user_id?: string;
};

const GATEKEEPER_OUTCOMES = new Set(['ALLOW', 'DENY', 'APPROVAL_REQUIRED', 'STOP_FOR_REVIEW']);
const APPROVAL_DECISIONS = new Set(['approved', 'rejected']);

@Controller('platform/workflows')
export class WorkflowController {
  constructor(private readonly workflowService: WorkflowService) {}

  @Post()
  startWorkflow(@Body() body: unknown, @Headers() headers: HeaderRecord) {
    const parsedBody = this.parseStartBody(body);
    const context = resolveTrustedRequestContext(headers, {
      routeOrganizationId: parsedBody.organization_id,
    });
    requireContextBodyMatch(context, {
      organization_id: parsedBody.organization_id,
      actor_user_id: parsedBody.actor_user_id,
    });

    return this.workflowService.startWorkflow({
      definition: parsedBody.definition,
      organization_id: context.organization_id,
      actor_user_id: context.actor_user_id,
      subject_type: parsedBody.subject_type,
      subject_id: parsedBody.subject_id,
      current_state: parsedBody.current_state,
      transition_key: parsedBody.transition_key,
      gatekeeper_outcome: parsedBody.gatekeeper_outcome,
      approval_decision: parsedBody.approval_decision,
      evidence_keys_present: parsedBody.evidence_keys_present,
      correlation_id: parsedBody.correlation_id,
    });
  }

  @Get(':id')
  getWorkflow(@Param('id') workflowId: string, @Headers() headers: HeaderRecord) {
    const context = resolveTrustedRequestContext(headers);

    return this.workflowService.getWorkflow({
      organization_id: context.organization_id,
      actor_user_id: context.actor_user_id,
      workflow_id: requireNonEmptyString(workflowId, 'workflow_id'),
    });
  }

  private parseStartBody(body: unknown): ParsedWorkflowStartBody {
    if (!isRecord(body)) {
      throw new BadRequestException('Workflow start body must be an object');
    }

    const input = body as WorkflowStartBody;

    return {
      organization_id: requireNonEmptyString(input.organization_id, 'organization_id'),
      actor_user_id: optionalNonEmptyString(input.actor_user_id, 'actor_user_id'),
      definition: requireWorkflowDefinition(input.definition),
      subject_type: requireNonEmptyString(input.subject_type, 'subject_type'),
      subject_id: optionalNullableString(input.subject_id, 'subject_id'),
      current_state: requireNonEmptyString(input.current_state, 'current_state'),
      transition_key: requireNonEmptyString(input.transition_key, 'transition_key'),
      gatekeeper_outcome: requireGatekeeperOutcome(input.gatekeeper_outcome),
      approval_decision: optionalApprovalDecision(input.approval_decision),
      evidence_keys_present: requireNonEmptyStringArray(input.evidence_keys_present, 'evidence_keys_present'),
      correlation_id: requireNonEmptyString(input.correlation_id, 'correlation_id'),
    };
  }
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === 'object' && input !== null && !Array.isArray(input);
}

function requireWorkflowDefinition(input: unknown): WorkflowProcessDefinition {
  if (!isRecord(input)) {
    throw new BadRequestException('Workflow start definition must be an object');
  }

  return input as WorkflowProcessDefinition;
}

function requireNonEmptyString(input: unknown, field: string): string {
  const value = optionalNonEmptyString(input, field);
  if (!value) {
    throw new BadRequestException(`Workflow ${field} is required`);
  }

  return value;
}

function optionalNonEmptyString(input: unknown, field: string): string | undefined {
  if (input === undefined) {
    return undefined;
  }
  if (typeof input !== 'string' || input.trim().length === 0) {
    throw new BadRequestException(`Workflow ${field} must be a non-empty string`);
  }

  return input.trim();
}

function optionalNullableString(input: unknown, field: string): string | null {
  if (input === undefined || input === null) {
    return null;
  }
  if (typeof input !== 'string' || input.trim().length === 0) {
    throw new BadRequestException(`Workflow ${field} must be a non-empty string when present`);
  }

  return input.trim();
}

function requireNonEmptyStringArray(input: unknown, field: string): string[] {
  if (!Array.isArray(input)) {
    throw new BadRequestException(`Workflow ${field} must be an array`);
  }
  const values = input.map((item) => requireNonEmptyString(item, field));
  if (values.length === 0) {
    throw new BadRequestException(`Workflow ${field} must not be empty`);
  }

  return values;
}

function requireGatekeeperOutcome(input: unknown): WorkflowApprovalFlowExecutionInput['gatekeeper_outcome'] {
  if (typeof input !== 'string' || !GATEKEEPER_OUTCOMES.has(input)) {
    throw new BadRequestException('Workflow gatekeeper_outcome is invalid');
  }

  return input as WorkflowApprovalFlowExecutionInput['gatekeeper_outcome'];
}

function optionalApprovalDecision(input: unknown): WorkflowApprovalFlowExecutionInput['approval_decision'] {
  if (input === undefined || input === null) {
    return null;
  }
  if (typeof input !== 'string' || !APPROVAL_DECISIONS.has(input)) {
    throw new BadRequestException('Workflow approval_decision is invalid');
  }

  return input as WorkflowApprovalFlowExecutionInput['approval_decision'];
}
