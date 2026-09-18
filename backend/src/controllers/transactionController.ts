
import type { Response } from "express";

import Transaction from "../models/Transaction";
import type { AuthRequest } from "../middleware/authMiddleware";

/*
 * =========================================================
 * TYPES
 * =========================================================
 */

type TransactionType =
  | "income"
  | "expense";

type TransactionStatus =
  | "completed"
  | "pending"
  | "failed";

interface ImportTransactionInput {
  id?: unknown;
  date?: unknown;
  description?: unknown;
  category?: unknown;
  amount?: unknown;
  type?: unknown;
  status?: unknown;
  account?: unknown;
  user_id?: unknown;
  user_profile?: unknown;
}

interface NormalizedImportTransaction {
  date: Date;
  description: string;
  category: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  account: string;
}

/*
 * =========================================================
 * IMPORT HELPERS
 * =========================================================
 */

/*
 * Extract transaction array from:
 *
 * 1. [...]
 *
 * 2. { "transactions": [...] }
 *
 * 3. { "data": [...] }
 */
const extractTransactions = (
  requestBody: unknown
): unknown[] | null => {
  let body: unknown = requestBody;

  /*
   * Handle stringified JSON.
   */
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      return null;
    }
  }

  /*
   * Direct array.
   */
  if (Array.isArray(body)) {
    return body;
  }

  /*
   * Object formats.
   */
  if (
    typeof body === "object" &&
    body !== null
  ) {
    const objectBody = body as {
      transactions?: unknown;
      data?: unknown;
    };

    if (
      Array.isArray(
        objectBody.transactions
      )
    ) {
      return objectBody.transactions;
    }

    if (
      Array.isArray(objectBody.data)
    ) {
      return objectBody.data;
    }

    /*
     * Stringified transactions.
     */
    if (
      typeof objectBody.transactions ===
      "string"
    ) {
      try {
        const parsed =
          JSON.parse(
            objectBody.transactions
          );

        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        return null;
      }
    }

    /*
     * Stringified data.
     */
    if (
      typeof objectBody.data ===
      "string"
    ) {
      try {
        const parsed =
          JSON.parse(
            objectBody.data
          );

        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        return null;
      }
    }
  }

  return null;
};

/*
 * =========================================================
 * NORMALIZE IMPORT RECORD
 * =========================================================
 *
 * Supports BOTH:
 *
 * Dashboard format:
 * {
 *   description,
 *   type,
 *   status,
 *   account
 * }
 *
 * AND your original assignment JSON:
 * {
 *   id,
 *   date,
 *   amount,
 *   category,
 *   status,
 *   user_id,
 *   user_profile
 * }
 *
 * Assignment mapping:
 *
 * Revenue -> income
 * Expense -> expense
 *
 * Paid -> completed
 * Pending -> pending
 *
 * Missing description -> generated description
 * Missing account -> Imported JSON
 */
const normalizeImportTransaction = (
  input: unknown,
  index: number
):
  | {
      transaction: NormalizedImportTransaction;
      sourceId: string;
      error?: undefined;
    }
  | {
      transaction: null;
      sourceId: string;
      error: string;
    } => {
  if (
    !input ||
    typeof input !== "object"
  ) {
    return {
      transaction: null,
      sourceId: String(index + 1),
      error:
        `Record ${
          index + 1
        } is not a valid object.`,
    };
  }

  const item =
    input as ImportTransactionInput;

  /*
   * SOURCE ID
   */
  const sourceId =
    String(
      item.id ??
        index + 1
    ).trim();

  /*
   * DATE
   */
  const dateValue =
    String(
      item.date ?? ""
    ).trim();

  if (!dateValue) {
    return {
      transaction: null,
      sourceId,
      error:
        `Record ${
          index + 1
        }: date is missing.`,
    };
  }

  const parsedDate =
    new Date(dateValue);

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return {
      transaction: null,
      sourceId,
      error:
        `Record ${
          index + 1
        }: invalid date "${dateValue}".`,
    };
  }

  /*
   * DESCRIPTION
   *
   * Your assignment JSON does not have
   * description, so generate one.
   */
  const providedDescription =
    String(
      item.description ?? ""
    ).trim();

  const description =
    providedDescription ||
    `Imported transaction #${sourceId}`;

  /*
   * CATEGORY
   */
  const category =
    String(
      item.category ??
        "Uncategorized"
    ).trim() ||
    "Uncategorized";

  /*
   * AMOUNT
   */
  const amount =
    Number(item.amount);

  if (
    !Number.isFinite(amount) ||
    amount < 0
  ) {
    return {
      transaction: null,
      sourceId,
      error:
        `Record ${
          index + 1
        }: amount must be a valid non-negative number.`,
    };
  }

  /*
   * =======================================================
   * TYPE
   * =======================================================
   *
   * Original JSON does not have type.
   *
   * Revenue -> income
   * Expense -> expense
   *
   * Also supports income/expense if supplied directly.
   */
  const rawType =
    String(
      item.type ?? ""
    )
      .trim()
      .toLowerCase();

  const rawCategory =
    category.toLowerCase();

  let normalizedType:
    | TransactionType;

  if (
    rawType === "income" ||
    rawType === "expense"
  ) {
    normalizedType =
      rawType;
  } else if (
    rawCategory === "revenue"
  ) {
    normalizedType = "income";
  } else if (
    rawCategory === "expense" ||
    rawCategory === "expenses"
  ) {
    normalizedType = "expense";
  } else {
    return {
      transaction: null,
      sourceId,
      error:
        `Record ${
          index + 1
        }: unable to determine transaction type from category "${category}".`,
    };
  }

  /*
   * =======================================================
   * STATUS
   * =======================================================
   *
   * Original JSON:
   *
   * Paid -> completed
   * Pending -> pending
   *
   * Also supports:
   * completed / pending / failed
   */
  const rawStatus =
    String(
      item.status ??
        "completed"
    )
      .trim()
      .toLowerCase();

  let normalizedStatus:
    | TransactionStatus;

  if (
    rawStatus === "paid"
  ) {
    normalizedStatus =
      "completed";
  } else if (
    rawStatus === "pending"
  ) {
    normalizedStatus =
      "pending";
  } else if (
    rawStatus === "completed"
  ) {
    normalizedStatus =
      "completed";
  } else if (
    rawStatus === "failed"
  ) {
    normalizedStatus =
      "failed";
  } else {
    return {
      transaction: null,
      sourceId,
      error:
        `Record ${
          index + 1
        }: unsupported status "${String(
          item.status
        )}".`,
    };
  }

  /*
   * ACCOUNT
   *
   * The original JSON does not have account.
   */
  const account =
    String(
      item.account ??
        "Imported JSON"
    ).trim() ||
    "Imported JSON";

  return {
    sourceId,

    transaction: {
      date: parsedDate,

      description,

      category,

      amount,

      type:
        normalizedType,

      status:
        normalizedStatus,

      account,
    },
  };
};

/*
 * =========================================================
 * GET /api/transactions
 * =========================================================
 */

export const getTransactions = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userId =
      req.user.userId;

    const {
      search = "",
      category = "",
      type = "",
      status = "",
      minAmount,
      maxAmount,
      startDate,
      endDate,
      sortBy = "date",
      sortOrder = "desc",
      page = "1",
      limit = "10",
    } = req.query;

    const pageNumber =
      Math.max(
        Number.parseInt(
          String(page),
          10
        ) || 1,
        1
      );

    const limitNumber =
      Math.min(
        Math.max(
          Number.parseInt(
            String(limit),
            10
          ) || 10,
          1
        ),
        100
      );

    const skip =
      (pageNumber - 1) *
      limitNumber;

    const allowedSortFields = [
      "transactionId",
      "date",
      "amount",
      "category",
      "status",
      "type",
      "description",
      "account",
    ];

    const requestedSortField =
      String(sortBy);

    const finalSortField =
      allowedSortFields.includes(
        requestedSortField
      )
        ? requestedSortField
        : "date";

    const finalSortOrder =
      String(sortOrder).toLowerCase() ===
      "asc"
        ? 1
        : -1;

    const filter: Record<
      string,
      unknown
    > = {
      userId,
    };

    /*
     * Search
     */
    const searchValue =
      String(search).trim();

    if (searchValue) {
      const escapedSearch =
        searchValue.replace(
          /[.*+?^${}()|[\]\\]/g,
          "\\$&"
        );

      const searchRegex =
        new RegExp(
          escapedSearch,
          "i"
        );

      filter.$or = [
        {
          transactionId:
            searchRegex,
        },
        {
          description:
            searchRegex,
        },
        {
          category:
            searchRegex,
        },
        {
          account:
            searchRegex,
        },
      ];
    }

    /*
     * Category
     */
    if (
      String(category).trim()
    ) {
      filter.category =
        String(category).trim();
    }

    /*
     * Type
     */
    const typeValue =
      String(type)
        .trim()
        .toLowerCase();

    if (
      typeValue === "income" ||
      typeValue === "expense"
    ) {
      filter.type =
        typeValue;
    }

    /*
     * Status
     */
    const statusValue =
      String(status)
        .trim()
        .toLowerCase();

    if (
      statusValue ===
        "completed" ||
      statusValue ===
        "pending" ||
      statusValue ===
        "failed"
    ) {
      filter.status =
        statusValue;
    }

    /*
     * Amount
     */
    const amountFilter: Record<
      string,
      number
    > = {};

    if (
      minAmount !== undefined &&
      String(minAmount).trim()
    ) {
      const minimum =
        Number(minAmount);

      if (
        Number.isFinite(
          minimum
        )
      ) {
        amountFilter.$gte =
          minimum;
      }
    }

    if (
      maxAmount !== undefined &&
      String(maxAmount).trim()
    ) {
      const maximum =
        Number(maxAmount);

      if (
        Number.isFinite(
          maximum
        )
      ) {
        amountFilter.$lte =
          maximum;
      }
    }

    if (
      Object.keys(
        amountFilter
      ).length > 0
    ) {
      filter.amount =
        amountFilter;
    }

    /*
     * Date
     */
    if (
      startDate ||
      endDate
    ) {
      const dateFilter: Record<
        string,
        Date
      > = {};

      if (startDate) {
        const start =
          new Date(
            String(startDate)
          );

        if (
          !Number.isNaN(
            start.getTime()
          )
        ) {
          start.setHours(
            0,
            0,
            0,
            0
          );

          dateFilter.$gte =
            start;
        }
      }

      if (endDate) {
        const end =
          new Date(
            String(endDate)
          );

        if (
          !Number.isNaN(
            end.getTime()
          )
        ) {
          end.setHours(
            23,
            59,
            59,
            999
          );

          dateFilter.$lte =
            end;
        }
      }

      if (
        Object.keys(
          dateFilter
        ).length > 0
      ) {
        filter.date =
          dateFilter;
      }
    }

    const [
      transactions,
      total,
    ] = await Promise.all([
      Transaction.find(filter)
        .sort({
          [finalSortField]:
            finalSortOrder,
        })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      Transaction.countDocuments(
        filter
      ),
    ]);

    const totalPages =
      total === 0
        ? 0
        : Math.ceil(
            total /
              limitNumber
          );

    return res.status(200).json({
      success: true,

      transactions,

      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error(
      "Get transactions error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch transactions.",
    });
  }
};

/*
 * =========================================================
 * POST /api/transactions
 * =========================================================
 */

export const createTransaction = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const {
      date,
      description,
      category,
      amount,
      type,
      status = "completed",
      account,
    } = req.body ?? {};

    if (
      !date ||
      !description ||
      !category ||
      amount === undefined ||
      !type ||
      !account
    ) {
      return res.status(400).json({
        success: false,
        message:
          "date, description, category, amount, type and account are required.",
      });
    }

    const numericAmount =
      Number(amount);

    if (
      !Number.isFinite(
        numericAmount
      ) ||
      numericAmount < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Amount must be a valid non-negative number.",
      });
    }

    const transactionDate =
      new Date(date);

    if (
      Number.isNaN(
        transactionDate.getTime()
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid transaction date.",
      });
    }

    const typeValue =
      String(type)
        .trim()
        .toLowerCase();

    if (
      typeValue !== "income" &&
      typeValue !== "expense"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Type must be either income or expense.",
      });
    }

    const normalizedType:
      TransactionType =
      typeValue;

    const statusValue =
      String(status)
        .trim()
        .toLowerCase();

    if (
      statusValue !==
        "completed" &&
      statusValue !==
        "pending" &&
      statusValue !==
        "failed"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Status must be completed, pending or failed.",
      });
    }

    const normalizedStatus:
      TransactionStatus =
      statusValue;

    const transaction =
      await Transaction.create({
        transactionId:
          `TRX-${Date.now()}-${Math.floor(
            Math.random() *
              1000000
          )}`,

        date:
          transactionDate,

        description:
          String(
            description
          ).trim(),

        category:
          String(
            category
          ).trim(),

        amount:
          numericAmount,

        type:
          normalizedType,

        status:
          normalizedStatus,

        account:
          String(
            account
          ).trim(),

        userId:
          req.user.userId,
      });

    return res.status(201).json({
      success: true,

      message:
        "Transaction created successfully.",

      transaction,
    });
  } catch (error) {
    console.error(
      "Create transaction error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create transaction.",
    });
  }
};

/*
 * =========================================================
 * POST /api/transactions/import
 * =========================================================
 */

export const importTransactions =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      /*
       * Authentication
       */
      if (!req.user?.userId) {
        return res.status(401).json({
          success: false,
          message:
            "Unauthorized",
        });
      }

      /*
       * Get raw transactions
       */
      const rawTransactions =
        extractTransactions(
          req.body
        );

      if (!rawTransactions) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid JSON format. Expected an array, {"transactions":[...]}, or {"data":[...]}.',
        });
      }

      if (
        rawTransactions.length ===
        0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "The imported JSON contains no transactions.",
        });
      }

      console.log(
        `JSON import received ${rawTransactions.length} transaction(s).`
      );

      /*
       * Normalize
       */
      const validTransactions:
        Array<{
          sourceId: string;
          transaction:
            NormalizedImportTransaction;
        }> = [];

      const validationErrors:
        string[] = [];

      rawTransactions.forEach(
        (
          item,
          index
        ) => {
          const result =
            normalizeImportTransaction(
              item,
              index
            );

          if (
            result.transaction
          ) {
            validTransactions.push(
              {
                sourceId:
                  result.sourceId,

                transaction:
                  result.transaction,
              }
            );
          } else {
            validationErrors.push(
              result.error
            );
          }
        }
      );

      /*
       * No valid records
       */
      if (
        validTransactions.length ===
        0
      ) {
        console.error(
          "Import validation errors:",
          validationErrors
        );

        return res.status(400).json({
          success: false,

          message:
            "No valid transactions were found in the imported JSON.",

          imported: 0,

          skipped:
            validationErrors.length,

          invalid:
            validationErrors.length,

          validationErrors,
        });
      }

      /*
       * Create MongoDB documents
       */
      const documents =
        validTransactions.map(
          (
            item,
            index
          ) => ({
            /*
             * We create our own unique
             * transactionId.
             */
            transactionId:
              `IMP-${req.user!.userId}-${item.sourceId}-${Date.now()}-${index}`,

            date:
              item.transaction
                .date,

            description:
              item.transaction
                .description,

            category:
              item.transaction
                .category,

            amount:
              item.transaction
                .amount,

            type:
              item.transaction
                .type,

            status:
              item.transaction
                .status,

            account:
              item.transaction
                .account,

            /*
             * IMPORTANT:
             *
             * Always attach the logged-in
             * user's MongoDB ID.
             *
             * Do NOT use the source
             * JSON's user_id value here.
             */
            userId:
              req.user!.userId,
          })
        );

      /*
       * Insert
       */
      const insertedTransactions =
        await Transaction.insertMany(
          documents
        );

      const invalidCount =
        validationErrors.length;

      console.log(
        `JSON import completed. Imported: ${insertedTransactions.length}, Invalid: ${invalidCount}`
      );

      return res.status(201).json({
        success: true,

        message:
          "Transactions imported successfully.",

        imported:
          insertedTransactions.length,

        skipped:
          invalidCount,

        invalid:
          invalidCount,

        transactions:
          insertedTransactions,

        validationErrors:
          invalidCount > 0
            ? validationErrors
            : undefined,
      });
    } catch (error) {
      console.error(
        "Import transactions error:",
        error
      );

      /*
       * Mongoose validation error
       */
      if (
        error &&
        typeof error ===
          "object" &&
        "name" in error &&
        (
          error as {
            name?: string;
          }
        ).name ===
          "ValidationError"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Imported transactions failed model validation.",

          details:
            error instanceof Error
              ? error.message
              : String(error),
        });
      }

      /*
       * Duplicate key
       */
      if (
        error &&
        typeof error ===
          "object" &&
        "code" in error &&
        (
          error as {
            code?: number;
          }
        ).code === 11000
      ) {
        return res.status(409).json({
          success: false,

          message:
            "A duplicate transaction was detected during import.",
        });
      }

      return res.status(500).json({
        success: false,

        message:
          "Failed to import transactions.",
      });
    }
  };

