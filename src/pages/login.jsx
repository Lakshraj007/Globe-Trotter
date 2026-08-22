import React, { useState } from "react";
import NavbarPublic from "../ui/NavbarPublic";
import "./login.css";

const Login = ({
  onLogin,
  onSignup,
}) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    onLogin?.({
      email,
      password,
    });
  };

  return (
    <div className="login-page">
      <NavbarPublic onSignup={onSignup} />

      <main className="login-container">
        <section className="login-card">
          <h1 className="login-title">Welcome back</h1>

          <p className="login-subtitle">
            Login to continue planning your trips.
          </p>

          <form
            className="login-form"
            onSubmit={handleSubmit}
          >
            <div className="login-field">
              <label htmlFor="login-email">
                Email
              </label>

              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="login-password">
                Password
              </label>

              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              className="login-submit"
            >
              Login
            </button>
          </form>

          <p className="login-signup-text">
            Don't have an account?
            <button
              type="button"
              className="login-signup-link"
              onClick={onSignup}
            >
              Sign up
            </button>
          </p>
        </section>
      </main>
    </div>
  );
};

export default Login;