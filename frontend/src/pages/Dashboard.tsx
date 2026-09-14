import { useMemo, useState } from "react";
import StatCard from "../components/StatCard";
import TransactionTable from "../components/TransactionTable";
import type { Transaction } from "../types/transaction";

const transactions: Transaction[] = [
  {
    id: "TXN001",
    date: "2026-09-01",
    description: "Salary Credit",
    category: "Income",
    amount: 50000,
    type: "income",
    status: "completed",
    user: "Omkar",
  },
  {
    id: "TXN002",
    date: "2026-09-02",
    description: "Rent Payment",
    category: "Housing",
    amount: 15000,
    type: "expense",
    status: "completed",
    user: "Omkar",
  },
  {
    id: "TXN003",
    date: "2026-09-03",
    description: "Grocery Shopping",
    category: "Food",
    amount: 3200,
    type: "expense",
    status: "completed",
    user: "Omkar",
  },
  {
    id: "TXN004",
    date: "2026-09-04",
    description: "Freelance Payment",
    category: "Income",
    amount: 12000,
    type: "income",
    status: "completed",
    user: "Omkar",
  },
  {
    id: "TXN005",
    date: "2026-09-05",
    description: "Electricity Bill",
    category: "Utilities",
    amount: 1800,
    type: "expense",
    status: "pending",
    user: "Omkar",
  },
  {
    id: "TXN006",
    date: "2026-09-06",
    description: "Fuel",
    category: "Transport",
    amount: 2500,
    type: "expense",
    status: "completed",
    user: "Omkar",
  },
  {
    id: "TXN007",
    date: "2026-09-07",
    description: "Investment Return",
    category: "Investment",
    amount: 7500,
    type: "income",
    status: "completed",
    user: "Omkar",
  },
  {
    id: "TXN008",
    date: "2026-09-08",
    description: "Online Shopping",
    category: "Shopping",
    amount: 4500,
    type: "expense",
    status: "failed",
    user: "Omkar",
  },
];

function Dashboard() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortBy, setSortBy] = useState("date-desc");

  const categories = [
    ...new Set(transactions.map((transaction) => transaction.category)),
  ];

  const filteredTransactions = useMemo(() => {
    const result = transactions.filter((transaction) => {
      const matchesSearch =
        transaction.description
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        transaction.category
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        transaction.user
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "all" ||
        transaction.category === category;

      const matchesType =
        type === "all" ||
        transaction.type === type;

      const matchesStatus =
        status === "all" ||
        transaction.status === status;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesType &&
        matchesStatus
      );
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case "amount-asc":
          return a.amount - b.amount;

        case "amount-desc":
          return b.amount - a.amount;

        case "date-asc":
          return a.date.localeCompare(b.date);

        case "date-desc":
        default:
          return b.date.localeCompare(a.date);
      }
    });

    return result;
  }, [search, category, type, status, sortBy]);

  return (
    <div className="dashboard">
      <section className="dashboard-cards">
        <StatCard
          title="Total Balance"
          value="₹1,25,000"
          change="+8.2% this month"
        />

        <StatCard
          title="Income"
          value="₹85,000"
          change="+12.5% this month"
        />

        <StatCard
          title="Expenses"
          value="₹42,500"
          change="-4.8% this month"
        />

        <StatCard
          title="Savings"
          value="₹42,500"
          change="+15.4% this month"
        />
      </section>

      <section className="dashboard-section">
        <h2>Financial Overview</h2>

        <div className="overview-placeholder">
          Chart will be added here.
        </div>
      </section>

      <section className="dashboard-section">
        <div className="transaction-header">
          <div>
            <h2>Recent Transactions</h2>
            <p>
              Showing {filteredTransactions.length} of{" "}
              {transactions.length} transactions
            </p>
          </div>
        </div>

        <div className="transaction-filters">
          <input
            type="text"
            placeholder="Search transactions..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="all">All Categories</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={type}
            onChange={(event) => setType(event.target.value)}
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>

          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value)}
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="amount-desc">
              Amount: High to Low
            </option>
            <option value="amount-asc">
              Amount: Low to High
            </option>
          </select>
        </div>

        <TransactionTable transactions={filteredTransactions} />
      </section>
    </div>
  );
}

export default Dashboard;