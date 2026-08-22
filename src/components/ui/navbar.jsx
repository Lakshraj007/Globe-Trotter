import React from "react";
import "./navbar.css";

const Navbar = ({
  logo = "Globe-Trotter",
  links = [],
  onLogoClick,
}) => {
  return (
    <nav className="navbar">
      <button
        type="button"
        className="navbar-logo"
        onClick={onLogoClick}
      >
        {logo}
      </button>

      <div className="navbar-links">
        {links.map((link, index) => (
          <a
            key={index}
            href={link.href || "#"}
            className="navbar-link"
          >
            {link.label}
          </a>
        ))}
      </div>
    </nav>
  );
};

export default Navbar;