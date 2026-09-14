export type TransactionType = "income" | "expense";

export type TransactionStatus =
  | "completed"
  | "pending"
  | "failed";

export interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  user: string;
}