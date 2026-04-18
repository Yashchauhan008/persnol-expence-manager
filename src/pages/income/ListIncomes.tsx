import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AmountBadge } from '@/components/shared/AmountBadge';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Income</h1>
        <Button asChild size="sm">
          <Link to="/income/new"><Plus className="h-4 w-4" />Add Income</Link>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-500">From</label>
              <Input type="date" value={from} onChange={e => { setFrom(e.target.value); setPage(1); }} className="w-36" />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm text-slate-500">To</label>
              <Input type="date" value={to} onChange={e => { setTo(e.target.value); setPage(1); }} className="w-36" />
            </div>
            {(from || to) && (
              <Button variant="ghost" size="sm" onClick={() => { setFrom(''); setTo(''); setPage(1); }}>
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {!isLoading && data && (
        <Card>
          <CardContent className="pt-4 flex flex-wrap gap-6 text-sm">
            <div>
              <span className="text-slate-500">Total (this list)</span>
              <div className="mt-0.5">
                <AmountBadge amount={data?.meta.sum_visible_amount ?? 0} type="income" className="text-base" />
              </div>
            </div>
            <div>
              <span className="text-slate-500">Total in date range</span>
              <p className="text-xs text-slate-400 mt-0.5">Incomes + loan recoveries</p>
              <div className="mt-0.5">
                <AmountBadge amount={data?.meta.sum_period_amount ?? 0} type="income" className="text-base" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">
            {data?.meta.total ?? 0} records
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
              ))}
            </div>
          ) : data?.data.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-400 mb-3">No income records found</p>
              <Button asChild size="sm">
                <Link to="/income/new">Add your first income</Link>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-2 px-2 font-medium text-slate-500">Date</th>
                    <th className="text-left py-2 px-2 font-medium text-slate-500">Source</th>
                    <th className="text-left py-2 px-2 font-medium text-slate-500">Note</th>
                    <th className="text-right py-2 px-2 font-medium text-slate-500">Amount</th>
                    <th className="text-right py-2 px-2 font-medium text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.data.map(item => {
                    const isRecovery = item.entry_kind === 'loan_recovery';
                    return (
                    <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-2 text-slate-500 whitespace-nowrap">{formatDate(item.date)}</td>
                      <td className="py-3 px-2 font-medium text-slate-900">
                        <span className="align-middle">{item.source}</span>
                        {isRecovery && (
                          <Badge variant="success" className="ml-2 align-middle text-[10px] px-1.5 py-0">Recovery</Badge>
                        )}
                      </td>
                      <td className="py-3 px-2 text-slate-400 max-w-xs truncate">{item.note ?? '—'}</td>
                      <td className="py-3 px-2 text-right">
                        <AmountBadge amount={Number(item.amount)} type="income" />
                      </td>
                      <td className="py-3 px-2 text-right">
                        {!isRecovery ? (
                          <div className="flex items-center justify-end gap-1">
                            <Button asChild variant="ghost" size="icon">
                              <Link to={`/income/${item.id}/edit`}><Pencil className="h-3.5 w-3.5" /></Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-500 hover:text-red-600"
                              onClick={() => setDeleteId(item.id)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">From loan</span>
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
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">
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
