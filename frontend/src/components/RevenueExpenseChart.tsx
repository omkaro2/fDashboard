import type { Transaction } from "../types/transaction";

interface RevenueExpenseChartProps {
  transactions: Transaction[];
}

interface MonthlyData {
  key: string;
  label: string;
  income: number;
  expense: number;
}

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const RevenueExpenseChart = ({
  transactions,
}: RevenueExpenseChartProps) => {
  const monthlyMap =
    new Map<string, MonthlyData>();

  transactions.forEach(
    (transaction) => {
      const date =
        new Date(transaction.date);

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return;
      }

      const year =
        date.getFullYear();

      const month =
        date.getMonth();

      const key = `${year}-${String(
        month + 1
      ).padStart(2, "0")}`;

      if (!monthlyMap.has(key)) {
        monthlyMap.set(key, {
          key,

          label: `${
            MONTH_NAMES[month]
          } ${String(year).slice(-2)}`,

          income: 0,

          expense: 0,
        });
      }

      const item =
        monthlyMap.get(key)!;

      const amount =
        Number(transaction.amount) ||
        0;

      if (
        transaction.type ===
        "income"
      ) {
        item.income += amount;
      }

      if (
        transaction.type ===
        "expense"
      ) {
        item.expense += amount;
      }
    }
  );

  const data =
    Array.from(
      monthlyMap.values()
    )
      .sort(
        (a, b) =>
          a.key.localeCompare(
            b.key
          )
      )
      .slice(-12);

  if (data.length === 0) {
    return (
      <div className="chart-empty-state">
        <h3>
          Revenue vs Expenses
        </h3>

        <p>
          Import transactions to display
          the financial trend.
        </p>
      </div>
    );
  }

  const width = 860;
  const height = 340;

  const paddingLeft = 65;
  const paddingRight = 25;
  const paddingTop = 30;
  const paddingBottom = 55;

  const chartWidth =
    width -
    paddingLeft -
    paddingRight;

  const chartHeight =
    height -
    paddingTop -
    paddingBottom;

  const maxValue = Math.max(
    ...data.flatMap((item) => [
      item.income,
      item.expense,
    ])
  );

  const safeMax =
    maxValue > 0
      ? maxValue
      : 1;

  const xStep =
    data.length === 1
      ? chartWidth / 2
      : chartWidth /
        (data.length - 1);

  const getX = (
    index: number
  ) => {
    if (data.length === 1) {
      return (
        paddingLeft +
        chartWidth / 2
      );
    }

    return (
      paddingLeft +
      index * xStep
    );
  };

  const getY = (
    value: number
  ) => {
    return (
      paddingTop +
      chartHeight -
      (value / safeMax) *
        chartHeight
    );
  };

  const incomePoints =
    data
      .map(
        (item, index) =>
          `${getX(index)},${getY(
            item.income
          )}`
      )
      .join(" ");

  const expensePoints =
    data
      .map(
        (item, index) =>
          `${getX(index)},${getY(
            item.expense
          )}`
      )
      .join(" ");

  const formatAmount = (
    value: number
  ) => {
    if (value >= 1000000) {
      return `₹${(
        value / 1000000
      ).toFixed(1)}M`;
    }

    if (value >= 1000) {
      return `₹${(
        value / 1000
      ).toFixed(1)}K`;
    }

    return `₹${Math.round(
      value
    )}`;
  };

  return (
    <div className="chart-card">

      <div className="chart-header">

        <div>
          <h3>
            Revenue vs Expenses
          </h3>

          <p>
            Monthly financial performance
          </p>
        </div>

        <div className="chart-legend">

          <span className="legend-item">

            <span className="legend-dot income-dot" />

            Revenue

          </span>

          <span className="legend-item">

            <span className="legend-dot expense-dot" />

            Expenses

          </span>

        </div>

      </div>

      <div className="chart-container">

        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          role="img"
          aria-label="Revenue versus expenses monthly chart"
        >

          {/* GRID */}

          {[0, 1, 2, 3, 4].map(
            (level) => {
              const y =
                paddingTop +
                (chartHeight / 4) *
                  level;

              const value =
                safeMax -
                (safeMax / 4) *
                  level;

              return (
                <g key={level}>

                  <line
                    x1={paddingLeft}
                    y1={y}
                    x2={
                      width -
                      paddingRight
                    }
                    y2={y}
                    className="chart-grid-line"
                  />

                  <text
                    x={
                      paddingLeft -
                      10
                    }
                    y={y + 4}
                    textAnchor="end"
                    className="chart-axis-label"
                  >
                    {formatAmount(
                      value
                    )}
                  </text>

                </g>
              );
            }
          )}

          {/* REVENUE LINE */}

          <polyline
            points={incomePoints}
            fill="none"
            className="income-line"
          />

          {/* EXPENSE LINE */}

          <polyline
            points={
              expensePoints
            }
            fill="none"
            className="expense-line"
          />

          {/* REVENUE POINTS */}

          {data.map(
            (
              item,
              index
            ) => (
              <circle
                key={`income-${item.key}`}
                cx={getX(index)}
                cy={getY(
                  item.income
                )}
                r="5"
                className="income-point"
              />
            )
          )}

          {/* EXPENSE POINTS */}

          {data.map(
            (
              item,
              index
            ) => (
              <circle
                key={`expense-${item.key}`}
                cx={getX(index)}
                cy={getY(
                  item.expense
                )}
                r="5"
                className="expense-point"
              />
            )
          )}

          {/* X AXIS */}

          {data.map(
            (item, index) => (
              <text
                key={item.key}
                x={getX(index)}
                y={
                  height - 18
                }
                textAnchor="middle"
                className="chart-axis-label"
              >
                {item.label}
              </text>
            )
          )}

        </svg>

      </div>

    </div>
  );
};

export default RevenueExpenseChart;