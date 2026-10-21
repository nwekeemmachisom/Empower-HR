import React, { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  FileText,
  CalendarDays,
  Users,
  BarChart3,
  Building2,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { getDashboardStats } from "../services/api";
import { getDepartments } from "../services/departmentService";

export default function AdminDashboard({ go }) {
  const [stats, setStats] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("hrms_token");

    if (!token) {
      go("admin");
      return;
    }

    async function loadDashboard() {
      try {
        const result = await getDashboardStats(token);
        setStats(result.data || result.stats || result);

        try {
          const departmentResult = await getDepartments(token);
          setDepartments(
            departmentResult.data || departmentResult.departments || []
          );
        } catch (departmentError) {
          console.error("Could not load departments:", departmentError);
        }
      } catch (err) {
        setError(err.message);

        if (
          err.message.toLowerCase().includes("token") ||
          err.message.toLowerCase().includes("authorization")
        ) {
          localStorage.removeItem("hrms_token");
          localStorage.removeItem("hrms_user");
          go("admin");
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

  const recentLeaves = stats?.recentLeaves || [];

  return (
    <div className="dashboard-page">
      <aside className="dash-sidebar">
        <div className="dash-logo">
          <span>✦</span> Empower HR
        </div>

        <div className="dash-role">HR / ADMIN</div>

        <input
          className="dash-menu-toggle"
          type="checkbox"
          id="mobile-menu-admindashboard"
          aria-label="Toggle dashboard navigation"
        />
        <label className="dash-mobile-menu" htmlFor="mobile-menu-admindashboard">
          <span className="dash-menu-icon" aria-hidden="true">☰</span>
          <span>Menu</span>
        </label>
        <nav>
          <button
            className="dash-nav active"
            onClick={() => go("admin-dashboard")}
          >
            <BarChart3 />
            Dashboard
          </button>

          <button
            className="dash-nav"
            onClick={() => go("admin-employees")}
          >
            <Users />
            Employees
          </button>

          <button
            className="dash-nav"
            onClick={() => go("admin-departments")}
          >
            <Building2 />
            Departments
          </button>

          <button
            className="dash-nav"
            onClick={() => go("admin-attendance")}
          >
            <Clock3 />
            Attendance
          </button>

          <button
            className="dash-nav"
            onClick={() => {
              go("admin-leaves")
            }}
          >
            <CalendarDays />
            Leave
          </button>

          <button
            className="dash-nav"
            onClick={() => {
              go("admin-documents");
            }}
          >
            <FileText />
            Documents
          </button>
          <button
            className="dash-nav"
            onClick={() => go("admin-management")}
          >
            <ShieldCheck />
            Admin Management
          </button>

        </nav>

        <button className="logout" onClick={signOut}>
          ← Sign out
        </button>
      </aside>

      <main className="dash-main">
        <div className="dash-top">
          <div>
            <div className="section-label">ADMINISTRATION</div>
            <h1>Good morning, Admin.</h1>
          </div>

          <div className="avatar">AD</div>
        </div>

        <div className="dash-banner">
          <div>
            <span>WORKFORCE SIGNAL</span>
            <strong>Your organisation at a glance.</strong>
          </div>

          <ArrowUpRight />
        </div>

        {error && <div className="login-error">{error}</div>}

        <div className="stat-grid">
          <div className="dash-stat">
            <Users />
            <strong>{stats?.totalEmployees ?? 0}</strong>
            <span>Total employees</span>
          </div>

          <div className="dash-stat">
            <Building2 />
            <strong>{stats?.totalDepartments ?? 0}</strong>
            <span>Departments</span>
          </div>

          <div className="dash-stat">
            <Clock3 />
            <strong>{stats?.todayAttendance ?? 0}</strong>
            <span>Attendance today</span>
          </div>

          <div className="dash-stat">
            <CalendarDays />
            <strong>{stats?.pendingLeaves ?? 0}</strong>
            <span>Pending leave</span>
          </div>
        </div>

        <section className="dash-panel" style={{ marginBottom: 24 }}>
          <div className="panel-title">
            <span>DEPARTMENTS OVERVIEW</span>
            <button
              className="employee-edit"
              onClick={() => go("admin-departments")}
            >
              View all →
            </button>
          </div>

          {departments.length === 0 ? (
            <div className="activity">
              <span>No departments found.</span>
              <button
                className="employee-edit"
                onClick={() => go("admin-departments")}
              >
                Manage departments
              </button>
            </div>
          ) : (
            departments.map((department) => (
              <div className="activity" key={department.id}>
                <i>🏢</i>
                <span>{department.name}</span>
                <small>
                  {department._count?.employees ?? 0} employees
                </small>
              </div>
            ))
          )}
        </section>

        <div className="dash-content-grid">
          <section className="dash-panel">
            <div className="panel-title">
              <span>RECENT LEAVE REQUESTS</span>
              <ArrowUpRight size={16} />
            </div>

            {recentLeaves.length === 0 ? (
              <div className="activity">
                <span>No leave requests yet.</span>
              </div>
            ) : (
              recentLeaves.map((leave, index) => (
                <div className="activity" key={leave.id}>
                  <i>{String(index + 1).padStart(2, "0")}</i>

                  <span>
                    {leave.employee?.firstName}{" "}
                    {leave.employee?.lastName}
                    {" — "}
                    {leave.leaveType}
                  </span>

                  <small>{leave.status}</small>
                </div>
              ))
            )}

            {/* MANAGE_LEAVE_REQUESTS_BUTTON */}
            <button
              type="button"
              onClick={() => go("admin-leaves")}
              style={{
                marginTop: "18px",
                padding: "12px 18px",
                border: "none",
                borderRadius: "8px",
                background: "#1d4ed8",
                color: "#ffffff",
                fontWeight: 700,
                cursor: "pointer",
                width: "100%",
              }}
            >
              Manage Leave Requests →
            </button>
          </section>

          <section className="dash-panel accent-panel">
            <div className="panel-title">
              <span>QUICK ACTION</span>
            </div>

            <h3>Keep your people moving.</h3>

            <p>
              Review employees, attendance and pending leave requests.
            </p>

            <button
              className="primary-button"
              onClick={() => go("admin-employees")}
            >
              Manage Employees
              <ArrowRight size={17} />
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
