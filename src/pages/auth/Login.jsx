// src/pages/auth/Login.jsx
//
// Admin login — email + password, direct token issuance.
// No OTP step for admin web panel.

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { adminLogin } from "../../api/AuthApi";
import { useAuth } from "../../auth/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const response = await adminLogin(email, password);
      const { access_token, refresh_token, user } = response.data.data;

      login({ access_token, refresh_token }, user);
      navigate("/admin", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Invalid email or password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div className="text-center mb-4">
          <h2 style={styles.title} className="text-primary">
            Nuvo Admin
          </h2>
          <small className="text-muted">Sign in to your account</small>
        </div>

        {error && (
          <div className="alert alert-danger py-2 text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mt-3"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>

          <p className="text-center mt-3 mb-0">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary">
              Register
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;

const styles = {
  page: {
    fontFamily: "Nunito, sans-serif",
    background: "#f2f7ff",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    width: "400px",
    background: "#fff",
    padding: "35px 40px",
    borderRadius: "12px",
    boxShadow: "0 0 20px rgba(0,0,0,0.08)",
  },
  title: {
    fontWeight: 800,
    fontSize: "28px",
  },
};
