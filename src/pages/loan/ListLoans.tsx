import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AmountBadge } from '@/components/shared/AmountBadge';
import { LoanStatusBadge } from '@/components/shared/LoanStatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { useGetLoans, useDeleteLoan } from '@/hooks/useLoans';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { LoanStatus, LoanType } from '@/types/loan';

export default function ListLoans() {
  const location = useLocation();
  const type: LoanType = location.pathname === '/loans/taken' ? 'taken' : 'given';

  const [status, setStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useGetLoans({
    type,
    status: status !== 'all' ? (status as LoanStatus) : undefined,
    page,
    limit: 20,
  });
  const { mutate: deleteLoan, isPending: deleting } = useDeleteLoan();

  const handleDelete = () => {
    if (!deleteId) return;
    deleteLoan(deleteId, { onSuccess: () => setDeleteId(null) });
  };

  const isGiven = type === 'given';
  const accentColor = isGiven ? 'text-emerald-700' : 'text-red-700';
  const cardBg = isGiven ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${accentColor}`}>
            Loans {isGiven ? 'Given' : 'Taken'}
          </h1>
          <p className="text-sm text-slate-500">
            {isGiven ? 'Money you lent out — you will receive it back' : 'Money you borrowed — you must return it'}
          </p>
        </div>
        <Button asChild size="sm" className={isGiven ? '' : 'bg-red-600 hover:bg-red-700'}>
          <Link to={`/loans/new?type=${type}`}>
            <Plus className="h-4 w-4" />Record Loan
          </Link>
        </Button>
      </div>

      {data?.meta.sum_original_amount !== undefined && data.data.length > 0 && (
        <Card>
          <CardContent className="pt-4 flex flex-wrap gap-8 text-sm">
            <div>
              <span className="text-slate-500">Total principal (listed)</span>
              <div className="mt-0.5">
                <AmountBadge amount={data.meta.sum_original_amount ?? 0} className="text-base" />
              </div>
            </div>
            <div>
              <span className="text-slate-500">Total remaining (listed)</span>
              <div className="mt-0.5">
                <AmountBadge
                  amount={data.meta.sum_remaining_amount ?? 0}
                  type={isGiven ? 'income' : 'expense'}
                  className="text-base"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500">Filter by status:</span>
        <Select value={status} onValueChange={v => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="partial">Partial</SelectItem>
            <SelectItem value="settled">Settled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-36 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-slate-400 mb-3">No loans {type === 'given' ? 'given' : 'taken'} yet</p>
          <Button asChild size="sm">
            <Link to={`/loans/new?type=${type}`}>Record your first loan</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data?.data.map(loan => {
            const settledPct = loan.amount > 0
              ? Math.round(((loan.amount - loan.remaining_amount) / loan.amount) * 100)
              : 0;

            return (
              <Card key={loan.id} className={`border ${cardBg} hover:shadow-md transition-shadow`}>
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{loan.person_name}</p>
                      <p className="text-xs text-slate-400">{formatDate(loan.date)}</p>
                    </div>
                    <LoanStatusBadge status={loan.status} />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Original</span>
                      <AmountBadge amount={loan.amount} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Remaining</span>
                      <AmountBadge
                        amount={loan.remaining_amount}
                        type={loan.remaining_amount > 0 ? (isGiven ? 'income' : 'expense') : 'neutral'}
                      />
                    </div>
                    {loan.due_date && (
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Due</span>
                        <span className="text-slate-700">{formatDate(loan.due_date)}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Settled</span>
                      <span>{settledPct}% ({formatCurrency(loan.amount - loan.remaining_amount)})</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${isGiven ? 'bg-emerald-500' : 'bg-red-400'}`}
                        style={{ width: `${settledPct}%` }}
                      />
                    </div>
                  </div>

                  {loan.note && <p className="text-xs text-slate-400 italic truncate">{loan.note}</p>}

                  <div className="flex items-center gap-1 pt-1">
                    <Button asChild variant="outline" size="sm" className="flex-1 text-xs">
                      <Link to={`/loans/${loan.id}`}><Eye className="h-3 w-3" />Details</Link>
                    </Button>
                    <Button asChild variant="ghost" size="icon">
                      <Link to={`/loans/${loan.id}/edit`}><Pencil className="h-3.5 w-3.5" /></Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => setDeleteId(loan.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {data && data.meta.total_pages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-slate-500">Page {data.meta.page} of {data.meta.total_pages}</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= data.meta.total_pages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={open => !open && setDeleteId(null)}
        title="Delete Loan"
        description="This will permanently delete this loan and all its settlements."
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
