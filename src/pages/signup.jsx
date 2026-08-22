import React, { useState } from "react";
import NavbarPublic from "../ui/NavbarPublic";
import "./signup.css";

const Signup = ({
  onSignup,
  onLogin,
}) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (password !== confirmPassword) {
      return;
    }

    onSignup?.({
      name,
      email,
      password,
    });
  };

  return (
    <div className="signup-page">
      <NavbarPublic onLogin={onLogin} />

      <main className="signup-container">
        <section className="signup-card">
          <h1 className="signup-title">
            Create your account
          </h1>

          <p className="signup-subtitle">
            Start planning your next adventure.
          </p>

          <form
            className="signup-form"
            onSubmit={handleSubmit}
          >
            <div className="signup-field">
              <label htmlFor="signup-name">
                Name
              </label>

              <input
                id="signup-name"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Enter your name"
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="signup-email">
                Email
              </label>

              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="signup-password">
                Password
              </label>

              <input
                id="signup-password"
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="Create a password"
                required
              />
            </div>

            <div className="signup-field">
              <label htmlFor="signup-confirm-password">
                Confirm Password
              </label>

              <input
                id="signup-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) =>
                  setConfirmPassword(event.target.value)
                }
                placeholder="Confirm your password"
                required
              />
            </div>

            <button
              type="submit"
              className="signup-submit"
            >
              Sign Up
            </button>
          </form>

          <p className="signup-login-text">
            Already have an account?

            <button
              type="button"
              className="signup-login-link"
              onClick={onLogin}
            >
              Login
            </button>
          </p>
        </section>
      </main>
    </div>
  );
};

export default Signup;