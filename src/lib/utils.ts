import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** `#rgb` / `#rrggbb` → `rgba(r,g,b,a)` for light UI tints. Invalid hex → zinc. */
export function hexToRgba(hex: string, alpha: number): string {
  let h = hex.trim().replace(/^#/, '');
  if (h.length === 3) {
    h = h
      .split('')
      .map(c => c + c)
      .join('');
  }
  if (!/^[0-9a-fA-F]{6}$/.test(h)) {
    return `rgba(24, 24, 27, ${alpha})`;
  }
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

/** Inclusive `YYYY-MM-DD` range for a calendar month (`month` is 1–12). */
export function getMonthIsoRange(year: number, month: number): { from: string; to: string } {
  const pad = (n: number) => String(n).padStart(2, '0');
  const from = `${year}-${pad(month)}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const to = `${year}-${pad(month)}-${pad(lastDay)}`;
  return { from, to };
}

/** Normalize API date strings for `<input type="date">` (YYYY-MM-DD). */
export function toInputDate(value: string | undefined | null): string {
  if (!value) return '';
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (s.length >= 10 && /^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

/** Add calendar days to a `YYYY-MM-DD` string (local calendar). */
export function addDaysIso(iso: string, days: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`;
}

/** Inclusive range for the last N calendar days ending today (`n` >= 1). */
export function getLastNDaysRange(n: number): { from: string; to: string } {
  const to = todayISO();
  const from = addDaysIso(to, -(n - 1));
  return { from, to };
}

/** Current calendar month inclusive range. */
export function getCurrentMonthRange(): { from: string; to: string } {
  const now = new Date();
  return getMonthIsoRange(now.getFullYear(), now.getMonth() + 1);
}

/** Jan 1 through today for the current year; full year for past years. */
export function getYearRangeForFilter(year: number): { from: string; to: string } {
  const yNow = new Date().getFullYear();
  const from = `${year}-01-01`;
  if (year < yNow) return { from, to: `${year}-12-31` };
  if (year > yNow) return { from, to: `${year}-12-31` };
  return { from, to: todayISO() };
}
