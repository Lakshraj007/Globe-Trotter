import React from "react";
import "./button.css";

const Button = ({
  children,
  variant = "primary",
  size = "medium",
  type = "button",
  onClick,
  disabled = false,
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn-${variant} btn-${size}`}
    >
      {children}
    </button>
  );
};

export default Button;