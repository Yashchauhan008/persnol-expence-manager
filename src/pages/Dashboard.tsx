import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, HandCoins, ArrowRight, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AmountBadge } from '@/components/shared/AmountBadge';
import { TagBadge } from '@/components/shared/TagBadge';
import { LoanStatusBadge } from '@/components/shared/LoanStatusBadge';
import { useGetMonthlySummary } from '@/hooks/useSummary';
import { useGetIncomes } from '@/hooks/useIncome';
import { useGetExpenses } from '@/hooks/useExpenses';
import { useGetLoans } from '@/hooks/useLoans';
import { formatDate } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Dashboard() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const { data: summary, isLoading: summaryLoading } = useGetMonthlySummary(year, month);
  const { data: incomeData } = useGetIncomes({ limit: 5 });
  const { data: expenseData } = useGetExpenses({ limit: 5 });
  const { data: loanGivenData } = useGetLoans({ type: 'given', status: 'pending', limit: 3 });
  const { data: loanTakenData } = useGetLoans({ type: 'taken', status: 'pending', limit: 3 });

  const chartData = summary?.daily_breakdown?.map(d => ({
    day: `${d.day}`,
    Income: d.income,
    Expenses: d.expense,
  })) ?? [];

  const net = summary?.net ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">{MONTH_NAMES[month - 1]} {year} overview</p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm">
            <Link to="/income/new"><Plus className="h-4 w-4" />Income</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link to="/expenses/new"><Plus className="h-4 w-4" />Expense</Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" /> Total Income
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="h-7 w-32 bg-slate-100 rounded animate-pulse" />
            ) : (
              <AmountBadge amount={summary?.total_income ?? 0} type="income" className="text-xl" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-red-500" /> Total Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="h-7 w-32 bg-slate-100 rounded animate-pulse" />
            ) : (
              <AmountBadge amount={summary?.total_expense ?? 0} type="expense" className="text-xl" />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Net Balance</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <div className="h-7 w-32 bg-slate-100 rounded animate-pulse" />
            ) : (
              <AmountBadge
                amount={net}
                type={net >= 0 ? 'income' : 'expense'}
                className="text-xl"
              />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-500 flex items-center gap-2">
              <HandCoins className="h-4 w-4 text-amber-500" /> Active Loans
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Given</span>
              <AmountBadge amount={summary?.total_loans_given ?? 0} type="income" />
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Taken</span>
              <AmountBadge amount={summary?.total_loans_taken ?? 0} type="expense" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily Income vs Expenses — {MONTH_NAMES[month - 1]}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) =>
                    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value))
                  }
                />
                <Legend />
                <Bar dataKey="Income" fill="#10b981" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Expenses" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Income */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Recent Income</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/income">View all <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {incomeData?.data.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No income recorded yet</p>
            )}
            {incomeData?.data.map(item => (
              <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.source}</p>
                  <p className="text-xs text-slate-400">{formatDate(item.date)}</p>
                </div>
                <AmountBadge amount={item.amount} type="income" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Expenses */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Recent Expenses</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/expenses">View all <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {expenseData?.data.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No expenses recorded yet</p>
            )}
            {expenseData?.data.map(item => (
              <div key={item.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-900 truncate">{item.title}</p>
                  <div className="flex items-center gap-1 flex-wrap mt-0.5">
                    <span className="text-xs text-slate-400">{formatDate(item.date)}</span>
                    {item.tags.slice(0, 2).map(tag => <TagBadge key={tag.id} tag={tag} />)}
                  </div>
                </div>
                <AmountBadge amount={item.amount} type="expense" className="ml-3" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Active Loans Given */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base text-emerald-700">Loans Given (Active)</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/loans/given">View all <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {loanGivenData?.data.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No active loans given</p>
            )}
            {loanGivenData?.data.map(loan => (
              <div key={loan.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-900">{loan.person_name}</p>
                  <p className="text-xs text-slate-400">{formatDate(loan.date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <LoanStatusBadge status={loan.status} />
                  <AmountBadge amount={loan.remaining_amount} type="income" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Active Loans Taken */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base text-red-700">Loans Taken (Active)</CardTitle>
            <Button asChild variant="ghost" size="sm">
              <Link to="/loans/taken">View all <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {loanTakenData?.data.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">No active loans taken</p>
            )}
            {loanTakenData?.data.map(loan => (
              <div key={loan.id} className="flex items-center justify-between py-1.5 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-900">{loan.person_name}</p>
                  <p className="text-xs text-slate-400">{formatDate(loan.date)}</p>
                </div>
                <div className="flex items-center gap-2">
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
