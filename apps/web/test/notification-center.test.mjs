import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const notificationCenter = readFileSync(new URL('../components/mission-control/notification-center.tsx', import.meta.url), 'utf8');
const shell = readFileSync(new URL('../components/mission-control/mission-control-shell.tsx', import.meta.url), 'utf8');

test('notification center renders bell badge drawer toast and empty shell states', () => {
  for (const text of [
    'summary.unreadCount} unread',
    'aria-hidden="true"',
    'Notification center',
    'Notification drawer',
    'ToastMessage',
    'No notifications',
    'Permission-aware placeholder',
    '/platform/notifications/summary',
    'NotificationSummaryState',
  ]) {
    assert.match(notificationCenter, new RegExp(text));
  }
});

test('notification shell remains a drawer region without a route', () => {
  assert.ok(shell.includes('<NotificationCenter />'));
  assert.match(shell, /id="notification-region"/);
  assert.equal(notificationCenter.includes('href='), false);
  assert.equal(notificationCenter.includes('href="/notifications"'), false);
  assert.equal(shell.includes('/notifications'), false);
});

test('notification center excludes deferred communication semantics', () => {
  for (const text of ['module-driven', 'real-time', 'WhatsApp', 'SMS', 'email', 'retention', 'escalation', 'mention']) {
    assert.equal(notificationCenter.includes(text), false);
  }
});
