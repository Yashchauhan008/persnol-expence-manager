import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangeFilter } from '@/components/shared/DateRangeFilter';
import { Button } from '@/components/ui/button';
import { AmountBadge } from '@/components/shared/AmountBadge';
import { TagBadge } from '@/components/shared/TagBadge';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { ListMetricsStrip } from '@/components/shared/ListMetricsStrip';
import { useGetExpenses, useDeleteExpense } from '@/hooks/useExpenses';
import { useGetTags } from '@/hooks/useTags';
import { useTheme } from '@/context/useTheme';
import { formatDate } from '@/lib/utils';
import type { Tag } from '@/types/tag';
import type { Expense } from '@/types/expense';

export default function ListExpenses() {
  const { isDark } = useTheme();
  const [page, setPage] = useState(1);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: allTags = [] } = useGetTags();
  const { data, isLoading } = useGetExpenses({
    page,
    limit: 20,
    from: from || undefined,
    to: to || undefined,
    tag_ids: selectedTagIds.length > 0 ? selectedTagIds.join(',') : undefined,
  });
  const { mutate: deleteExpense, isPending: deleting } = useDeleteExpense();

  const toggleTagFilter = (tag: Tag) => {
    setSelectedTagIds(prev =>
      prev.includes(tag.id) ? prev.filter(id => id !== tag.id) : [...prev, tag.id]
    );
    setPage(1);
  };

  const handleDelete = () => {
    if (!deleteId) return;
    deleteExpense(deleteId, { onSuccess: () => setDeleteId(null) });
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="Expenses" description="Filter by date and tags. Totals reflect the current list and date range.">
        <Button asChild size="sm">
          <Link to="/expenses/new">
            <Plus className="h-4 w-4" />
            Add expense
          </Link>
        </Button>
      </PageHeader>

      <div className="space-y-4">
        <DateRangeFilter
          from={from}
          to={to}
          onFromChange={v => { setFrom(v); setPage(1); }}
          onToChange={v => { setTo(v); setPage(1); }}
          onClearDates={() => { setFrom(''); setTo(''); setPage(1); }}
          trailingActions={
            (from || to || selectedTagIds.length > 0) ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-zinc-500 hover:text-zinc-900"
                onClick={() => { setFrom(''); setTo(''); setSelectedTagIds([]); setPage(1); }}
              >
                Clear all filters
              </Button>
            ) : null
          }
        />
        {allTags.length > 0 ? (
          <div className="rounded-xl border border-zinc-200/60 bg-white/60 px-4 py-3 shadow-sm ring-1 ring-zinc-900/[0.02] dark:border-zinc-700/70 dark:bg-zinc-900/50 dark:ring-zinc-100/5 sm:px-5">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Tags</p>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTagFilter(tag)}
                  className="rounded-full border px-3 py-1 text-xs font-medium shadow-sm transition-[transform,box-shadow,filter] duration-150 ease-out hover:brightness-105 active:scale-[0.98]"
                  style={
                    selectedTagIds.includes(tag.id)
                      ? { backgroundColor: tag.color, color: 'white', borderColor: tag.color }
                      : { borderColor: tag.color, color: tag.color, backgroundColor: isDark ? 'rgba(24,24,27,0.45)' : 'rgba(255,255,255,0.65)' }
                  }
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {!isLoading && data && (
        <ListMetricsStrip
          items={[
            {
              label: 'Total (this list)',
              amount: data.meta.sum_visible_amount ?? 0,
              amountType: 'expense',
            },
            {
              label: 'Total in date range',
              hint: 'Expenses + loan repayments',
              amount: data.meta.sum_period_amount ?? 0,
              amountType: 'expense',
            },
            ...(selectedTagIds.length > 0 && data.meta.sum_tagged_amount !== undefined
              ? [
                  {
                    label: 'Tagged total',
                    hint: 'Selected tags only',
                    amount: data.meta.sum_tagged_amount,
                    amountType: 'expense' as const,
                  },
                ]
              : []),
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
              <p className="mb-4 text-sm text-zinc-400 dark:text-zinc-300">No expenses found</p>
              <Button asChild size="sm">
                <Link to="/expenses/new">Add your first expense</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-200/80 dark:border-zinc-800/70">
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Date</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Title</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Tags</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Note</th>
                    <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Amount</th>
                    <th className="px-3 py-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-zinc-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map((item: Expense) => {
                    const isLoanRepay = item.entry_kind === 'loan_repayment';
                    const tags = Array.isArray(item.tags) ? item.tags : [];
                    return (
                    <tr key={item.id} className="border-b border-zinc-100/90 transition-colors duration-150 hover:bg-zinc-50/80 dark:border-zinc-700/60 dark:hover:bg-zinc-800/50">
                      <td className="whitespace-nowrap px-3 py-3 text-zinc-500">{formatDate(item.date)}</td>
                      <td className="px-3 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                        <span className="align-middle">{item.title}</span>
                        {isLoanRepay && (
                          <Badge variant="secondary" className="ml-2 align-middle text-[10px] px-1.5 py-0">Loan repay</Badge>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap gap-1">
                          {tags.map((tag: Tag) => <TagBadge key={tag.id} tag={tag} />)}
                        </div>
                      </td>
                      <td className="max-w-xs truncate px-3 py-3 text-zinc-400 dark:text-zinc-300">{item.note ?? '—'}</td>
                      <td className="px-3 py-3 text-right">
                        <AmountBadge amount={Number(item.amount)} type="expense" />
                      </td>
                      <td className="px-3 py-3 text-right">
                        {!isLoanRepay ? (
                          <div className="flex items-center justify-end gap-0.5">
                            <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-indigo-600">
                              <Link to={`/expenses/${item.id}/edit`}><Pencil className="h-3.5 w-3.5" /></Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600"
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

          {data && data.meta.total_pages > 1 && (
            <div className="mt-5 flex items-center justify-between border-t border-zinc-100/90 pt-5 dark:border-zinc-800/65">
              <p className="text-sm text-zinc-500">Page {data.meta.page} of {data.meta.total_pages}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                <Button variant="outline" size="sm" disabled={page >= data.meta.total_pages} onClick={() => setPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={open => !open && setDeleteId(null)}
        title="Delete Expense"
        description="This will permanently delete this expense."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
