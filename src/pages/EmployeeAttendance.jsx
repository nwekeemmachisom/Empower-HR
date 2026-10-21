import React, { useEffect, useState } from "react";
import { Clock3, RefreshCw } from "lucide-react";
import { apiRequest } from "../services/api";

export default function EmployeeAttendance({ go }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadAttendance() {
    const token = localStorage.getItem("hrms_token");
    if (!token) {
      go("employee");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await apiRequest("/api/attendance", { token });
      setRecords(result.data || result.attendance || result.records || []);
    } catch (err) {
      setError(err.message || "Could not load attendance.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAttendance(); }, []);

  return (
    <div className="dashboard-page">
      <aside className="dash-sidebar">
        <div className="dash-logo"><span>✦</span> Empower HR</div>
        <div className="dash-role">EMPLOYEE PORTAL</div>
        <input
          className="dash-menu-toggle"
          type="checkbox"
          id="mobile-menu-employeeattendance"
          aria-label="Toggle dashboard navigation"
        />
        <label className="dash-mobile-menu" htmlFor="mobile-menu-employeeattendance">
          <span className="dash-menu-icon" aria-hidden="true">☰</span>
          <span>Menu</span>
        </label>
        <nav>
          <button className="dash-nav" onClick={() => go("employee-dashboard")}>Dashboard</button>
          <button className="dash-nav" onClick={() => go("employee-profile")}>My profile</button>
          <button className="dash-nav active"><Clock3 /> Attendance</button>
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
          <div><div className="section-label">TIME & ATTENDANCE</div><h1>My attendance</h1><p>Attendance records saved for your employee account.</p></div>
          <div className="avatar"><Clock3 /></div>
        </div>

        <section className="dash-panel" style={{ marginTop: 24 }}>
          <div className="panel-title"><span>ATTENDANCE HISTORY</span><button className="employee-edit" onClick={loadAttendance}><RefreshCw size={14}/> Refresh</button></div>
          {error && <div className="login-error">{error}</div>}
          {loading ? <p style={{ padding: 20 }}>Loading attendance records...</p> :
            records.length === 0 ? <div className="activity"><span>No attendance records have been recorded for you yet.</span></div> :
            <div style={{ overflowX: "auto" }}>
              <table className="employee-table">
                <thead><tr><th>Date</th><th>Check in</th><th>Check out</th><th>Status</th></tr></thead>
                <tbody>{records.map((record) => (
                  <tr key={record.id}>
                    <td>{record.date ? new Date(record.date).toLocaleDateString() : "—"}</td>
                    <td>{record.checkIn ? new Date(record.checkIn).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                    <td>{record.checkOut ? new Date(record.checkOut).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "—"}</td>
                    <td>{record.status || "—"}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          }
        </section>
      </main>
    </div>
  );
}
