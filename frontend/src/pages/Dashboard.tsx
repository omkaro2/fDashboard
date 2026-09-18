import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

import { authService } from "../services/authService";
import { transactionService } from "../services/transactionService";

import type { Transaction } from "../types/transaction";

import TransactionTable from "../components/TransactionTable";
import ExportModal from "../components/ExportModal";
import RevenueExpenseChart from "../components/RevenueExpenseChart";
import CategoryBreakdownChart from "../components/CategoryBreakdownChart";

const Dashboard = () => {
  const navigate = useNavigate();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [userName, setUserName] =
    useState("");

  /*
   * Current table page
   */
  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  /*
   * All transactions matching current
   * filters. Used by analytics and export.
   */
  const [
    analyticsTransactions,
    setAnalyticsTransactions,
  ] = useState<Transaction[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [
    transactionLoading,
    setTransactionLoading,
  ] = useState(false);

  const [
    analyticsLoading,
    setAnalyticsLoading,
  ] = useState(false);

  const [
    importLoading,
    setImportLoading,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [
    transactionError,
    setTransactionError,
  ] = useState("");

  const [
    analyticsError,
    setAnalyticsError,
  ] = useState("");

  const [
    importMessage,
    setImportMessage,
  ] = useState("");

  const [
    importError,
    setImportError,
  ] = useState("");

  const [search, setSearch] =
    useState("");

  const [category, setCategory] =
    useState("all");

  const [type, setType] =
    useState("all");

  const [status, setStatus] =
    useState("all");

  const [page, setPage] =
    useState(1);

  const [refreshKey, setRefreshKey] =
    useState(0);

  const [
    isExportModalOpen,
    setIsExportModalOpen,
  ] = useState(false);

  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  /*
   * ==========================================
   * VERIFY AUTHENTICATION
   * ==========================================
   */

  useEffect(() => {
    const verifyUser = async () => {
      try {
        setError("");

        const response =
          await authService.getCurrentUser();

        if (
          !response.success ||
          !response.user
        ) {
          authService.logout();

          navigate("/login", {
            replace: true,
          });

          return;
        }

        setUserName(
          response.user.name
        );
      } catch (verificationError) {
        console.error(
          "Authentication verification failed:",
          verificationError
        );

        authService.logout();

        navigate("/login", {
          replace: true,
        });
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [navigate]);

  /*
   * ==========================================
   * LOAD TABLE + ANALYTICS
   * ==========================================
   */

  useEffect(() => {
    if (loading) {
      return;
    }

    const loadDashboardData =
      async () => {
        try {
          setTransactionLoading(true);
          setAnalyticsLoading(true);

          setTransactionError("");
          setAnalyticsError("");

          const filterParams = {
            search:
              search.trim() || undefined,

            category:
              category !== "all"
                ? category
                : undefined,

            type:
              type !== "all"
                ? type
                : undefined,

            status:
              status !== "all"
                ? status
                : undefined,
          };

          const [
            tableResponse,
            allData,
          ] = await Promise.all([
            transactionService.getTransactions({
              ...filterParams,

              page,

              limit: 10,

              sortBy: "date",

              sortOrder: "desc",
            }),

            transactionService.getAllTransactions({
              ...filterParams,

              sortBy: "date",

              sortOrder: "desc",
            }),
          ]);

          /*
           * TABLE
           */

          if (!tableResponse.success) {
            throw new Error(
              tableResponse.message ||
                "Failed to load transactions."
            );
          }

          setTransactions(
            tableResponse.transactions
          );

          setPagination(
            tableResponse.pagination
          );

          /*
           * ANALYTICS
           */

          setAnalyticsTransactions(
            allData
          );
        } catch (dashboardError) {
          console.error(
            "Failed to load dashboard data:",
            dashboardError
          );

          const errorMessage =
            dashboardError instanceof Error
              ? dashboardError.message
              : "Failed to load dashboard data.";

          const lowerMessage =
            errorMessage.toLowerCase();

          if (
            lowerMessage.includes(
              "authentication"
            ) ||
            lowerMessage.includes(
              "unauthorized"
            ) ||
            lowerMessage.includes(
              "token"
            )
          ) {
            authService.logout();

            navigate("/login", {
              replace: true,
            });

            return;
          }

          setTransactionError(
            errorMessage
          );

          setAnalyticsError(
            errorMessage
          );

          setTransactions([]);

          setAnalyticsTransactions([]);

          setPagination({
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          });
        } finally {
          setTransactionLoading(false);
          setAnalyticsLoading(false);
        }
      };

    loadDashboardData();
  }, [
    loading,
    search,
    category,
    type,
    status,
    page,
    refreshKey,
    navigate,
  ]);

  /*
   * ==========================================
   * DASHBOARD CALCULATIONS
   * ==========================================
   */

  const totalIncome = useMemo(() => {
    return analyticsTransactions
      .filter(
        (transaction) =>
          transaction.type === "income"
      )
      .reduce(
        (total, transaction) =>
          total +
          (Number(transaction.amount) || 0),
        0
      );
  }, [analyticsTransactions]);

  const totalExpense = useMemo(() => {
    return analyticsTransactions
      .filter(
        (transaction) =>
          transaction.type === "expense"
      )
      .reduce(
        (total, transaction) =>
          total +
          (Number(transaction.amount) || 0),
        0
      );
  }, [analyticsTransactions]);

  const balance =
    totalIncome - totalExpense;

  const categories = useMemo(() => {
    const categorySet =
      new Set<string>();

    analyticsTransactions.forEach(
      (transaction) => {
        const transactionCategory =
          transaction.category?.trim();

        if (transactionCategory) {
          categorySet.add(
            transactionCategory
          );
        }
      }
    );

    return Array.from(
      categorySet
    ).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [analyticsTransactions]);

  /*
   * ==========================================
   * FORMAT CURRENCY
   * ==========================================
   */

  const formatCurrency = (
    amount: number
  ) => {
    return `₹${amount.toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;
  };

  /*
   * ==========================================
   * RESET FILTERS
   * ==========================================
   */

  const resetFilters = () => {
    setSearch("");
    setCategory("all");
    setType("all");
    setStatus("all");
    setPage(1);
  };

  /*
   * ==========================================
   * EXPORT
   * ==========================================
   *
   * Export all transactions matching the
   * current filters, not just table page.
   */

  const handleOpenExport = () => {
    if (
      analyticsTransactions.length === 0
    ) {
      return;
    }

    setIsExportModalOpen(true);
  };

  /*
   * ==========================================
   * IMPORT FILE PICKER
   * ==========================================
   */

  const handleOpenImport = () => {
    setImportMessage("");
    setImportError("");

    fileInputRef.current?.click();
  };

  /*
   * ==========================================
   * IMPORT JSON
   * ==========================================
   */

  const handleImportFile = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    /*
     * Reset file input so the same file
     * can be selected again.
     */
    event.target.value = "";

    if (!file) {
      return;
    }

    setImportLoading(true);

    setImportMessage("");

    setImportError("");

    try {
      /*
       * File validation
       */

      if (
        !file.name
          .toLowerCase()
          .endsWith(".json")
      ) {
        setImportError(
          "Please select a valid JSON file."
        );

        return;
      }

      /*
       * Read file
       */

      const fileText =
        await file.text();

      if (!fileText.trim()) {
        setImportError(
          "The selected JSON file is empty."
        );

        return;
      }

      /*
       * Parse JSON
       */

      let parsedData: unknown;

      try {
        parsedData =
          JSON.parse(fileText);
      } catch {
        setImportError(
          "The selected file contains invalid JSON."
        );

        return;
      }

      /*
       * Accept all supported formats:
       *
       * 1. [...]
       *
       * 2. { "transactions": [...] }
       *
       * 3. { "data": [...] }
       */

      let transactionData: unknown[] | null =
        null;

      if (
        Array.isArray(parsedData)
      ) {
        transactionData =
          parsedData;
      } else if (
        typeof parsedData ===
          "object" &&
        parsedData !== null
      ) {
        const objectData =
          parsedData as {
            transactions?: unknown;
            data?: unknown;
          };

        if (
          Array.isArray(
            objectData.transactions
          )
        ) {
          transactionData =
            objectData.transactions;
        } else if (
          Array.isArray(
            objectData.data
          )
        ) {
          transactionData =
            objectData.data;
        }
      }

      if (!transactionData) {
        setImportError(
          'Invalid JSON format. Expected an array, { "transactions": [...] }, or { "data": [...] }.'
        );

        return;
      }

      if (
        transactionData.length === 0
      ) {
        setImportError(
          "The JSON file does not contain any transactions."
        );

        return;
      }

      /*
       * Send to backend
       */

      const response =
        await transactionService.importTransactions(
          transactionData as Partial<Transaction>[]
        );

      /*
       * Authentication
       */

      if (!response.success) {
        const message =
          response.message?.toLowerCase() ||
          "";

        if (
          message.includes(
            "authentication"
          ) ||
          message.includes(
            "unauthorized"
          ) ||
          message.includes(
            "token"
          )
        ) {
          authService.logout();

          navigate("/login", {
            replace: true,
          });

          return;
        }

        setImportError(
          response.message ||
            "Failed to import transactions."
        );

        return;
      }

      /*
       * Import result
       */

      setImportMessage(
        `${response.message || "Transactions imported successfully."} Imported: ${
          response.imported ?? 0
        }, Skipped: ${
          response.skipped ?? 0
        }, Invalid: ${
          response.invalid ?? 0
        }.`
      );

      /*
       * Reset filters after import
       */

      setPage(1);
      setSearch("");
      setCategory("all");
      setType("all");
      setStatus("all");

      /*
       * Force reload
       */

      setRefreshKey(
        (value) => value + 1
      );
    } catch (importErrorValue) {
      console.error(
        "Transaction import failed:",
        importErrorValue
      );

      setImportError(
        importErrorValue instanceof Error
          ? importErrorValue.message
          : "Failed to import transactions."
      );
    } finally {
      setImportLoading(false);
    }
  };

  /*
   * ==========================================
   * AUTH LOADING
   * ==========================================
   */

  if (loading) {
    return (
      <div className="loading-screen">
        <p>
          Verifying authentication...
        </p>
      </div>
    );
  }

  /*
   * ==========================================
   * AUTH ERROR
   * ==========================================
   */

  if (error) {
    return (
      <div className="dashboard-error">
        <p>{error}</p>
      </div>
    );
  }

  /*
   * ==========================================
   * DASHBOARD UI
   * ==========================================
   */

  return (
    <div className="dashboard">

      {/* HEADER */}

      <div className="dashboard-header">
        <div>
          <h1>
            Financial Dashboard
          </h1>

          <p>
            Welcome back
            {userName
              ? `, ${userName}`
              : ""}
            !
          </p>
        </div>
      </div>

      {/* STAT CARDS */}

      <div className="dashboard-cards">

        <div className="stat-card">
          <div className="stat-title">
            Total Revenue
          </div>

          <div className="stat-value">
            {formatCurrency(
              totalIncome
            )}
          </div>

          <div className="stat-change">
            All matching income transactions
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">
            Total Expenses
          </div>

          <div className="stat-value">
            {formatCurrency(
              totalExpense
            )}
          </div>

          <div className="stat-change">
            All matching expense transactions
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">
            Net Balance
          </div>

          <div className="stat-value">
            {formatCurrency(
              balance
            )}
          </div>

          <div className="stat-change">
            Revenue - Expenses
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-title">
            Transactions
          </div>

          <div className="stat-value">
            {pagination.total}
          </div>

          <div className="stat-change">
            Matching transaction records
          </div>
        </div>

      </div>

      {/* ANALYTICS */}

      <section className="dashboard-section">

        <div className="section-heading">
          <div>
            <h2>
              Financial Analytics
            </h2>

            <p>
              Visual summary of your
              transaction data.
            </p>
          </div>
        </div>

        {analyticsError && (
          <div className="error-state">
            {analyticsError}
          </div>
        )}

        {analyticsLoading ? (
          <div className="loading-state">
            Loading financial analytics...
          </div>
        ) : (
          <div className="analytics-grid">

            <RevenueExpenseChart
              transactions={
                analyticsTransactions
              }
            />

            <CategoryBreakdownChart
              transactions={
                analyticsTransactions
              }
            />

          </div>
        )}

      </section>

      {/* TRANSACTIONS */}

      <section className="dashboard-section">

        <div className="transaction-header">

          <div>
            <h2>
              Recent Transactions
            </h2>

            <p>
              Transactions from your
              financial account.
            </p>
          </div>

          <div className="transaction-actions">

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={
                handleImportFile
              }
              style={{
                display: "none",
              }}
            />

            <button
              type="button"
              className="import-json-button"
              onClick={
                handleOpenImport
              }
              disabled={
                transactionLoading ||
                importLoading
              }
            >
              {importLoading
                ? "Importing..."
                : "Import JSON"}
            </button>

            <button
              type="button"
              className="export-csv-button"
              onClick={
                handleOpenExport
              }
              disabled={
                transactionLoading ||
                importLoading ||
                analyticsTransactions.length ===
                  0
              }
            >
              Export CSV
            </button>

          </div>

        </div>

        {importMessage && (
          <div className="success-state">
            {importMessage}
          </div>
        )}

        {importError && (
          <div className="error-state">
            {importError}
          </div>
        )}

        {/* FILTERS */}

        <div className="transaction-filters">

          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(event) => {
              setSearch(
                event.target.value
              );

              setPage(1);
            }}
          />

          <select
            value={category}
            onChange={(event) => {
              setCategory(
                event.target.value
              );

              setPage(1);
            }}
          >
            <option value="all">
              All Categories
            </option>

            {categories.map(
              (item) => (
                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>
              )
            )}
          </select>

          <select
            value={type}
            onChange={(event) => {
              setType(
                event.target.value
              );

              setPage(1);
            }}
          >
            <option value="all">
              All Types
            </option>

            <option value="income">
              Income
            </option>

            <option value="expense">
              Expense
            </option>
          </select>

          <select
            value={status}
            onChange={(event) => {
              setStatus(
                event.target.value
              );

              setPage(1);
            }}
          >
            <option value="all">
              All Status
            </option>

            <option value="completed">
              Completed
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="failed">
              Failed
            </option>
          </select>

          <button
            type="button"
            onClick={resetFilters}
          >
            Reset
          </button>

        </div>

        {transactionError && (
          <div className="error-state">
            {transactionError}
          </div>
        )}

        {/* TABLE */}

        {transactionLoading ? (
          <div className="loading-state">
            Loading transactions...
          </div>
        ) : (
          <TransactionTable
            transactions={
              transactions
            }
          />
        )}

        {/* PAGINATION */}

        <div className="pagination">

          <button
            type="button"
            disabled={
              page <= 1 ||
              transactionLoading
            }
            onClick={() => {
              setPage(
                (currentPage) =>
                  Math.max(
                    currentPage - 1,
                    1
                  )
              );
            }}
          >
            Previous
          </button>

          <span>
            Page {pagination.page} of{" "}
            {pagination.totalPages ||
              1}
          </span>

          <button
            type="button"
            disabled={
              transactionLoading ||
              pagination.totalPages === 0 ||
              page >=
                pagination.totalPages
            }
            onClick={() => {
              setPage(
                (currentPage) =>
                  currentPage + 1
              );
            }}
          >
            Next
          </button>

        </div>

      </section>

      {/* EXPORT MODAL */}

      <ExportModal
        isOpen={
          isExportModalOpen
        }
        onClose={() =>
          setIsExportModalOpen(false)
        }
        transactions={
          analyticsTransactions
        }
      />

    </div>
  );
};

export default Dashboard;