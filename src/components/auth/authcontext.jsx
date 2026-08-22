import React, { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    if (!email || !password) {
      return {
        success: false,
        message: "Email and password are required.",
      };
    }

    const loggedInUser = {
      email,
    };

    setUser(loggedInUser);

    return {
      success: true,
      user: loggedInUser,
    };
  };

  const signup = (name, email, password) => {
    if (!name || !email || !password) {
      return {
        success: false,
        message: "All fields are required.",
      };
    }

    const newUser = {
      name,
      email,
    };

    setUser(newUser);

    return {
      success: true,
      user: newUser,
    };
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};