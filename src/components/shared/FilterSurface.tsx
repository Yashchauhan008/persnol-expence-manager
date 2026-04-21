import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterSurfaceProps {
  title: string;
  icon?: LucideIcon;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function FilterSurface({ title, icon: Icon, description, children, className }: FilterSurfaceProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-zinc-200/70 bg-gradient-to-b from-white via-white to-zinc-50/35 p-4 shadow-sm ring-1 ring-zinc-900/[0.03] dark:border-zinc-700/70 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900/70 dark:ring-zinc-100/[0.04] sm:p-5',
        className
      )}
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2 border-b border-zinc-100/90 pb-3 dark:border-zinc-700/70 sm:mb-5 sm:items-center sm:pb-3.5">
        <div className="flex min-w-0 items-center gap-2.5">
          {Icon ? (
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 ring-1 ring-indigo-500/15">
              <Icon className="h-4 w-4" strokeWidth={2} />
            </span>
          ) : null}
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-zinc-500 dark:text-zinc-300">{title}</p>
            {description ? (
              <p className="mt-0.5 text-xs leading-snug text-zinc-400 dark:text-zinc-500">{description}</p>
            ) : null}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
