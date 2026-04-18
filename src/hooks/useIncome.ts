import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getIncomes, getIncome, createIncome, updateIncome, deleteIncome
} from '@/services/api/income.api';
import type { CreateIncomeData, Income, IncomeListParams, PaginatedResponse, UpdateIncomeData } from '@/types/income';

export const incomeKeys = {
  all: ['incomes'] as const,
  lists: (params?: IncomeListParams) => [...incomeKeys.all, 'list', params] as const,
  details: (id: string) => [...incomeKeys.all, 'detail', id] as const,
};

export function useGetIncomes(params?: IncomeListParams) {
  return useQuery({
    queryKey: incomeKeys.lists(params),
    queryFn: async () => {
      const res = await getIncomes(params);
      return res.data as PaginatedResponse<Income>;
    },
  });
}

export function useGetIncome(id: string) {
  return useQuery({
    queryKey: incomeKeys.details(id),
    queryFn: async () => {
      const res = await getIncome(id);
      return res.data.data as Income;
    },
    enabled: !!id,
  });
}

export function useCreateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateIncomeData) => createIncome(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomeKeys.all });
      toast.success('Income added');
    },
  });
}

export function useUpdateIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateIncomeData }) => updateIncome(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomeKeys.all });
      toast.success('Income updated');
    },
  });
}

export function useDeleteIncome() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteIncome(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: incomeKeys.all });
      toast.success('Income deleted');
    },
  });
}
