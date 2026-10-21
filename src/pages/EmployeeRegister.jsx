import React, { useState } from "react";
import { ArrowRight, ShieldCheck, UserPlus } from "lucide-react";
import { login, registerEmployee } from "../services/api";

export default function EmployeeRegister({ go }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await registerEmployee(normalizedEmail, password);

      // Sign in after registration using the existing login endpoint.
      const result = await login(normalizedEmail, password);

      if (result.user?.role !== "EMPLOYEE") {
        throw new Error("Please use the correct employee login.");
      }

      localStorage.setItem("hrms_token", result.token);
      localStorage.setItem("hrms_user", JSON.stringify(result.user));

      go("employee-dashboard");
    } catch (err) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-art">
        <button className="back-link" type="button" onClick={() => go("employee")}>
          ← Back to sign in
        </button>

        <div className="login-art-content">
          <div className="eyebrow">
            <span className="live-dot" />
            JOIN EMPOWER HR
          </div>
          <h1>
            Your HR
            <br />
            journey starts here.
          </h1>
          <p>
            Create your employee login to access your workspace.
            Your official employment details will be linked by HR.
          </p>
        </div>

        <div className="login-art-mark">✦</div>
      </div>

      <div className="login-form-wrap">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-brand">Empower HR</div>
          <div className="form-kicker">EMPLOYEE REGISTRATION</div>
          <h2>Create account.</h2>
          <p className="form-subtitle">
            Register with an email address you can access.
          </p>

          {error && <div className="login-error" role="alert">{error}</div>}

          <label htmlFor="register-email">Email address</label>
          <input
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />

          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            minLength={8}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />

          <label htmlFor="register-confirm-password">Confirm password</label>
          <input
            id="register-confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder="Enter the password again"
            minLength={8}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />

          <button
            className="primary-button full"
            type="submit"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
            {!loading && <ArrowRight size={18} />}
          </button>

          <button
            className="secondary-button full"
            type="button"
            onClick={() => go("employee")}
          >
            Already registered? Sign in
          </button>

          <div className="login-note">
            <ShieldCheck size={15} />
            <span>
              Registration creates an employee login. HR must create or link
              your official employee profile before your HR details are available.
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
