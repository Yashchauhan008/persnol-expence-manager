import type { Tag } from './tag';

export type ExpenseEntryKind = 'expense' | 'loan_repayment';

export interface Expense {
  id: string;
  amount: number;
  title: string;
  note?: string;
  date: string;
  chart_visibility: boolean;
  tags: Tag[];
  created_at: string;
  updated_at: string;
  entry_kind?: ExpenseEntryKind;
}

export interface CreateExpenseData {
  amount: number;
  title: string;
  note?: string;
  date: string;
  tag_ids: string[];
  chart_visibility: boolean;
}

export interface UpdateExpenseData {
  amount?: number;
  title?: string;
  note?: string | null;
  date?: string;
  tag_ids?: string[];
  chart_visibility?: boolean;
}

export interface ExpenseListParams {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  tag_ids?: string;
}
