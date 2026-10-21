import React, { useEffect, useState } from "react";
import {
  Clock3, RefreshCw, Loader2, Users, Building2,
  CalendarDays, FileText, BarChart3, Save,
} from "lucide-react";
import { apiRequest } from "../services/api";

const today = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export default function AdminAttendance({ go }) {
  const [employees, setEmployees] = useState([]);
  const [records, setRecords] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [date, setDate] = useState(today());
  const [status, setStatus] = useState("PRESENT");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function tokenOrRedirect() {
    const token = localStorage.getItem("hrms_token");
    if (!token) go("admin");
    return token;
  }

  function unwrapList(result, key) {
    if (Array.isArray(result)) return result;
    if (Array.isArray(result?.[key])) return result[key];
    if (Array.isArray(result?.data)) return result.data;
    if (Array.isArray(result?.data?.[key])) return result.data[key];
    return [];
  }

  async function loadData() {
    const token = tokenOrRedirect();
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    setNotice("");

    try {
      const [attendanceResult, employeeResult] = await Promise.all([
        apiRequest("/api/attendance", { token }),
        apiRequest("/api/employees", { token }),
      ]);

      setRecords(unwrapList(attendanceResult, "attendance"));
      setEmployees(unwrapList(employeeResult, "employees"));
    } catch (err) {
      setError(err.message || "Could not load attendance data.");
      if (/token|authorization|unauthorized/i.test(err.message || "")) {
        localStorage.removeItem("hrms_token");
        localStorage.removeItem("hrms_user");
        go("admin");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function employeeName(employee) {
    if (!employee) return "Unknown employee";
    const name = [employee.firstName, employee.lastName].filter(Boolean).join(" ");
    return name || employee.user?.name || `Employee #${employee.id}`;
  }

  function formatTime(value) {
    if (!value) return "—";
    return new Date(value).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (!employeeId || !date) {
      setError("Please select an employee and attendance date.");
      return;
    }

    if (checkIn && checkOut && checkOut < checkIn) {
      setError("Check-out time cannot be earlier than check-in time.");
      return;
    }

    const token = tokenOrRedirect();
    if (!token) return;

    setSaving(true);

    try {
      const payload = {
        employeeId: Number(employeeId),
        date,
        status,
        checkIn: checkIn ? `${date}T${checkIn}:00` : null,
        checkOut: checkOut ? `${date}T${checkOut}:00` : null,
      };

      await apiRequest("/api/attendance", {
        method: "POST",
        token,
        body: payload,
      });

      setNotice("Attendance saved successfully.");
      await loadData();
    } catch (err) {
      setError(err.message || "Could not save attendance.");
    } finally {
      setSaving(false);
    }
  }

  function signOut() {
    localStorage.removeItem("hrms_token");
    localStorage.removeItem("hrms_user");
    go("home");
  }

  return (
    <div className="dashboard-page">
      <aside className="dash-sidebar">
        <div className="dash-logo"><span>✦</span> Empower HR</div>
        <div className="dash-role">HR / ADMIN</div>

        <input
          className="dash-menu-toggle"
          type="checkbox"
          id="mobile-menu-adminattendance"
          aria-label="Toggle dashboard navigation"
        />
        <label className="dash-mobile-menu" htmlFor="mobile-menu-adminattendance">
          <span className="dash-menu-icon" aria-hidden="true">☰</span>
          <span>Menu</span>
        </label>
        <nav>
          <button className="dash-nav" onClick={() => go("admin-dashboard")}><BarChart3 /> Dashboard</button>
          <button className="dash-nav" onClick={() => go("admin-employees")}><Users /> Employees</button>
          <button className="dash-nav" onClick={() => go("admin-departments")}><Building2 /> Departments</button>
          <button className="dash-nav active" onClick={() => go("admin-attendance")}><Clock3 /> Attendance</button>
          <button className="dash-nav" onClick={() => go("admin-leaves")}><CalendarDays /> Leave</button>
          <button className="dash-nav" onClick={() => go("admin-documents")}><FileText /> Documents</button>
        </nav>

        <button className="logout" onClick={signOut}>← Sign out</button>
      </aside>

      <main className="dash-main">
        <div className="dash-top">
          <div>
            <div className="section-label">WORKFORCE MANAGEMENT</div>
            <h1>Attendance</h1>
            <p>Record daily attendance and review employee history.</p>
          </div>
          <button className="employee-edit" onClick={loadData} disabled={loading}>
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        {error && <div className="login-error">{error}</div>}
        {notice && <div className="documents-notice">{notice}</div>}

        <section className="dash-panel documents-panel">
          <div className="panel-title"><span>RECORD ATTENDANCE</span></div>

          <form className="documents-form" onSubmit={handleSubmit}>
            <label>
              Employee
              <select value={employeeId} onChange={(e) => setEmployeeId(e.target.value)} required>
                <option value="">Select an employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employeeName(employee)}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Attendance date
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
            </label>

            <label>
              Attendance status
              <select value={status} onChange={(e) => setStatus(e.target.value)} required>
                <option value="PRESENT">Present</option>
                <option value="LATE">Late</option>
                <option value="ABSENT">Absent</option>
              </select>
            </label>

            <div className="attendance-time-grid">
              <label>
                Check-in time
                <input type="time" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
              </label>
              <label>
                Check-out time
                <input type="time" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
              </label>
            </div>

            <p className="attendance-help">
              Saving attendance for an employee and date updates that day's record instead of creating a duplicate.
            </p>

            <button className="documents-submit" type="submit" disabled={saving || employees.length === 0}>
              {saving ? <Loader2 className="spin" size={17} /> : <Save size={17} />}
              {saving ? "Saving attendance..." : "Save attendance"}
            </button>

            {!loading && employees.length === 0 && (
              <p className="attendance-help">No employees were returned. Check that employee profiles have been created.</p>
            )}
          </form>
        </section>

        <section className="dash-panel documents-panel">
          <div className="panel-title">
            <span>ATTENDANCE HISTORY</span>
            <span>{records.length} record{records.length === 1 ? "" : "s"}</span>
          </div>

          {loading ? (
            <div className="dashboard-loading">
              <Loader2 className="spin" size={27} />
              <p>Loading attendance records...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="documents-empty">
              <Clock3 size={40} />
              <h3>No attendance records yet</h3>
              <p>Use the form above to record an employee's attendance.</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Date</th>
                    <th>Check in</th>
                    <th>Check out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => (
                    <tr key={record.id}>
                      <td>{employeeName(record.employee)}</td>
                      <td>{record.date ? new Date(record.date).toLocaleDateString() : "—"}</td>
                      <td>{formatTime(record.checkIn)}</td>
                      <td>{formatTime(record.checkOut)}</td>
                      <td><span className={`attendance-status status-${String(record.status || "").toLowerCase()}`}>{record.status || "—"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
