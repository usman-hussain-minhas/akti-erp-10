import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-transparent px-4 py-2 text-sm font-medium outline-none transition-all focus-visible:ring-2 focus-visible:ring-[var(--esbla-cyan)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--phase5c-bg)] active:translate-y-px disabled:pointer-events-none disabled:opacity-55',
  {
    variants: {
      variant: {
        default: 'bg-[var(--esbla-blue)] text-white shadow-[var(--esbla-glow-cyan)] hover:bg-[#006ad9]',
        secondary: 'border-[var(--phase5c-border)] bg-[var(--phase5c-surface)] text-[var(--phase5c-text)] hover:border-[var(--esbla-cyan)] hover:bg-[var(--phase5c-surface-muted)]',
        ghost: 'text-[var(--phase5c-text)] hover:bg-[var(--phase5c-surface-muted)]',
        destructive: 'bg-[var(--danger)] text-white hover:bg-[#843333]',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 px-3',
        lg: 'h-11 px-5',
        icon: 'h-10 w-10 px-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
);

export type ButtonProps = React.ComponentProps<'button'> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

export function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : 'button';

  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { buttonVariants };
