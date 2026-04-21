import { cn, formatCurrency } from '@/lib/utils';

interface AmountBadgeProps {
  amount: number;
  type?: 'income' | 'expense' | 'neutral';
  className?: string;
}

export function AmountBadge({ amount, type = 'neutral', className }: AmountBadgeProps) {
  return (
    <span
      className={cn(
        'font-semibold tabular-nums tracking-tight',
        type === 'income' && 'text-teal-600',
        type === 'expense' && 'text-rose-600',
        type === 'neutral' && 'text-zinc-900 dark:text-zinc-100',
        className
      )}
    >
      {formatCurrency(amount)}
    </span>
  );
}
