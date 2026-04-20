import { useId } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

function formatChartInr(value: number | string | undefined) {
  const n = Number(value);
  if (Number.isNaN(n)) return '—';
  return formatCurrency(n);
}

type TooltipPayload = {
  name?: string;
  value?: number | string;
  color?: string;
};

export function PremiumBarTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string | number;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/12 bg-slate-950/88 px-3 py-2.5 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.55)] backdrop-blur-md">
      <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-slate-500">
        {label != null ? String(label) : ''}
      </p>
      <ul className="space-y-1.5">
        {payload.map((entry) => (
          <li key={String(entry.name)} className="flex items-center justify-between gap-8 text-xs">
            <span className="flex items-center gap-2 text-slate-300">
              <span
                className="h-2 w-2 shrink-0 rounded-full ring-1 ring-white/20"
                style={{ backgroundColor: entry.color ?? '#94a3b8' }}
              />
              {entry.name}
            </span>
            <span className="font-medium tabular-nums text-white">{formatChartInr(entry.value)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function PremiumPieTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value?: number;
    payload?: { tag_name?: string; name?: string; total?: number };
  }>;
}) {
  if (!active || !payload?.[0]) return null;
  const p = payload[0];
  const inner = p.payload;
  const name = p.name ?? inner?.tag_name ?? inner?.name ?? 'Tag';
  const value = Number(p.value ?? inner?.total ?? 0);
  return (
    <div className="rounded-lg border border-white/12 bg-slate-950/88 px-3 py-2 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.55)] backdrop-blur-md">
      <p className="text-xs font-medium text-white">{name}</p>
      <p className="mt-0.5 text-[11px] tabular-nums text-slate-300">{formatChartInr(value)}</p>
    </div>
  );
}

const tickStyle = { fill: '#64748b', fontSize: 11, fontWeight: 500 };

export interface IncomeExpenseBarChartProps {
  data: Array<Record<string, string | number>>;
  xKey: string;
  height?: number;
  margin?: { top?: number; right?: number; left?: number; bottom?: number };
}

export function IncomeExpenseBarChart({
  data,
  xKey,
  height = 240,
  margin = { top: 8, right: 10, left: 4, bottom: 4 },
}: IncomeExpenseBarChartProps) {
  const uid = useId().replace(/:/g, '');
  const incomeGrad = `ie-income-${uid}`;
  const expenseGrad = `ie-expense-${uid}`;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={margin} barCategoryGap="18%">
        <defs>
          <linearGradient id={incomeGrad} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#5eead4" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
          <linearGradient id={expenseGrad} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fda4af" />
            <stop offset="100%" stopColor="#e11d48" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 6" vertical={false} stroke="rgba(148, 163, 184, 0.35)" />
        <XAxis
          dataKey={xKey}
          axisLine={false}
          tickLine={false}
          tick={tickStyle}
          dy={6}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={tickStyle}
          width={48}
          tickFormatter={(v) =>
            new Intl.NumberFormat('en-IN', {
              notation: Number(v) >= 100000 ? 'compact' : 'standard',
              maximumFractionDigits: 1,
            }).format(Number(v))
          }
        />
        <Tooltip
          cursor={{ fill: 'rgba(99, 102, 241, 0.06)' }}
          content={<PremiumBarTooltip />}
          animationDuration={150}
        />
        <Legend
          wrapperStyle={{ paddingTop: 18 }}
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ fontSize: 12, fontWeight: 500, color: '#52525b' }}>{String(value)}</span>
          )}
        />
        <Bar
          dataKey="Income"
          fill={`url(#${incomeGrad})`}
          radius={[5, 5, 0, 0]}
          maxBarSize={36}
          animationDuration={380}
          animationEasing="ease-out"
        />
        <Bar
          dataKey="Expenses"
          fill={`url(#${expenseGrad})`}
          radius={[5, 5, 0, 0]}
          maxBarSize={36}
          animationDuration={380}
          animationEasing="ease-out"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
