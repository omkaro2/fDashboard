export type TransactionType =
  | "income"
  | "expense";

export type TransactionStatus =
  | "completed"
  | "pending"
  | "failed";

export interface Transaction {
  _id?: string;

  transactionId?: string;

  date: string;

  description: string;

  category: string;

  amount: number;

  type: TransactionType;

  status: TransactionStatus;

  account: string;

  userId?: string;

  createdAt?: string;

  updatedAt?: string;
}