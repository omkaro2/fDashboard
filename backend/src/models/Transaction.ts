import mongoose, {
  Document,
  Model,
  Schema,
} from "mongoose";

export interface ITransaction extends Document {
  transactionId: string;
  date: Date;
  description: string;
  category: string;
  amount: number;
  type: "income" | "expense";
  status: "completed" | "pending" | "failed";
  account: string;
  userId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    date: {
      type: Date,
      required: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },

    status: {
      type: String,
      enum: [
        "completed",
        "pending",
        "failed",
      ],
      default: "completed",
      required: true,
    },

    account: {
      type: String,
      required: true,
      trim: true,
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
transactionSchema.index({
  userId: 1,
  date: -1,
});

transactionSchema.index({
  userId: 1,
  category: 1,
});

transactionSchema.index({
  userId: 1,
  status: 1,
});

transactionSchema.index({
  userId: 1,
  type: 1,
});

// Model
const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>(
    "Transaction",
    transactionSchema
  );

export default Transaction;