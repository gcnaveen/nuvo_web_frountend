import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const inputsRef = useRef([]);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [error, setError] = useState("");

  const DUMMY_OTP = "123456";

  const handleChange = (value, index) => {
    if (!/^\d?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    const enteredOtp = otp.join("");

    if (enteredOtp.length < 6) {
      setError("Please enter complete OTP");
      return;
    }

    if (enteredOtp !== DUMMY_OTP) {
      setError("Invalid OTP");
      return;
    }

    // OTP success → login user
    login();
    navigate("/");
  };

  return (
    <div style={styles.page}>
      <div className="auth-card" style={styles.card}>
        <div className="text-center mb-4">
          <h2 className="auth-title text-primary" style={styles.title}>
            Verify OTP
          </h2>
          <small className="text-muted">
            Enter the 6 digit code sent to your email
          </small>
        </div>

        {error && (
          <div className="alert alert-danger py-2 text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="d-flex justify-content-between mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                type="text"
                className="form-control otp-input"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                style={styles.otpInput}
              />
            ))}
          </div>

          <button type="submit" className="btn btn-primary w-100">
            Verify
          </button>

          <p className="text-center mt-3">
            Didn't receive OTP?{" "}
            <span
              className="text-primary fw-bold"
              style={{ cursor: "pointer" }}
            >
              Resend Code
            </span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default VerifyOtp;

/* Styles */
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
