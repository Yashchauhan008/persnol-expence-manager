import httpRequest from './httpRequest';

export const getDailySummary = (date?: string) =>
  httpRequest.get('/summary/daily', { params: { date } });

export const getMonthlySummary = (year?: number, month?: number) =>
  httpRequest.get('/summary/monthly', { params: { year, month } });

export const getYearlySummary = (year?: number) =>
  httpRequest.get('/summary/yearly', { params: { year } });
