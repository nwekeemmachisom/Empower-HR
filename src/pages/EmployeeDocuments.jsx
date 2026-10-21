import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  FileText,
  ExternalLink,
  RefreshCw,
  Loader2,
  Clock3,
  CalendarDays,
  UserRound,
  BarChart3,
} from "lucide-react";
import { getDocuments } from "../services/documentService";

export default function EmployeeDocuments({ go }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDocuments() {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("hrms_token");
      if (!token) {
        go("employee");
        return;
      }

      const result = await getDocuments(token);
      setDocuments(
        Array.isArray(result) ? result :
        result.documents || result.data?.documents || []
      );
    } catch (err) {
      setError(err.message || "Could not load your documents.");

      if (/token|authorization|unauthorized/i.test(err.message || "")) {
        localStorage.removeItem("hrms_token");
        localStorage.removeItem("hrms_user");
        go("employee");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDocuments();
  }, []);

  function signOut() {
    localStorage.removeItem("hrms_token");
    localStorage.removeItem("hrms_user");
    go("home");
  }

  return (
    <div className="dashboard-page">
      <aside className="dash-sidebar">
        <div className="dash-logo"><span>✦</span> Empower HR</div>
        <div className="dash-role">EMPLOYEE</div>

        <input
          className="dash-menu-toggle"
          type="checkbox"
          id="mobile-menu-employeedocuments"
          aria-label="Toggle dashboard navigation"
        />
        <label className="dash-mobile-menu" htmlFor="mobile-menu-employeedocuments">
          <span className="dash-menu-icon" aria-hidden="true">☰</span>
          <span>Menu</span>
        </label>
        <nav>
          <button className="dash-nav" onClick={() => go("employee-dashboard")}>
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
          <button className="dash-nav active" onClick={() => go("employee-documents")}>
            <FileText /> Documents
          </button>
        </nav>

        <button className="logout" onClick={signOut}>← Sign out</button>
      </aside>

      <main className="dash-main">
        <div className="dash-top">
          <div>
            <div className="section-label">EMPLOYEE SPACE</div>
            <h1>My Documents</h1>
            <p>View and open documents shared with you by HR.</p>
          </div>

          <button
            className="employee-edit"
            onClick={loadDocuments}
            disabled={loading}
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>

        <section className="dash-panel documents-panel">
          <div className="panel-title">
            <span>MY DOCUMENT LIBRARY</span>
            <span>{documents.length} document{documents.length === 1 ? "" : "s"}</span>
          </div>

          {loading ? (
            <div className="dashboard-loading">
              <Loader2 className="spin" size={28} />
              <p>Loading your documents...</p>
            </div>
          ) : error ? (
            <div className="documents-message documents-error">
              <p>{error}</p>
              <button className="employee-edit" onClick={loadDocuments}>
                Try again
              </button>
            </div>
          ) : documents.length === 0 ? (
            <div className="documents-empty">
              <FileText size={42} />
              <h3>No documents yet</h3>
              <p>Your HR administrator has not shared any documents with you.</p>
            </div>
          ) : (
            <div className="documents-list">
              {documents.map((doc) => (
                <article className="documents-item" key={doc.id}>
                  <div className="documents-file-icon"><FileText size={23} /></div>
                  <div className="documents-file-details">
                    <strong>{doc.name}</strong>
                    <span>
                      Added {doc.createdAt
                        ? new Date(doc.createdAt).toLocaleDateString()
                        : "date unavailable"}
                    </span>
                  </div>
                  <a
                    className="documents-open"
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open <ExternalLink size={15} />
                  </a>
                </article>
              ))}
            </div>
          )}
        </section>

        <button className="documents-back" onClick={() => go("employee-dashboard")}>
          <ArrowLeft size={16} /> Back to dashboard
        </button>
      </main>
    </div>
  );
}
