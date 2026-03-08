// src/auth/AuthContext.jsx
//
// Real JWT-based auth context.
// - Reads tokens from localStorage on mount (survives page refresh)
// - Exposes login(), logout(), user object, and isAuthenticated flag
// - logout() calls the backend blacklist endpoint before clearing storage

import React, { createContext, useContext, useState, useEffect } from "react";
import { logout as apiLogout } from "../api/AuthApi";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser]                   = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading]         = useState(true); // true while we check localStorage

  // ── Rehydrate from localStorage on first mount ────────────────
  useEffect(() => {
    const storedUser        = localStorage.getItem("user");
    const storedAccessToken = localStorage.getItem("access_token");

    if (storedUser && storedAccessToken) {
      try {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      } catch {
        // Corrupted data — clear and force re-login
        _clear();
      }
    }

    setIsLoading(false);
  }, []);

  // ── Called after successful verify-otp ───────────────────────
  // tokens: { access_token, refresh_token }
  // userData: the user object from verify-otp response
  const login = (tokens, userData) => {
    localStorage.setItem("access_token",  tokens.access_token);
    localStorage.setItem("refresh_token", tokens.refresh_token);
    localStorage.setItem("user",          JSON.stringify(userData));

    setUser(userData);
    setIsAuthenticated(true);
  };

  // ── Logout: blacklist token on backend, then clear local state ──
  const logout = async () => {
    const refreshToken = localStorage.getItem("refresh_token");

    try {
      if (refreshToken) {
        await apiLogout(refreshToken);
      }
    } catch {
      // Even if the backend call fails, still clear local state
    } finally {
      _clear();
    }
  };

  const _clear = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);