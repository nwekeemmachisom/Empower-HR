import React, { useEffect, useState } from "react";
import { CalendarDays, ArrowLeft, Send, RefreshCw } from "lucide-react";
import { getLeaves, submitLeave } from "../services/leaveService";

export default function EmployeeLeave({ go }) {
  const [leaves, setLeaves] = useState([]);
  const [leaveType, setLeaveType] = useState("Annual Leave");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("hrms_token");

  async function loadLeaves() {
    if (!token) {
      go("employee");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await getLeaves(token);
      setLeaves(result.data || result.leaves || []);
    } catch (err) {
      setError(err.message || "Could not load your leave requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadLeaves();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    if (endDate < startDate) {
      setError("The end date must be on or after the start date.");
      return;
    }

    setSaving(true);

    try {
      await submitLeave(token, {
        leaveType,
        startDate,
        endDate,
        reason,
      });

      setMessage("Your leave request has been submitted.");
      setStartDate("");
      setEndDate("");
      setReason("");
      await loadLeaves();
    } catch (err) {
      setError(err.message || "Could not submit your request.");
    } finally {
      setSaving(false);
    }
  }

  function signOut() {
    localStorage.removeItem("hrms_token");
    localStorage.removeItem("hrms_user");
    go("home");
  }

  const statusStyle = (status) => ({
    display: "inline-block",
    padding: "5px 10px",
    borderRadius: 20,
    fontSize: 12,
    fontWeight: 700,
    color: status === "APPROVED" ? "#18794e" : status === "REJECTED" ? "#b42318" : "#9a6700",
    background: status === "APPROVED" ? "#dcfae6" : status === "REJECTED" ? "#fee4e2" : "#fef0c7",
  });

  return (
    <div className="dashboard-page">
      <aside className="dash-sidebar">
        <div className="dash-logo"><span>✦</span> Empower HR</div>
        <div className="dash-role">EMPLOYEE PORTAL</div>
        <input
          className="dash-menu-toggle"
          type="checkbox"
          id="mobile-menu-employeeleave"
          aria-label="Toggle dashboard navigation"
        />
        <label className="dash-mobile-menu" htmlFor="mobile-menu-employeeleave">
          <span className="dash-menu-icon" aria-hidden="true">☰</span>
          <span>Menu</span>
        </label>
        <nav>
          <button className="dash-nav" onClick={() => go("employee-dashboard")}>← Dashboard</button>
          <button className="dash-nav active"><CalendarDays /> Leave requests</button>
        </nav>
        <button className="logout" onClick={signOut}>← Sign out</button>
      </aside>

      <main className="dash-main">
        <div className="dash-top">
          <div>
            <div className="section-label">TIME OFF</div>
            <h1>Leave requests</h1>
            <p>Submit a request and track its approval status.</p>
          </div>
          <div className="avatar">HR</div>
        </div>

        {error && <div className="login-error">{error}</div>}
        {message && <div style={{ background: "#dcfae6", color: "#18794e", padding: 14, borderRadius: 8, marginBottom: 18 }}>{message}</div>}

        <div className="dash-content-grid employee-leave-grid">
          <section className="dash-panel">
            <div className="panel-title"><span>NEW REQUEST</span><CalendarDays size={18} /></div>
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16, paddingTop: 16 }}>
              <label>
                Leave type
                <select value={leaveType} onChange={(e) => setLeaveType(e.target.value)} required style={fieldStyle}>
                  <option>Annual Leave</option>
                  <option>Sick Leave</option>
                  <option>Personal Leave</option>
                  <option>Maternity Leave</option>
                  <option>Paternity Leave</option>
                  <option>Study Leave</option>
                  <option>Unpaid Leave</option>
                </select>
              </label>
              <label>
                Start date
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required style={fieldStyle} />
              </label>
              <label>
                End date
                <input type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} required style={fieldStyle} />
              </label>
              <label>
                Reason (optional)
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} maxLength={500} placeholder="Add a short explanation..." style={fieldStyle} />
              </label>
              <button className="primary-button" type="submit" disabled={saving}>
                <Send size={16} /> {saving ? "Submitting..." : "Submit request"}
              </button>
            </form>
          </section>

          <section className="dash-panel">
            <div className="panel-title">
              <span>MY REQUEST HISTORY</span>
              <button className="employee-edit" onClick={loadLeaves}><RefreshCw size={14} /> Refresh</button>
            </div>
            {loading ? <p style={{ padding: 18 }}>Loading your requests...</p> :
              leaves.length === 0 ? <div className="activity"><span>You haven't submitted any leave requests yet.</span></div> :
              leaves.map((leave) => (
                <div key={leave.id} className="activity" style={{ alignItems: "flex-start", gap: 12 }}>
                  <i><CalendarDays size={17} /></i>
                  <div style={{ flex: 1 }}>
                    <strong>{leave.leaveType}</strong>
                    <div style={{ fontSize: 12, opacity: .7, marginTop: 5 }}>
                      {new Date(leave.startDate).toLocaleDateString()} – {new Date(leave.endDate).toLocaleDateString()}
                    </div>
                    {leave.reason && <p style={{ fontSize: 13, margin: "6px 0 0" }}>{leave.reason}</p>}
                  </div>
                  <span style={statusStyle(leave.status)}>{leave.status || "PENDING"}</span>
                </div>
              ))
            }
          </section>
        </div>
      </main>
    </div>
  );
}

const fieldStyle = {
  display: "block",
  width: "100%",
  boxSizing: "border-box",
  marginTop: 7,
  padding: "11px 12px",
  border: "1px solid #ddd",
  borderRadius: 8,
  background: "#fff",
  font: "inherit",
};
