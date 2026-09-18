import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import type { Transaction } from "../types/transaction";

interface FinancialOverviewProps {
  transactions: Transaction[];
}

function FinancialOverview({
  transactions,
}: FinancialOverviewProps) {
  /*
   * =========================
   * MONTHLY DATA
   * =========================
   *
   * We group transactions by date.
   */
  const monthlyData = transactions.reduce<
    {
      date: string;
      revenue: number;
      expenses: number;
    }[]
  >((result, transaction) => {
    const existing = result.find(
      (item) => item.date === transaction.date
    );

    if (existing) {
      if (transaction.type === "income") {
        existing.revenue += transaction.amount;
      } else {
        existing.expenses += transaction.amount;
      }
    } else {
      result.push({
        date: transaction.date,
        revenue:
          transaction.type === "income"
            ? transaction.amount
            : 0,
        expenses:
          transaction.type === "expense"
            ? transaction.amount
            : 0,
      });
    }

    return result;
  }, []);

  /*
   * =========================
   * CATEGORY DATA
   * =========================
   *
   * Only expense transactions
   * are used for the category chart.
   */
  const categoryMap = transactions.reduce<
    Record<string, number>
  >((result, transaction) => {
    if (transaction.type === "expense") {
      result[transaction.category] =
        (result[transaction.category] || 0) +
        transaction.amount;
    }

    return result;
  }, {});

  const categoryData = Object.entries(categoryMap).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  /*
   * Chart labels
   */
  const formattedMonthlyData = monthlyData.map(
    (item) => ({
      ...item,
      date: item.date.slice(5),
    })
  );

  /*
   * Pie chart cells
   */
  const pieColors = [
    "#4F46E5",
    "#16A34A",
    "#EA580C",
    "#DC2626",
    "#0891B2",
    "#9333EA",
    "#CA8A04",
    "#DB2777",
  ];

  return (
    <div className="financial-overview-grid">

      {/* =========================
          REVENUE VS EXPENSES
      ========================== */}
      <div className="chart-card">
        <div className="chart-card-header">
          <div>
            <h3>Revenue vs Expenses</h3>
            <p>
              Financial activity by date
            </p>
          </div>
        </div>

        <div className="chart-container">
          {formattedMonthlyData.length === 0 ? (
            <div className="chart-empty">
              No data available.
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <BarChart
                data={formattedMonthlyData}
                margin={{
                  top: 10,
                  right: 10,
                  left: 0,
                  bottom: 10,
                }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                />

                <XAxis
                  dataKey="date"
                />

                <YAxis
                  tickFormatter={(value) =>
                    `₹${value}`
                  }
                />

                <Tooltip
                  formatter={(value) =>
                    `₹${Number(value).toLocaleString(
                      "en-IN"
                    )}`
                  }
                />

                <Legend />

                <Bar
                  dataKey="revenue"
                  name="Revenue"
                  fill="#16A34A"
                  radius={[4, 4, 0, 0]}
                />

                <Bar
                  dataKey="expenses"
                  name="Expenses"
                  fill="#DC2626"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* =========================
          EXPENSE CATEGORY
      ========================== */}
      <div className="chart-card">
        <div className="chart-card-header">
          <div>
            <h3>Expenses by Category</h3>
            <p>
              Breakdown of spending
            </p>
          </div>
        </div>

        <div className="chart-container">
          {categoryData.length === 0 ? (
            <div className="chart-empty">
              No expense data available.
            </div>
          ) : (
            <ResponsiveContainer
              width="100%"
              height="100%"
            >
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={45}
                  paddingAngle={2}
                  label
                >
                  {categoryData.map(
                    (_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          pieColors[
                            index %
                              pieColors.length
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip
                  formatter={(value) =>
                    `₹${Number(value).toLocaleString(
                      "en-IN"
                    )}`
                  }
                />

                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

export default FinancialOverview;