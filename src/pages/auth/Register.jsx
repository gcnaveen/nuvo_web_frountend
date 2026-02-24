import React from "react";
import { Link } from "react-router-dom";

export default function Register() {
  return (
    <div style={styles.page}>
      <div className="auth-card" style={styles.card}>
        <div className="text-center mb-4">
          <h2 className="auth-title text-primary" style={styles.title}>
            Create Account
          </h2>
          <small className="text-muted">Register & access admin panel</small>
        </div>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter full name"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter email"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Create password"
            />
          </div>

          <button type="submit" className="btn btn-primary w-100 mt-3">
            Register
          </button>

          <p className="text-center mt-3">
            Already have an account?{" "}
            <Link to="/login" className="text-primary">
              Login
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

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
    width: "450px",
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
