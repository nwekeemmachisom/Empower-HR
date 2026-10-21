import React, { useEffect, useState } from "react";
import { testBackend } from "../services/api";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileText,
  Users,
  CalendarDays,
  ShieldCheck,
  BarChart3,
} from "lucide-react";

const features = [
  [
    "People",
    "Keep employee records, departments and roles organised in one place.",
    Users,
  ],
  [
    "Attendance",
    "Track working hours, attendance and daily workforce activity.",
    Clock3,
  ],
  [
    "Leave",
    "Make leave requests and approvals simple, visible and accountable.",
    CalendarDays,
  ],
  [
    "Documents",
    "Keep important employee documents organised and accessible.",
    FileText,
  ],
];

function Header({ go }) {
  return (
    <header className="site-header">
      <a className="brand" href="#top">
        <span className="brand-mark">✦</span>
        Empower HR
      </a>

      <nav className="nav-links">
        <a href="#system">System</a>
        <a href="#features">Features</a>
        <a href="#about">About</a>

        <button onClick={() => go("employee")}>
          Employee / Admin portal
          <ArrowUpRight size={16} />
        </button>
      </nav>
    </header>
  );
}

export default function Landing({ go }) {
  const [backendStatus, setBackendStatus] = useState("Checking backend...");

  useEffect(() => {
    testBackend()
      .then((data) => {
        setBackendStatus(data.message);
      })
      .catch(() => {
        setBackendStatus("Backend connection failed");
      });
  }, []);

  return (
    <div className="landing" id="top">
      <Header go={go} />

      <main>
        {/* HERO */}
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="live-dot" />
              PEOPLE OPERATIONS · NIGERIA
            </div>

            <h1>
              People.
              <br />
              <em>Organised.</em>
              <br />
              Progressing.
            </h1>

            <p>
              A modern human resource management system for organisations that
              want their people, processes and information moving in one
              direction.
            </p>

            <div className="hero-actions">
              <button
                className="primary-button"
                onClick={() => go("employee")}
              >
                Employee portal
                <ArrowRight size={18} />
              </button>

              <button
                className="secondary-button"
                onClick={() => go("admin")}
              >
                Admin / HR portal
                <ArrowUpRight size={18} />
              </button>
            </div>

            {/* TEMPORARY BACKEND CONNECTION TEST */}
            <div
              style={{
                marginTop: "20px",
                fontSize: "12px",
                opacity: 0.7,
              }}
            >
              Backend: {backendStatus}
            </div>
          </div>

          <div className="hero-visual">
            <div className="orb orb-green" />
            <div className="orb orb-gold" />

            <div className="dashboard-card">
              <div className="card-top">
                <span>WORKFORCE / TODAY</span>
                <span className="status-pill">LIVE</span>
              </div>

              <div className="big-number">248</div>

              <div className="muted">Employees in the system</div>

              <div className="mini-chart">
                {[34, 48, 43, 67, 57, 79, 91].map((h, i) => (
                  <span key={i} style={{ height: `${h}%` }} />
                ))}
              </div>

              <div className="card-stats">
                <div>
                  <strong>94%</strong>
                  <span>Present</span>
                </div>

                <div>
                  <strong>18</strong>
                  <span>On leave</span>
                </div>

                <div>
                  <strong>07</strong>
                  <span>Pending</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WORKFORCE STRIP */}
        <section className="signal-strip">
          <div>01 / THE WORKFORCE</div>
          <strong>One system. Every employee signal.</strong>
          <div>Built for teams that want clarity.</div>
        </section>

        {/* SYSTEM */}
        <section className="system-section" id="system">
          <div className="section-label">02 / THE SYSTEM</div>

          <div className="section-heading">
            <h2>
              Everything your people need.
              <br />
              <span>Nothing they don't.</span>
            </h2>

            <p>
              From employee records and departments to everyday attendance,
              leave and documents, Empower HR keeps important HR information
              connected.
            </p>
          </div>

          <div className="feature-grid" id="features">
            {features.map(([title, text, Icon], i) => (
              <article className="feature-card" key={title}>
                <div className="feature-icon">
                  <Icon size={22} />
                </div>

                <div className="feature-number">0{i + 1}</div>

                <h3>{title}</h3>

                <p>{text}</p>

                <span className="feature-arrow">
                  <ArrowUpRight size={18} />
                </span>
              </article>
            ))}
          </div>
        </section>

        {/* DASHBOARD PREVIEW */}
        <section className="insight-section">
          <div className="insight-panel">
            <div className="section-label">03 / THE DASHBOARD</div>

            <h2>See what your organisation is telling you.</h2>

            <p>
              Turn everyday HR activity into a clear view of employees,
              attendance, leave and workforce activity.
            </p>

            <div className="check-list">
              <div>
                <CheckCircle2 /> Central employee records
              </div>

              <div>
                <CheckCircle2 /> Role-based employee and admin access
              </div>

              <div>
                <CheckCircle2 /> Clear HR activity and reporting
              </div>
            </div>
          </div>

          <div className="insight-graphic">
            <div className="graphic-header">
              <span>HR SIGNAL / MONTHLY</span>
              <BarChart3 size={18} />
            </div>

            <div className="bars">
              {[55, 72, 48, 86, 68, 92, 77, 98].map((h, i) => (
                <i key={i} style={{ height: `${h}%` }} />
              ))}
            </div>

            <div className="graphic-footer">
              {["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG"].map(
                (x) => (
                  <span key={x}>{x}</span>
                )
              )}
            </div>
          </div>
        </section>

        {/* PORTALS */}
        <section className="portal-section" id="about">
          <div>
            <div className="section-label">04 / ENTER THE PORTAL</div>

            <h2>
              Your organisation.
              <br />
              Your account.
            </h2>

            <p>
              Choose the workspace that matches your role. Employees manage
              their personal HR activity while HR and administrators manage the
              wider organisation.
            </p>
          </div>

          <div className="portal-cards">
            <button
              className="portal-card employee"
              onClick={() => go("employee")}
            >
              <div>
                <span>EMPLOYEE</span>
                <Users size={24} />
              </div>

              <strong>Employee portal</strong>

              <small>Attendance, leave, documents & profile</small>

              <ArrowRight />
            </button>

            <button
              className="portal-card admin"
              onClick={() => go("admin")}
            >
              <div>
                <span>HR / ADMIN</span>
                <ShieldCheck size={24} />
              </div>

              <strong>Admin portal</strong>

              <small>People, departments, approvals & reports</small>

              <ArrowRight />
            </button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="brand">
          <span className="brand-mark">✦</span>
          Empower HR
        </div>

        <span>Human Resource Management System</span>

        <span>© 2026 / Built for modern teams</span>
      </footer>
    </div>
  );
}
