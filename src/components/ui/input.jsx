import React from "react";
import "./input.css";

const Input = ({
  type = "text",
  placeholder = "",
  value,
  onChange,
  name,
  id,
  disabled = false,
  required = false,
  className = "",
}) => {
  return (
    <input
      type={type}
      name={name}
      id={id}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      className={`input ${className}`}
    />
  );
};

export default Input;