'use client';

import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { KeyboardEvent as ReactKeyboardEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { CRM_VISIBLE_LABEL } from '../../lib/crm_alias.config';
import { COMMAND_SEARCH_SCOPE_GUARD, SHELL_COMMANDS } from '../../lib/routes.config';
import { Button } from '../ui/button';
import { EmptyState } from '../ui/design_system';

type ShellCommand = (typeof SHELL_COMMANDS)[number];

type CoreCommand = {
  id: ShellCommand['id'];
  label: ShellCommand['label'];
  description: ShellCommand['description'];
  group: ShellCommand['group'];
  route: ShellCommand['route'];
  keywords: ShellCommand['keywords'];
  action_type: ShellCommand['action_type'];
  source: ShellCommand['source'];
  required_capability?: ShellCommand['required_capability'];
};

type RenderCommand = CoreCommand & {
  renderGroup: CoreCommand['group'] | 'Recent commands';
};

const RECENT_COMMANDS_KEY = 'akti.phase4b.commandPalette.recentCommandIds';

const CORE_COMMANDS: CoreCommand[] = [...SHELL_COMMANDS];

export function CommandPalette() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [recentCommandIds, setRecentCommandIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(RECENT_COMMANDS_KEY);
      const parsed = stored ? JSON.parse(stored) : [];
      if (Array.isArray(parsed)) {
        setRecentCommandIds(parsed.filter((item): item is string => typeof item === 'string'));
      }
    } catch {
      setRecentCommandIds([]);
    }
  }, []);

  useEffect(() => {
    function handleGlobalKeyDown(event: globalThis.KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen(true);
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (open) {
      setActiveIndex(0);
      window.setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery('');
    }
  }, [open]);

  const visibleCommands = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const matches = CORE_COMMANDS.filter((command) => {
      if (!normalizedQuery) {
        return true;
      }

      return [command.label, command.description, command.group, ...command.keywords]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery);
    });

    if (normalizedQuery || recentCommandIds.length === 0) {
      return matches.map((command) => ({ ...command, renderGroup: command.group }));
    }

    const recent = recentCommandIds
      .map((id) => CORE_COMMANDS.find((command) => command.id === id))
      .filter((command): command is CoreCommand => Boolean(command))
      .map((command) => ({ ...command, renderGroup: 'Recent commands' as const }));
    const recentIds = new Set(recent.map((command) => command.id));
    const remaining = matches
      .filter((command) => !recentIds.has(command.id))
      .map((command) => ({ ...command, renderGroup: command.group }));

    return [...recent, ...remaining];
  }, [query, recentCommandIds]);

  const groupedCommands = useMemo(() => {
    const groups = new Map<RenderCommand['renderGroup'], RenderCommand[]>();
    for (const command of visibleCommands) {
      groups.set(command.renderGroup, [...(groups.get(command.renderGroup) ?? []), command]);
    }
    return [...groups.entries()];
  }, [visibleCommands]);

  function closePalette() {
    setOpen(false);
  }

  function rememberCommand(command: CoreCommand) {
    const next = [command.id, ...recentCommandIds.filter((id) => id !== command.id)].slice(0, 5);
    setRecentCommandIds(next);
    try {
      window.localStorage.setItem(RECENT_COMMANDS_KEY, JSON.stringify(next));
    } catch {
      // Recent commands are a convenience only; navigation should still work.
    }
  }

  function runCommand(command: CoreCommand) {
    rememberCommand(command);
    closePalette();
    if (command.action_type === 'anchor') {
      const target = document.getElementById(command.route.slice(1));
      target?.scrollIntoView({ block: 'start' });
      window.history.replaceState(null, '', command.route);
      return;
    }

    router.push(command.route);
  }

  function handleInputKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault();
      closePalette();
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((current) => (visibleCommands.length === 0 ? 0 : (current + 1) % visibleCommands.length));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((current) => (visibleCommands.length === 0 ? 0 : (current - 1 + visibleCommands.length) % visibleCommands.length));
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const command = visibleCommands[activeIndex];
      if (command) {
        runCommand(command);
      }
    }
  }

  return (
    <>
      <button
        type="button"
        className="inline-flex min-w-48 items-center gap-2 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-left text-sm text-[#55605a]"
        aria-label="Command palette entry"
        aria-keyshortcuts="Control+K Meta+K"
        onClick={() => setOpen(true)}
      >
        <Search aria-hidden="true" size={16} />
        <span>Command palette</span>
        <kbd className="ml-auto rounded border border-[var(--border)] px-1.5 text-xs">Ctrl K</kbd>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-start bg-black/30 px-4 py-20"
          role="presentation"
          onMouseDown={closePalette}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="command-palette-title"
            className="mx-auto grid w-full max-w-2xl gap-3 rounded-lg border border-[var(--border)] bg-white p-4 shadow-xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <h2 id="command-palette-title" className="m-0 text-lg font-semibold">
                Command palette
              </h2>
              <Button type="button" variant="ghost" size="icon" onClick={closePalette} aria-label="Close command palette">
                <X aria-hidden="true" size={18} />
              </Button>
            </div>

            <label className="grid gap-2 text-sm font-medium">
              <span>Search commands</span>
              <input
                ref={inputRef}
                className="h-11 rounded-md border border-[var(--border)] px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleInputKeyDown}
                placeholder="Type a destination or action"
              />
              <span className="text-xs text-[var(--phase5c-text-muted)]">
                Static command filtering only. Backend search scope remains{' '}
                {COMMAND_SEARCH_SCOPE_GUARD.allowedSearchModels.join(' and ')}; no CRM or Lead Desk search expansion.
              </span>
            </label>

            {visibleCommands.length === 0 ? (
              <EmptyState title="No commands found" message={`Try dashboard, ${CRM_VISIBLE_LABEL}, settings, create lead, or help.`} />
            ) : (
              <div className="grid max-h-[28rem] gap-4 overflow-y-auto" role="listbox" aria-label="Command results">
                {groupedCommands.map(([group, commands]) => (
                  <section key={group} className="grid gap-2">
                    <h3 className="m-0 text-xs font-semibold uppercase tracking-wide text-[#66716a]">{group}</h3>
                    <div className="grid gap-1">
                      {commands.map((command) => {
                        const globalIndex = visibleCommands.findIndex((item) => item.id === command.id && item.renderGroup === command.renderGroup);
                        const active = globalIndex === activeIndex;
                        return (
                          <button
                            key={`${command.renderGroup}-${command.id}`}
                            type="button"
                            role="option"
                            aria-selected={active}
                            className={`grid rounded-md px-3 py-2 text-left text-sm ${
                              active ? 'bg-[var(--surface-muted)] ring-2 ring-[var(--ring)]' : 'hover:bg-[var(--surface-muted)]'
                            }`}
                            onMouseEnter={() => setActiveIndex(globalIndex)}
                            onClick={() => runCommand(command)}
                          >
                            <span className="font-medium">{command.label}</span>
                            <span className="text-[#55605a]">{command.description}</span>
                            {command.required_capability ? (
                              <span className="text-xs text-[var(--phase5c-text-muted)]">
                                Capability: {command.required_capability}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}
