// src/pages/auth/VerifyOtp.jsx
//
// Receives { email, password } from Login via router state.
// Calls POST /auth/verify-otp/ → stores tokens → navigates to dashboard.
// Also handles resend-otp with a 60-second cooldown timer.

import React, { useRef, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { verifyOtp, resendOtp } from "../../api/AuthApi";

const RESEND_COOLDOWN = 60; // seconds

const VerifyOtp = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Email passed from Login page via router state
  // (password is not part of the OTP flow — login is email + OTP only)
  const email = location.state?.email || "";

  const inputsRef = useRef([]);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Resend cooldown
  const [cooldown, setCooldown] = useState(0);
  const [resendMsg, setResendMsg] = useState("");
  const cooldownRef = useRef(null);

  // If no email in state, send back to login
  useEffect(() => {
    if (!email) {
      navigate("/login", { replace: true });
    }
    // Auto-focus first input
    inputsRef.current[0]?.focus();
  }, []);

  // Countdown ticker
  useEffect(() => {
    if (cooldown > 0) {
      cooldownRef.current = setTimeout(() => setCooldown((c) => c - 1), 1000);
    }
    return () => clearTimeout(cooldownRef.current);
  }, [cooldown]);

  // ── OTP input handlers ────────────────────────────────────────
  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    const newOtp = [...otp];
    pasted.split("").forEach((char, i) => {
      newOtp[i] = char;
    });
    setOtp(newOtp);
    // Focus last filled input
    const lastIndex = Math.min(pasted.length, 5);
    inputsRef.current[lastIndex]?.focus();
  };

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const enteredOtp = otp.join("");
    if (enteredOtp.length < 6) {
      setError("Please enter the complete 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const response = await verifyOtp(email, enteredOtp);
      const { access_token, refresh_token, user } = response.data.data;

      // Store tokens + user in context (which also writes to localStorage)
      login({ access_token, refresh_token }, user);

      navigate("/", { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message || "Invalid OTP. Please try again.";
      setError(msg);
      // Clear the OTP inputs on failure
      setOtp(Array(6).fill(""));
      inputsRef.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ─────────────────────────────────────────────────
  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    setResendMsg("");
    setError("");

    try {
      await resendOtp(email);
      setCooldown(RESEND_COOLDOWN);
      setResendMsg("OTP resent successfully!");
      setOtp(Array(6).fill(""));
      inputsRef.current[0]?.focus();
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to resend OTP. Try again.";
      setError(msg);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div className="text-center mb-4">
          <h2 style={styles.title} className="text-primary">
            Verify OTP
          </h2>
          <small className="text-muted">
            Enter the 6-digit code sent to{" "}
            <strong>{email || "your email"}</strong>
          </small>
        </div>

        {error && (
          <div className="alert alert-danger py-2 text-center">{error}</div>
        )}

        {resendMsg && (
          <div className="alert alert-success py-2 text-center">
            {resendMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div
            className="d-flex justify-content-between mb-4"
            onPaste={handlePaste}
          >
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                className="form-control otp-input"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={loading}
                style={styles.otpInput}
              />
            ))}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100"
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                />
                Verifying...
              </>
            ) : (
              "Verify & Login"
            )}
          </button>

          <p className="text-center mt-3 mb-0">
            Didn't receive OTP?{" "}
            {cooldown > 0 ? (
              <span className="text-muted">
                Resend in <strong>{cooldown}s</strong>
              </span>
            ) : (
              <span
                className="text-primary fw-bold"
                style={{ cursor: "pointer" }}
                onClick={handleResend}
              >
                Resend Code
              </span>
            )}
          </p>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;

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
    width: "420px",
    background: "#fff",
    padding: "35px 40px",
    borderRadius: "12px",
    boxShadow: "0 0 20px rgba(0,0,0,0.08)",
  },
  title: {
    fontWeight: 800,
    fontSize: "26px",
  },
  otpInput: {
    width: "55px",
    height: "55px",
    textAlign: "center",
    fontSize: "22px",
    fontWeight: 700,
    borderRadius: "10px",
  },
};
