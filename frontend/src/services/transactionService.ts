import { apiRequest } from "./api";
import type { Transaction } from "../types/transaction";

export interface TransactionFilters {
  search?: string;
  category?: string;
  type?: string;
  status?: string;
  minAmount?: number;
  maxAmount?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TransactionsResponse {
  success: boolean;
  transactions: Transaction[];
  pagination: Pagination;
  message?: string;
}

export interface CreateTransactionResponse {
  success: boolean;
  transaction?: Transaction;
  message?: string;
}

export interface ImportTransactionsResponse {
  success: boolean;
  message?: string;
  imported?: number;
  skipped?: number;
  invalid?: number;
  transactions?: Transaction[];
}

interface RawTransactionsResponse {
  success: boolean;
  transactions?: Transaction[];
  data?: Transaction[];
  pagination?: Pagination;
  message?: string;
}

/*
 * Build URL query parameters
 */
const buildQueryParams = (
  filters: TransactionFilters
): URLSearchParams => {
  const params = new URLSearchParams();

  if (filters.search?.trim()) {
    params.set(
      "search",
      filters.search.trim()
    );
  }

  if (filters.category) {
    params.set(
      "category",
      filters.category
    );
  }

  if (filters.type) {
    params.set(
      "type",
      filters.type
    );
  }

  if (filters.status) {
    params.set(
      "status",
      filters.status
    );
  }

  if (
    filters.minAmount !== undefined &&
    Number.isFinite(filters.minAmount)
  ) {
    params.set(
      "minAmount",
      String(filters.minAmount)
    );
  }

  if (
    filters.maxAmount !== undefined &&
    Number.isFinite(filters.maxAmount)
  ) {
    params.set(
      "maxAmount",
      String(filters.maxAmount)
    );
  }

  if (filters.startDate) {
    params.set(
      "startDate",
      filters.startDate
    );
  }

  if (filters.endDate) {
    params.set(
      "endDate",
      filters.endDate
    );
  }

  if (filters.sortBy) {
    params.set(
      "sortBy",
      filters.sortBy
    );
  }

  if (filters.sortOrder) {
    params.set(
      "sortOrder",
      filters.sortOrder
    );
  }

  params.set(
    "page",
    String(filters.page ?? 1)
  );

  params.set(
    "limit",
    String(filters.limit ?? 10)
  );

  return params;
};

export const transactionService = {
  /*
   * ==========================================
   * GET PAGINATED TRANSACTIONS
   * ==========================================
   */

  async getTransactions(
    filters: TransactionFilters = {}
  ): Promise<TransactionsResponse> {
    const params =
      buildQueryParams(filters);

    const response =
      await apiRequest<RawTransactionsResponse>(
        `/api/transactions?${params.toString()}`
      );

    const transactions =
      response.transactions ??
      response.data ??
      [];

    return {
      success: response.success,
      transactions,
      pagination:
        response.pagination ?? {
          page: filters.page ?? 1,
          limit: filters.limit ?? 10,
          total: transactions.length,
          totalPages:
            transactions.length > 0 ? 1 : 0,
        },
      message: response.message,
    };
  },

  /*
   * ==========================================
   * GET ALL TRANSACTIONS
   * ==========================================
   *
   * Used by analytics and export.
   *
   * Backend supports maximum limit = 100,
   * so multiple requests are made when
   * there are more than 100 records.
   */

  async getAllTransactions(
    filters: TransactionFilters = {}
  ): Promise<Transaction[]> {
    const allTransactions: Transaction[] = [];

    let currentPage = 1;
    let totalPages = 1;

    while (currentPage <= totalPages) {
      const response =
        await this.getTransactions({
          ...filters,
          page: currentPage,
          limit: 100,
        });

      if (!response.success) {
        throw new Error(
          response.message ||
            "Failed to load transactions."
        );
      }

      allTransactions.push(
        ...response.transactions
      );

      totalPages =
        response.pagination.totalPages || 0;

      currentPage += 1;
    }

    return allTransactions;
  },

  /*
   * ==========================================
   * CREATE TRANSACTION
   * ==========================================
   */

  async createTransaction(
    transaction: Partial<Transaction>
  ): Promise<CreateTransactionResponse> {
    return apiRequest<CreateTransactionResponse>(
      "/api/transactions",
      {
        method: "POST",
        body: JSON.stringify(transaction),
      }
    );
  },

  /*
   * ==========================================
   * IMPORT JSON TRANSACTIONS
   * ==========================================
   */

  async importTransactions(
    transactions: Partial<Transaction>[]
  ): Promise<ImportTransactionsResponse> {
    return apiRequest<ImportTransactionsResponse>(
      "/api/transactions/import",
      {
        method: "POST",

        body: JSON.stringify({
          transactions,
        }),
      }
    );
  },
};