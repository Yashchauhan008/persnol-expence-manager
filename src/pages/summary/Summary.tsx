import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AmountBadge } from '@/components/shared/AmountBadge';
import { useGetDailySummary, useGetMonthlySummary, useGetYearlySummary } from '@/hooks/useSummary';
import { todayISO } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, Tooltip as PieTooltip,
} from 'recharts';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function SummaryCards({ data }: { data: ReturnType<typeof useGetDailySummary>['data'] }) {
  if (!data) return null;
  const net = data.net;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-slate-500 mb-1">Total Income</p>
          <AmountBadge amount={data.total_income} type="income" className="text-lg" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-slate-500 mb-1">Total Expenses</p>
          <AmountBadge amount={data.total_expense} type="expense" className="text-lg" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-slate-500 mb-1">Net Balance</p>
          <AmountBadge amount={net} type={net >= 0 ? 'income' : 'expense'} className="text-lg" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-slate-500 mb-1">Loans Given</p>
          <AmountBadge amount={data.total_loans_given} className="text-lg" />
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-slate-500 mb-1">Loans Taken</p>
          <AmountBadge amount={data.total_loans_taken} className="text-lg" />
        </CardContent>
      </Card>
    </div>
  );
}

function TagBreakdownChart({ data }: { data: ReturnType<typeof useGetDailySummary>['data'] }) {
  if (!data || data.expenses_by_tag.length === 0) return null;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Expenses by Tag</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data.expenses_by_tag.map(t => ({ ...t, name: t.tag_name }))}
              dataKey="total"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
            >
              {data.expenses_by_tag.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <PieTooltip
              formatter={(value) =>
                new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(value))
              }
            />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function DailySummaryTab() {
  const [date, setDate] = useState(todayISO());
  const { data, isLoading } = useGetDailySummary(date);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Label htmlFor="daily-date">Date</Label>
        <Input id="daily-date" type="date" value={date} onChange={e => setDate(e.target.value)} className="w-40" />
      </div>
      {isLoading ? (
        <div className="h-40 bg-slate-100 rounded animate-pulse" />
      ) : (
        <>
          <SummaryCards data={data} />
          <TagBreakdownChart data={data} />
        </>
      )}
    </div>
  );
}

function MonthlySummaryTab() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const { data, isLoading } = useGetMonthlySummary(year, month);

  const chartData = data?.daily_breakdown?.map(d => ({
    day: String(d.day),
    Income: d.income,
    Expenses: d.expense,
  })) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Label>Year</Label>
        <Input
          type="number"
          value={year}
          onChange={e => setYear(parseInt(e.target.value))}
          className="w-24"
          min="2020"
          max="2099"
        />
        <Label>Month</Label>
        <select
          value={month}
          onChange={e => setMonth(parseInt(e.target.value))}
          className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {MONTH_NAMES.map((m, i) => (
            <option key={i + 1} value={i + 1}>{m}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="h-40 bg-slate-100 rounded animate-pulse" />
      ) : (
        <>
          <SummaryCards data={data} />
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Daily Breakdown — {MONTH_NAMES[month - 1]} {year}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(v))} />
                    <Legend />
                    <Bar dataKey="Income" fill="#10b981" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Expenses" fill="#ef4444" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
          <TagBreakdownChart data={data} />
        </>
      )}
    </div>
  );
}

function YearlySummaryTab() {
  const [year, setYear] = useState(new Date().getFullYear());
  const { data, isLoading } = useGetYearlySummary(year);

  const chartData = data?.monthly_breakdown?.map(m => ({
    month: MONTH_NAMES[m.month - 1],
    Income: m.income,
    Expenses: m.expense,
  })) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Label>Year</Label>
        <Input
          type="number"
          value={year}
          onChange={e => setYear(parseInt(e.target.value))}
          className="w-24"
          min="2020"
          max="2099"
        />
      </div>

      {isLoading ? (
        <div className="h-40 bg-slate-100 rounded animate-pulse" />
      ) : (
        <>
          <SummaryCards data={data} />
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Monthly Breakdown — {year}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(v))} />
                    <Legend />
                    <Bar dataKey="Income" fill="#10b981" radius={[3, 3, 0, 0]} />
                    <Bar dataKey="Expenses" fill="#ef4444" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
          <TagBreakdownChart data={data} />
        </>
      )}
    </div>
  );
}

export default function Summary() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-slate-900">Summary</h1>
      <Tabs defaultValue="monthly">
        <TabsList>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="mt-4"><DailySummaryTab /></TabsContent>
        <TabsContent value="monthly" className="mt-4"><MonthlySummaryTab /></TabsContent>
        <TabsContent value="yearly" className="mt-4"><YearlySummaryTab /></TabsContent>
      </Tabs>
    </div>
  );
}
