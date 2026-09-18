import type { Transaction } from "../types/transaction";

interface CategoryBreakdownChartProps {
  transactions: Transaction[];
}

interface CategoryData {
  category: string;
  amount: number;
}

const CategoryBreakdownChart = ({
  transactions,
}: CategoryBreakdownChartProps) => {
  const categoryMap =
    new Map<string, number>();

  transactions.forEach(
    (transaction) => {
      const category =
        transaction.category?.trim() ||
        "Uncategorized";

      const amount =
        Number(transaction.amount) || 0;

      categoryMap.set(
        category,
        (categoryMap.get(category) || 0) +
          amount
      );
    }
  );

  /*
   * Total across ALL categories.
   */
  const totalAmount =
    Array.from(
      categoryMap.values()
    ).reduce(
      (sum, amount) => sum + amount,
      0
    );

  /*
   * Show maximum 8 categories.
   */
  const data: CategoryData[] =
    Array.from(
      categoryMap.entries()
    )
      .map(
        ([category, amount]) => ({
          category,
          amount,
        })
      )
      .sort(
        (a, b) =>
          b.amount - a.amount
      )
      .slice(0, 8);

  if (data.length === 0) {
    return (
      <div className="chart-empty-state">
        <h3>
          Category Breakdown
        </h3>

        <p>
          Import transactions to display
          category analytics.
        </p>
      </div>
    );
  }

  const maxAmount = Math.max(
    ...data.map(
      (item) => item.amount
    )
  );

  const formatCurrency = (
    amount: number
  ) =>
    `₹${amount.toLocaleString(
      "en-IN",
      {
        maximumFractionDigits: 2,
      }
    )}`;

  return (
    <div className="chart-card">

      <div className="chart-header">

        <div>
          <h3>
            Category Breakdown
          </h3>

          <p>
            Transaction amount by category
          </p>
        </div>

        <div className="chart-total">
          {formatCurrency(
            totalAmount
          )}
        </div>

      </div>

      <div className="category-chart-list">

        {data.map((item) => {

          const percentage =
            totalAmount > 0
              ? (item.amount /
                  totalAmount) *
                100
              : 0;

          const barWidth =
            maxAmount > 0
              ? (item.amount /
                  maxAmount) *
                100
              : 0;

          return (
            <div
              className="category-chart-row"
              key={item.category}
            >

              <div className="category-row-top">

                <span className="category-name">
                  {item.category}
                </span>

                <span className="category-amount">
                  {formatCurrency(
                    item.amount
                  )}
                </span>

              </div>

              <div className="category-bar-track">

                <div
                  className="category-bar-fill"
                  style={{
                    width: `${Math.max(
                      barWidth,
                      2
                    )}%`,
                  }}
                />

              </div>

              <div className="category-percentage">
                {percentage.toFixed(
                  1
                )}
                % of total
              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
};

export default CategoryBreakdownChart;