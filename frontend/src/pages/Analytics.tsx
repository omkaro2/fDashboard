import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import {
  transactionService,
} from "../services/transactionService";

import type { Transaction } from "../types/transaction";

import RevenueExpenseChart from "../components/RevenueExpenseChart";
import CategoryBreakdownChart from "../components/CategoryBreakdownChart";
import { authService } from "../services/authService";

const Analytics = () => {
  const navigate = useNavigate();

  const [
    transactions,
    setTransactions,
  ] = useState<Transaction[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const loadAnalytics =
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await transactionService.getAllTransactions(
              {
                sortBy: "date",
                sortOrder: "asc",
              }
            );

          setTransactions(data);
        } catch (requestError) {
          console.error(
            "Analytics error:",
            requestError
          );

          const message =
            requestError instanceof Error
              ? requestError.message
              : "Failed to load analytics.";

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
        } finally {
          setLoading(false);
        }
      };

    loadAnalytics();
  }, [navigate]);

  const totalIncome = useMemo(
    () =>
      transactions
        .filter(
          (item) =>
            item.type === "income"
        )
        .reduce(
          (sum, item) =>
            sum +
            Number(item.amount || 0),
          0
        ),
    [transactions]
  );

  const totalExpense = useMemo(
    () =>
      transactions
        .filter(
          (item) =>
            item.type === "expense"
        )
        .reduce(
          (sum, item) =>
            sum +
            Number(item.amount || 0),
          0
        ),
    [transactions]
  );

  const balance =
    totalIncome - totalExpense;

  const formatCurrency = (
    value: number
  ) =>
    `₹${value.toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;

  return (
    <div className="dashboard">

      <div className="dashboard-header">
        <h1>Analytics</h1>

        <p>
          Detailed financial analytics based
          on your transaction history.
        </p>
      </div>

      {error && (
        <div className="error-state">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          Loading analytics...
        </div>
      ) : (
        <>
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
            </div>

            <div className="stat-card">
              <div className="stat-title">
                Total Transactions
              </div>

              <div className="stat-value">
                {transactions.length}
              </div>
            </div>

          </div>

          <section className="dashboard-section">

            <h2>
              Financial Analytics
            </h2>

            <div className="analytics-grid">

              <RevenueExpenseChart
                transactions={
                  transactions
                }
              />

              <CategoryBreakdownChart
                transactions={
                  transactions
                }
              />

            </div>

          </section>
        </>
      )}

    </div>
  );
};

export default Analytics;