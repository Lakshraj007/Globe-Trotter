import React, { useState } from "react";
import "./tabs.css";

const Tabs = ({
  items = [],
  defaultValue,
  value,
  onChange,
  variant = "underline",
  fullWidth = false,
  className = "",
}) => {
  const firstEnabledTab = items.find((item) => !item.disabled);

  const [internalValue, setInternalValue] = useState(
    defaultValue ?? firstEnabledTab?.value
  );

  const activeValue = value !== undefined ? value : internalValue;

  const handleChange = (tab) => {
    if (tab.disabled) return;

    if (value === undefined) {
      setInternalValue(tab.value);
    }

    onChange?.(tab.value, tab);
  };

  return (
    <div
      className={`tabs tabs-${variant} ${
        fullWidth ? "tabs-full-width" : ""
      } ${className}`}
    >
      <div className="tabs-list" role="tablist">
        {items.map((tab) => {
          const isActive = activeValue === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-disabled={tab.disabled || undefined}
              disabled={tab.disabled}
              className={`tab ${isActive ? "tab-active" : ""} ${
                tab.disabled ? "tab-disabled" : ""
              }`}
              onClick={() => handleChange(tab)}
            >
              {tab.icon && (
                <span className="tab-icon" aria-hidden="true">
                  {tab.icon}
                </span>
              )}

              <span className="tab-label">{tab.label}</span>

              {tab.badge !== undefined && (
                <span className="tab-badge">{tab.badge}</span>
              )}
            </button>
          );
        })}
      </div>

      {items.map((tab) => {
        if (activeValue !== tab.value || tab.content === undefined) {
          return null;
        }

        return (
          <div
            key={tab.value}
            className="tab-panel"
            role="tabpanel"
            tabIndex="0"
          >
            {tab.content}
          </div>
        );
      })}
    </div>
  );
};

export default Tabs;