import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const aliasConfig = readFileSync('lib/crm-alias.config.ts', 'utf8');
const shell = readFileSync('components/mission-control/mission-control-shell.tsx', 'utf8');
const launcher = readFileSync('components/mission-control/module-launcher.tsx', 'utf8');
const palette = readFileSync('components/mission-control/command-palette.tsx', 'utf8');
const workspace = readFileSync('app/lead-desk/lead-desk-workspace.tsx', 'utf8');
const dashboard = readFileSync('components/mission-control/dashboard-overview.tsx', 'utf8');
const manifest = readFileSync('../../packages/contracts/lead-desk-core.module-manifest.contract.ts', 'utf8');
const schema = readFileSync('../../prisma/schema.prisma', 'utf8');

test('CRM alias config preserves Lead Desk technical route and module key', () => {
  assert.match(aliasConfig, /CRM_VISIBLE_LABEL = 'CRM'/);
  assert.equal(aliasConfig.includes("LEAD_DESK_TECHNICAL_ROUTE_PREFIX = '/lead-desk'"), true);
  assert.equal(aliasConfig.includes("LEAD_DESK_TECHNICAL_MODULE_KEY = 'lead.desk'"), true);
  assert.match(aliasConfig, /CRM_VISIBLE_LABEL_RULE/);
  assert.match(aliasConfig, /do not rename lead-desk routes/);
  assert.match(aliasConfig, /CRM_TECHNICAL_RENAME_FORBIDDEN/);
});

test('visible shell surfaces use CRM while technical routes remain lead-desk', () => {
  for (const source of [shell, launcher, palette, workspace, dashboard]) {
    assert.match(source, /CRM_VISIBLE_LABEL/);
  }

  for (const source of [shell, launcher, palette, workspace]) {
    assert.equal(source.includes('/lead-desk'), true);
  }
});

test('Lead Desk technical contracts and Prisma schema are not renamed', () => {
  assert.equal(manifest.includes('module_key: "lead.desk"'), true);
  assert.equal(manifest.includes('/api/lead-desk/organizations'), true);
  assert.doesNotMatch(manifest, /module_key: "crm"/);
  assert.doesNotMatch(schema, /model\\s+Crm/);
});
