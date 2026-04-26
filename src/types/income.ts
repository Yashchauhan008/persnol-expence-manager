export type IncomeEntryKind = 'income' | 'loan_recovery';

export interface Income {
  id: string;
  amount: number;
  source: string;
  note?: string;
  date: string;
  chart_visibility: boolean;
  created_at: string;
  updated_at: string;
  entry_kind?: IncomeEntryKind;
}

export interface CreateIncomeData {
  amount: number;
  source: string;
  note?: string;
  date: string;
  chart_visibility: boolean;
}

export interface UpdateIncomeData {
  amount?: number;
  source?: string;
  note?: string | null;
  date?: string;
  chart_visibility?: boolean;
}

export interface IncomeListParams {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    /** Sum for date range: incomes + loan recoveries (expenses page uses its own rules). */
    sum_period_amount?: number;
    /** Sum of rows currently returned (table). */
    sum_visible_amount?: number;
    /** When tag filter is on: sum of matching expenses only (no loan rows). */
    sum_tagged_amount?: number;
    /** Loans list: sum of principal (amount). */
    sum_original_amount?: number;
    /** Loans list: sum of remaining_amount. */
    sum_remaining_amount?: number;
  };
}
