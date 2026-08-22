import React, { useEffect } from "react";
import "./toast.css";

const TOAST_TYPES = {
  success: {
    icon: "✓",
    label: "Success",
  },
  error: {
    icon: "!",
    label: "Error",
  },
  warning: {
    icon: "⚠",
    label: "Warning",
  },
  info: {
    icon: "i",
    label: "Information",
  },
};

const Toast = ({
  message,
  title,
  type = "info",
  isOpen = true,
  onClose,
  duration = 4000,
  showProgress = true,
  position = "top-right",
}) => {
  // Automatically close the toast
  useEffect(() => {
    if (!isOpen || !onClose || duration <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [isOpen, onClose, duration]);

  // Don't render when closed
  if (!isOpen) {
    return null;
  }

  // Prevent invalid toast types
  const toastType = TOAST_TYPES[type] ? type : "info";
  const toastInfo = TOAST_TYPES[toastType];

  return (
    <div
      className={`toast-container toast-position-${position}`}
      aria-live={toastType === "error" ? "assertive" : "polite"}
      aria-atomic="true"
    >
      <div
        className={`toast toast-${toastType}`}
        role={toastType === "error" ? "alert" : "status"}
      >
        {/* Icon */}
        <div
          className="toast-icon"
          aria-label={toastInfo.label}
          title={toastInfo.label}
        >
          {toastInfo.icon}
        </div>

        {/* Content */}
        <div className="toast-content">
          {title && (
            <h4 className="toast-title">
              {title}
            </h4>
          )}

          {message && (
            <p className="toast-message">
              {message}
            </p>
          )}
        </div>

        {/* Close button */}
        {onClose && (
          <button
            type="button"
            className="toast-close"
            onClick={onClose}
            aria-label="Close notification"
          >
            <span aria-hidden="true">×</span>
          </button>
        )}

        {/* Auto-dismiss progress */}
        {showProgress && duration > 0 && (
          <div
            className="toast-progress"
            style={{
              animationDuration: `${duration}ms`,
            }}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
};

export default Toast;