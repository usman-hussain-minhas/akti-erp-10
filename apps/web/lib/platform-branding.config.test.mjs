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

test('platform branding defaults encode visual direction without backend tokens', () => {
  const config = readFileSync('lib/platform-branding.config.ts', 'utf8');

  assert.match(config, /themeDefault: 'system'/);
  assert.match(config, /flagshipMode: 'dark'/);
  assert.match(config, /lightModeSource: 'derived_from_dark_mode'/);
  assert.match(config, /cssTokensProvidedByBackend: false/);
  assert.match(config, /databaseRecordRequired: false/);
  assert.match(config, /brandIdentity: 'purple_violet'/);
  assert.match(config, /actionAndActivation: 'teal_cyan'/);
  assert.match(config, /warning: 'amber'/);
  assert.match(config, /success: 'emerald'/);
  assert.match(config, /danger: 'red_rose'/);
});
