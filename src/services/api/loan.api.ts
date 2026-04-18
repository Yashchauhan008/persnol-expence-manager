import httpRequest from './httpRequest';
import type { CreateLoanData, UpdateLoanData, SettleLoanData, LoanListParams } from '@/types/loan';

export const getLoans = (params?: LoanListParams) => httpRequest.get('/loans', { params });
export const getLoan = (id: string) => httpRequest.get(`/loans/${id}`);
export const createLoan = (data: CreateLoanData) => httpRequest.post('/loans', data);
export const updateLoan = (id: string, data: UpdateLoanData) => httpRequest.patch(`/loans/${id}`, data);
export const deleteLoan = (id: string) => httpRequest.delete(`/loans/${id}`);
export const settleLoan = (id: string, data: SettleLoanData) => httpRequest.post(`/loans/${id}/settle`, data);
