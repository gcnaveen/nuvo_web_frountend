// src/pages/auth/Register.jsx
//
// Admin self-registration with email + password.
// Calls POST /auth/register/admin/ → pending approval → redirect to login.

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerAdmin } from "../../api/AuthApi";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    if (!form.full_name.trim()) return "Full name is required";
    if (!form.email.trim()) return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Invalid email address";
    if (!form.phone_number.trim()) return "Phone number is required";
    if (!/^\d{10}$/.test(form.phone_number))
      return "Phone number must be 10 digits";
    if (!form.password) return "Password is required";
    if (form.password.length < 8)
      return "Password must be at least 8 characters";
    if (form.password !== form.confirm) return "Passwords do not match";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      await registerAdmin(
        form.full_name,
        form.email,
        form.phone_number,
        form.password,
      );
      setSuccess(
        "Registration submitted! An existing admin must approve your account before you can log in.",
      );
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !!success;

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div className="text-center mb-4">
          <h2 style={styles.title} className="text-primary">
            Create Account
          </h2>
          <small className="text-muted">Register & access admin panel</small>
        </div>

        {error && (
          <div className="alert alert-danger py-2 text-center">{error}</div>
        )}
        {success && (
          <div className="alert alert-success py-2 text-center">{success}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              name="full_name"
              type="text"
              className="form-control"
              placeholder="Enter full name"
              value={form.full_name}
              onChange={handleChange}
              disabled={isDisabled}
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              name="email"
              type="email"
              className="form-control"
              placeholder="Enter email"
              value={form.email}
              onChange={handleChange}
              disabled={isDisabled}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <input
              name="phone_number"
              type="tel"
              className="form-control"
              placeholder="10-digit mobile number"
              value={form.phone_number}
              onChange={handleChange}
              maxLength={10}
              disabled={isDisabled}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password</label>
            <input
              name="password"
              type="password"
              className="form-control"
              placeholder="Min 8 characters"
              value={form.password}
              onChange={handleChange}
              disabled={isDisabled}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              name="confirm"
              type="password"
              className="form-control"
              placeholder="Re-enter password"
              value={form.confirm}
              onChange={handleChange}
              disabled={isDisabled}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 mt-2"
            disabled={isDisabled}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                />
                Registering...
              </>
            ) : (
              "Register"
            )}
          </button>

          <p className="text-center mt-3 mb-0">
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

const styles = {
  page: {
    fontFamily: "Nunito, sans-serif",
    background: "#f2f7ff",
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
  },
  card: {
    width: "420px",
    background: "#fff",
    padding: "35px 40px",
    borderRadius: "12px",
    boxShadow: "0 0 20px rgba(0,0,0,0.08)",
  },
  title: { fontWeight: 800, fontSize: "28px" },
};
