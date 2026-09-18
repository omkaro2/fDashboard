import { Router } from "express";

import {
  getTransactions,
  createTransaction,
  importTransactions,
} from "../controllers/transactionController";

import {
  authMiddleware,
} from "../middleware/authMiddleware";

const router = Router();

// GET /api/transactions
router.get(
  "/",
  authMiddleware,
  getTransactions
);

// POST /api/transactions
router.post(
  "/",
  authMiddleware,
  createTransaction
);

// POST /api/transactions/import
router.post(
  "/import",
  authMiddleware,
  importTransactions
);

export default router;