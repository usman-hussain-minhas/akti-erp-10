import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
  scripts?: {
    test?: string;
  };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

const REQUIRED_GATEKEEPER_NEGATIVE_TEST_COMMANDS = [
  'pnpm exec tsx src/gatekeeper/gatekeeper.p5b-007e.test.ts',
  'pnpm exec tsx src/gatekeeper/gatekeeper.p5b-008f.test.ts',
  'pnpm exec tsx src/gatekeeper/gatekeeper.p5b-008g.test.ts',
];

function testGatekeeperNegativeTestsAreWiredIntoApiPackageTestScript() {
  const testScript = packageJson.scripts?.test ?? '';

  for (const command of REQUIRED_GATEKEEPER_NEGATIVE_TEST_COMMANDS) {
    assert.ok(testScript.includes(command), `API test script includes ${command}`);
  }

  const positions = REQUIRED_GATEKEEPER_NEGATIVE_TEST_COMMANDS.map((command) => testScript.indexOf(command));
  assert.deepEqual([...positions].sort((left, right) => left - right), positions);
}

function testWiredGatekeeperNegativeTestFilesExist() {
  for (const command of REQUIRED_GATEKEEPER_NEGATIVE_TEST_COMMANDS) {
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
  testGatekeeperNegativeTestsAreWiredIntoApiPackageTestScript();
  testWiredGatekeeperNegativeTestFilesExist();
  testNoDependencyOrLockfileChangeIsNeededForWiring();

  console.log('P5B-033c Gatekeeper negative test CI wiring proof passed.');
}

run();
