import React, { useEffect } from "react";
import "./drawer.css";

const Drawer = ({
  isOpen,
  onClose,
  children,
  title = "",
  side = "right",
  width = "380px",
  showClose = true,
}) => {
  // Close drawer with Escape key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && isOpen) {
        onClose?.();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="drawer-root">
      {/* Overlay */}
      <div
        className="drawer-overlay"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`drawer drawer-${side}`}
        style={{ "--drawer-width": width }}
        role="dialog"
        aria-modal="true"
        aria-label={title || "Drawer"}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="drawer-header">
            {title && <h2 className="drawer-title">{title}</h2>}

            {showClose && (
              <button
                type="button"
                className="drawer-close"
                onClick={onClose}
                aria-label="Close drawer"
              >
                <span>×</span>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="drawer-content">
          {children}
        </div>
      </aside>
    </div>
  );
};

