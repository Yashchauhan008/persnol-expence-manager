export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
  updated_at: string;
  /** Sum of expense amounts that include this tag (all time). */
  total_expense_amount?: number;
}

export interface CreateTagData {
  name: string;
  color: string;
}

export interface UpdateTagData {
  name?: string;
  color?: string;
}
