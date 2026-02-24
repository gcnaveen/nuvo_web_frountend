import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Dummy users
  const users = [
    { email: "rakesh@gmail.com", password: "rakesh@123" },
    { email: "rudresh@gmail.com", password: "rudresh@123" },
  ];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    // Check dummy users
    const userExists = users.find(
      (user) => user.email === email && user.password === password
    );

    if (!userExists) {
      setError("Invalid email or password");
      return;
    }

    // Login success
    // login(); commenting to after implementing veryfy-otp compoents 
    // now it should redirect to /verify-otp page 
    navigate("/verify-otp");
  };

  return (
    <div style={styles.page}>
      <div className="auth-card" style={styles.card}>
        <div className="text-center mb-4">
          <h2 className="auth-title text-primary" style={styles.title}>
            Nuvo Admin
          </h2>
          <small className="text-muted">Login to continue</small>
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
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-3">
            Login
          </button>

          <p className="text-center mt-3">
            Don’t have an account?{" "}
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

/* Inline styles */
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
