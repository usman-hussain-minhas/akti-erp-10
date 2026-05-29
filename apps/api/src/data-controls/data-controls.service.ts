import { BadRequestException, Injectable } from '@nestjs/common';

export type DataControlsStatusRequest = {
  organization_id: string;
  actor_user_id: string;
};

export type DataControlsStatusResponse = {
  import_export: 'unavailable';
  retention_policy: 'inactive';
  audit_controls: 'inactive';
  tenant_context: {
    organization_id: string;
    actor_user_id: string;
  };
  capability: {
    required: 'platform.data.controls.view';
  };
  execution: {
    import_run_enabled: false;
    export_run_enabled: false;
    backup_restore_enabled: false;
    retention_workflow_enabled: false;
  };
};

@Injectable()
export class DataControlsService {
  getStatus(input: DataControlsStatusRequest): DataControlsStatusResponse {
    const organizationId = this.nonEmpty(input.organization_id, 'organization_id');
    const actorUserId = this.nonEmpty(input.actor_user_id, 'actor_user_id');

    return {
      import_export: 'unavailable',
      retention_policy: 'inactive',
      audit_controls: 'inactive',
      tenant_context: {
        organization_id: organizationId,
        actor_user_id: actorUserId,
      },
      capability: {
        required: 'platform.data.controls.view',
      },
      execution: {
        import_run_enabled: false,
        export_run_enabled: false,
        backup_restore_enabled: false,
        retention_workflow_enabled: false,
      },
    };
  }

  private nonEmpty(value: string, field: string): string {
    if (typeof value !== 'string' || value.trim().length === 0) {
      throw new BadRequestException(`data controls status ${field} is required`);
    }

    return value.trim();
  }
}
