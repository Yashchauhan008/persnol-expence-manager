import { Card, CardContent } from '@/components/ui/card';
import { AmountBadge } from './AmountBadge';
import { cn } from '@/lib/utils';

export type ListMetricItem = {
  label: string;
  hint?: string;
  amount: number;
  amountType?: 'income' | 'expense' | 'neutral';
};

interface ListMetricsStripProps {
  items: ListMetricItem[];
  className?: string;
}

export function ListMetricsStrip({ items, className }: ListMetricsStripProps) {
  if (items.length === 0) return null;

  const colClass =
    items.length >= 3 ? 'sm:grid-cols-3' : items.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-1';

  return (
    <Card className={cn('overflow-hidden border-zinc-200/60 dark:border-zinc-700/70', className)}>
      <CardContent className="p-0">
        <div
          role="list"
          className={cn(
            'grid grid-cols-1 divide-y divide-zinc-200/70 dark:divide-zinc-700/70 sm:auto-rows-fr sm:divide-x sm:divide-y-0',
            colClass
          )}
        >
          {items.map((item, i) => (
            <div
              key={`${item.label}-${i}`}
              role="listitem"
              className="grid grid-rows-[auto_minmax(2.25rem,auto)_auto] justify-items-center gap-0 px-4 py-5 text-center sm:px-6 sm:py-6"
            >
              <p className="max-w-[16rem] text-[11px] font-medium uppercase leading-snug tracking-[0.06em] text-zinc-500 dark:text-zinc-400">
                {item.label}
              </p>
              <div className="flex w-full max-w-[18rem] items-start justify-center pt-1">
                {item.hint ? (
                  <p className="text-center text-[11px] leading-snug text-zinc-400 dark:text-zinc-500">{item.hint}</p>
                ) : (
                  <div className="min-h-[2.25rem] w-full max-w-[14rem]" aria-hidden />
                )}
              </div>
              <div className="pt-2">
                <AmountBadge
                  amount={item.amount}
                  type={item.amountType ?? 'neutral'}
                  className="text-lg font-semibold tabular-nums tracking-tight sm:text-xl"
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
