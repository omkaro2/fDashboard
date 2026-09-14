import type { Transaction } from "../types/transaction";

interface TransactionTableProps {
  transactions: Transaction[];
}

function TransactionTable({
  transactions,
}: TransactionTableProps) {
  return (
    <div className="transaction-table-container">
      <table className="transaction-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Type</th>
            <th>Status</th>
            <th>User</th>
          </tr>
        </thead>

        <tbody>
          {transactions.length === 0 ? (
            <tr>
              <td colSpan={7} className="empty-state">
                No transactions found.
              </td>
            </tr>
          ) : (
            transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.date}</td>
                <td>{transaction.description}</td>
                <td>{transaction.category}</td>

                <td>
                  ₹{transaction.amount.toLocaleString("en-IN")}
                </td>

                <td>
                  <span className={`type-badge ${transaction.type}`}>
                    {transaction.type}
                  </span>
                </td>

                <td>
                  <span
                    className={`status-badge ${transaction.status}`}
                  >
                    {transaction.status}
                  </span>
                </td>

                <td>{transaction.user}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TransactionTable;