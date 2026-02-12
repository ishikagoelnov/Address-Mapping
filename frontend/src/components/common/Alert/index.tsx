import "./styles.css";

interface AlertState {
  message?: string;
  title?: string;
  type?: "success" | "error" | "warning" | "info";
  isVisible?: boolean;
}

interface AlertProps {
  alert?: AlertState;
  onClose?: () => void;
}

const iconMap: Record<string, string> = {
  success: "✓",
  error: "\\",
  warning: "⚠",
  info: "ℹ",
};

export const Alert = ({ alert, onClose }: AlertProps) => {
  // Safely handle missing alert or isVisible
  if (!alert?.isVisible) return null;

  const alertType = alert?.type || "info";
  const title = alert?.title || "";
  const message = alert?.message || "";

  return (
    <div className={`alert alert-${alertType}`}>
      <span className="alert-icon">{iconMap[alertType] || "•"}</span>
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        {message && <div className="alert-message">{message}</div>}
      </div>
      <button
        className="alert-close"
        onClick={onClose}
        aria-label="Close alert"
      >
        ✕
      </button>
    </div>
  );
};

export { useAlert } from "./useAlert";
