import { useQuery } from '@tanstack/react-query';
import { getDailySummary, getMonthlySummary, getRangeSummary, getYearlySummary } from '@/services/api/summary.api';
import type { Summary } from '@/types/summary';
import { useAuth } from '@/context/AuthContext';

/** Prefix for all summary queries — invalidate after income/expense/loan changes. */
export const summaryKeys = {
  all: ['summary'] as const,
};

export function useGetDailySummary(date?: string) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['summary', 'daily', user?.id, date],
    queryFn: async () => {
      const res = await getDailySummary(date);
      return res.data.data as Summary;
    },
  });
}

export function useGetMonthlySummary(year?: number, month?: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['summary', 'monthly', user?.id, year, month],
    queryFn: async () => {
      const res = await getMonthlySummary(year, month);
      return res.data.data as Summary;
    },
  });
}

export function useGetYearlySummary(year?: number) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['summary', 'yearly', user?.id, year],
    queryFn: async () => {
      const res = await getYearlySummary(year);
      return res.data.data as Summary;
    },
  });
}

export function useGetRangeSummary(params: { from?: string; to?: string; year?: number; months?: string }) {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['summary', 'range', user?.id, params],
    queryFn: async () => {
      const res = await getRangeSummary(params);
      return res.data.data as Summary;
    },
    enabled: (!!params.from && !!params.to) || (!!params.year && !!params.months),
  });
}
