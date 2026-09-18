import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";

import {
  transactionService,
} from "../services/transactionService";

import type { Transaction } from "../types/transaction";

import TransactionTable from "../components/TransactionTable";
import ExportModal from "../components/ExportModal";
import { authService } from "../services/authService";

const Transactions = () => {
  const navigate = useNavigate();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [
    allTransactions,
    setAllTransactions,
  ] = useState<Transaction[]>([]);

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

  const [
    pagination,
    setPagination,
  ] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    importLoading,
    setImportLoading,
  ] = useState(false);

  const [
    importMessage,
    setImportMessage,
  ] = useState("");

  const [
    importError,
    setImportError,
  ] = useState("");

  const [
    exportOpen,
    setExportOpen,
  ] = useState(false);

  const [refreshKey, setRefreshKey] =
    useState(0);

  /*
   * ==========================================
   * CATEGORIES
   * ==========================================
   */

  const categories = useMemo(() => {
    const values =
      new Set<string>();

    allTransactions.forEach(
      (transaction) => {
        if (transaction.category) {
          values.add(
            transaction.category
          );
        }
      }
    );

    return Array.from(values).sort(
      (a, b) =>
        a.localeCompare(b)
    );
  }, [allTransactions]);

  /*
   * ==========================================
   * LOAD TRANSACTIONS
   * ==========================================
   */

  useEffect(() => {
    const loadTransactions =
      async () => {
        try {
          setLoading(true);
          setError("");

          const filters = {
            search:
              search.trim() ||
              undefined,

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
            transactionService.getTransactions(
              {
                ...filters,
                page,
                limit: 10,
                sortBy: "date",
                sortOrder: "desc",
              }
            ),

            transactionService.getAllTransactions(
              {
                ...filters,
                sortBy: "date",
                sortOrder: "desc",
              }
            ),
          ]);

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

          setAllTransactions(
            allData
          );
        } catch (requestError) {
          console.error(
            "Transactions page error:",
            requestError
          );

          const message =
            requestError instanceof Error
              ? requestError.message
              : "Failed to load transactions.";

          if (
            message
              .toLowerCase()
              .includes("unauthorized")
          ) {
            authService.logout();

            navigate("/login", {
              replace: true,
            });

            return;
          }

          setError(message);
          setTransactions([]);
          setAllTransactions([]);
        } finally {
          setLoading(false);
        }
      };

    loadTransactions();
  }, [
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
   * OPEN IMPORT
   * ==========================================
   */

  const openImport = () => {
    setImportMessage("");
    setImportError("");

    fileInputRef.current?.click();
  };

  /*
   * ==========================================
   * IMPORT JSON
   * ==========================================
   */

  const handleImport = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setImportLoading(true);
    setImportMessage("");
    setImportError("");

    try {
      if (
        !file.name
          .toLowerCase()
          .endsWith(".json")
      ) {
        setImportError(
          "Please select a JSON file."
        );

        return;
      }

      const text =
        await file.text();

      const parsed: unknown =
        JSON.parse(text);

      let data: unknown[] | null =
        null;

      if (Array.isArray(parsed)) {
        data = parsed;
      } else if (
        parsed &&
        typeof parsed === "object"
      ) {
        const objectData =
          parsed as {
            transactions?: unknown;
            data?: unknown;
          };

        if (
          Array.isArray(
            objectData.transactions
          )
        ) {
          data =
            objectData.transactions;
        } else if (
          Array.isArray(
            objectData.data
          )
        ) {
          data =
            objectData.data;
        }
      }

      if (!data) {
        setImportError(
          "Invalid JSON transaction format."
        );

        return;
      }

      if (data.length === 0) {
        setImportError(
          "The JSON file contains no transactions."
        );

        return;
      }

      const response =
        await transactionService.importTransactions(
          data as Partial<Transaction>[]
        );

      if (!response.success) {
        setImportError(
          response.message ||
            "Failed to import transactions."
        );

        return;
      }

      setImportMessage(
        `${response.message || "Transactions imported successfully."} Imported: ${
          response.imported ?? 0
        }, Invalid: ${
          response.invalid ?? 0
        }.`
      );

      setPage(1);

      setRefreshKey(
        (value) => value + 1
      );
    } catch (importRequestError) {
      console.error(
        "Import error:",
        importRequestError
      );

      setImportError(
        importRequestError instanceof Error
          ? importRequestError.message
          : "Failed to import JSON."
      );
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="dashboard">

      {/* HEADER */}

      <div className="dashboard-header">
        <h1>Transactions</h1>

        <p>
          Search, filter, import and export
          your financial transactions.
        </p>
      </div>

      {/* ACTIONS */}

      <section className="dashboard-section">

        <div className="transaction-header">

          <div>
            <h2>
              Transaction Management
            </h2>

            <p>
              {pagination.total} matching
              transaction records.
            </p>
          </div>

          <div className="transaction-actions">

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleImport}
              style={{
                display: "none",
              }}
            />

            <button
              type="button"
              className="import-json-button"
              onClick={openImport}
              disabled={
                loading ||
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
              onClick={() =>
                setExportOpen(true)
              }
              disabled={
                allTransactions.length ===
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
            onClick={
              resetFilters
            }
          >
            Reset
          </button>

        </div>

        {error && (
          <div className="error-state">
            {error}
          </div>
        )}

        {loading ? (
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
              loading
            }
            onClick={() =>
              setPage(
                (value) =>
                  Math.max(
                    value - 1,
                    1
                  )
              )
            }
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
              loading ||
              pagination.totalPages ===
                0 ||
              page >=
                pagination.totalPages
            }
            onClick={() =>
              setPage(
                (value) =>
                  value + 1
              )
            }
          >
            Next
          </button>

        </div>

      </section>

      <ExportModal
        isOpen={exportOpen}
        onClose={() =>
          setExportOpen(false)
        }
        transactions={
          allTransactions
        }
      />

    </div>
  );
};

export default Transactions;