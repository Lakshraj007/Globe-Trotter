import React from "react";
import "./breadcrumbs.css";

const Breadcrumbs = ({ items = [] }) => {
  if (!items.length) {
    return null;
  }

  return (
    <nav
      className="breadcrumbs"
      aria-label="Breadcrumb"
    >
      <ol className="breadcrumbs-list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="breadcrumbs-item"
            >
              {isLast || !item.href ? (
                <span
                  className="breadcrumbs-current"
                  aria-current={isLast ? "page" : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href}
                  className="breadcrumbs-link"
                >
                  {item.label}
                </a>
              )}

              {!isLast && (
                <span
                  className="breadcrumbs-separator"
                  aria-hidden="true"
                >
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;