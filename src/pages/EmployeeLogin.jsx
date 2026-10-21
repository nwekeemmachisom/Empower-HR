import React, { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { login } from "../services/api";

export default function EmployeeLogin({ go }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await login(email, password);

      if (result.user.role !== "EMPLOYEE") {
        throw new Error("This account is not an employee account.");
      }

      localStorage.setItem("hrms_token", result.token);
      localStorage.setItem("hrms_user", JSON.stringify(result.user));

      go("employee-dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-art">
        <button className="back-link" onClick={() => go("home")}>
          ← Back to HRMS
        </button>

        <div className="login-art-content">
          <div className="eyebrow">
            <span className="live-dot" />
            SECURE WORKSPACE
          </div>

          <h1>
            Your work.
            <br />
            Your HR space.
          </h1>

          <p>
            Access your attendance, leave, documents and employee information.
          </p>
        </div>

        <div className="login-art-mark">✦</div>
      </div>

      <div className="login-form-wrap">
        <form className="login-form" onSubmit={handleLogin}>
          <div className="login-brand">Empower HR</div>

          <div className="form-kicker">EMPLOYEE PORTAL</div>

          <h2>Welcome back.</h2>

          <p className="form-subtitle">
            Sign in to continue to your workspace.
          </p>

          {error && <div className="login-error">{error}</div>}

          <label>Email address</label>
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="form-row">
            <label className="remember">
              <input type="checkbox" />
              Remember me
            </label>

            <a href="#forgot">Forgot password?</a>
          </div>

          <button
            className="primary-button full"
            type="submit"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
            {!loading && <ArrowRight size={18} />}
          </button>

          <button
            className="secondary-button full"
            type="button"
            onClick={() => go("employee-register")}
          >
            Create employee account
          </button>

          <div className="login-note">
            <ShieldCheck size={15} />
            Your HRMS account is protected by role-based access.
          </div>
        </form>
      </div>
    </div>
  );
}
