import { internalFixtureModuleManifest } from "./internal-fixture.module-manifest.contract.js";
import { ModuleManifestSchema } from "./module-manifest.schema.js";

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function testInternalFixtureManifestParsesAgainstModuleManifestSchema() {
  const result = ModuleManifestSchema.safeParse(internalFixtureModuleManifest);

  assert(result.success, "internal fixture manifest parses");
  assert(internalFixtureModuleManifest.module_key === "platform.fixture", "module key is platform.fixture");
  assert(
    internalFixtureModuleManifest.display_name === "Internal Platform Fixture",
    "display name is Internal Platform Fixture",
  );
  assert(internalFixtureModuleManifest.owner === "platform", "owner is platform");
}

function testInternalFixtureUsesPlatformOnlyCapabilityAndDependencySurface() {
  const capabilityKeys = new Set(internalFixtureModuleManifest.capabilities.map((capability) => capability.key));
  const consumedCapabilityKeys = new Set(
    internalFixtureModuleManifest.capabilities_consumed.map((capability) => capability.capability_key),
  );
  const dependencyKeys = new Set(internalFixtureModuleManifest.dependencies.map((dependency) => dependency.module_key));

  assert(
    JSON.stringify([...capabilityKeys].sort()) ===
      JSON.stringify(["platform.fixture.manage", "platform.fixture.read"]),
    "fixture capabilities are platform-only",
  );
  assert(consumedCapabilityKeys.has("platform.shell.access"), "fixture consumes platform.shell.access");
  assert(JSON.stringify([...dependencyKeys]) === JSON.stringify(["core.access"]), "fixture depends only on core.access");
}

function testManageCapabilityIsGatekeeperGoverned() {
  const manageCapability = internalFixtureModuleManifest.capabilities.find(
    (capability) => capability.key === "platform.fixture.manage",
  );
  const gatekeeperHook = internalFixtureModuleManifest.gatekeeper_hooks.find(
    (hook) => hook.capability_key === "platform.fixture.manage",
  );

  assert(manageCapability?.risk_level === "high", "manage capability is high risk");
  assert(manageCapability?.requires_audit === true, "manage capability requires audit");
  assert(manageCapability?.gatekeeper_required === true, "manage capability requires Gatekeeper");
  assert(gatekeeperHook?.required === true, "manage capability has required Gatekeeper hook");
}

function testInternalFixtureDoesNotDeclareBusinessGoldenMarketplaceOrProviderScope() {
  const serialized = JSON.stringify(internalFixtureModuleManifest).toLowerCase();

  for (const forbidden of [
    "lead.desk",
    "admissions",
    "finance",
    "hr",
    "golden",
    "marketplace",
    "whatsapp",
    "provider api key",
  ]) {
    assert(!serialized.includes(forbidden), `manifest must not contain ${forbidden}`);
  }

  assert(internalFixtureModuleManifest.data_ownership.sensitive_data === false, "fixture is not sensitive data");
  assert(
    internalFixtureModuleManifest.disable_behavior.blocks_dependent_modules === false,
    "fixture does not block dependent modules",
  );
}

function run() {
  testInternalFixtureManifestParsesAgainstModuleManifestSchema();
  testInternalFixtureUsesPlatformOnlyCapabilityAndDependencySurface();
  testManageCapabilityIsGatekeeperGoverned();
  testInternalFixtureDoesNotDeclareBusinessGoldenMarketplaceOrProviderScope();

  console.log("P5B-035a internal fixture manifest proof passed.");
}

run();
