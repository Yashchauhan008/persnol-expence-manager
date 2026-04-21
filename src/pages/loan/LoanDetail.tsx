import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Pencil, Plus, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AmountBadge } from '@/components/shared/AmountBadge';
import { LoanStatusBadge } from '@/components/shared/LoanStatusBadge';
import { PageBackButton } from '@/components/shared/PageBackButton';
import { useGetLoan, useSettleLoan } from '@/hooks/useLoans';
import { formatCurrency, formatDate, todayISO } from '@/lib/utils';

export default function LoanDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: loan, isLoading } = useGetLoan(id!);
  const { mutate: settle, isPending: settling } = useSettleLoan();

  const [settleOpen, setSettleOpen] = useState(false);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleNote, setSettleNote] = useState('');
  const [settleDate, setSettleDate] = useState(todayISO());

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-2xl mx-auto">
        <div className="h-8 w-40 rounded bg-slate-100 animate-pulse dark:bg-zinc-800/65" />
        <div className="h-64 rounded-xl bg-slate-100 animate-pulse dark:bg-zinc-800/65" />
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-400 dark:text-zinc-300">Loan not found</p>
        <Button asChild variant="link" className="mt-2">
          <Link to="/loans/given">Go back</Link>
        </Button>
      </div>
    );
  }

  const isGiven = loan.type === 'given';
  const settledAmount = loan.amount - loan.remaining_amount;
  const settledPct = loan.amount > 0 ? Math.round((settledAmount / loan.amount) * 100) : 0;

  const handleSettle = () => {
    const amount = parseFloat(settleAmount);
    if (!amount || amount <= 0) return;

    settle(
      { id: loan.id, data: { amount, note: settleNote || undefined, date: settleDate } },
      {
        onSuccess: () => {
          setSettleOpen(false);
          setSettleAmount('');
          setSettleNote('');
          setSettleDate(todayISO());
        },
      }
    );
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-2">
        <PageBackButton to={`/loans/${loan.type}`} />
      </div>

      <Card
        className={
          isGiven
            ? 'border-emerald-100 bg-emerald-50/30 dark:border-emerald-900/45 dark:bg-emerald-950/20'
            : 'border-red-100 bg-red-50/30 dark:border-red-900/45 dark:bg-red-950/20'
        }
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-zinc-300">
                Loan {isGiven ? 'Given To' : 'Taken From'}
              </p>
              <CardTitle className="text-xl">{loan.person_name}</CardTitle>
              <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">{formatDate(loan.date)}</p>
            </div>
            <div className="flex items-center gap-2">
              <LoanStatusBadge status={loan.status} />
              <Button asChild variant="ghost" size="icon">
                <Link to={`/loans/${loan.id}/edit`}><Pencil className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-0.5 text-xs text-slate-400 dark:text-zinc-300">Original Amount</p>
              <AmountBadge amount={loan.amount} className="text-lg" />
            </div>
            <div>
              <p className="mb-0.5 text-xs text-slate-400 dark:text-zinc-300">Remaining</p>
              <AmountBadge
                amount={loan.remaining_amount}
                type={loan.remaining_amount > 0 ? (isGiven ? 'income' : 'expense') : 'neutral'}
                className="text-lg"
              />
            </div>
            {loan.due_date && (
              <div>
                <p className="mb-0.5 text-xs text-slate-400 dark:text-zinc-300">Due Date</p>
                <p className="font-medium text-slate-900 dark:text-zinc-100">{formatDate(loan.due_date)}</p>
              </div>
            )}
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500 dark:text-zinc-300">Settlement Progress</span>
              <span className="font-medium">
                {settledPct}% ({formatCurrency(settledAmount)} of {formatCurrency(loan.amount)})
              </span>
            </div>
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-700/70">
              <div
                className={`h-full rounded-full transition-all ${isGiven ? 'bg-emerald-500' : 'bg-red-400'}`}
                style={{ width: `${settledPct}%` }}
              />
            </div>
          </div>

          {loan.note && (
            <div className="rounded-lg bg-white/70 px-3 py-2 dark:bg-zinc-900/55">
              <p className="mb-0.5 text-xs text-slate-400 dark:text-zinc-300">Note</p>
              <p className="text-sm text-slate-700 dark:text-zinc-200">{loan.note}</p>
            </div>
          )}

          {loan.status !== 'settled' && (
            <Button
              className={isGiven ? '' : 'bg-red-600 hover:bg-red-700'}
              onClick={() => setSettleOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Settlement
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Settlement History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Settlement History</CardTitle>
        </CardHeader>
        <CardContent>
          {(!loan.settlements || loan.settlements.length === 0) ? (
            <p className="py-6 text-center text-sm text-slate-400 dark:text-zinc-300">No settlements recorded yet</p>
          ) : (
            <div className="relative">
              <div className="absolute bottom-0 left-4 top-0 w-px bg-slate-200 dark:bg-zinc-700/70" />
              <div className="space-y-4">
                {loan.settlements.map((s, idx) => (
                  <div key={s.id} className="relative pl-10">
                    <div className={`absolute left-2.5 top-1.5 h-3 w-3 rounded-full border-2 border-white dark:border-zinc-900 ${isGiven ? 'bg-emerald-500' : 'bg-red-400'}`} />
                    <div className="rounded-lg bg-slate-50 p-3 dark:bg-zinc-900/55">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-slate-400 dark:text-zinc-300">
                          Settlement #{idx + 1} — {formatDate(s.date)}
                        </span>
                        <AmountBadge amount={s.amount} type={isGiven ? 'income' : 'expense'} />
                      </div>
                      {s.note && <p className="text-xs italic text-slate-500 dark:text-zinc-300">{s.note}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {loan.status === 'settled' && (
                <div className="relative pl-10 mt-4">
                  <div className="absolute left-2.5 top-1.5 h-3 w-3 rounded-full bg-emerald-500 flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                  <p className="text-sm font-medium text-emerald-600">Fully Settled</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Settle Dialog */}
      <Dialog open={settleOpen} onOpenChange={setSettleOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Record Settlement</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <p className="mb-3 text-sm text-slate-500 dark:text-zinc-300">
                Remaining: <strong>{formatCurrency(loan.remaining_amount)}</strong>
              </p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-amount">Amount (₹) *</Label>
              <Input
                id="s-amount"
                type="number"
                min="0.01"
                max={loan.remaining_amount}
                step="0.01"
                placeholder="0.00"
                value={settleAmount}
                onChange={e => setSettleAmount(e.target.value)}
                autoFocus
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-date">Date *</Label>
              <Input id="s-date" type="date" value={settleDate} onChange={e => setSettleDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="s-note">Note</Label>
              <Textarea id="s-note" placeholder="Optional note..." value={settleNote} onChange={e => setSettleNote(e.target.value)} rows={2} />
            </div>
          </div>
          <Separator />
          <DialogFooter>
            <Button variant="outline" onClick={() => setSettleOpen(false)} disabled={settling}>Cancel</Button>
            <Button
              onClick={handleSettle}
              disabled={settling || !settleAmount || parseFloat(settleAmount) <= 0}
              className={isGiven ? '' : 'bg-red-600 hover:bg-red-700'}
            >
              {settling ? 'Recording...' : 'Record Settlement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
