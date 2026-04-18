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
        'font-semibold tabular-nums',
        type === 'income' && 'text-emerald-600',
        type === 'expense' && 'text-red-500',
        type === 'neutral' && 'text-slate-900',
        className
      )}
    >
      {formatCurrency(amount)}
    </span>
  );
}
