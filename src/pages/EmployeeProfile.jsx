import React, { useEffect, useState } from "react";
import { UserRound, RefreshCw } from "lucide-react";
import { apiRequest } from "../services/api";

export default function EmployeeProfile({ go }) {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProfile() {
    const token = localStorage.getItem("hrms_token");
    if (!token) {
      go("employee");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await apiRequest("/api/employees/me", { token });
      setEmployee(result.data || result.employee || result);
    } catch (err) {
      setError(err.message || "Could not load your profile.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadProfile(); }, []);

  return (
    <div className="dashboard-page">
      <aside className="dash-sidebar">
        <div className="dash-logo"><span>✦</span> Empower HR</div>
        <div className="dash-role">EMPLOYEE PORTAL</div>
        <input
          className="dash-menu-toggle"
          type="checkbox"
          id="mobile-menu-employeeprofile"
          aria-label="Toggle dashboard navigation"
        />
        <label className="dash-mobile-menu" htmlFor="mobile-menu-employeeprofile">
          <span className="dash-menu-icon" aria-hidden="true">☰</span>
          <span>Menu</span>
        </label>
        <nav>
          <button className="dash-nav" onClick={() => go("employee-dashboard")}>Dashboard</button>
          <button className="dash-nav active"><UserRound /> My profile</button>
          <button className="dash-nav" onClick={() => go("employee-attendance")}>Attendance</button>
          <button className="dash-nav" onClick={() => go("employee-leave")}>Leave</button>
          <button className="dash-nav" onClick={() => go("employee-documents")}>Documents</button>
        </nav>
        <button className="logout" onClick={() => {
          localStorage.removeItem("hrms_token");
          localStorage.removeItem("hrms_user");
          go("home");
        }}>← Sign out</button>
      </aside>

      <main className="dash-main">
        <div className="dash-top">
          <div><div className="section-label">MY INFORMATION</div><h1>My profile</h1><p>Your employee record as maintained by HR.</p></div>
          <div className="avatar">{employee?.firstName?.[0] || "E"}{employee?.lastName?.[0] || ""}</div>
        </div>
        <section className="dash-panel" style={{ marginTop: 24 }}>
          <div className="panel-title"><span>EMPLOYEE DETAILS</span><button className="employee-edit" onClick={loadProfile}><RefreshCw size={14}/> Refresh</button></div>
          {loading ? <p style={{ padding: 20 }}>Loading profile...</p> :
            error ? <div className="login-error">{error}</div> :
            !employee?.id ? <div className="activity"><span>Your employee profile has not been created yet. Please contact HR.</span></div> :
            <div style={{ padding: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 22 }}>
              {[
                ["First name", employee.firstName],
                ["Last name", employee.lastName],
                ["Email", employee.user?.email || employee.email],
                ["Job title", employee.jobTitle],
                ["Department", employee.department?.name],
                ["Phone", employee.phone],
                ["Date joined", employee.dateJoined ? new Date(employee.dateJoined).toLocaleDateString() : ""],
                ["Address", employee.address],
              ].map(([label, value]) => (
                <div key={label}>
                  <div className="section-label">{label}</div>
                  <div style={{ marginTop: 7, overflowWrap: "anywhere" }}>{value || "Not provided"}</div>
                </div>
              ))}
              <p style={{ gridColumn: "1 / -1", fontSize: 13, opacity: .7 }}>For changes to your official details, contact your HR administrator.</p>
            </div>
          }
        </section>
      </main>
    </div>
  );
}
