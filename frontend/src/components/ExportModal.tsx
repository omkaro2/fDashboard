import { useEffect, useState } from "react";

import {
  EXPORT_COLUMNS,
  exportTransactionsToCsv,
  type ExportColumnKey,
} from "../utils/csvExport";

import type { Transaction } from "../types/transaction";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
}

const ExportModal = ({
  isOpen,
  onClose,
  transactions,
}: ExportModalProps) => {
  const [selectedColumns, setSelectedColumns] =
    useState<ExportColumnKey[]>(
      EXPORT_COLUMNS.map(
        (column) => column.key
      )
    );

  useEffect(() => {
    if (isOpen) {
      setSelectedColumns(
        EXPORT_COLUMNS.map(
          (column) => column.key
        )
      );
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const toggleColumn = (
    column: ExportColumnKey
  ) => {
    setSelectedColumns((current) => {
      if (current.includes(column)) {
        return current.filter(
          (item) => item !== column
        );
      }

      return [...current, column];
    });
  };

  const selectAll = () => {
    setSelectedColumns(
      EXPORT_COLUMNS.map(
        (column) => column.key
      )
    );
  };

  const clearAll = () => {
    setSelectedColumns([]);
  };

  const handleExport = () => {
    if (
      transactions.length === 0 ||
      selectedColumns.length === 0
    ) {
      return;
    }

    exportTransactionsToCsv(
      transactions,
      selectedColumns,
      "fDashboard-transactions.csv"
    );

    onClose();
  };

  return (
    <div
      className="export-modal-overlay"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }
      }}
    >
      <div
        className="export-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-modal-title"
      >
        {/* Header */}

        <div className="export-modal-header">
          <div>
            <h3 id="export-modal-title">
              Export Transactions
            </h3>

            <p>
              Choose the columns you want
              in your CSV file.
            </p>
          </div>

          <button
            type="button"
            className="export-modal-close"
            onClick={onClose}
            aria-label="Close export modal"
          >
            ×
          </button>
        </div>

        {/* Select / Clear */}

        <div className="export-column-actions">
          <button
            type="button"
            onClick={selectAll}
          >
            Select All
          </button>

          <button
            type="button"
            onClick={clearAll}
          >
            Clear All
          </button>
        </div>

        {/* Columns */}

        <div className="export-columns">
          {EXPORT_COLUMNS.map(
            (column) => (
              <label
                key={column.key}
                className="export-column-item"
              >
                <input
                  type="checkbox"
                  checked={selectedColumns.includes(
                    column.key
                  )}
                  onChange={() =>
                    toggleColumn(
                      column.key
                    )
                  }
                />

                <span>
                  {column.label}
                </span>
              </label>
            )
          )}
        </div>

        {/* Summary */}

        <div className="export-summary">
          <span>
            Transactions:{" "}
            {transactions.length}
          </span>

          <span>
            Columns selected:{" "}
            {selectedColumns.length}
          </span>
        </div>

        {/* Footer */}

        <div className="export-modal-footer">
          <button
            type="button"
            className="export-cancel-button"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="export-confirm-button"
            onClick={handleExport}
            disabled={
              transactions.length === 0 ||
              selectedColumns.length === 0
            }
          >
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;

