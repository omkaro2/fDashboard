interface AlertChipProps {
  type: "success" | "info" | "warning" | "error";
  message: string;
  onClose?: () => void;
}

function AlertChip({
  type,
  message,
  onClose,
}: AlertChipProps) {
  const iconMap = {
    success: "✓",
    info: "ⓘ",
    warning: "⚠",
    error: "!",
  };

  return (
    <div
      className={`alert-chip alert-chip-${type}`}
      role="alert"
    >
      <span className="alert-chip-icon">
        {iconMap[type]}
      </span>

      <span className="alert-chip-message">
        {message}
      </span>

      {onClose && (
        <button
          type="button"
          className="alert-chip-close"
          onClick={onClose}
          aria-label="Close alert"
        >
          ×
        </button>
      )}
    </div>
  );
}

export default AlertChip;