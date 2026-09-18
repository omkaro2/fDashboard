import type { Transaction } from "../types/transaction";

interface TransactionTableProps {
  transactions: Transaction[];
}

const TransactionTable = ({
  transactions,
}: TransactionTableProps) => {
  const formatDate = (
    date: string
  ): string => {
    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatAmount = (
    amount: number
  ): string => {
    const numericAmount =
      Number(amount) || 0;

    return numericAmount.toLocaleString(
      "en-IN",
      {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }
    );
  };

  return (
    <div className="transaction-table-container">
      <table className="transaction-table">

        <thead>
          <tr>
            <th>Date</th>
            <th>Transaction ID</th>
            <th>Description</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Status</th>
            <th>Account</th>
          </tr>
        </thead>

        <tbody>

          {transactions.length === 0 ? (
            <tr>
              <td
                colSpan={8}
                className="empty-state"
              >
                No transactions found.
              </td>
            </tr>
          ) : (
            transactions.map(
              (transaction, index) => {

                const transactionKey =
                  transaction._id ||
                  transaction.transactionId ||
                  `${transaction.date}-${transaction.description}-${index}`;

                const transactionType =
                  transaction.type;

                const transactionStatus =
                  transaction.status;

                return (
                  <tr
                    key={
                      transactionKey
                    }
                  >

                    {/* DATE */}

                    <td>
                      {formatDate(
                        transaction.date
                      )}
                    </td>

                    {/* TRANSACTION ID */}

                    <td>
                      {transaction.transactionId ||
                        "—"}
                    </td>

                    {/* DESCRIPTION */}

                    <td>
                      {transaction.description ||
                        "—"}
                    </td>

                    {/* CATEGORY */}

                    <td>
                      {transaction.category ||
                        "—"}
                    </td>

                    {/* AMOUNT */}

                    <td>
                      ₹
                      {formatAmount(
                        transaction.amount
                      )}
                    </td>

                    {/* TYPE */}

                    <td>
                      <span
                        className={`type-badge ${transactionType}`}
                      >
                        {transactionType}
                      </span>
                    </td>

                    {/* STATUS */}

                    <td>
                      <span
                        className={`status-badge ${transactionStatus}`}
                      >
                        {transactionStatus}
                      </span>
                    </td>

                    {/* ACCOUNT */}

                    <td>
                      {transaction.account ||
                        "—"}
                    </td>

                  </tr>
                );
              }
            )
          )}

        </tbody>
      </table>
    </div>
  );
};

export default TransactionTable;