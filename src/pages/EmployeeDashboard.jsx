import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  FileText,
  CalendarDays,
  UserRound,
  BarChart3,
  Loader2,
} from "lucide-react";
import { getDashboardStats } from "../services/api";

export default function EmployeeDashboard({ go }) {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("hrms_token");

    if (!token) {
      go("employee");
      return;
    }

    async function loadDashboard() {
      try {
        const result = await getDashboardStats(token);
        setStats(result.data);
      } catch (err) {
        setError(err.message);

        if (
          err.message.toLowerCase().includes("token") ||
          err.message.toLowerCase().includes("authorization")
        ) {
          localStorage.removeItem("hrms_token");
          localStorage.removeItem("hrms_user");
          go("employee");
        }
      }
    }

    loadDashboard();
  }, [go]);

  function signOut() {
    localStorage.removeItem("hrms_token");
    localStorage.removeItem("hrms_user");
    go("home");
  }

  if (!stats && !error) {
    return (
      <div className="dashboard-page">
        <main className="dash-main">
          <div className="dashboard-loading">
            <Loader2 className="spin" size={30} />
            <p>Loading dashboard...</p>
          </div>
        </main>
      </div>
    );
  }

  const employee = stats?.employee;

  const fullName = employee
    ? `${employee.firstName} ${employee.lastName}`
    : "Employee";

  const initials = employee
    ? `${employee.firstName?.[0] || ""}${employee.lastName?.[0] || ""}`
    : "EM";

  return (
    <div className="dashboard-page">
      <aside className="dash-sidebar">
        <div className="dash-logo">
          <span>✦</span> Empower HR
        </div>

        <div className="dash-role">EMPLOYEE</div>

        <input
          className="dash-menu-toggle"
          type="checkbox"
          id="mobile-menu-employeedashboard"
          aria-label="Toggle dashboard navigation"
        />
        <label className="dash-mobile-menu" htmlFor="mobile-menu-employeedashboard">
          <span className="dash-menu-icon" aria-hidden="true">☰</span>
          <span>Menu</span>
        </label>
        <nav>
          <button className="dash-nav active" onClick={() => go("employee-dashboard")}>
            <BarChart3 /> Dashboard
          </button>

          <button className="dash-nav" onClick={() => go("employee-profile")}>
            <UserRound /> My profile
          </button>

          <button className="dash-nav" onClick={() => go("employee-attendance")}>
            <Clock3 /> Attendance
          </button>

          <button className="dash-nav" onClick={() => go("employee-leave")}>
            <CalendarDays /> Leave
          </button>

          <button className="dash-nav" onClick={() => go("employee-documents")}>
            <FileText /> Documents
          </button>
        </nav>

        <button className="logout" onClick={signOut}>
          ← Sign out
        </button>
      </aside>

      <main className="dash-main">
        <div className="dash-top">
          <div>
            <div className="section-label">EMPLOYEE SPACE</div>

            <h1>Good morning, {employee?.firstName || "Employee"}.</h1>
          </div>

          <div className="avatar">{initials.toUpperCase()}</div>
        </div>

        <div className="dash-banner">
          <div>
            <span>WORKFORCE SIGNAL</span>

            <strong>
              {employee?.jobTitle || "Your HR activity at a glance."}
            </strong>
          </div>

          <ArrowUpRight />
        </div>

        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        <div className="stat-grid">
          <div className="dash-stat">
            <Clock3 />
            <strong>{stats?.myAttendance ?? 0}</strong>
            <span>Attendance records</span>
          </div>

          <div className="dash-stat">
            <CalendarDays />
            <strong>{stats?.pendingLeaves ?? 0}</strong>
            <span>Pending leave</span>
          </div>

          <div className="dash-stat">
            <CalendarDays />
            <strong>{stats?.approvedLeaves ?? 0}</strong>
            <span>Approved leave</span>
          </div>

          <div className="dash-stat">
            <UserRound />
            <strong>{employee?.department?.name || "—"}</strong>
            <span>Department</span>
          </div>
        </div>

        <div className="dash-content-grid">
          <section className="dash-panel">
            <div className="panel-title">
              <span>MY PROFILE</span>
              <ArrowUpRight size={16} />
            </div>

            <div className="activity">
              <i>01</i>
              <span>{fullName}</span>
              <small>Employee</small>
            </div>

            <div className="activity">
              <i>02</i>
              <span>{employee?.jobTitle || "Not specified"}</span>
              <small>Position</small>
            </div>

            <div className="activity">
              <i>03</i>
              <span>{employee?.department?.name || "Not assigned"}</span>
              <small>Department</small>
            </div>
          </section>

          <section className="dash-panel accent-panel">
            <div className="panel-title">
              <span>QUICK ACTION</span>
            </div>

            <h3>Keep your HR records current.</h3>

            <p>
              Review your attendance or submit a leave request.
            </p>

            <button className="primary-button" onClick={() => go("employee-leave")}>
              Continue
              <ArrowRight size={17} />
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
