import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  getLoans, getLoan, createLoan, updateLoan, deleteLoan, settleLoan
} from '@/services/api/loan.api';
import { incomeKeys } from '@/hooks/useIncome';
import { expenseKeys } from '@/hooks/useExpenses';
import type {
  CreateLoanData, Loan, LoanListParams, SettleLoanData, UpdateLoanData
} from '@/types/loan';
import type { PaginatedResponse } from '@/types/income';

export const loanKeys = {
  all: ['loans'] as const,
  lists: (params?: LoanListParams) => [...loanKeys.all, 'list', params] as const,
  details: (id: string) => [...loanKeys.all, 'detail', id] as const,
};

export function useGetLoans(params?: LoanListParams) {
  return useQuery({
    queryKey: loanKeys.lists(params),
    queryFn: async () => {
      const res = await getLoans(params);
      return res.data as PaginatedResponse<Loan>;
    },
  });
}

export function useGetLoan(id: string) {
  return useQuery({
    queryKey: loanKeys.details(id),
    queryFn: async () => {
      const res = await getLoan(id);
      return res.data.data as Loan;
    },
    enabled: !!id,
  });
}

export function useCreateLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateLoanData) => createLoan(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loanKeys.all });
      toast.success('Loan recorded');
    },
  });
}

export function useUpdateLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateLoanData }) => updateLoan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loanKeys.all });
      toast.success('Loan updated');
    },
  });
}

export function useDeleteLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteLoan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loanKeys.all });
      toast.success('Loan deleted');
    },
  });
}

export function useSettleLoan() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: SettleLoanData }) => settleLoan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: loanKeys.all });
      queryClient.invalidateQueries({ queryKey: incomeKeys.all });
      queryClient.invalidateQueries({ queryKey: expenseKeys.all });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      toast.success('Settlement recorded');
    },
  });
}
