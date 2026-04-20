import { useState } from 'react';
import { Calendar, CalendarDays } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AmountBadge } from '@/components/shared/AmountBadge';
import { PageHeader } from '@/components/shared/PageHeader';
import { FilterSurface } from '@/components/shared/FilterSurface';
import { useGetDailySummary, useGetMonthlySummary, useGetYearlySummary } from '@/hooks/useSummary';
import { addDaysIso, todayISO } from '@/lib/utils';
import { IncomeExpenseBarChart, PremiumPieTooltip } from '@/lib/chart';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function SummaryCards({ data }: { data: ReturnType<typeof useGetDailySummary>['data'] }) {
  if (!data) return null;
  const net = data.net;
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
      <Card className="border-zinc-200/60">
        <CardContent className="pt-5">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500">Total income</p>
          <AmountBadge amount={data.total_income} type="income" className="text-lg" />
        </CardContent>
      </Card>
      <Card className="border-zinc-200/60">
        <CardContent className="pt-5">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500">Total expenses</p>
          <AmountBadge amount={data.total_expense} type="expense" className="text-lg" />
        </CardContent>
      </Card>
      <Card className="border-zinc-200/60">
        <CardContent className="pt-5">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500">Net balance</p>
          <AmountBadge amount={net} type={net >= 0 ? 'income' : 'expense'} className="text-lg" />
        </CardContent>
      </Card>
      <Card className="border-zinc-200/60">
        <CardContent className="pt-5">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500">Loans given</p>
          <AmountBadge amount={data.total_loans_given} className="text-lg" />
        </CardContent>
      </Card>
      <Card className="border-zinc-200/60">
        <CardContent className="pt-5">
          <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-zinc-500">Loans taken</p>
          <AmountBadge amount={data.total_loans_taken} className="text-lg" />
        </CardContent>
      </Card>
    </div>
  );
}

function TagBreakdownChart({ data }: { data: ReturnType<typeof useGetDailySummary>['data'] }) {
  if (!data || data.expenses_by_tag.length === 0) return null;
  const pieData = data.expenses_by_tag.map(t => ({ ...t, name: t.tag_name }));
  return (
    <Card className="overflow-hidden border-zinc-200/60">
      <CardHeader className="border-b border-zinc-100/80 bg-gradient-to-r from-white to-zinc-50/50">
        <CardTitle className="text-base font-semibold tracking-tight">Expenses by tag</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie
              data={pieData}
              dataKey="total"
              nameKey="name"
              cx="50%"
              cy="48%"
              innerRadius={52}
              outerRadius={84}
              paddingAngle={2}
              stroke="rgba(255,255,255,0.85)"
              strokeWidth={2}
              animationDuration={400}
              animationEasing="ease-out"
            >
              {data.expenses_by_tag.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<PremiumPieTooltip />} animationDuration={150} />
            <Legend
              verticalAlign="bottom"
              height={40}
              iconType="circle"
              iconSize={8}
              formatter={(value) => (
                <span style={{ fontSize: 11, fontWeight: 500, color: '#52525b' }}>{String(value)}</span>
              )}
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
    <div className="space-y-6">
      <FilterSurface
        title="Day"
        icon={Calendar}
        description="Pick any calendar day. Totals and tag split match that day only."
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="grid gap-1.5">
            <Label htmlFor="daily-date" className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              Date
            </Label>
            <Input
              id="daily-date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full min-w-[10.5rem] sm:w-44"
            />
          </div>
          <div className="flex flex-wrap gap-2 sm:pb-0.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 rounded-full border border-zinc-200/80 bg-white/80 px-3 text-xs font-medium shadow-sm transition-[background-color,box-shadow,transform] duration-150 hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-900 active:scale-[0.98]"
              onClick={() => setDate(todayISO())}
            >
              Today
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 rounded-full border border-zinc-200/80 bg-white/80 px-3 text-xs font-medium shadow-sm transition-[background-color,box-shadow,transform] duration-150 hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-900 active:scale-[0.98]"
              onClick={() => setDate(addDaysIso(todayISO(), -1))}
            >
              Yesterday
            </Button>
          </div>
        </div>
      </FilterSurface>
      {isLoading ? (
        <div className="h-44 animate-pulse rounded-xl bg-zinc-100/80" />
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
  const [month, setMonth] = useState(String(now.getMonth() + 1));
  const { data, isLoading } = useGetMonthlySummary(year, parseInt(month, 10));

  const goThisMonth = () => {
    const n = new Date();
    setYear(n.getFullYear());
    setMonth(String(n.getMonth() + 1));
  };

  const goPrevMonth = () => {
    let y = year;
    let m = parseInt(month, 10) - 1;
    if (m < 1) {
      m = 12;
      y -= 1;
    }
    setYear(y);
    setMonth(String(m));
  };

  const chartData =
    data?.daily_breakdown?.map(d => ({
      day: String(d.day),
      Income: d.income,
      Expenses: d.expense,
    })) ?? [];

  return (
    <div className="space-y-6">
      <FilterSurface
        title="Month & year"
        icon={CalendarDays}
        description="Choose a calendar month for totals, daily chart, and tag split."
      >
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
            <div className="grid gap-1.5">
              <Label htmlFor="summary-month-year" className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                Year
              </Label>
              <Input
                id="summary-month-year"
                type="number"
                value={year}
                onChange={e => setYear(parseInt(e.target.value, 10) || now.getFullYear())}
                className="w-28"
                min={2020}
                max={2099}
              />
            </div>
            <div className="grid min-w-0 gap-1.5 sm:w-44">
              <Label className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">Month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_NAMES.map((m, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-zinc-100/90 pt-3 lg:border-t-0 lg:pt-0">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 rounded-full border border-zinc-200/80 bg-white/80 px-3 text-xs font-medium shadow-sm transition-[background-color,box-shadow,transform] duration-150 hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-900 active:scale-[0.98]"
              onClick={goThisMonth}
            >
              This month
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 rounded-full border border-zinc-200/80 bg-white/80 px-3 text-xs font-medium shadow-sm transition-[background-color,box-shadow,transform] duration-150 hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-900 active:scale-[0.98]"
              onClick={goPrevMonth}
            >
              Previous month
            </Button>
          </div>
        </div>
      </FilterSurface>

      {isLoading ? (
        <div className="h-44 animate-pulse rounded-xl bg-zinc-100/80" />
      ) : (
        <>
          <SummaryCards data={data} />
          {chartData.length > 0 && (
            <Card className="overflow-hidden border-zinc-200/60">
              <CardHeader className="border-b border-zinc-100/80 bg-gradient-to-r from-white to-zinc-50/50">
                <CardTitle className="text-base font-semibold tracking-tight">
                  Daily breakdown — {MONTH_NAMES[parseInt(month, 10) - 1]} {year}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <IncomeExpenseBarChart data={chartData} xKey="day" height={248} />
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
  const yNow = new Date().getFullYear();
  const [year, setYear] = useState(yNow);
  const { data, isLoading } = useGetYearlySummary(year);

  const chartData =
    data?.monthly_breakdown?.map(m => ({
      month: MONTH_NAMES[m.month - 1],
      Income: m.income,
      Expenses: m.expense,
    })) ?? [];

  return (
    <div className="space-y-6">
      <FilterSurface
        title="Calendar year"
        icon={CalendarDays}
        description="Full-year totals and monthly bars for the selected year."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="grid gap-1.5">
            <Label htmlFor="summary-yearly-year" className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              Year
            </Label>
            <Input
              id="summary-yearly-year"
              type="number"
              value={year}
              onChange={e => setYear(parseInt(e.target.value, 10) || yNow)}
              className="w-28"
              min={2020}
              max={2099}
            />
          </div>
          <div className="flex flex-wrap gap-2 border-t border-zinc-100/90 pt-3 sm:border-t-0 sm:pt-0">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 rounded-full border border-zinc-200/80 bg-white/80 px-3 text-xs font-medium shadow-sm transition-[background-color,box-shadow,transform] duration-150 hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-900 active:scale-[0.98]"
              onClick={() => setYear(yNow)}
            >
              This year
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 rounded-full border border-zinc-200/80 bg-white/80 px-3 text-xs font-medium shadow-sm transition-[background-color,box-shadow,transform] duration-150 hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-900 active:scale-[0.98]"
              onClick={() => setYear(yNow - 1)}
            >
              Last year
            </Button>
          </div>
        </div>
      </FilterSurface>

      {isLoading ? (
        <div className="h-44 animate-pulse rounded-xl bg-zinc-100/80" />
      ) : (
        <>
          <SummaryCards data={data} />
          {chartData.length > 0 && (
            <Card className="overflow-hidden border-zinc-200/60">
              <CardHeader className="border-b border-zinc-100/80 bg-gradient-to-r from-white to-zinc-50/50">
                <CardTitle className="text-base font-semibold tracking-tight">Monthly breakdown — {year}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <IncomeExpenseBarChart data={chartData} xKey="month" height={268} />
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
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Summary"
        description="Switch between daily, monthly, and yearly views. Charts use the same currency formatting as the rest of the app."
      />
      <Tabs defaultValue="monthly" className="space-y-6">
        <TabsList className="h-auto flex-wrap justify-start gap-0.5 p-1 sm:inline-flex">
          <TabsTrigger value="daily" className="min-w-[5.5rem]">
            Daily
          </TabsTrigger>
          <TabsTrigger value="monthly" className="min-w-[5.5rem]">
            Monthly
          </TabsTrigger>
          <TabsTrigger value="yearly" className="min-w-[5.5rem]">
            Yearly
          </TabsTrigger>
        </TabsList>
        <TabsContent value="daily" className="mt-0 focus-visible:ring-0">
          <DailySummaryTab />
        </TabsContent>
        <TabsContent value="monthly" className="mt-0 focus-visible:ring-0">
          <MonthlySummaryTab />
        </TabsContent>
        <TabsContent value="yearly" className="mt-0 focus-visible:ring-0">
          <YearlySummaryTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
