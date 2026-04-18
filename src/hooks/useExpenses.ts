import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getExpenses, getExpense, createExpense, updateExpense, deleteExpense
} from '@/services/api/expense.api';
import type {
  CreateExpenseData, Expense, ExpenseListParams, UpdateExpenseData
} from '@/types/expense';
import type { PaginatedResponse } from '@/types/income';

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: (params?: ExpenseListParams) => [...expenseKeys.all, 'list', params] as const,
  details: (id: string) => [...expenseKeys.all, 'detail', id] as const,
};

export function useGetExpenses(params?: ExpenseListParams) {
  return useQuery({
    queryKey: expenseKeys.lists(params),
    queryFn: async () => {
      const res = await getExpenses(params);
      return res.data as PaginatedResponse<Expense>;
    },
  });
}

export function useGetExpense(id: string) {
  return useQuery({
    queryKey: expenseKeys.details(id),
    queryFn: async () => {
      const res = await getExpense(id);
      return res.data.data as Expense;
    },
    enabled: !!id,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseData) => createExpense(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      toast.success('Expense added');
    },
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateExpenseData }) => updateExpense(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      toast.success('Expense updated');
    },
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      toast.success('Expense deleted');
    },
  });
}
