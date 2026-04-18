import { useQuery } from '@tanstack/react-query';
import { getDailySummary, getMonthlySummary, getYearlySummary } from '@/services/api/summary.api';
import type { Summary } from '@/types/summary';

export function useGetDailySummary(date?: string) {
  return useQuery({
    queryKey: ['summary', 'daily', date],
    queryFn: async () => {
      const res = await getDailySummary(date);
      return res.data.data as Summary;
    },
  });
}

export function useGetMonthlySummary(year?: number, month?: number) {
  return useQuery({
    queryKey: ['summary', 'monthly', year, month],
    queryFn: async () => {
      const res = await getMonthlySummary(year, month);
      return res.data.data as Summary;
    },
  });
}

export function useGetYearlySummary(year?: number) {
  return useQuery({
    queryKey: ['summary', 'yearly', year],
    queryFn: async () => {
      const res = await getYearlySummary(year);
      return res.data.data as Summary;
    },
  });
}
