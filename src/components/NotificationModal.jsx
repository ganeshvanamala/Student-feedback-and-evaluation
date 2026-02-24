import React from "react";
import "../styles/NotificationModal.css";

export function NotificationModal({ isOpen, title, message, type = "success", onClose, autoClose = true }) {
  React.useEffect(() => {
    if (isOpen && autoClose) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, onClose]);

  if (!isOpen) return null;

  const icons = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  const colors = {
    success: "#4CAF50",
    error: "#f44336",
    warning: "#ff9800",
    info: "#2196F3",
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ borderTop: `4px solid ${colors[type] || colors.success}` }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon" style={{ color: colors[type] || colors.success }}>
          {icons[type]}
        </div>
        <h2>{title}</h2>
        <p>{message}</p>
        <button onClick={onClose} className="modal-btn" style={{ backgroundColor: colors[type] || colors.success }}>
          OK
        </button>
      </div>
    </div>
  );
}
