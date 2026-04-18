import httpRequest from './httpRequest';
import type { CreateExpenseData, UpdateExpenseData, ExpenseListParams } from '@/types/expense';

export const getExpenses = (params?: ExpenseListParams) => httpRequest.get('/expenses', { params });
export const getExpense = (id: string) => httpRequest.get(`/expenses/${id}`);
export const createExpense = (data: CreateExpenseData) => httpRequest.post('/expenses', data);
export const updateExpense = (id: string, data: UpdateExpenseData) => httpRequest.patch(`/expenses/${id}`, data);
export const deleteExpense = (id: string) => httpRequest.delete(`/expenses/${id}`);
