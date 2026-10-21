import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Building2,
  Pencil,
  Trash2,
  X,
  Loader2,
  BarChart3,
  Users,
  Clock3,
  CalendarDays,
  FileText,
} from "lucide-react";

import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../services/departmentService";

export default function AdminDepartments({ go }) {
  const token = localStorage.getItem("hrms_token");

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");

  async function loadDepartments() {
    try {
      setLoading(true);
      setError("");

      const result = await getDepartments(token);

      setDepartments(result.data || result.departments || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDepartments();
  }, []);

  function openCreate() {
    setEditing(null);
    setName("");
    setError("");
    setShowForm(true);
  }

  function openEdit(department) {
    setEditing(department);
    setName(department.name);
    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!name.trim()) {
      setError("Department name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editing) {
        await updateDepartment(token, editing.id, name.trim());
      } else {
        await createDepartment(token, name.trim());
      }

      setShowForm(false);
      setEditing(null);
      setName("");

      await loadDepartments();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(department) {
    const confirmed = window.confirm(
      `Delete "${department.name}"?`
    );

    if (!confirmed) return;

    try {
      setError("");

      await deleteDepartment(token, department.id);

      await loadDepartments();
    } catch (err) {
      setError(err.message);
    }
  }

  const filteredDepartments = departments.filter((department) =>
    department.name
      .toLowerCase()
      .includes(search.toLowerCase())
  );

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
          id="mobile-menu-admindepartments"
          aria-label="Toggle dashboard navigation"
        />
        <label className="dash-mobile-menu" htmlFor="mobile-menu-admindepartments">
          <span className="dash-menu-icon" aria-hidden="true">☰</span>
          <span>Menu</span>
        </label>
        <nav>
          <button
            className="dash-nav"
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

          <button className="dash-nav active">
            <Building2 />
            Departments
          </button>

          <button className="dash-nav" onClick={() => go("admin-attendance")}>
            <Clock3 />
            Attendance
          </button>

          <button className="dash-nav" onClick={() => go("admin-leaves")}>
            <CalendarDays />
            Leave
          </button>

          <button className="dash-nav" onClick={() => go("admin-documents")}>
            <FileText />
            Documents
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
            <button
              className="employees-back"
              onClick={() => go("admin-dashboard")}
            >
              <ArrowLeft size={16} />
              Dashboard
            </button>

            <div className="section-label">ORGANISATION</div>

            <h1>Departments</h1>

            <p>
              Organise employees into departments and teams.
            </p>
          </div>

          <button
            className="employee-add-button"
            onClick={openCreate}
          >
            <Plus size={18} />
            Add department
          </button>
        </div>

        <div className="employee-summary">
          <div className="employee-summary-icon">
            <Building2 size={22} />
          </div>

          <div>
            <strong>{departments.length}</strong>
            <span>Total departments</span>
          </div>

          <div className="employee-summary-divider" />

          <div>
            <strong>
              {departments.reduce(
                (total, department) =>
                  total + (department._count?.employees || 0),
                0
              )}
            </strong>

            <span>Assigned employees</span>
          </div>
        </div>

        <section className="employees-section">
          <div className="employees-section-header">
            <div>
              <h2>Department directory</h2>

              <p>
                {filteredDepartments.length} department
                {filteredDepartments.length !== 1
                  ? "s"
                  : ""}{" "}
                shown
              </p>
            </div>

            <div className="employee-search">
              <Search size={17} />

              <input
                placeholder="Search departments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="employee-loading">
              <Loader2 className="spin" size={28} />
              <span>Loading departments...</span>
            </div>
          ) : error && !showForm ? (
            <div className="employee-error">{error}</div>
          ) : filteredDepartments.length === 0 ? (
            <div className="employee-empty">
              <Building2 size={42} />

              <h3>No departments found</h3>

              <p>
                Create a department to organise your employees.
              </p>

              <button
                className="employee-add-button"
                onClick={openCreate}
              >
                <Plus size={17} />
                Add department
              </button>
            </div>
          ) : (
            <div className="department-grid">
              {filteredDepartments.map((department) => (
                <div
                  className="department-card"
                  key={department.id}
                >
                  <div className="department-card-top">
                    <div className="department-icon">
                      <Building2 size={20} />
                    </div>

                    <div className="department-actions">
                      <button
                        onClick={() => openEdit(department)}
                        title="Edit department"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        onClick={() => handleDelete(department)}
                        title="Delete department"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <h3>{department.name}</h3>

                  <div className="department-count">
                    <Users size={15} />

                    <span>
                      {department._count?.employees || 0} employee
                      {department._count?.employees === 1
                        ? ""
                        : "s"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {showForm && (
        <div className="employee-modal-overlay">
          <div className="employee-modal-card department-modal">
            <div className="employee-modal-header">
              <div>
                <span className="section-label">
                  ORGANISATION
                </span>

                <h2>
                  {editing
                    ? "Edit department"
                    : "Add department"}
                </h2>

                <p>
                  {editing
                    ? "Update the department name."
                    : "Create a new department."}
                </p>
              </div>

              <button
                className="employee-modal-close"
                onClick={() => setShowForm(false)}
              >
                <X size={20} />
              </button>
            </div>

            {error && (
              <div className="employee-error">
                {error}
              </div>
            )}

            <form
              className="employee-form"
              onSubmit={handleSubmit}
            >
              <label>
                Department name

                <input
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  placeholder="e.g. Human Resources"
                  autoFocus
                />
              </label>

              <div className="employee-form-actions">
                <button
                  type="button"
                  className="employee-cancel"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="employee-save"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editing
                    ? "Save changes"
                    : "Create department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
