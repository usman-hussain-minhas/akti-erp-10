import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, type OrganizationUnit, type OrganizationUnitClosure } from '../../node_modules/.prisma/client';

import { PrismaService } from '../prisma/prisma.service';

type DbClient = PrismaService | Prisma.TransactionClient;

export type CreateUnitWithClosureInput = {
  organization_id: string;
  unit_type_id: string;
  parent_unit_id?: string | null;
  key: string;
  name: string;
  status: string;
};

type UnitRecord = Pick<
  OrganizationUnit,
  'id' | 'organization_id' | 'unit_type_id' | 'parent_unit_id' | 'key' | 'name' | 'status'
>;

type ClosureRecord = Pick<OrganizationUnitClosure, 'organization_id' | 'ancestor_unit_id' | 'descendant_unit_id' | 'depth'>;

export type CreateUnitWithClosureResult = {
  unit: UnitRecord;
  closure_rows: ClosureRecord[];
};

@Injectable()
export class HierarchyClosureService {
  constructor(private readonly prisma: PrismaService) {}

  async createUnitWithClosure(input: CreateUnitWithClosureInput): Promise<CreateUnitWithClosureResult> {
    return this.prisma.$transaction(
      (tx) => this.createUnitWithClosureInTransaction(tx, input),
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  async createUnitWithClosureInTransaction(
    db: DbClient,
    input: CreateUnitWithClosureInput,
  ): Promise<CreateUnitWithClosureResult> {
    let parentChain: Array<{ ancestor_unit_id: string; depth: number }> = [];

    if (input.parent_unit_id) {
      parentChain = await db.organizationUnitClosure.findMany({
        where: {
          organization_id: input.organization_id,
          descendant_unit_id: input.parent_unit_id,
        },
        select: {
          ancestor_unit_id: true,
          depth: true,
        },
      });

      if (parentChain.length === 0) {
        throw new BadRequestException('parent unit not found in organization');
      }
    }

    const unit = await db.organizationUnit.create({
      data: {
        organization_id: input.organization_id,
        unit_type_id: input.unit_type_id,
        parent_unit_id: input.parent_unit_id ?? null,
        key: input.key,
        name: input.name,
        status: input.status,
      },
      select: {
        id: true,
        organization_id: true,
        unit_type_id: true,
        parent_unit_id: true,
        key: true,
        name: true,
        status: true,
      },
    });

    const closureRows: ClosureRecord[] = [
      {
        organization_id: input.organization_id,
        ancestor_unit_id: unit.id,
        descendant_unit_id: unit.id,
        depth: 0,
      },
    ];

    if (input.parent_unit_id) {
      closureRows.push(
        ...parentChain.map((ancestor) => ({
          organization_id: input.organization_id,
          ancestor_unit_id: ancestor.ancestor_unit_id,
          descendant_unit_id: unit.id,
          depth: ancestor.depth + 1,
        })),
      );
    }

    await db.organizationUnitClosure.createMany({
      data: closureRows,
    });

    return {
      unit,
      closure_rows: closureRows,
    };
  }
}
