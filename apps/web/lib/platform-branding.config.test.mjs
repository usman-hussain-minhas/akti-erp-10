import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

test('platform branding config defines AKTI Spark without package rename', () => {
  const config = readFileSync('lib/platform-branding.config.ts', 'utf8');
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));

  assert.match(config, /PLATFORM_PRODUCT_NAME = 'AKTI Spark'/);
  assert.match(config, /PLATFORM_LEGACY_PRODUCT_NAME = 'AKTI ERP'/);
  assert.equal(packageJson.name, '@akti/web');
});

test('UI shell brand copy uses the frontend display substrate', () => {
  const page = readFileSync('app/page.tsx', 'utf8');
  const shell = readFileSync('components/mission-control/mission-control-shell.tsx', 'utf8');

  assert.match(page, /PLATFORM_PRODUCT_NAME/);
  assert.match(shell, /PLATFORM_PRODUCT_NAME/);
  assert.doesNotMatch(page, /AKTI ERP Web Scaffold/);
  assert.doesNotMatch(shell, />AKTI ERP</);
});
