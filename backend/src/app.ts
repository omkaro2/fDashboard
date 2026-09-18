import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes";
import transactionRoutes from "./routes/transactionRoutes";

const app = express();

/*
 * =========================
 * MIDDLEWARE
 * =========================
 */

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

/*
 * =========================
 * ROOT
 * =========================
 */

app.get("/", (_req, res) => {
  res.status(200).json({
    message:
      "Financial Dashboard Backend API is running",
  });
});

/*
 * =========================
 * HEALTH CHECK
 * =========================
 */

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "OK",
    message:
      "Financial Dashboard API is running",
  });
});

/*
 * =========================
 * AUTH ROUTES
 * =========================
 */

app.use(
  "/api/auth",
  authRoutes
);

/*
 * =========================
 * TRANSACTION ROUTES
 * =========================
 */

app.use(
  "/api/transactions",
  transactionRoutes
);

/*
 * =========================
 * EXPORT APP
 * =========================
 */

export default app;