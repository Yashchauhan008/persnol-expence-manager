export type LoanType = 'given' | 'taken';
export type LoanStatus = 'pending' | 'partial' | 'settled';

export interface LoanSettlement {
  id: string;
  loan_id: string;
  amount: number;
  note?: string;
  date: string;
  created_at: string;
}

export interface Loan {
  id: string;
  type: LoanType;
  person_name: string;
  amount: number;
  remaining_amount: number;
  note?: string;
  date: string;
  due_date?: string;
  status: LoanStatus;
  settlements?: LoanSettlement[];
  created_at: string;
  updated_at: string;
}

export interface CreateLoanData {
  type: LoanType;
  person_name: string;
  amount: number;
  note?: string;
  date: string;
  due_date?: string | null;
}

export interface UpdateLoanData {
  person_name?: string;
  note?: string | null;
  date?: string;
  due_date?: string | null;
}

export interface SettleLoanData {
  amount: number;
  note?: string;
  date: string;
}

export interface LoanListParams {
  type?: LoanType;
  status?: LoanStatus;
  page?: number;
  limit?: number;
}
