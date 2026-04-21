import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AmountBadge } from '@/components/shared/AmountBadge';
import { LoanStatusBadge } from '@/components/shared/LoanStatusBadge';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { ListMetricsStrip } from '@/components/shared/ListMetricsStrip';
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
  const accentColor = isGiven ? 'text-emerald-700 dark:text-emerald-300' : 'text-red-700 dark:text-red-300';
  const cardBg = isGiven
    ? 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/25 dark:border-emerald-900/45'
    : 'bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900/45';

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title={`Loans ${isGiven ? 'Given' : 'Taken'}`}
        titleClassName={accentColor}
        description={
          isGiven
            ? 'Money you lent — track principal, remaining balance, and settlements.'
            : 'Money you borrowed — stay on top of what you still owe.'
        }
      >
        <Button asChild size="sm" variant={isGiven ? 'default' : 'destructive'}>
          <Link to={`/loans/new?type=${type}`}>
            <Plus className="h-4 w-4" />
            Record loan
          </Link>
        </Button>
      </PageHeader>

      {data?.meta.sum_original_amount !== undefined && data.data.length > 0 && (
        <ListMetricsStrip
          items={[
            {
              label: 'Total principal',
              hint: 'Listed loans on this page',
              amount: data.meta.sum_original_amount ?? 0,
              amountType: 'neutral',
            },
            {
              label: 'Total remaining',
              hint: isGiven ? 'Still outstanding to you' : 'You still owe',
              amount: data.meta.sum_remaining_amount ?? 0,
              amountType: isGiven ? 'income' : 'expense',
            },
          ]}
        />
      )}

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200/60 bg-white/60 px-4 py-3 backdrop-blur-sm dark:border-zinc-700/70 dark:bg-zinc-900/50">
        <span className="text-sm font-medium text-zinc-600">Status</span>
        <Select value={status} onValueChange={v => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-40">
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-zinc-100/90 dark:bg-zinc-800/65" />
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="py-16 text-center">
          <p className="mb-4 text-sm text-zinc-400 dark:text-zinc-300">No loans {type === 'given' ? 'given' : 'taken'} yet</p>
          <Button asChild size="sm">
            <Link to={`/loans/new?type=${type}`}>Record your first loan</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {data?.data.map(loan => {
            const settledPct = loan.amount > 0
              ? Math.round(((loan.amount - loan.remaining_amount) / loan.amount) * 100)
              : 0;

            return (
              <Card
                key={loan.id}
                className={`border transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/8 ${cardBg}`}
              >
                <CardContent className="space-y-3 pt-5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">{loan.person_name}</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-300">{formatDate(loan.date)}</p>
                    </div>
                    <LoanStatusBadge status={loan.status} />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Original</span>
                      <AmountBadge amount={loan.amount} />
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-500">Remaining</span>
                      <AmountBadge
                        amount={loan.remaining_amount}
                        type={loan.remaining_amount > 0 ? (isGiven ? 'income' : 'expense') : 'neutral'}
                      />
                    </div>
                    {loan.due_date && (
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Due</span>
                        <span className="text-zinc-800 dark:text-zinc-200">{formatDate(loan.due_date)}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-400 dark:text-zinc-300">
                      <span>Settled</span>
                      <span>{settledPct}% ({formatCurrency(loan.amount - loan.remaining_amount)})</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200/90">
                      <div
                        className={`h-full rounded-full transition-[width] duration-500 ease-out ${isGiven ? 'bg-gradient-to-r from-teal-400 to-teal-600' : 'bg-gradient-to-r from-rose-400 to-rose-600'}`}
                        style={{ width: `${settledPct}%` }}
                      />
                    </div>
                  </div>

                  {loan.note && <p className="truncate text-xs italic text-zinc-400 dark:text-zinc-300">{loan.note}</p>}

                  <div className="flex items-center gap-1 pt-1">
                    <Button asChild variant="outline" size="sm" className="flex-1 text-xs">
                      <Link to={`/loans/${loan.id}`}>
                        <Eye className="h-3 w-3" />
                        Details
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-indigo-600">
                      <Link to={`/loans/${loan.id}/edit`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/20"
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
        <div className="flex items-center justify-between pt-4">
          <p className="text-sm text-zinc-500">Page {data.meta.page} of {data.meta.total_pages}</p>
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
