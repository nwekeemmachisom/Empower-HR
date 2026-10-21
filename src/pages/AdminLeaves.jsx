import React, { useCallback, useEffect, useState } from "react";
import { getLeaves, reviewLeave } from "../services/leaveService";

export default function AdminLeaves({ go }) {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("hrms_token");

  const loadLeaves = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const result = await getLeaves(token);
      setLeaves(result.data || result.leaves || []);
    } catch (err) {
      setError(err.message || "Could not load leave requests.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadLeaves();
  }, [loadLeaves]);

  async function decide(id, status) {
    const action = status === "APPROVED" ? "approve" : "reject";

    if (!window.confirm(`Are you sure you want to ${action} this leave request?`)) {
      return;
    }

    setBusyId(id);
    setError("");
    setMessage("");

    try {
      await reviewLeave(token, id, status);
      setMessage(`Leave request ${action}d successfully.`);
      await loadLeaves();
    } catch (err) {
      setError(err.message || `Could not ${action} the request.`);
    } finally {
      setBusyId(null);
    }
  }

  const buttonStyle = {
    border: "none",
    borderRadius: "7px",
    padding: "9px 13px",
    fontWeight: 600,
    cursor: "pointer",
    color: "#fff",
    marginRight: "7px",
    marginBottom: "5px",
  };

  return (
    <main style={{ padding: "28px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", flexWrap: "wrap", gap: "12px",
        marginBottom: "24px"
      }}>
        <div>
          <h1 style={{ marginBottom: "6px" }}>Leave Management</h1>
          <p style={{ color: "#64748b", margin: 0 }}>
            Review employee leave requests and record your decision.
          </p>
        </div>
        <button
          onClick={loadLeaves}
          disabled={loading}
          style={{ ...buttonStyle, background: "#334155" }}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {message && (
        <p style={{ background: "#dcfce7", color: "#166534", padding: "12px", borderRadius: "8px" }}>
          {message}
        </p>
      )}

      {error && (
        <p style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px" }}>
          {error}
        </p>
      )}

      {loading ? (
        <p>Loading leave requests...</p>
      ) : leaves.length === 0 ? (
        <section style={{ padding: "35px 20px", textAlign: "center", background: "#f8fafc", borderRadius: "12px" }}>
          <h3>No leave requests yet</h3>
          <p>New employee requests will appear here.</p>
        </section>
      ) : (
        <div style={{ overflowX: "auto", background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "850px" }}>
            <thead>
              <tr style={{ background: "#f1f5f9", textAlign: "left" }}>
                {["Employee", "Leave type", "Start date", "End date", "Reason", "Status", "Action"].map((heading) => (
                  <th key={heading} style={{ padding: "14px 12px", borderBottom: "1px solid #e2e8f0" }}>
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => {
                const employee = leave.employee || {};
                const employeeName =
                  `${employee.firstName || ""} ${employee.lastName || ""}`.trim() ||
                  employee.name ||
                  "Employee";

                const status = String(leave.status || "PENDING").toUpperCase();
                const pending = status === "PENDING";

                return (
                  <tr key={leave.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                    <td style={{ padding: "14px 12px" }}>{employeeName}</td>
                    <td style={{ padding: "14px 12px" }}>{leave.leaveType || "—"}</td>
                    <td style={{ padding: "14px 12px" }}>
                      {leave.startDate ? new Date(leave.startDate).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      {leave.endDate ? new Date(leave.endDate).toLocaleDateString() : "—"}
                    </td>
                    <td style={{ padding: "14px 12px", maxWidth: "200px" }}>
                      {leave.reason || "—"}
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      <span style={{
                        display: "inline-block",
                        padding: "5px 9px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: 700,
                        background: status === "APPROVED" ? "#dcfce7" : status === "REJECTED" ? "#fee2e2" : "#fef3c7",
                        color: status === "APPROVED" ? "#166534" : status === "REJECTED" ? "#991b1b" : "#92400e"
                      }}>
                        {status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      {pending ? (
                        <>
                          <button
                            disabled={busyId === leave.id}
                            onClick={() => decide(leave.id, "APPROVED")}
                            style={{ ...buttonStyle, background: "#15803d", opacity: busyId === leave.id ? 0.6 : 1 }}
                          >
                            {busyId === leave.id ? "Saving..." : "Approve"}
                          </button>
                          <button
                            disabled={busyId === leave.id}
                            onClick={() => decide(leave.id, "REJECTED")}
                            style={{ ...buttonStyle, background: "#b91c1c", opacity: busyId === leave.id ? 0.6 : 1 }}
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span style={{ color: "#64748b", fontSize: "13px" }}>
                          Decision recorded
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <button
        onClick={() => go("admin-dashboard")}
        style={{ ...buttonStyle, background: "#475569", marginTop: "22px" }}
      >
        Back to Dashboard
      </button>
    </main>
  );
}
