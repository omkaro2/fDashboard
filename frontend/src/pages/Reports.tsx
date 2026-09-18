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

import { authService } from "../services/authService";

const Reports = () => {
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
    const loadReports =
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await transactionService.getAllTransactions(
              {
                sortBy: "date",
                sortOrder: "desc",
              }
            );

          setTransactions(data);
        } catch (requestError) {
          console.error(
            "Reports error:",
            requestError
          );

          const message =
            requestError instanceof Error
              ? requestError.message
              : "Failed to load reports.";

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

    loadReports();
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

  const categoryReport = useMemo(() => {
    const map =
      new Map<
        string,
        {
          income: number;
          expense: number;
        }
      >();

    transactions.forEach(
      (transaction) => {
        const category =
          transaction.category ||
          "Uncategorized";

        if (!map.has(category)) {
          map.set(category, {
            income: 0,
            expense: 0,
          });
        }

        const current =
          map.get(category)!;

        const amount =
          Number(
            transaction.amount || 0
          );

        if (
          transaction.type ===
          "income"
        ) {
          current.income += amount;
        }

        if (
          transaction.type ===
          "expense"
        ) {
          current.expense += amount;
        }
      }
    );

    return Array.from(
      map.entries()
    ).sort(
      (a, b) =>
        b[1].expense +
        b[1].income -
        (a[1].expense +
          a[1].income)
    );
  }, [transactions]);

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
        <h1>Reports</h1>

        <p>
          Summary reports generated from
          your transaction data.
        </p>
      </div>

      {error && (
        <div className="error-state">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          Generating reports...
        </div>
      ) : (
        <>
          <div className="dashboard-cards">

            <div className="stat-card">
              <div className="stat-title">
                Revenue
              </div>

              <div className="stat-value">
                {formatCurrency(
                  totalIncome
                )}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-title">
                Expenses
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
                  totalIncome -
                    totalExpense
                )}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-title">
                Records
              </div>

              <div className="stat-value">
                {transactions.length}
              </div>
            </div>

          </div>

          <section className="dashboard-section">

            <h2>
              Category Report
            </h2>

            {categoryReport.length ===
            0 ? (
              <div className="empty-state">
                No transaction data
                available.
              </div>
            ) : (
              <div className="transaction-table-container">

                <table className="transaction-table">

                  <thead>
                    <tr>
                      <th>
                        Category
                      </th>

                      <th>
                        Revenue
                      </th>

                      <th>
                        Expenses
                      </th>

                      <th>
                        Net
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {categoryReport.map(
                      ([
                        category,
                        values,
                      ]) => (
                        <tr
                          key={category}
                        >
                          <td>
                            {category}
                          </td>

                          <td>
                            {formatCurrency(
                              values.income
                            )}
                          </td>

                          <td>
                            {formatCurrency(
                              values.expense
                            )}
                          </td>

                          <td>
                            {formatCurrency(
                              values.income -
                                values.expense
                            )}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>

                </table>

              </div>
            )}

          </section>
        </>
      )}

    </div>
  );
};

export default Reports;