import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const globals = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8');
const primitives = readFileSync(new URL('../components/ui/design-system.tsx', import.meta.url), 'utf8');
const button = readFileSync(new URL('../components/ui/button.tsx', import.meta.url), 'utf8');

test('design system exposes baseline must-use component families', () => {
  const expectedExports = [
    'TextLink',
    'Field',
    'Input',
    'Textarea',
    'ValidationMessage',
    'SectionCard',
    'DataTable',
    'ModalPanel',
    'DrawerPanel',
    'ToastMessage',
    'StateMessage',
    'TabsList',
    'StatusBadge',
    'Breadcrumbs',
    'NavigationList',
    'EmptyState',
    'LoadingState',
    'ErrorState',
    'PermissionState',
    'DegradedState',
    'SuccessState',
    'FormActions',
    'DisabledReason',
  ];

  for (const exportName of expectedExports) {
    assert.match(primitives, new RegExp(`export function ${exportName}`));
  }
});

test('baseline tokens cover semantic color and focus states', () => {
  for (const token of ['--background', '--foreground', '--surface', '--border', '--primary', '--accent', '--success', '--warning', '--info', '--danger', '--ring']) {
    assert.match(globals, new RegExp(token));
  }

  for (const token of ['--akti-cyan', '--akti-violet', '--akti-emerald', '--phase5c-bg', '--phase5c-surface', '--phase5c-border']) {
    assert.match(globals, new RegExp(token));
  }

  assert.match(globals, /data-theme='light'/);
  assert.match(globals, /:focus-visible/);
});

test('component behavior rules include readable disabled focus and state handling', () => {
  assert.match(button, /disabled:pointer-events-none/);
  assert.match(button, /focus-visible:ring-2/);
  assert.match(primitives, /aria-modal="true"/);
  assert.match(primitives, /role="status"/);
  assert.match(primitives, /aria-label="Breadcrumb"/);
  assert.match(primitives, /aria-label="Primary navigation"/);
  assert.match(primitives, /LoadingState/);
  assert.match(primitives, /ErrorState/);
  assert.match(primitives, /PermissionState/);
  assert.match(primitives, /DegradedState/);
  assert.match(primitives, /EmptyState/);
});
