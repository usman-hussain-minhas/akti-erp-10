#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const REQUIRED_FILES = [
  'source_coverage_matrix_v1.json',
  'subsurface_catalog_v1.json',
  'dependency_extraction_matrix_v1.json',
  'dependency_fidelity_matrix_v1.json',
  'execution_seed_matrix_v1.json',
  'dependency_extraction_audit_v1.md',
  'dependency_fidelity_audit_v1.md',
  'execution_seed_matrix_audit_v1.md',
  'subsurface_catalog_audit_v1.md',
  'readiness_report_v1.md',
  'zero_trust_gate_summary_v1.md'
];

const SOFT_EDGE_TYPES = new Set([
  'soft_dependency',
  'conditional_dependency',
  'deferred_with_reason',
  'manual_review_required'
]);

const ALLOWED_HARD_DEPENDENCY_BASIS = new Set([
  'phase_doc_required',
  'business_logic_hard_rule',
  'adl_hard_rule',
  'activation_lifecycle_required',
  'billing_or_evidence_required',
  'manual_decision'
]);

function usageError(message) {
  const out = {
    phase: null,
    phase_root: null,
    counts: {},
    category_status: {},
    assertions: [],
    overall: 'ERROR',
    error: { type: 'usage', message }
  };
  console.log(JSON.stringify(out, null, 2));
  process.exit(2);
}

function parseArgs(argv) {
  const args = { json: false, strict: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--phase-root') args.phaseRoot = argv[++i];
    else if (arg === '--phase') args.phase = argv[++i];
    else if (arg === '--json') args.json = true;
    else if (arg === '--strict') args.strict = true;
    else usageError(`Unknown argument: ${arg}`);
  }
  if (!args.phaseRoot) usageError('Missing required --phase-root argument.');
  if (!args.phase) usageError('Missing required --phase argument.');
  return args;
}

const args = parseArgs(process.argv.slice(2));
const phaseRoot = path.resolve(process.cwd(), args.phaseRoot);
const phase = String(args.phase).toLowerCase();
const phaseLabel = phase.toUpperCase();
const serviceManifestSeedId = `seed_${phase}_service_manifest_contract`;

function filePath(name) {
  return path.join(phaseRoot, name);
}

function errorExit(type, message, details = {}) {
  const out = {
    phase,
    phase_root: phaseRoot,
    counts: {},
    category_status: {},
    assertions: [],
    overall: 'ERROR',
    error: { type, message, ...details }
  };
  console.log(JSON.stringify(out, null, 2));
  process.exit(2);
}

for (const file of REQUIRED_FILES) {
  if (!fs.existsSync(filePath(file))) {
    errorExit('missing_file', `Required file is missing: ${file}`, { file });
  }
}

function readText(file) {
  return fs.readFileSync(filePath(file), 'utf8');
}

function readJson(file) {
  try {
    return JSON.parse(readText(file));
  } catch (error) {
    errorExit('json_parse', `Failed to parse JSON file: ${file}`, { file, cause: error.message });
  }
}

const sourceCoverage = readJson('source_coverage_matrix_v1.json');
const subsurfaceCatalog = readJson('subsurface_catalog_v1.json');
const dependencyExtraction = readJson('dependency_extraction_matrix_v1.json');
readJson('dependency_fidelity_matrix_v1.json');
const executionSeedMatrix = readJson('execution_seed_matrix_v1.json');

const docs = {
  dependencyExtractionAudit: readText('dependency_extraction_audit_v1.md'),
  dependencyFidelityAudit: readText('dependency_fidelity_audit_v1.md'),
  executionSeedMatrixAudit: readText('execution_seed_matrix_audit_v1.md'),
  subsurfaceCatalogAudit: readText('subsurface_catalog_audit_v1.md'),
  readinessReport: readText('readiness_report_v1.md'),
  zeroTrustGateSummary: readText('zero_trust_gate_summary_v1.md')
};

const sourceRows = arrayField(sourceCoverage, ['rows', 'source_components', 'components']);
const subsurfaces = arrayField(subsurfaceCatalog, ['subsurfaces', 'sub_surfaces', 'rows']);
const extractionEdges = arrayField(dependencyExtraction, ['edges', 'dependency_edges', 'rows']);
const seeds = arrayField(executionSeedMatrix, ['seeds', 'execution_seeds', 'rows']);

const seedById = new Map(seeds.map(seed => [seed.seed_id, seed]));
const seedIds = new Set(seeds.map(seed => seed.seed_id));
const subsurfaceById = new Map(subsurfaces.map(subsurface => [subsurface.subsurface_id, subsurface]));
const sourceById = new Map(sourceRows.map(row => [row.source_component_id, row]));

const assertions = [];
function pass(id, detail) {
  assertions.push({ id, status: 'PASS', detail });
}
function fail(id, detail) {
  assertions.push({ id, status: 'FAIL', detail });
}
function arrayField(obj, names) {
  for (const name of names) if (Array.isArray(obj?.[name])) return obj[name];
  return [];
}
function edgeType(edge) {
  return edge.edge_type || edge.type;
}
function makeSet(values) {
  return new Set(values || []);
}
function equalSets(a, b) {
  if (a.size !== b.size) return false;
  for (const value of a) if (!b.has(value)) return false;
  return true;
}
function extractionDistribution() {
  return extractionEdges.reduce((acc, edge) => {
    const type = edgeType(edge) || 'unknown';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});
}
function seedDependencyReferenceCount() {
  return seeds.reduce((total, seed) => total + (seed.dependencies || []).length, 0);
}
function adlRefsInText(text) {
  const refs = [];
  for (const match of String(text || '').matchAll(/ADL-(\d{3})(?:\/(\d{3}))?/g)) {
    refs.push(`ADL-${match[1]}`);
    if (match[2]) refs.push(`ADL-${match[2]}`);
  }
  return [...new Set(refs)];
}
function section(text, heading) {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = text.match(new RegExp(`(^|\\n)## ${escaped}\\n([\\s\\S]*?)(?=\\n## |$)`));
  return match ? match[2] : '';
}
function countLineMatches(text, regex) {
  return text.split('\n').filter(line => regex.test(line));
}
function sourceRowHasRequiredDependencies(row) {
  const raw = String(row?.required_dependencies_raw || '').trim();
  return Boolean(raw && raw !== 'None' && !/^Existing approved platform baseline$/i.test(raw));
}

// Category A - Field-schema consistency.
{
  const failures = [];
  for (const seed of seeds) {
    for (const edge of seed.akti_local?.dependency_edges || []) {
      if (!Object.prototype.hasOwnProperty.call(edge, 'seed_id')) failures.push(`${seed.seed_id}: seed-local dependency edge missing seed_id`);
      if (Object.prototype.hasOwnProperty.call(edge, 'target_seed_id')) failures.push(`${seed.seed_id}: seed-local dependency edge contains target_seed_id`);
    }
  }
  failures.length ? fail('A1', failures) : pass('A1', 'Every seed-local dependency edge includes seed_id and none includes target_seed_id.');
}
{
  const failures = [];
  for (const seed of seeds) {
    const topLevel = makeSet(seed.dependencies || []);
    const localTargets = makeSet((seed.akti_local?.dependency_edges || []).map(edge => edge.seed_id).filter(Boolean));
    if (!equalSets(topLevel, localTargets)) {
      failures.push({ seed_id: seed.seed_id, dependencies: [...topLevel].sort(), local_edge_seed_ids: [...localTargets].sort() });
    }
  }
  failures.length ? fail('A2', failures) : pass('A2', 'Every seed top-level dependency set equals akti_local.dependency_edges[].seed_id.');
}
{
  const failures = subsurfaces
    .filter(subsurface => subsurface.manifest_required === false && (subsurface.manifest_traceability_targets || []).length > 0)
    .map(subsurface => ({ subsurface_id: subsurface.subsurface_id, manifest_traceability_targets: subsurface.manifest_traceability_targets }));
  failures.length ? fail('A3', failures) : pass('A3', 'Every manifest_required=false sub-surface has empty manifest_traceability_targets.');
}
{
  const failures = [];
  for (const seed of seeds) {
    if (seed.seed_id === serviceManifestSeedId) continue;
    const subsurface = subsurfaceById.get(seed.subsurface_id);
    if (subsurface?.manifest_required === true && !(seed.dependencies || []).includes(serviceManifestSeedId)) {
      failures.push({ seed_id: seed.seed_id, subsurface_id: seed.subsurface_id, required_dependency: serviceManifestSeedId });
    }
  }
  failures.length ? fail('A4', failures) : pass('A4', `Every manifest_required=true seed depends on ${serviceManifestSeedId}, except ${serviceManifestSeedId} itself.`);
}

// Category B - Dependency chain integrity.
{
  const failures = [];
  const visiting = new Set();
  const visited = new Set();
  const stack = [];
  function dfs(seedId) {
    if (visiting.has(seedId)) {
      failures.push(stack.concat(seedId).join(' -> '));
      return;
    }
    if (visited.has(seedId)) return;
    visiting.add(seedId);
    stack.push(seedId);
    const seed = seedById.get(seedId);
    for (const dependency of seed?.dependencies || []) {
      if (seedById.has(dependency)) dfs(dependency);
    }
    stack.pop();
    visiting.delete(seedId);
    visited.add(seedId);
  }
  for (const seed of seeds) dfs(seed.seed_id);
  failures.length ? fail('B1', failures) : pass('B1', 'DFS cycle detection found no seed dependency cycles.');
}
{
  const extractionHardPairs = new Set(
    extractionEdges
      .filter(edge => edgeType(edge) === 'hard_dependency' && edge.source_seed_id && edge.target_seed_id)
      .map(edge => `${edge.source_seed_id}->${edge.target_seed_id}`)
  );
  const seedDependencyPairs = new Set();
  for (const seed of seeds) for (const dependency of seed.dependencies || []) seedDependencyPairs.add(`${seed.seed_id}->${dependency}`);
  const extractionNotInSeeds = [...extractionHardPairs].filter(pair => !seedDependencyPairs.has(pair));
  const seedNotInExtraction = [...seedDependencyPairs].filter(pair => !extractionHardPairs.has(pair));
  const failures = { extraction_hard_edges_not_in_seed_dependencies: extractionNotInSeeds, seed_dependencies_not_in_extraction_hard_edges: seedNotInExtraction };
  extractionNotInSeeds.length || seedNotInExtraction.length ? fail('B2', failures) : pass('B2', 'Extraction hard edges and top-level seed dependencies match bidirectionally.');
}
{
  const failures = [];
  for (const seed of seeds) {
    const seedOrder = seed.akti_local?.catalog_order;
    for (const dependencyId of seed.dependencies || []) {
      const dependency = seedById.get(dependencyId);
      if (!dependency) continue;
      if (dependency.source_component_id === seed.source_component_id && (dependency.akti_local?.catalog_order ?? 0) > (seedOrder ?? 0)) {
        failures.push({ seed_id: seed.seed_id, dependency_seed_id: dependencyId, source_component_id: seed.source_component_id, seed_order: seedOrder, dependency_order: dependency.akti_local?.catalog_order });
      }
    }
  }
  failures.length ? fail('B3', failures) : pass('B3', 'No same-component dependency points forward in catalog order.');
}

// Category C - Semantic field quality.
{
  const failures = sourceRows
    .filter(row => /flags align/i.test(row.manifest_foundry_consistency_rationale || ''))
    .map(row => row.source_component_id);
  failures.length ? fail('C1', failures) : pass('C1', 'No source coverage row contains generic Flags align rationale.');
}
{
  const phrase = new RegExp(`No upstream Phase\\s+${phaseLabel}\\s+seed dependency applies after dependency extraction`, 'i');
  const failures = seeds
    .filter(seed => (seed.dependencies || []).length === 0)
    .filter(seed => phrase.test(seed.dependency_reason || ''))
    .map(seed => seed.seed_id);
  failures.length ? fail('C2', failures) : pass('C2', `No root seed contains generic Phase ${phaseLabel} root boilerplate dependency_reason.`);
}
{
  const failures = [];
  for (const edge of extractionEdges) {
    const proseRefs = adlRefsInText(`${edge.reason || ''} ${edge.edge_basis || ''} ${edge.hard_dependency_basis || ''}`);
    const structuredRefs = edge.adl_refs || [];
    for (const ref of proseRefs) {
      if (!structuredRefs.includes(ref)) failures.push({ dependency_edge_id: edge.dependency_edge_id, missing_ref: ref, adl_refs: structuredRefs, reason: edge.reason });
    }
  }
  failures.length ? fail('C3', failures) : pass('C3', 'Every ADL prose reference in extraction edges appears in structured adl_refs.');
}
{
  const failures = [];
  for (const row of sourceRows) {
    const optionalRaw = String(row.optional_dependencies_raw || '').trim();
    if (!optionalRaw || optionalRaw === 'None') continue;
    const represented = extractionEdges.some(edge => edge.source_component_id === row.source_component_id && SOFT_EDGE_TYPES.has(edgeType(edge)));
    if (!represented) failures.push({ source_component_id: row.source_component_id, optional_dependencies_raw: optionalRaw });
  }
  failures.length ? fail('C4', failures) : pass('C4', 'Every source row with optional dependencies has soft/conditional/deferred/manual-review extraction representation.');
}
{
  const failures = extractionEdges
    .filter(edge => edgeType(edge) === 'hard_dependency')
    .filter(edge => !ALLOWED_HARD_DEPENDENCY_BASIS.has(edge.hard_dependency_basis))
    .map(edge => ({ dependency_edge_id: edge.dependency_edge_id, hard_dependency_basis: edge.hard_dependency_basis }));
  failures.length ? fail('C5', failures) : pass('C5', 'Every hard dependency has an approved hard_dependency_basis.');
}

// Category D - Count consistency.
{
  const failures = [];
  const dist = extractionDistribution();
  const distText = `hard_dependency=${dist.hard_dependency || 0} / deferred_with_reason=${dist.deferred_with_reason || 0} / conditional_dependency=${dist.conditional_dependency || 0} / manual_review_required=${dist.manual_review_required || 0}`;
  const distJson = JSON.stringify({ hard_dependency: dist.hard_dependency || 0, deferred_with_reason: dist.deferred_with_reason || 0, conditional_dependency: dist.conditional_dependency || 0, manual_review_required: dist.manual_review_required || 0 });
  const seedRefs = seedDependencyReferenceCount();
  const extractionCurrent = section(docs.dependencyExtractionAudit, 'Current Final State Summary');
  const extractionSummary = section(docs.dependencyExtractionAudit, 'Summary') || extractionCurrent;
  const extractionSections = [extractionCurrent, extractionSummary].filter(Boolean);
  for (const [index, text] of extractionSections.entries()) {
    if (!new RegExp(`(?:Extraction|Dependency) edges:\\s*${extractionEdges.length}\\b`).test(text)) failures.push(`dependency_extraction_audit_v1.md section ${index + 1} missing live extraction edge count ${extractionEdges.length}`);
    const distributionLines = countLineMatches(text, /Distribution:|Extraction edge distribution:/);
    if (!distributionLines.length) failures.push(`dependency_extraction_audit_v1.md section ${index + 1} missing distribution line`);
    for (const line of distributionLines) {
      if (!line.includes(distJson) && !line.includes(distText)) failures.push(`dependency_extraction_audit_v1.md stale distribution line: ${line.trim()}`);
    }
  }
  const seedCurrent = section(docs.executionSeedMatrixAudit, 'Current Final State Summary');
  if (!new RegExp(`Seeds:\\s*${seeds.length}\\b`).test(seedCurrent)) failures.push(`execution_seed_matrix_audit_v1.md missing live seed count ${seeds.length}`);
  if (!new RegExp(`Top-level seed dependency references:\\s*${seedRefs}\\b`).test(seedCurrent)) failures.push(`execution_seed_matrix_audit_v1.md missing live seed dependency reference count ${seedRefs}`);
  const subsurfaceCurrent = section(docs.subsurfaceCatalogAudit, 'Current Final State Summary');
  if (!new RegExp(`Sub-surfaces:\\s*${subsurfaces.length}\\b`).test(subsurfaceCurrent)) failures.push(`subsurface_catalog_audit_v1.md missing live sub-surface count ${subsurfaces.length}`);
  for (const [name, text] of [['readiness_report_v1.md', docs.readinessReport], ['zero_trust_gate_summary_v1.md', docs.zeroTrustGateSummary]]) {
    const current = section(text, 'Current Final State Summary');
    if (!new RegExp(`Source components:\\s*${sourceRows.length}\\b`).test(current)) failures.push(`${name} missing live source component count ${sourceRows.length}`);
    if (!new RegExp(`Sub-surfaces:\\s*${subsurfaces.length}\\b`).test(current)) failures.push(`${name} missing live sub-surface count ${subsurfaces.length}`);
    if (!new RegExp(`Seeds:\\s*${seeds.length}\\b`).test(current)) failures.push(`${name} missing live seed count ${seeds.length}`);
    if (!new RegExp(`Extraction edges:\\s*${extractionEdges.length}\\b`).test(current)) failures.push(`${name} missing live extraction edge count ${extractionEdges.length}`);
    if (!current.includes(`Extraction edge distribution: ${distText}`)) failures.push(`${name} missing live extraction distribution ${distText}`);
    if (!new RegExp(`Top-level seed dependency references:\\s*${seedRefs}\\b`).test(current)) failures.push(`${name} missing live seed dependency reference count ${seedRefs}`);
  }
  failures.length ? fail('D1', failures) : pass('D1', 'Audit/report documents report live JSON counts and distribution.');
}
{
  const failures = [];
  const rootSeeds = seeds.filter(seed => (seed.dependencies || []).length === 0).map(seed => seed.seed_id);
  for (const [name, text] of [['readiness_report_v1.md', docs.readinessReport], ['zero_trust_gate_summary_v1.md', docs.zeroTrustGateSummary]]) {
    const current = section(text, 'Current Final State Summary');
    const reportsCurrentCount = new RegExp(`Root seeds:\\s*${rootSeeds.length}\\b`).test(current);
    const hasRootList = /Current root seeds:/i.test(text) || /Root seed list:/i.test(text);
    const documentsRootChange = /root count change|root-count change|root seed count change|before\/after root/i.test(text);
    if (!reportsCurrentCount) failures.push(`${name} missing current root seed count ${rootSeeds.length}`);
    if (!hasRootList && !documentsRootChange) failures.push(`${name} must list current root seeds or document root-count changes`);
  }
  failures.length ? fail('D2', failures) : pass('D2', 'Readiness report and gate summary report current root seed count and root list/change context.');
}
{
  const trueWithTargets = subsurfaces.filter(subsurface => subsurface.manifest_required === true && (subsurface.manifest_traceability_targets || []).length > 0).length;
  const falseEmptyTargets = subsurfaces.filter(subsurface => subsurface.manifest_required === false && (subsurface.manifest_traceability_targets || []).length === 0).length;
  const falseWithTargets = subsurfaces.filter(subsurface => subsurface.manifest_required === false && (subsurface.manifest_traceability_targets || []).length > 0).length;
  falseWithTargets === 0
    ? pass('D3', { manifest_required_true_with_targets: trueWithTargets, manifest_required_false_empty_targets: falseEmptyTargets, manifest_required_false_with_targets: falseWithTargets })
    : fail('D3', { manifest_required_true_with_targets: trueWithTargets, manifest_required_false_empty_targets: falseEmptyTargets, manifest_required_false_with_targets: falseWithTargets });
}

// Category E - Inheritance trace completeness.
{
  const seedCountBySourceComponent = new Map();
  for (const seed of seeds) seedCountBySourceComponent.set(seed.source_component_id, (seedCountBySourceComponent.get(seed.source_component_id) || 0) + 1);
  const failures = [];
  for (const seed of seeds) {
    const sourceRow = sourceById.get(seed.source_component_id);
    if ((seedCountBySourceComponent.get(seed.source_component_id) || 0) > 1 && sourceRowHasRequiredDependencies(sourceRow)) {
      const traces = seed.akti_local?.parent_required_dependency_trace;
      if (!Array.isArray(traces) || traces.length === 0) failures.push(seed.seed_id);
    }
  }
  failures.length ? fail('E1', failures) : pass('E1', 'Every split-child seed with parent required dependencies includes parent_required_dependency_trace.');
}
{
  const allowedStatuses = new Set(['inherited', 'satisfied_by_anchor_child', 'not_applicable_with_reason']);
  const failures = [];
  for (const seed of seeds) {
    for (const trace of seed.akti_local?.parent_required_dependency_trace || []) {
      if (!allowedStatuses.has(trace.inheritance_status)) failures.push({ seed_id: seed.seed_id, invalid_inheritance_status: trace.inheritance_status });
      if (!String(trace.reason || '').trim()) failures.push({ seed_id: seed.seed_id, trace, problem: 'missing reason' });
      if (trace.inheritance_status === 'inherited' && trace.target_seed_id && !(seed.dependencies || []).includes(trace.target_seed_id)) failures.push({ seed_id: seed.seed_id, inherited_target_missing_from_dependencies: trace.target_seed_id });
      if (trace.inheritance_status === 'satisfied_by_anchor_child' && !seedIds.has(trace.anchor_seed_id)) failures.push({ seed_id: seed.seed_id, missing_anchor_seed_id: trace.anchor_seed_id });
    }
  }
  failures.length ? fail('E2', failures) : pass('E2', 'Inheritance statuses are valid, inherited targets are dependencies, anchor children resolve, and traces have reasons.');
}

const categoryStatus = {
  A: assertions.filter(assertion => assertion.id.startsWith('A')).every(assertion => assertion.status === 'PASS') ? 'PASS' : 'FAIL',
  B: assertions.filter(assertion => assertion.id.startsWith('B')).every(assertion => assertion.status === 'PASS') ? 'PASS' : 'FAIL',
  C: assertions.filter(assertion => assertion.id.startsWith('C')).every(assertion => assertion.status === 'PASS') ? 'PASS' : 'FAIL',
  D: assertions.filter(assertion => assertion.id.startsWith('D')).every(assertion => assertion.status === 'PASS') ? 'PASS' : 'FAIL',
  E: assertions.filter(assertion => assertion.id.startsWith('E')).every(assertion => assertion.status === 'PASS') ? 'PASS' : 'FAIL'
};
const overall = Object.values(categoryStatus).every(status => status === 'PASS') ? 'PASS' : 'FAIL';
const summary = {
  phase,
  phase_root: phaseRoot,
  counts: {
    source_components: sourceRows.length,
    subsurfaces: subsurfaces.length,
    seeds: seeds.length,
    extraction_edges: extractionEdges.length,
    extraction_edge_distribution: extractionDistribution(),
    seed_dependency_references: seedDependencyReferenceCount(),
    root_seeds: seeds.filter(seed => (seed.dependencies || []).length === 0).length,
    manifest_required_true_with_targets: subsurfaces.filter(subsurface => subsurface.manifest_required === true && (subsurface.manifest_traceability_targets || []).length > 0).length,
    manifest_required_false_empty_targets: subsurfaces.filter(subsurface => subsurface.manifest_required === false && (subsurface.manifest_traceability_targets || []).length === 0).length,
    manifest_required_false_with_targets: subsurfaces.filter(subsurface => subsurface.manifest_required === false && (subsurface.manifest_traceability_targets || []).length > 0).length
  },
  category_status: categoryStatus,
  assertions,
  overall
};
console.log(JSON.stringify(summary, null, 2));
process.exit(overall === 'PASS' ? 0 : 1);
