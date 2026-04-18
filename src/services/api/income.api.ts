import httpRequest from './httpRequest';
import type { CreateIncomeData, UpdateIncomeData, IncomeListParams } from '@/types/income';

export const getIncomes = (params?: IncomeListParams) => httpRequest.get('/incomes', { params });
export const getIncome = (id: string) => httpRequest.get(`/incomes/${id}`);
export const createIncome = (data: CreateIncomeData) => httpRequest.post('/incomes', data);
export const updateIncome = (id: string, data: UpdateIncomeData) => httpRequest.patch(`/incomes/${id}`, data);
export const deleteIncome = (id: string) => httpRequest.delete(`/incomes/${id}`);
