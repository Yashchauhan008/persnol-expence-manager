import type { ReactNode } from 'react';
import { ArrowRight, CalendarRange } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FilterSurface } from '@/components/shared/FilterSurface';
import { getCurrentMonthRange, getLastNDaysRange, getYearRangeForFilter } from '@/lib/utils';

type PresetId = 'month' | '30' | '7' | 'ytd';

interface DateRangeFilterProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onClearDates: () => void;
  /** Extra controls after presets (e.g. clear all filters including tags) */
  trailingActions?: ReactNode;
  className?: string;
}

function applyPreset(id: PresetId, onBoth: (f: string, t: string) => void) {
  if (id === 'month') {
    const { from, to } = getCurrentMonthRange();
    onBoth(from, to);
    return;
  }
  if (id === '30') {
    const { from, to } = getLastNDaysRange(30);
    onBoth(from, to);
    return;
  }
  if (id === '7') {
    const { from, to } = getLastNDaysRange(7);
    onBoth(from, to);
    return;
  }
  if (id === 'ytd') {
    const y = new Date().getFullYear();
    const { from, to } = getYearRangeForFilter(y);
    onBoth(from, to);
  }
}

export function DateRangeFilter({
  from,
  to,
  onFromChange,
  onToChange,
  onClearDates,
  trailingActions,
  className,
}: DateRangeFilterProps) {
  const hasRange = Boolean(from || to);

  const setBoth = (f: string, t: string) => {
    onFromChange(f);
    onToChange(t);
  };

  const handleFrom = (next: string) => {
    onFromChange(next);
    if (to && next && next > to) onToChange(next);
  };

  const handleTo = (next: string) => {
    if (from && next && next < from) {
      onToChange(from);
      return;
    }
    onToChange(next);
  };

  const presets: { id: PresetId; label: string }[] = [
    { id: 'month', label: 'This month' },
    { id: '30', label: 'Last 30 days' },
    { id: '7', label: 'Last 7 days' },
    { id: 'ytd', label: 'Year to date' },
  ];

  return (
    <FilterSurface
      className={className}
      title="Date range"
      icon={CalendarRange}
      description="Filter list totals and rows. End date adjusts if it falls before start."
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="grid gap-1.5">
            <Label htmlFor="filter-date-from" className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              From
            </Label>
            <Input
              id="filter-date-from"
              type="date"
              value={from}
              max={to || undefined}
              onChange={e => handleFrom(e.target.value)}
              className="w-full min-w-[10.5rem] sm:w-44"
            />
          </div>
          <span
            className="hidden items-center pb-2 text-zinc-300 sm:flex"
            aria-hidden
          >
            <ArrowRight className="h-4 w-4" strokeWidth={2} />
          </span>
          <span className="flex items-center justify-center text-zinc-400 sm:hidden">
            <span className="text-xs font-medium">to</span>
          </span>
          <div className="grid gap-1.5">
            <Label htmlFor="filter-date-to" className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
              To
            </Label>
            <Input
              id="filter-date-to"
              type="date"
              value={to}
              min={from || undefined}
              onChange={e => handleTo(e.target.value)}
              className="w-full min-w-[10.5rem] sm:w-44"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100/90 pt-3 lg:border-t-0 lg:pt-0">
          {presets.map(p => (
            <Button
              key={p.id}
              type="button"
              variant="secondary"
              size="sm"
              className="h-8 rounded-full border border-zinc-200/80 bg-white/80 px-3 text-xs font-medium text-zinc-700 shadow-sm transition-[background-color,box-shadow,transform] duration-150 hover:border-indigo-200 hover:bg-indigo-50/60 hover:text-indigo-900 active:scale-[0.98]"
              onClick={() => applyPreset(p.id, setBoth)}
            >
              {p.label}
            </Button>
          ))}
          {hasRange ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-zinc-500 hover:text-zinc-900"
              onClick={onClearDates}
            >
              Clear dates
            </Button>
          ) : null}
          {trailingActions ? (
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto lg:ml-auto">{trailingActions}</div>
          ) : null}
        </div>
      </div>
    </FilterSurface>
  );
}
