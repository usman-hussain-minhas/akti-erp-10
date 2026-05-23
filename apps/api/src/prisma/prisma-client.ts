import { createRequire } from 'node:module';
import { delimiter, dirname } from 'node:path';

import type * as GeneratedPrismaClient from '../../generated/prisma-client';

type GeneratedPrismaClientModule = typeof GeneratedPrismaClient;
type PrismaRuntime = {
  TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted';
    ReadCommitted: 'ReadCommitted';
    RepeatableRead: 'RepeatableRead';
    Serializable: 'Serializable';
  };
};

const runtimeRequire = createRequire(__filename);

function registerPrismaRuntimeDependencyPath() {
  const prismaClientPackageJson = ['@prisma', 'client', 'package.json'].join('/');
  const packageJsonPath = runtimeRequire.resolve(prismaClientPackageJson);
  const packageNodeModulesPath = dirname(dirname(dirname(packageJsonPath)));
  const nodePathEntries = process.env.NODE_PATH?.split(delimiter).filter(Boolean) ?? [];

  if (!nodePathEntries.includes(packageNodeModulesPath)) {
    process.env.NODE_PATH = [...nodePathEntries, packageNodeModulesPath].join(delimiter);
    const moduleLoader = runtimeRequire('node:module') as { Module: { _initPaths(): void } };
    moduleLoader.Module._initPaths();
  }
}

registerPrismaRuntimeDependencyPath();

const generatedPrismaClient = runtimeRequire('../../generated/prisma-client') as GeneratedPrismaClientModule;
const generatedPrismaRuntime = generatedPrismaClient as unknown as { Prisma: PrismaRuntime };

export const PrismaClient = generatedPrismaClient.PrismaClient;
export const TransactionIsolationLevel = generatedPrismaRuntime.Prisma.TransactionIsolationLevel;
export type { Prisma } from '../../generated/prisma-client';
export type * from '../../generated/prisma-client';
