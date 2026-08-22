import React from "react";
import "./dropdown.css";

const Dropdown = ({
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
}) => {
  return (
    <select
      className="dropdown"
      value={value}
      onChange={onChange}
      disabled={disabled}
    >
      <option value="" disabled>
        {placeholder}
      </option>

      {options.map((option, index) => (
        <option
          key={index}
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Dropdown;