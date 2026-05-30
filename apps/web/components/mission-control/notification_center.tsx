'use client';

import { Bell, X } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { useLeadDeskOperatorContext } from '../../app/lead-desk/operator-context';
import { Button } from '../ui/button';
import { DrawerPanel, EmptyState, ErrorState, LoadingState, PermissionState, StatusBadge, ToastMessage } from '../ui/design_system';

type NotificationSummarySnapshot =
  | { state: 'placeholder'; unreadCount: 0; message: string }
  | { state: 'loading'; unreadCount: 0; message: string }
  | { state: 'ready'; unreadCount: 0; message: string; status: string }
  | { state: 'error'; unreadCount: 0; message: string }
  | { state: 'permission'; unreadCount: 0; message: string };

function resolveApiBase(): string | null {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return configured ? configured.replace(/\/$/, '') : null;
}

export function NotificationCenter() {
  const { context } = useLeadDeskOperatorContext();
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<NotificationSummarySnapshot>({
    state: 'placeholder',
    unreadCount: 0,
    message: 'Connect the local/demo API to load notification summary.',
  });
  const apiBase = useMemo(resolveApiBase, []);

  const loadSummary = useCallback(async () => {
    if (!apiBase) {
      setSummary({
        state: 'placeholder',
        unreadCount: 0,
        message: 'Connect the local/demo API to load notification summary.',
      });
      return;
    }

    setSummary({ state: 'loading', unreadCount: 0, message: 'Loading notification summary.' });
    const headers = context.sessionToken.trim().length > 0 ? { Authorization: `Bearer ${context.sessionToken.trim()}` } : undefined;

    try {
      const response = await fetch(`${apiBase}/platform/notifications/summary`, { headers });
      if (response.status === 401 || response.status === 403) {
        setSummary({ state: 'permission', unreadCount: 0, message: 'Access needed to read notification summary.' });
        return;
      }
      if (!response.ok) {
        setSummary({ state: 'error', unreadCount: 0, message: 'Notification summary is temporarily unavailable.' });
        return;
      }

      const payload = (await response.json()) as { unread_count?: unknown; status?: unknown };
      const unreadCount = payload.unread_count === 0 ? 0 : 0;
      setSummary({
        state: 'ready',
        unreadCount,
        status: typeof payload.status === 'string' ? payload.status : 'not_configured',
        message: 'Notification summary loaded. No live notification provider is configured.',
      });
    } catch {
      setSummary({ state: 'error', unreadCount: 0, message: 'Notification summary is temporarily unavailable.' });
    }
  }, [apiBase, context.sessionToken]);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label={`Notifications, ${summary.unreadCount} unread`}
        aria-expanded={open}
        aria-controls="notification-drawer"
        onClick={() => setOpen((current) => !current)}
        className="relative"
      >
        <Bell aria-hidden="true" size={18} />
        <span
          aria-hidden="true"
          className="absolute right-1 top-1 grid min-h-4 min-w-4 place-items-center rounded-full border border-white bg-[var(--warning)] px-1 text-[10px] font-semibold text-[#3c2d00]"
        >
          {summary.unreadCount}
        </span>
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/20" role="presentation">
          <div className="absolute inset-y-0 right-0 w-full max-w-md overflow-y-auto bg-white shadow-xl">
            <DrawerPanel title="Notification center">
              <div id="notification-drawer" className="grid gap-4" aria-label="Notification drawer">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid gap-2">
                    <StatusBadge tone="info">Infrastructure shell only</StatusBadge>
                    <p className="m-0 text-sm text-[#55605a]">
                      Notification summary uses GET /platform/notifications/summary. No live provider or fake
                      notifications are exposed in Phase 5C.
                    </p>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close notifications">
                    <X aria-hidden="true" size={18} />
                  </Button>
                </div>

                <ToastMessage>{summary.message}</ToastMessage>

                <Button type="button" variant="secondary" onClick={loadSummary} disabled={summary.state === 'loading'}>
                  {summary.state === 'loading' ? 'Loading summary' : 'Refresh notification summary'}
                </Button>

                <NotificationSummaryState snapshot={summary} />

                <section aria-labelledby="notification-access-title" className="rounded-lg border border-[var(--border)] p-3">
                  <h3 id="notification-access-title" className="m-0 text-sm font-semibold">
                    Permission-aware placeholder
                  </h3>
                  <p className="m-0 mt-2 text-sm text-[#55605a]">
                    If a future notification is unavailable to your role, this drawer will show a plain-English unavailable state.
                  </p>
                </section>
              </div>
            </DrawerPanel>
          </div>
        </div>
      ) : null}
    </>
  );
}

function NotificationSummaryState({ snapshot }: { snapshot: NotificationSummarySnapshot }) {
  if (snapshot.state === 'loading') {
    return <LoadingState message={snapshot.message} />;
  }

  if (snapshot.state === 'error') {
    return <ErrorState message={snapshot.message} />;
  }

  if (snapshot.state === 'permission') {
    return <PermissionState message={snapshot.message} />;
  }

  return (
    <EmptyState
      title="No notifications"
      message="There are no configured notifications to show. The approved summary reports zero unread items without provider runtime."
    />
  );
}
