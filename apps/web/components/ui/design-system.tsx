import * as React from 'react';

import { cn } from '../../lib/utils';
import { Button } from './button';

export function TextLink({ className, ...props }: React.ComponentProps<'a'>) {
  return (
    <a
      className={cn(
        'font-medium text-[var(--primary)] underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
        className,
      )}
      {...props}
    />
  );
}

export function Field({
  label,
  helperText,
  error,
  children,
}: {
  label: string;
  helperText?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-[var(--foreground)]">
      <span>{label}</span>
      {children}
      {helperText ? <span className="text-sm font-normal text-[#55605a]">{helperText}</span> : null}
      {error ? <ValidationMessage>{error}</ValidationMessage> : null}
    </label>
  );
}

export function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      className={cn(
        'h-10 rounded-md border border-[var(--border)] bg-white px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:bg-[var(--surface-muted)] disabled:text-[#66716a]',
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      className={cn(
        'min-h-24 rounded-md border border-[var(--border)] bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:bg-[var(--surface-muted)] disabled:text-[#66716a]',
        className,
      )}
      {...props}
    />
  );
}

export function ValidationMessage({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-normal text-[var(--danger)]">{children}</span>;
}

export function SectionCard({ className, ...props }: React.ComponentProps<'section'>) {
  return (
    <section
      className={cn('rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm', className)}
      {...props}
    />
  );
}

export function DataTable({ className, ...props }: React.ComponentProps<'table'>) {
  return (
    <div className="w-full overflow-x-auto rounded-lg border border-[var(--border)] bg-[var(--surface)]">
      <table className={cn('w-full border-collapse text-left text-sm', className)} {...props} />
    </div>
  );
}

export function ModalPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title" className="rounded-lg bg-white p-5 shadow-lg">
      <h2 id="modal-title" className="m-0 text-lg font-semibold">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </div>
  );
}

export function DrawerPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <aside aria-labelledby="drawer-title" className="h-full w-full max-w-md border-l border-[var(--border)] bg-white p-5">
      <h2 id="drawer-title" className="m-0 text-lg font-semibold">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </aside>
  );
}

export function ToastMessage({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'success' | 'warning' | 'danger';
  children: React.ReactNode;
}) {
  const tones = {
    info: 'border-[var(--info)]',
    success: 'border-[var(--success)]',
    warning: 'border-[var(--warning)]',
    danger: 'border-[var(--danger)]',
  };

  return (
    <div role="status" className={cn('rounded-md border-l-4 bg-white p-3 text-sm shadow-sm', tones[tone])}>
      {children}
    </div>
  );
}

export function TabsList({ className, ...props }: React.ComponentProps<'div'>) {
  return <div role="tablist" className={cn('flex gap-1 rounded-md bg-[var(--surface-muted)] p-1', className)} {...props} />;
}

export function StatusBadge({
  tone = 'neutral',
  children,
}: {
  tone?: 'neutral' | 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
}) {
  const tones = {
    neutral: 'border-[var(--border)] bg-[var(--surface-muted)] text-[var(--foreground)]',
    success: 'border-[var(--success)] bg-[#e7f3ec] text-[var(--success)]',
    warning: 'border-[var(--warning)] bg-[#f7edd1] text-[var(--warning)]',
    danger: 'border-[var(--danger)] bg-[#f5dddd] text-[var(--danger)]',
    info: 'border-[var(--info)] bg-[#e2edf8] text-[var(--info)]',
  };

  return <span className={cn('inline-flex rounded-full border px-2.5 py-1 text-xs font-medium', tones[tone])}>{children}</span>;
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; href?: string }> }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-[#55605a]">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href ? <TextLink href={item.href}>{item.label}</TextLink> : <span>{item.label}</span>}
            {index < items.length - 1 ? <span aria-hidden="true">/</span> : null}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function NavigationList({ children }: { children: React.ReactNode }) {
  return <nav className="grid gap-1" aria-label="Primary navigation">{children}</nav>;
}

export function EmptyState({
  title,
  message,
  action,
}: {
  title: string;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <SectionCard className="grid gap-3 text-center">
      <h2 className="m-0 text-lg font-semibold">{title}</h2>
      <p className="m-0 text-sm text-[#55605a]">{message}</p>
      {action ? <div>{action}</div> : null}
    </SectionCard>
  );
}

export function LoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div role="status" className="rounded-lg border border-[var(--border)] bg-white p-4 text-sm text-[#55605a]">
      {message}
    </div>
  );
}

export function ErrorState({ message, retryLabel }: { message: string; retryLabel?: string }) {
  return (
    <SectionCard className="grid gap-3 border-[var(--danger)]">
      <p className="m-0 text-sm text-[var(--danger)]">{message}</p>
      {retryLabel ? <Button type="button" variant="secondary">{retryLabel}</Button> : null}
    </SectionCard>
  );
}

export function DisabledReason({ reason }: { reason: string }) {
  return <p className="m-0 text-sm text-[#66716a]">{reason}</p>;
}
