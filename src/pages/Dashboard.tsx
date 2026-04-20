import { useMemo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, HandCoins, ArrowRight, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AmountBadge } from '@/components/shared/AmountBadge';
import { TagBadge } from '@/components/shared/TagBadge';
import { LoanStatusBadge } from '@/components/shared/LoanStatusBadge';
import { PageHeader } from '@/components/shared/PageHeader';
import { useGetMonthlySummary } from '@/hooks/useSummary';
import { useGetIncomes } from '@/hooks/useIncome';
import { useGetExpenses } from '@/hooks/useExpenses';
import { useGetLoans } from '@/hooks/useLoans';
import { cn, formatDate, getMonthIsoRange } from '@/lib/utils';
import { IncomeExpenseBarChart } from '@/lib/chart';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function StatCard({
  accent,
  children,
  className,
}: {
  accent: 'income' | 'expense' | 'neutral' | 'loan';
  children: ReactNode;
  className?: string;
}) {
  const accentRing =
    accent === 'income'
      ? 'from-teal-400/25 via-transparent to-transparent'
      : accent === 'expense'
        ? 'from-rose-400/20 via-transparent to-transparent'
        : accent === 'loan'
          ? 'from-amber-400/22 via-transparent to-transparent'
          : 'from-indigo-400/15 via-transparent to-transparent';

  return (
    <Card
      className={cn(
        'group relative overflow-hidden border-zinc-200/60 transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:shadow-lg hover:shadow-indigo-500/8',
        className
      )}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-100 transition-opacity duration-200 group-hover:opacity-100',
          accentRing
        )}
      />
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-white/80 to-transparent blur-2xl" />
      {children}
    </Card>
  );
}

export default function Dashboard() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const { from: monthFrom, to: monthTo } = useMemo(
    () => getMonthIsoRange(year, month),
    [year, month]
  );

  const { data: summary, isLoading: summaryLoading } = useGetMonthlySummary(year, month);
  const { data: incomeData } = useGetIncomes({ limit: 5, from: monthFrom, to: monthTo });
  const { data: expenseData } = useGetExpenses({ limit: 5, from: monthFrom, to: monthTo });
  const { data: loanGivenData } = useGetLoans({ type: 'given', status: 'pending', limit: 3 });
  const { data: loanTakenData } = useGetLoans({ type: 'taken', status: 'pending', limit: 3 });

  const chartData = summary?.daily_breakdown?.map(d => ({
    day: `${d.day}`,
    Income: d.income,
    Expenses: d.expense,
  })) ?? [];

  const net = summary?.net ?? 0;

  return (
    <div className="space-y-8 sm:space-y-10">
      <PageHeader
        title="Dashboard"
        description={`${MONTH_NAMES[month - 1]} ${year} — totals, chart, and recent activity use this calendar month.`}
      >
        <Button asChild size="sm">
          <Link to="/income/new">
            <Plus className="h-4 w-4" />
            Income
          </Link>
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link to="/expenses/new">
            <Plus className="h-4 w-4" />
            Expense
          </Link>
        </Button>
      </PageHeader>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        <StatCard accent="income">
          <CardHeader className="relative pb-2">
            <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
              <TrendingUp className="h-3.5 w-3.5 text-teal-500" /> Total income
              <span className="font-normal normal-case tracking-normal text-zinc-400">({MONTH_NAMES[month - 1]})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {summaryLoading ? (
              <div className="h-8 w-36 animate-pulse rounded-md bg-zinc-100" />
            ) : (
              <AmountBadge amount={summary?.total_income ?? 0} type="income" className="text-xl sm:text-2xl" />
            )}
          </CardContent>
        </StatCard>

        <StatCard accent="expense">
          <CardHeader className="relative pb-2">
            <CardTitle className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
              <TrendingDown className="h-3.5 w-3.5 text-rose-500" /> Total expenses
              <span className="font-normal normal-case tracking-normal text-zinc-400">({MONTH_NAMES[month - 1]})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {summaryLoading ? (
              <div className="h-8 w-36 animate-pulse rounded-md bg-zinc-100" />
            ) : (
              <AmountBadge amount={summary?.total_expense ?? 0} type="expense" className="text-xl sm:text-2xl" />
            )}
          </CardContent>
        </StatCard>

        <StatCard accent="neutral">
          <CardHeader className="relative pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wide text-zinc-500">Net balance</CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {summaryLoading ? (
              <div className="h-8 w-36 animate-pulse rounded-md bg-zinc-100" />
            ) : (
              <AmountBadge
                amount={net}
                type={net >= 0 ? 'income' : 'expense'}
                className="text-xl sm:text-2xl"
              />
            )}
          </CardContent>
        </StatCard>

        <StatCard accent="loan">
          <CardHeader className="relative pb-2">
            <CardTitle className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
              <HandCoins className="h-3.5 w-3.5 text-amber-500" /> New loans
              <span className="font-normal normal-case tracking-normal text-zinc-400">({MONTH_NAMES[month - 1]})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Given</span>
              <AmountBadge amount={summary?.total_loans_given ?? 0} type="income" />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-500">Taken</span>
              <AmountBadge amount={summary?.total_loans_taken ?? 0} type="expense" />
            </div>
          </CardContent>
        </StatCard>
      </div>

      {chartData.length > 0 && (
        <Card className="overflow-hidden border-zinc-200/60">
          <CardHeader className="border-b border-zinc-100/80 bg-gradient-to-r from-white to-zinc-50/50 pb-4">
            <CardTitle className="text-base font-semibold tracking-tight text-zinc-900">
              Daily income vs expenses — {MONTH_NAMES[month - 1]}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <IncomeExpenseBarChart data={chartData} xKey="day" height={248} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <Card className="border-zinc-200/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-zinc-100/80 pb-4">
            <CardTitle className="text-base font-semibold tracking-tight">
              Income — {MONTH_NAMES[month - 1]} {year}
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-zinc-500 hover:text-indigo-600">
              <Link to="/income">
                View all <ArrowRight className="h-3.5 w-3.5 opacity-70" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-0 pt-2">
            {incomeData?.data.length === 0 && (
              <p className="py-8 text-center text-sm text-zinc-400">No income recorded yet</p>
            )}
            {incomeData?.data.map(item => (
              <div
                key={item.id}
                className="group flex items-center justify-between gap-3 rounded-lg py-2.5 pl-2 pr-2 transition-colors duration-150 hover:bg-zinc-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">{item.source}</p>
                  <p className="text-xs text-zinc-400">{formatDate(item.date)}</p>
                </div>
                <AmountBadge amount={item.amount} type="income" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-zinc-200/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-zinc-100/80 pb-4">
            <CardTitle className="text-base font-semibold tracking-tight">
              Expenses — {MONTH_NAMES[month - 1]} {year}
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-zinc-500 hover:text-indigo-600">
              <Link to="/expenses">
                View all <ArrowRight className="h-3.5 w-3.5 opacity-70" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-0 pt-2">
            {expenseData?.data.length === 0 && (
              <p className="py-8 text-center text-sm text-zinc-400">No expenses recorded yet</p>
            )}
            {expenseData?.data.map(item => (
              <div
                key={item.id}
                className="group flex items-center justify-between gap-3 rounded-lg py-2.5 pl-2 pr-2 transition-colors duration-150 hover:bg-zinc-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-900">{item.title}</p>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1">
                    <span className="text-xs text-zinc-400">{formatDate(item.date)}</span>
                    {item.tags.slice(0, 2).map(tag => (
                      <TagBadge key={tag.id} tag={tag} />
                    ))}
                  </div>
                </div>
                <AmountBadge amount={item.amount} type="expense" className="ml-1 shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-teal-200/50 bg-gradient-to-b from-teal-50/40 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-teal-100/60 pb-4">
            <CardTitle className="text-base font-semibold tracking-tight text-teal-900">Loans given (active)</CardTitle>
            <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-zinc-500 hover:text-indigo-600">
              <Link to="/loans/given">
                View all <ArrowRight className="h-3.5 w-3.5 opacity-70" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-0 pt-2">
            <p className="-mt-1 mb-3 text-xs leading-relaxed text-zinc-500">
              Open loans (any month). The summary card counts only loans created in {MONTH_NAMES[month - 1]}.
            </p>
            {loanGivenData?.data.length === 0 && (
              <p className="py-8 text-center text-sm text-zinc-400">No active loans given</p>
            )}
            {loanGivenData?.data.map(loan => (
              <div
                key={loan.id}
                className="group flex items-center justify-between gap-3 rounded-lg py-2.5 pl-2 pr-2 transition-colors duration-150 hover:bg-white/60"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">{loan.person_name}</p>
                  <p className="text-xs text-zinc-400">{formatDate(loan.date)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <LoanStatusBadge status={loan.status} />
                  <AmountBadge amount={loan.remaining_amount} type="income" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-rose-200/50 bg-gradient-to-b from-rose-50/35 to-transparent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-rose-100/60 pb-4">
            <CardTitle className="text-base font-semibold tracking-tight text-rose-900">Loans taken (active)</CardTitle>
            <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-zinc-500 hover:text-indigo-600">
              <Link to="/loans/taken">
                View all <ArrowRight className="h-3.5 w-3.5 opacity-70" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-0 pt-2">
            <p className="-mt-1 mb-3 text-xs leading-relaxed text-zinc-500">
              Open loans (any month). The summary card counts only loans created in {MONTH_NAMES[month - 1]}.
            </p>
            {loanTakenData?.data.length === 0 && (
              <p className="py-8 text-center text-sm text-zinc-400">No active loans taken</p>
            )}
            {loanTakenData?.data.map(loan => (
              <div
                key={loan.id}
                className="group flex items-center justify-between gap-3 rounded-lg py-2.5 pl-2 pr-2 transition-colors duration-150 hover:bg-white/60"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-zinc-900">{loan.person_name}</p>
                  <p className="text-xs text-zinc-400">{formatDate(loan.date)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <LoanStatusBadge status={loan.status} />
                  <AmountBadge amount={loan.remaining_amount} type="expense" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
