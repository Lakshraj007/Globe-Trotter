import React from "react";
import "./navbar-public.css";

const NavbarPublic = ({
  logo = "Globe-Trotter",
  onLogoClick,
  onLogin,
  onSignup,
}) => {
  return (
    <nav className="navbar-public">
      <button
        type="button"
        className="navbar-public-logo"
        onClick={onLogoClick}
      >
        {logo}
      </button>

      <div className="navbar-public-actions">
        <button
          type="button"
          className="navbar-public-login"
          onClick={onLogin}
        >
          Login
        </button>

        <button
          type="button"
          className="navbar-public-signup"
          onClick={onSignup}
        >
          Sign Up
        </button>
      </div>
    </nav>
  );
};

export default NavbarPublic;