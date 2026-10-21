import React, { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ShieldCheck, Users, UserPlus, Loader2, Trash2 } from "lucide-react";
import { getAdmins, createAdmin, deleteAdmin } from "../services/adminService";

export default function AdminManagement({ go }) {
  const token = localStorage.getItem("hrms_token");
  const [admins, setAdmins] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadAdmins = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await getAdmins(token);
      setAdmins(result.admins || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (!token) {
      go("admin");
      return;
    }
    loadAdmins();
  }, [token, go, loadAdmins]);

  async function handleDeleteAdmin(admin) {
    const confirmed = window.confirm(
      `Remove administrator account for ${admin.email}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      setSaving(true);
      const result = await deleteAdmin(token, admin.id);
      setMessage(result.message || "Administrator removed successfully.");
      await loadAdmins();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");

    try {
      setSaving(true);
      const result = await createAdmin(token, { email, password });
      setMessage(result.message || "Administrator created successfully.");
      setEmail("");
      setPassword("");
      await loadAdmins();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="dashboard-page">
      <aside className="dash-sidebar">
        <div className="dash-logo"><span>✦</span> Empower HR</div>
        <div className="dash-role">HR / ADMIN</div>
        <nav>
          <button className="dash-nav" onClick={() => go("admin-dashboard")}>
            <ArrowLeft size={18} /> Dashboard
          </button>
          <button className="dash-nav active">
            <ShieldCheck size={18} /> Admin Management
          </button>
        </nav>
        <button
          className="logout"
          onClick={() => {
            localStorage.removeItem("hrms_token");
            localStorage.removeItem("hrms_user");
            go("home");
          }}
        >
          ← Sign out
        </button>
      </aside>

      <main className="dash-main">
        <div className="employees-header">
          <div>
            <div className="section-label">ACCESS CONTROL</div>
            <h1>Admin Management</h1>
            <p>Create administrator accounts and review existing admins.</p>
          </div>
          <ShieldCheck size={34} />
        </div>

        {error && <div className="employee-error">{error}</div>}
        {message && (
          <div className="employee-summary" role="status">{message}</div>
        )}

        <section className="employees-section">
          <div className="employees-section-header">
            <div>
              <h2><UserPlus size={20} /> Create administrator</h2>
              <p>Only an existing administrator can create another admin.</p>
            </div>
          </div>

          <form className="employee-form" onSubmit={handleSubmit}>
            <div className="employee-form-grid">
              <label>
                Email address
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="admin@example.com"
                  autoComplete="email"
                  required
                />
              </label>
              <label>
                Temporary password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  minLength={8}
                  required
                />
              </label>
            </div>
            <p>Share the password securely with the new administrator and ask them to change it when possible.</p>
            <button className="employee-save" type="submit" disabled={saving}>
              {saving ? "Creating..." : "Create administrator"}
            </button>
          </form>
        </section>

        <section className="employees-section" style={{ marginTop: 24 }}>
          <div className="employees-section-header">
            <div>
              <h2><Users size={20} /> Existing administrators</h2>
              <p>{admins.length} administrator account{admins.length === 1 ? "" : "s"}</p>
            </div>
          </div>

          {loading ? (
            <div className="employee-loading">
              <Loader2 className="spin" size={26} /> Loading administrators...
            </div>
          ) : admins.length === 0 ? (
            <div className="employee-empty">No administrator accounts found.</div>
          ) : (
            <div className="employee-table-wrapper">
              <table className="employee-table">
                <thead>
                  <tr><th>EMAIL</th><th>ROLE</th><th>CREATED</th><th>ACTION</th></tr>
                </thead>
                <tbody>
                  {admins.map((admin) => (
                    <tr key={admin.id}>
                      <td>{admin.email}</td>
                      <td><span className="employee-role">{admin.role}</span></td>
                      <td>
                        {new Date(admin.createdAt).toLocaleDateString("en-GB", {
                          day: "2-digit", month: "short", year: "numeric",
                        })}
                      </td>
                      <td>
                        {admin.id === Number(JSON.parse(localStorage.getItem("hrms_user") || "{}").id) ? (
                          <span className="employee-role">CURRENT ADMIN</span>
                        ) : (
                          <button
                            type="button"
                            className="admin-remove-button"
                            onClick={() => handleDeleteAdmin(admin)}
                            disabled={saving}
                          >
                            <Trash2 size={15} />
                            Remove
                          </button>
                        )}
                      </td>
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
