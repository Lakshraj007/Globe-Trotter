import React, { useState } from "react";
import "./accordion.css";

const Accordion = ({
  title,
  children,
  defaultOpen = false,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  };

  return (
    <div
      className={`accordion ${
        isOpen ? "accordion-open" : ""
      } ${disabled ? "accordion-disabled" : ""}`}
    >
      <button
        type="button"
        className="accordion-header"
        onClick={handleToggle}
        disabled={disabled}
        aria-expanded={isOpen}
      >
        <span className="accordion-title">{title}</span>

        <span className="accordion-icon" aria-hidden="true">
          {isOpen ? "−" : "+"}
        </span>
      </button>

      {isOpen && (
        <div className="accordion-content">
          {children}
        </div>
      )}
    </div>
  );
};

export default Accordion;