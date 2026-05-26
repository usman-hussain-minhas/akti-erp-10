'use client';

import { Bell, X } from 'lucide-react';
import { useState } from 'react';

import { Button } from '../ui/button';
import { DrawerPanel, EmptyState, StatusBadge, ToastMessage } from '../ui/design-system';

const STATIC_SYSTEM_NOTICE = 'Local/demo notification shell is ready.';

export function NotificationCenter() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-label="Notifications, 0 unread"
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
          0
        </span>
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/20" role="presentation">
          <div className="absolute inset-y-0 right-0 w-full max-w-md bg-white shadow-xl">
            <DrawerPanel title="Notification center">
              <div id="notification-drawer" className="grid gap-4" aria-label="Notification drawer">
                <div className="flex items-start justify-between gap-3">
                  <div className="grid gap-2">
                    <StatusBadge tone="info">Infrastructure shell only</StatusBadge>
                    <p className="m-0 text-sm text-[#55605a]">
                      Notification content is limited to static system messages and clear placeholders in Phase 4B.
                    </p>
                  </div>
                  <Button type="button" variant="ghost" size="icon" onClick={() => setOpen(false)} aria-label="Close notifications">
                    <X aria-hidden="true" size={18} />
                  </Button>
                </div>

                <ToastMessage>{STATIC_SYSTEM_NOTICE}</ToastMessage>

                <EmptyState
                  title="No notifications"
                  message="There are no live notifications to show. Future notification rules wait for a later policy phase."
                />

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
