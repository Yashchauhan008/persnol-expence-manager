import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode;
  titleClassName?: string;
}

export function PageHeader({ title, description, children, titleClassName }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div className="min-w-0 space-y-1.5">
        <h1
          className={cn(
            'text-2xl font-semibold tracking-tight text-slate-900 dark:text-zinc-100 sm:text-[1.65rem]',
            titleClassName
          )}
        >
          {title}
        </h1>
        {description ? <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-zinc-400">{description}</p> : null}
      </div>
      {children ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">{children}</div>
      ) : null}
    </div>
  );
}
