import React from "react";
import "./spinner.css";

const Spinner = ({ size = "medium" }) => {
  return (
    <div
      className={`spinner spinner-${size}`}
      role="status"
      aria-label="Loading"
    />
  );
};

export default Spinner;