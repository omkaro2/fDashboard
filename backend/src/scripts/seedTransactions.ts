import dotenv from "dotenv";
import { connectDatabase } from "../config/database";
import User from "../models/User";
import Transaction from "../models/Transaction";

dotenv.config();

const sampleTransactions = [
  {
    transactionId: "TXN001",
    date: "2026-09-01",
    description: "Salary Credit",
    category: "Income",
    amount: 50000,
    type: "income" as const,
    status: "completed" as const,
    user: "Omkar",
  },
  {
    transactionId: "TXN002",
    date: "2026-09-02",
    description: "Rent Payment",
    category: "Housing",
    amount: 15000,
    type: "expense" as const,
    status: "completed" as const,
    user: "Omkar",
  },
  {
    transactionId: "TXN003",
    date: "2026-09-03",
    description: "Grocery Shopping",
    category: "Food",
    amount: 3200,
    type: "expense" as const,
    status: "completed" as const,
    user: "Omkar",
  },
  {
    transactionId: "TXN004",
    date: "2026-09-04",
    description: "Freelance Payment",
    category: "Income",
    amount: 12000,
    type: "income" as const,
    status: "completed" as const,
    user: "Omkar",
  },
  {
    transactionId: "TXN005",
    date: "2026-09-05",
    description: "Electricity Bill",
    category: "Utilities",
    amount: 1800,
    type: "expense" as const,
    status: "pending" as const,
    user: "Omkar",
  },
  {
    transactionId: "TXN006",
    date: "2026-09-06",
    description: "Fuel",
    category: "Transport",
    amount: 2500,
    type: "expense" as const,
    status: "completed" as const,
    user: "Omkar",
  },
  {
    transactionId: "TXN007",
    date: "2026-09-07",
    description: "Investment Return",
    category: "Investment",
    amount: 7500,
    type: "income" as const,
    status: "completed" as const,
    user: "Omkar",
  },
  {
    transactionId: "TXN008",
    date: "2026-09-08",
    description: "Online Shopping",
    category: "Shopping",
    amount: 4500,
    type: "expense" as const,
    status: "failed" as const,
    user: "Omkar",
  },
];

const seedTransactions = async () => {
  try {
    await connectDatabase();

    const seedEmail =
      process.env.SEED_USER_EMAIL || "omkartest@example.com";

    const existingUser = await User.findOne({
      email: seedEmail.toLowerCase(),
    });

    if (!existingUser) {
      console.error(
        `User not found for email: ${seedEmail}`
      );

      process.exit(1);
    }

    // Remove old transactions for this user
    await Transaction.deleteMany({
      userId: existingUser._id,
    });

    const transactionsToInsert = sampleTransactions.map(
      (transaction) => ({
        ...transaction,
        date: new Date(transaction.date),
        userId: existingUser._id,
      })
    );

    await Transaction.insertMany(transactionsToInsert);

    console.log(
      `${transactionsToInsert.length} transactions seeded successfully for ${seedEmail}`
    );
  } catch (error) {
    console.error("Failed to seed transactions:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
};

seedTransactions();