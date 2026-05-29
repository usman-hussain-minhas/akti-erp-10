import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
  scripts?: {
    test?: string;
  };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const REQUIRED_FOUNDRY_LIFECYCLE_TEST_COMMANDS = [
  'pnpm exec tsx src/foundry/foundry.p5b-012b.test.ts',
  'pnpm exec tsx src/foundry/foundry.p5b-012c.test.ts',
  'pnpm exec tsx src/foundry/foundry.p5b-013a.test.ts',
  'pnpm exec tsx src/foundry/foundry.p5b-013b.test.ts',
  'pnpm exec tsx src/foundry/foundry.p5b-013c.test.ts',
  'pnpm exec tsx src/foundry/foundry.p5b-014a.test.ts',
  'pnpm exec tsx src/foundry/foundry.p5b-014b.test.ts',
];

function testFoundryLifecycleTestsAreWiredIntoApiPackageTestScript() {
  const testScript = packageJson.scripts?.test ?? '';

  for (const command of REQUIRED_FOUNDRY_LIFECYCLE_TEST_COMMANDS) {
    assert.ok(testScript.includes(command), `API test script includes ${command}`);
  }

  const positions = REQUIRED_FOUNDRY_LIFECYCLE_TEST_COMMANDS.map((command) => testScript.indexOf(command));
  assert.deepEqual([...positions].sort((left, right) => left - right), positions);
}

function testWiredFoundryLifecycleTestFilesExist() {
  for (const command of REQUIRED_FOUNDRY_LIFECYCLE_TEST_COMMANDS) {
    const filePath = command.replace('pnpm exec tsx ', '');
    assert.equal(existsSync(filePath), true, `${filePath} exists`);
  }
}

function testNoDependencyOrLockfileChangeIsNeededForWiring() {
  assert.equal(packageJson.dependencies?.tsx, undefined);
  assert.equal(packageJson.devDependencies?.tsx, undefined);
  assert.equal(existsSync('../../pnpm-lock.yaml'), true);
}

function run() {
  testFoundryLifecycleTestsAreWiredIntoApiPackageTestScript();
  testWiredFoundryLifecycleTestFilesExist();
  testNoDependencyOrLockfileChangeIsNeededForWiring();

  console.log('P5B-033b Foundry lifecycle CI test wiring proof passed.');
}

run();
