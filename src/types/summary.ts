export interface TagBreakdown {
  tag_id: string;
  tag_name: string;
  color: string;
  total: number;
}

export interface DailyBreakdown {
  day: number;
  income: number;
  expense: number;
}

export interface MonthlyBreakdown {
  month: number;
  income: number;
  expense: number;
}

export interface Summary {
  total_income: number;
  total_expense: number;
  net: number;
  total_loans_given: number;
  total_loans_taken: number;
  total_settled_given: number;
  total_settled_taken: number;
  expenses_by_tag: TagBreakdown[];
  daily_breakdown?: DailyBreakdown[];
  monthly_breakdown?: MonthlyBreakdown[];
}
