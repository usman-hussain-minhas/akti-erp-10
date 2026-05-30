import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const globals = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const button = readFileSync(new URL('../components/ui/button.tsx', import.meta.url), 'utf8');
const proof = readFileSync(new URL('../components/phase4b_shadcn_import_proof.tsx', import.meta.url), 'utf8');
const componentsConfig = readFileSync(new URL('../components.json', import.meta.url), 'utf8');

test('Tailwind global stylesheet is wired into the web app layout', () => {
  assert.match(globals, /@import "tailwindcss"/);
  assert.equal(layout.includes("import './globals.css';"), true);
});

test('shadcn setup exposes a button component import proof', () => {
  assert.match(button, /@radix-ui\/react-slot/);
  assert.match(button, /class-variance-authority/);
  assert.match(button, /buttonVariants/);
  assert.match(proof, /Phase4BShadcnImportProof/);
  assert.match(proof, /<Button/);
});

test('components configuration records the Tailwind and shadcn direction', () => {
  const parsed = JSON.parse(componentsConfig);
  assert.equal(parsed.style, 'new-york');
  assert.equal(parsed.tsx, true);
  assert.equal(parsed.rsc, true);
  assert.equal(parsed.tailwind.css, 'app/globals.css');
  assert.equal(parsed.iconLibrary, 'lucide');
});
