export interface FinanceTransaction {
  id: string;
  division_id: number;
  created_by: string;
  label: string;
  amount: number;
  type: number; // 0 = Income (Pemasukan), 1 = Expense (Pengeluaran)
  date: string;
  divisions?: {
    name: string;
  };
}

export interface FinanceFormData {
  division_id: number;
  label: string;
  amount: number;
  type: number;
  date: string;
}
