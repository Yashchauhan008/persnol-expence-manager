import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DateRangeFilter } from '@/components/shared/DateRangeFilter';
import { AmountBadge } from '@/components/shared/AmountBadge';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { ListMetricsStrip } from '@/components/shared/ListMetricsStrip';
import { useGetIncomes, useDeleteIncome } from '@/hooks/useIncome';
import { formatDate } from '@/lib/utils';

export default function ListIncomes() {
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useGetIncomes({ page, limit: 20, from: from || undefined, to: to || undefined });
  const { mutate: deleteIncome, isPending: deleting } = useDeleteIncome();

  const handleDelete = () => {
    if (!deleteId) return;
    deleteIncome(deleteId, { onSuccess: () => setDeleteId(null) });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="Income" description="Track sources and amounts. Loan recoveries appear with a recovery badge.">
        <Button asChild size="sm">
          <Link to="/income/new">
            <Plus className="h-4 w-4" />
            Add income
          </Link>
        </Button>
      </PageHeader>

      <DateRangeFilter
        from={from}
        to={to}
        onFromChange={v => { setFrom(v); setPage(1); }}
        onToChange={v => { setTo(v); setPage(1); }}
        onClearDates={() => { setFrom(''); setTo(''); setPage(1); }}
      />

      {!isLoading && data && (
        <ListMetricsStrip
          items={[
            {
              label: 'Total (this list)',
              amount: data.meta.sum_visible_amount ?? 0,
              amountType: 'income',
            },
            {
              label: 'Total in date range',
              hint: 'Incomes + loan recoveries',
              amount: data.meta.sum_period_amount ?? 0,
              amountType: 'income',
            },
          ]}
        />
      )}

      <Card className="border-zinc-200/60 dark:border-zinc-800/65">
        <CardHeader className="border-b border-zinc-100/80 pb-3 dark:border-zinc-800/65">
          <CardTitle className="text-sm font-semibold tracking-tight text-zinc-800">
            {data?.meta.total ?? 0} records
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 animate-pulse rounded-lg bg-zinc-100/90 dark:bg-zinc-800/65" />
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="py-14 text-center">
              <p className="mb-4 text-sm text-zinc-400 dark:text-zinc-300">No income records found</p>
              <Button asChild size="sm">
                <Link to="/income/new">Add your first income</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200/80 dark:border-zinc-800/70">
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Date</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Source</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Note</th>
                    <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Amount</th>
                    <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map(item => {
                    const isRecovery = item.entry_kind === 'loan_recovery';
                    return (
                    <tr key={item.id} className="border-b border-zinc-100/90 transition-colors duration-150 hover:bg-zinc-50/80 dark:border-zinc-700/60 dark:hover:bg-zinc-800/50">
                      <td className="whitespace-nowrap px-3 py-3 text-zinc-500">{formatDate(item.date)}</td>
                      <td className="px-3 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                        <span className="align-middle">{item.source}</span>
                        {isRecovery && (
                          <Badge variant="success" className="ml-2 align-middle text-[10px] px-1.5 py-0">Recovery</Badge>
                        )}
                      </td>
                      <td className="max-w-xs truncate px-3 py-3 text-zinc-400 dark:text-zinc-300">{item.note ?? '—'}</td>
                      <td className="px-3 py-3 text-right">
                        <AmountBadge amount={Number(item.amount)} type="income" />
                      </td>
                      <td className="px-3 py-3 text-right">
                        {!isRecovery ? (
                          <div className="flex items-center justify-end gap-0.5">
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-indigo-600">
                              <Link to={`/income/${item.id}/edit`}><Pencil className="h-3.5 w-3.5" /></Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/20"
                              onClick={() => setDeleteId(item.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400 dark:text-zinc-300">From loan</span>
                        )}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {data && data.meta.total_pages > 1 && (
            <div className="mt-5 flex items-center justify-between border-t border-zinc-100/90 pt-5 dark:border-zinc-800/65">
              <p className="text-sm text-zinc-500">
                Page {data.meta.page} of {data.meta.total_pages}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" disabled={page >= data.meta.total_pages} onClick={() => setPage(p => p + 1)}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={open => !open && setDeleteId(null)}
        title="Delete Income"
        description="This will permanently delete this income record."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
