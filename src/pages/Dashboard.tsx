import { useMemo, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, HandCoins, ArrowRight, Plus, Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AmountBadge } from '@/components/shared/AmountBadge';
import { TagBadge } from '@/components/shared/TagBadge';
import { LoanStatusBadge } from '@/components/shared/LoanStatusBadge';
import { PageHeader } from '@/components/shared/PageHeader';
import { useGetRangeSummary } from '@/hooks/useSummary';
import { useGetIncomes } from '@/hooks/useIncome';
import { useGetExpenses } from '@/hooks/useExpenses';
import { useGetLoans } from '@/hooks/useLoans';
import { cn, formatDate, getMonthIsoRange, todayISO } from '@/lib/utils';
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
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-white/80 to-transparent blur-2xl dark:from-zinc-100/10" />
      {children}
    </Card>
  );
}

export default function Dashboard() {
  const [rangeType, setRangeType] = useState<'month' | 'custom'>('month');
  const [selectedMonths, setSelectedMonths] = useState<number[]>([new Date().getMonth() + 1]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [customRange, setCustomRange] = useState({ from: todayISO(), to: todayISO() });

  const { from, to } = useMemo(() => {
    if (rangeType === 'month' && selectedMonths.length > 0) {
      const minMonth = Math.min(...selectedMonths);
      const maxMonth = Math.max(...selectedMonths);
      const { from } = getMonthIsoRange(selectedYear, minMonth);
      const { to } = getMonthIsoRange(selectedYear, maxMonth);
      return { from, to };
    }
    return customRange;
  }, [rangeType, selectedYear, selectedMonths, customRange]);

  const summaryParams = useMemo(() => {
    if (rangeType === 'month') {
      return { year: selectedYear, months: selectedMonths.sort((a, b) => a - b).join(',') };
    }
    return customRange;
  }, [rangeType, selectedYear, selectedMonths, customRange]);

  const { data: summary, isLoading: summaryLoading } = useGetRangeSummary(summaryParams);
  const { data: incomeData } = useGetIncomes({ limit: 5, from, to });
  const { data: expenseData } = useGetExpenses({ limit: 5, from, to });
  const { data: loanGivenData } = useGetLoans({ type: 'given', status: 'pending', limit: 3 });
  const { data: loanTakenData } = useGetLoans({ type: 'taken', status: 'pending', limit: 3 });

  const chartData = useMemo(() => {
    return summary?.daily_breakdown?.map(d => {
      const dateParts = (d.label || '').split('-');
      const label = rangeType === 'month' && selectedMonths.length === 1 
        ? (dateParts[2] || String(d.day || '')) 
        : `${MONTH_NAMES[parseInt(dateParts[1], 10) - 1] || ''} ${dateParts[2] || ''}`;
      return {
        day: label,
        Income: d.income,
        Expenses: d.expense,
      };
    }) ?? [];
  }, [summary, rangeType, selectedMonths]);

  const net = summary?.net ?? 0;

  const handlePrevYear = () => setSelectedYear(y => y - 1);
  const handleNextYear = () => setSelectedYear(y => y + 1);

  const toggleMonth = (monthNum: number) => {
    setRangeType('month');
    setSelectedMonths(prev => {
      if (prev.includes(monthNum)) {
        if (prev.length === 1) return prev; // Keep at least one
        return prev.filter(m => m !== monthNum);
      }
      return [...prev, monthNum];
    });
  };

  return (
    <div className="space-y-8 sm:space-y-10">
      <PageHeader
        title="Dashboard"
        description={
          rangeType === 'month' 
            ? `${selectedMonths.length > 1 ? 'Selected Months' : MONTH_NAMES[selectedMonths[0] - 1]} ${selectedYear} — totals, chart, and recent activity.` 
            : `Custom range: ${formatDate(from)} to ${formatDate(to)}`
        }
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

      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 mr-4 bg-zinc-100/80 p-1 rounded-lg dark:bg-zinc-800/50">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePrevYear}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold px-2 min-w-[3rem] text-center">{selectedYear}</span>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleNextYear}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            {MONTH_NAMES.map((name, idx) => {
              const monthNum = idx + 1;
              const isActive = rangeType === 'month' && selectedMonths.includes(monthNum);
              return (
                <button
                  key={name}
                  onClick={() => toggleMonth(monthNum)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border",
                    isActive 
                      ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20" 
                      : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400"
                  )}
                >
                  {name}
                </button>
              );
            })}
            <div className="h-4 w-[1px] bg-zinc-200 mx-1 hidden sm:block dark:bg-zinc-800" />
            <button
              onClick={() => setRangeType('custom')}
              className={cn(
                "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border",
                rangeType === 'custom'
                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20"
                  : "bg-white border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-400"
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              Custom
            </button>
          </div>

          {rangeType === 'custom' && (
            <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
              <input
                type="date"
                value={customRange.from}
                onChange={(e) => setCustomRange(prev => ({ ...prev, from: e.target.value }))}
                className="bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-zinc-900 dark:border-zinc-800"
              />
              <span className="text-xs font-medium text-zinc-400 uppercase">to</span>
              <input
                type="date"
                value={customRange.to}
                onChange={(e) => setCustomRange(prev => ({ ...prev, to: e.target.value }))}
                className="bg-white border border-zinc-200 rounded-lg px-3 py-1.5 text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:bg-zinc-900 dark:border-zinc-800"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
          <StatCard accent="income">
            <CardHeader className="relative pb-2">
              <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                <TrendingUp className="h-3.5 w-3.5 text-teal-500" /> Total income
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              {summaryLoading ? (
                <div className="h-8 w-36 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800/65" />
              ) : (
                <AmountBadge amount={summary?.total_income ?? 0} type="income" className="text-xl sm:text-2xl" />
              )}
            </CardContent>
          </StatCard>

          <StatCard accent="expense">
            <CardHeader className="relative pb-2">
              <CardTitle className="flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                <TrendingDown className="h-3.5 w-3.5 text-rose-500" /> Total expenses
              </CardTitle>
            </CardHeader>
            <CardContent className="relative">
              {summaryLoading ? (
                <div className="h-8 w-36 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800/65" />
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
                <div className="h-8 w-36 animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800/65" />
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
                <HandCoins className="h-3.5 w-3.5 text-amber-500" /> Loans impact
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
      </div>

      {chartData.length > 0 && (
        <Card className="overflow-hidden border-zinc-200/60">
          <CardHeader className="border-b border-zinc-100/80 bg-gradient-to-r from-white to-zinc-50/50 pb-4 dark:border-zinc-700/70 dark:from-zinc-900 dark:to-zinc-900/40">
            <CardTitle className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
              Income vs Expenses Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <IncomeExpenseBarChart data={chartData} xKey="day" height={248} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
        <Card className="flex flex-col border-zinc-200/60 dark:border-zinc-800/65">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-zinc-100/80 pb-4 dark:border-zinc-800/65">
            <CardTitle className="text-base font-semibold tracking-tight">
              Recent Income
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-zinc-500 hover:text-indigo-600">
              <Link to="/income">
                View all <ArrowRight className="h-3.5 w-3.5 opacity-70" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="h-[350px] overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
            <div className="space-y-0 pt-2 px-4 pb-4">
              {incomeData?.data.length === 0 && (
                <p className="py-20 text-center text-sm text-zinc-400 dark:text-zinc-300">No income recorded for this period</p>
              )}
              {incomeData?.data.map(item => (
                <div
                  key={item.id}
                  className="group flex items-center justify-between gap-3 rounded-lg py-2.5 pl-2 pr-2 transition-colors duration-150 hover:bg-zinc-50 dark:hover:bg-zinc-800/55"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.source}</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-300">{formatDate(item.date)}</p>
                  </div>
                  <AmountBadge amount={item.amount} type="income" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col border-zinc-200/60 dark:border-zinc-800/65">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-zinc-100/80 pb-4 dark:border-zinc-800/65">
            <CardTitle className="text-base font-semibold tracking-tight">
              Recent Expenses
            </CardTitle>
            <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-zinc-500 hover:text-indigo-600">
              <Link to="/expenses">
                View all <ArrowRight className="h-3.5 w-3.5 opacity-70" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="h-[350px] overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-800">
            <div className="space-y-0 pt-2 px-4 pb-4">
              {expenseData?.data.length === 0 && (
                <p className="py-20 text-center text-sm text-zinc-400 dark:text-zinc-300">No expenses recorded for this period</p>
              )}
              {expenseData?.data.map(item => (
                <div
                  key={item.id}
                  className="group flex items-center justify-between gap-3 rounded-lg py-2.5 pl-2 pr-2 transition-colors duration-150 hover:bg-zinc-50 dark:hover:bg-zinc-800/55"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{item.title}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-1">
                      <span className="text-xs text-zinc-400 dark:text-zinc-300">{formatDate(item.date)}</span>
                      {item.tags.slice(0, 2).map(tag => (
                        <TagBadge key={tag.id} tag={tag} />
                      ))}
                    </div>
                  </div>
                  <AmountBadge amount={item.amount} type="expense" className="ml-1 shrink-0" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col border-teal-200/50 bg-gradient-to-b from-teal-50/40 to-transparent dark:border-teal-900/50 dark:from-teal-950/25">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-teal-100/60 pb-4 dark:border-teal-900/50">
            <CardTitle className="text-base font-semibold tracking-tight text-teal-900 dark:text-teal-200">Loans given (active)</CardTitle>
            <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-zinc-500 hover:text-indigo-600">
              <Link to="/loans/given">
                View all <ArrowRight className="h-3.5 w-3.5 opacity-70" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="h-[350px] overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-teal-100 dark:scrollbar-thumb-teal-900">
            <div className="space-y-0 pt-2 px-4 pb-4">
              <p className="mb-3 text-xs leading-relaxed text-zinc-500 px-2">
                Open loans (any month).
              </p>
              {loanGivenData?.data.length === 0 && (
                <p className="py-20 text-center text-sm text-zinc-400 dark:text-zinc-300">No active loans given</p>
              )}
              {loanGivenData?.data.map(loan => (
                <div
                  key={loan.id}
                  className="group flex items-center justify-between gap-3 rounded-lg py-2.5 pl-2 pr-2 transition-colors duration-150 hover:bg-white/60 dark:hover:bg-zinc-800/55"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{loan.person_name}</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-300">{formatDate(loan.date)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <LoanStatusBadge status={loan.status} />
                    <AmountBadge amount={loan.remaining_amount} type="income" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col border-rose-200/50 bg-gradient-to-b from-rose-50/35 to-transparent dark:border-rose-900/50 dark:from-rose-950/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 border-b border-rose-100/60 pb-4 dark:border-rose-900/45">
            <CardTitle className="text-base font-semibold tracking-tight text-rose-900 dark:text-rose-200">Loans taken (active)</CardTitle>
            <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-zinc-500 hover:text-indigo-600">
              <Link to="/loans/taken">
                View all <ArrowRight className="h-3.5 w-3.5 opacity-70" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="h-[350px] overflow-y-auto p-0 scrollbar-thin scrollbar-thumb-rose-100 dark:scrollbar-thumb-rose-900">
            <div className="space-y-0 pt-2 px-4 pb-4">
              <p className="mb-3 text-xs leading-relaxed text-zinc-500 px-2">
                Open loans (any month).
              </p>
              {loanTakenData?.data.length === 0 && (
                <p className="py-20 text-center text-sm text-zinc-400 dark:text-zinc-300">No active loans taken</p>
              )}
              {loanTakenData?.data.map(loan => (
                <div
                  key={loan.id}
                  className="group flex items-center justify-between gap-3 rounded-lg py-2.5 pl-2 pr-2 transition-colors duration-150 hover:bg-white/60 dark:hover:bg-zinc-800/55"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">{loan.person_name}</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-300">{formatDate(loan.date)}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <LoanStatusBadge status={loan.status} />
                    <AmountBadge amount={loan.remaining_amount} type="expense" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
