import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { TransactionIsolationLevel, type Organization, type OrganizationDomain, type Prisma } from '../prisma/prisma-client';

import { PrismaService } from '../prisma/prisma.service';
import { EventOutboxService } from '../platform-observability/event-outbox.service';
import { ModuleRegistryService } from '../module-registry/module-registry.service';
import {
  OrganizationSetupValidationError,
  validateAndNormalizeCreateOrganizationSetupInput,
} from './dto/create-organization-setup.dto';

type SetupResult = {
  organization: Pick<Organization, 'id' | 'slug' | 'display_name' | 'status' | 'created_at' | 'updated_at'>;
  domain: Pick<OrganizationDomain, 'id' | 'organization_id' | 'domain' | 'is_primary' | 'verified_at'>;
  setup_state: 'completed';
};

function isPrismaKnownRequestError(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code?: unknown }).code === 'string'
  );
}

@Injectable()
export class OrganizationSetupService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventOutboxService: EventOutboxService,
    private readonly moduleRegistryService: ModuleRegistryService,
  ) {}

  async bootstrapSetup(rawInput: unknown): Promise<SetupResult> {
    const input = this.validateInput(rawInput);

    try {
      const result = await this.prisma.$transaction(
        async (tx) => {
          const organizationCount = await tx.organization.count();
          if (organizationCount > 0) {
            throw new ConflictException('organization setup already completed');
          }

          const organization = await tx.organization.create({
            data: {
              slug: input.slug,
              display_name: input.display_name,
              status: input.status,
            },
            select: {
              id: true,
              slug: true,
              display_name: true,
              status: true,
              created_at: true,
              updated_at: true,
            },
          });

          const domain = await tx.organizationDomain.create({
            data: {
              organization_id: organization.id,
              domain: input.domain,
              is_primary: true,
              verified_at: null,
            },
            select: {
              id: true,
              organization_id: true,
              domain: true,
              is_primary: true,
              verified_at: true,
            },
          });

          await this.eventOutboxService.recordMutation(tx, {
            organization_id: organization.id,
            action_key: 'organization.setup.completed',
            entity_type: 'organization',
            entity_id: organization.id,
            actor_user_id: null,
          });

          await this.moduleRegistryService.seedCoreFoundation(tx);

          return {
            organization,
            domain,
            setup_state: 'completed' as const,
          };
        },
        {
          isolationLevel: TransactionIsolationLevel.Serializable,
        },
      );

      return result;
    } catch (error: unknown) {
      if (error instanceof ConflictException) {
        throw error;
      }

      if (isPrismaKnownRequestError(error)) {
        if (error.code === 'P2002') {
          throw new ConflictException('organization slug or domain already exists');
        }

        if (error.code === 'P2034') {
          throw new ConflictException('organization setup conflict; retry not allowed after initial setup');
        }
      }

      throw error;
    }
  }

  private validateInput(rawInput: unknown) {
    try {
      return validateAndNormalizeCreateOrganizationSetupInput(rawInput);
    } catch (error) {
      if (error instanceof OrganizationSetupValidationError) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }
}
