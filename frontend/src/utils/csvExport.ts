import type { Transaction } from "../types/transaction";

export type ExportColumnKey =
  | "date"
  | "transactionId"
  | "description"
  | "category"
  | "amount"
  | "type"
  | "status"
  | "account";

export interface ExportColumn {
  key: ExportColumnKey;
  label: string;
}

export const EXPORT_COLUMNS: ExportColumn[] =
  [
    {
      key: "date",
      label: "Date",
    },
    {
      key: "transactionId",
      label: "Transaction ID",
    },
    {
      key: "description",
      label: "Description",
    },
    {
      key: "category",
      label: "Category",
    },
    {
      key: "amount",
      label: "Amount",
    },
    {
      key: "type",
      label: "Type",
    },
    {
      key: "status",
      label: "Status",
    },
    {
      key: "account",
      label: "Account",
    },
  ];

const escapeCsvValue = (
  value: unknown
): string => {
  const stringValue =
    String(value ?? "");

  const requiresQuotes =
    stringValue.includes(",") ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r");

  if (!requiresQuotes) {
    return stringValue;
  }

  return `"${stringValue.replace(
    /"/g,
    '""'
  )}"`;
};

const formatDate = (
  value: unknown
): string => {
  if (!value) {
    return "";
  }

  const parsedDate =
    new Date(String(value));

  if (
    Number.isNaN(
      parsedDate.getTime()
    )
  ) {
    return String(value);
  }

  return parsedDate.toLocaleDateString(
    "en-IN"
  );
};

const getColumnValue = (
  transaction: Transaction,
  key: ExportColumnKey
): string | number => {
  switch (key) {
    case "date":
      return formatDate(
        transaction.date
      );

    case "transactionId":
      return (
        transaction.transactionId ||
        ""
      );

    case "description":
      return (
        transaction.description ||
        ""
      );

    case "category":
      return (
        transaction.category ||
        ""
      );

    case "amount":
      return Number(
        transaction.amount
      ) || 0;

    case "type":
      return transaction.type;

    case "status":
      return transaction.status;

    case "account":
      return (
        transaction.account ||
        ""
      );

    default:
      return "";
  }
};

export const exportTransactionsToCsv = (
  transactions: Transaction[],
  selectedColumns: ExportColumnKey[],
  fileName =
    "fDashboard-transactions.csv"
): void => {
  if (
    transactions.length === 0 ||
    selectedColumns.length === 0
  ) {
    return;
  }

  const columns =
    EXPORT_COLUMNS.filter(
      (column) =>
        selectedColumns.includes(
          column.key
        )
    );

  if (columns.length === 0) {
    return;
  }

  const headerRow =
    columns
      .map(
        (column) =>
          escapeCsvValue(
            column.label
          )
      )
      .join(",");

  const dataRows =
    transactions.map(
      (transaction) =>
        columns
          .map(
            (column) =>
              escapeCsvValue(
                getColumnValue(
                  transaction,
                  column.key
                )
              )
          )
          .join(",")
    );

  const csvContent = [
    headerRow,
    ...dataRows,
  ].join("\r\n");

  const blob = new Blob(
    [csvContent],
    {
      type:
        "text/csv;charset=utf-8;",
    }
  );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download = fileName;

  link.style.display = "none";

  document.body.appendChild(link);

  link.click();

  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};