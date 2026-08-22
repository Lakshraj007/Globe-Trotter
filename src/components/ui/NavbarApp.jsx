import React from "react";
import "./navbar-app.css";

const NavbarApp = ({
  logo = "Globe-Trotter",
  userName = "User",
  onLogoClick,
  onMenuClick,
  onProfileClick,
  onLogout,
}) => {
  return (
    <nav className="navbar-app">
      <div className="navbar-app-left">
        <button
          type="button"
          className="navbar-app-menu"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          ☰
        </button>

        <button
          type="button"
          className="navbar-app-logo"
          onClick={onLogoClick}
        >
          {logo}
        </button>
      </div>

      <div className="navbar-app-right">
        <button
          type="button"
          className="navbar-app-profile"
          onClick={onProfileClick}
        >
          {userName}
        </button>

        <button
          type="button"
          className="navbar-app-logout"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default NavbarApp;