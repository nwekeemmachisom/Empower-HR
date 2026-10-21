import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  FileText,
  ExternalLink,
  RefreshCw,
  Loader2,
  Trash2,
  Plus,
  Users,
  Building2,
  CalendarDays,
  BarChart3,
  Clock3,
} from "lucide-react";
import { getDocuments, addDocument, deleteDocument } from "../services/documentService";
import { apiRequest } from "../services/api";

export default function AdminDocuments({ go }) {
  const [documents, setDocuments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [name, setName] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [employeesError, setEmployeesError] = useState("");
  const [documentsError, setDocumentsError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [notice, setNotice] = useState("");
  const [formError, setFormError] = useState("");

  function getToken() {
    const token = localStorage.getItem("hrms_token");
    if (!token) go("admin");
    return token;
  }

  async function loadData({ preserveNotice = false } = {}) {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setDocumentsError("");
    setEmployeesError("");
    if (!preserveNotice) setNotice("");

    const results = await Promise.allSettled([
      getDocuments(token),
      apiRequest("/api/employees", { token }),
    ]);

    const docsResult = results[0];
    const employeesResult = results[1];

    if (docsResult.status === "fulfilled") {
      const data = docsResult.value;
      setDocuments(
        Array.isArray(data) ? data :
        data.documents || data.data?.documents || []
      );
    } else {
      setDocumentsError(
        docsResult.reason?.message || "Could not load documents."
      );
    }

    if (employeesResult.status === "fulfilled") {
      const data = employeesResult.value;
      setEmployees(
        Array.isArray(data) ? data :
        data.employees || data.data?.employees || []
      );
    } else {
      setEmployeesError(
        employeesResult.reason?.message || "Could not load employees."
      );
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    setNotice("");

    if (!employeeId || !name.trim() || !fileUrl.trim()) {
      setFormError("Select an employee and enter a document name and URL.");
      return;
    }

    try {
      const parsedUrl = new URL(fileUrl.trim());
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        throw new Error("Use a valid link beginning with http:// or https://.");
      }
    } catch {
      setFormError("Enter a valid document URL beginning with https:// or http://.");
      return;
    }

    const token = getToken();
    if (!token) return;

    setSaving(true);

    try {
      await addDocument(token, {
        employeeId: Number(employeeId),
        name: name.trim(),
        fileUrl: fileUrl.trim(),
      });

      setName("");
      setFileUrl("");
      setEmployeeId("");
      await loadData({ preserveNotice: true });
      setNotice("Document added successfully.");
    } catch (err) {
      setFormError(err.message || "Could not add the document.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(doc) {
    if (!window.confirm(`Delete "${doc.name}"? This cannot be undone.`)) return;

    const token = getToken();
    if (!token) return;

    setDeletingId(doc.id);
    setDocumentsError("");
    setNotice("");

    try {
      await deleteDocument(token, doc.id);
      setDocuments((current) => current.filter((item) => item.id !== doc.id));
      setNotice("Document deleted successfully.");
    } catch (err) {
      setDocumentsError(err.message || "Could not delete the document.");
    } finally {
      setDeletingId(null);
    }
  }

  function signOut() {
    localStorage.removeItem("hrms_token");
    localStorage.removeItem("hrms_user");
    go("home");
  }

  function employeeName(employee) {
    if (!employee) return "Employee";
    const fullName = [employee.firstName, employee.lastName].filter(Boolean).join(" ");
    return fullName || employee.user?.name || employee.email || `Employee #${employee.id}`;
  }

  return (
    <div className="dashboard-page">
      <aside className="dash-sidebar">
        <div className="dash-logo"><span>✦</span> Empower HR</div>
        <div className="dash-role">HR / ADMIN</div>

        <input
          className="dash-menu-toggle"
          type="checkbox"
          id="mobile-menu-admindocuments"
          aria-label="Toggle dashboard navigation"
        />
        <label className="dash-mobile-menu" htmlFor="mobile-menu-admindocuments">
          <span className="dash-menu-icon" aria-hidden="true">☰</span>
          <span>Menu</span>
        </label>
        <nav>
          <button className="dash-nav" onClick={() => go("admin-dashboard")}>
            <BarChart3 /> Dashboard
          </button>
          <button className="dash-nav" onClick={() => go("admin-employees")}>
            <Users /> Employees
          </button>
          <button className="dash-nav" onClick={() => go("admin-departments")}>
            <Building2 /> Departments
          </button>
          <button className="dash-nav" onClick={() => go("admin-attendance")}>
            <Clock3 /> Attendance
          </button>
          <button className="dash-nav" onClick={() => go("admin-leaves")}>
            <CalendarDays /> Leave
          </button>
          <button className="dash-nav active" onClick={() => go("admin-documents")}>
            <FileText /> Documents
          </button>
        </nav>

        <button className="logout" onClick={signOut}>← Sign out</button>
      </aside>

      <main className="dash-main">
        <div className="dash-top">
          <div>
            <div className="section-label">ADMINISTRATION</div>
            <h1>Employee Documents</h1>
            <p>Share document links with employees and manage existing records.</p>
          </div>

          <button
            className="employee-edit"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        {notice && <div className="documents-notice">{notice}</div>}

        <section className="dash-panel documents-panel">
          <div className="panel-title">
            <span><Plus size={17} /> SHARE A DOCUMENT</span>
          </div>

          <form className="documents-form documents-share-form" onSubmit={handleSubmit}>
            <div className="documents-fields-grid">
              <label>
                <span>Employee <span className="documents-required">*</span></span>
                <select
                  value={employeeId}
                  onChange={(event) => setEmployeeId(event.target.value)}
                  required
                >
                  <option value="">Choose an employee</option>
                  {employees.map((employee) => (
                    <option key={employee.id} value={employee.id}>
                      {employeeName(employee)}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Document name <span className="documents-required">*</span></span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Employee Handbook"
                  required
                />
              </label>
            </div>

            {employeesError && (
              <div className="documents-error">
                Could not load the employee list: {employeesError}
              </div>
            )}

            <label className="documents-url-field">
              <span>Document URL <span className="documents-required">*</span></span>
              <input
                type="url"
                value={fileUrl}
                onChange={(event) => setFileUrl(event.target.value)}
                placeholder="https://example.com/employee-handbook.pdf"
                required
              />
              <small>Paste a link to a file hosted somewhere your employee can access.</small>
            </label>

            {formError && <div className="documents-error">{formError}</div>}

            <div className="documents-form-footer">
              <p>Only share documents intended for the selected employee.</p>
              <button
                className="documents-submit"
                type="submit"
                disabled={saving || employees.length === 0}
              >
                {saving ? <Loader2 className="spin" size={17} /> : <Plus size={17} />}
                {saving ? "Sharing document..." : "Share document"}
              </button>
            </div>
          </form>
        </section>

        <section className="dash-panel documents-panel">
          <div className="panel-title">
            <span>DOCUMENT LIBRARY</span>
            <span>{documents.length} document{documents.length === 1 ? "" : "s"}</span>
          </div>

          {loading ? (
            <div className="dashboard-loading">
              <Loader2 className="spin" size={28} />
              <p>Loading document records...</p>
            </div>
          ) : documentsError ? (
            <div className="documents-message documents-error">
              <p>{documentsError}</p>
              <button className="employee-edit" onClick={loadData}>Try again</button>
            </div>
          ) : documents.length === 0 ? (
            <div className="documents-empty">
              <FileText size={42} />
              <h3>No documents have been added</h3>
              <p>Use the form above to share the first document with an employee.</p>
            </div>
          ) : (
            <div className="documents-list">
              {documents.map((doc) => (
                <article className="documents-item" key={doc.id}>
                  <div className="documents-file-icon"><FileText size={23} /></div>

                  <div className="documents-file-details">
                    <strong>{doc.name}</strong>
                    <span>For: {employeeName(doc.employee)}</span>
                    <span>
                      Added {doc.createdAt
                        ? new Date(doc.createdAt).toLocaleDateString()
                        : "date unavailable"}
                    </span>
                  </div>

                  <div className="documents-actions">
                    <a
                      className="documents-open"
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open <ExternalLink size={15} />
                    </a>

                    <button
                      className="documents-delete"
                      onClick={() => handleDelete(doc)}
                      disabled={deletingId === doc.id}
                      aria-label={`Delete ${doc.name}`}
                    >
                      {deletingId === doc.id
                        ? <Loader2 className="spin" size={16} />
                        : <Trash2 size={16} />}
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <button className="documents-back" onClick={() => go("admin-dashboard")}>
          <ArrowLeft size={16} /> Back to dashboard
        </button>
      </main>
    </div>
  );
}
