import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Search,
  Users,
  X,
  Pencil,
  Mail,
  Phone,
  Building2,
  CalendarDays,
  Loader2,
  BarChart3,
  Clock3,
  FileText,
  Filter,
} from "lucide-react";

import {
  getEmployees,
  createEmployee,
  updateEmployee,
} from "../services/employeeService";

export default function AdminEmployees({ go }) {
  const token = localStorage.getItem("hrms_token");

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewing, setViewing] = useState(null);

  const emptyForm = {
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    jobTitle: "",
    departmentId: "",
    dateJoined: "",
  };

  const [form, setForm] = useState(emptyForm);

  async function loadEmployees() {
    try {
      setLoading(true);
      setError("");

      const result = await getEmployees(token);
      setEmployees(result.data || result.employees || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadDepartments() {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/departments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();

      if (response.ok) {
        setDepartments(result.data || result.departments || []);
      }
    } catch {
      // Departments can be loaded later.
    }
  }

  useEffect(() => {
    loadEmployees();
    loadDepartments();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  }

  function openEdit(employee) {
    setEditing(employee);

    setForm({
      email: employee.user?.email || "",
      password: "",
      firstName: employee.firstName || "",
      lastName: employee.lastName || "",
      phone: employee.phone || "",
      address: employee.address || "",
      jobTitle: employee.jobTitle || "",
      departmentId: employee.departmentId
        ? String(employee.departmentId)
        : employee.department?.id
        ? String(employee.department.id)
        : "",
      dateJoined: employee.dateJoined
        ? employee.dateJoined.substring(0, 10)
        : "",
    });

    setError("");
    setShowForm(true);
  }

  function handleChange(e) {
    setForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSaving(true);
      setError("");

      const data = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone || undefined,
        address: form.address || undefined,
        jobTitle: form.jobTitle || undefined,
        departmentId: form.departmentId
          ? Number(form.departmentId)
          : undefined,
        dateJoined: form.dateJoined || undefined,
      };

      if (!editing) {
        data.email = form.email.trim();

        if (form.password.trim()) {
          data.password = form.password;
        }

        await createEmployee(token, data);
      } else {
        await updateEmployee(token, editing.id, data);
      }

      setShowForm(false);
      setEditing(null);
      setForm(emptyForm);

      await loadEmployees();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  const filteredEmployees = employees.filter((employee) => {
    const searchText = `
      ${employee.firstName || ""}
      ${employee.lastName || ""}
      ${employee.user?.email || ""}
      ${employee.jobTitle || ""}
      ${employee.department?.name || ""}
    `.toLowerCase();

    const matchesSearch = searchText.includes(search.toLowerCase());

    const matchesDepartment =
      !departmentFilter ||
      String(employee.department?.id || employee.departmentId || "") ===
        String(departmentFilter);

    return matchesSearch && matchesDepartment;
  });

  function clearFilters() {
    setSearch("");
    setDepartmentFilter("");
  }

  const hasFilters = search.trim() || departmentFilter;

  return (
    <div className="dashboard-page">
      {/* SIDEBAR */}
      <aside className="dash-sidebar">
        <div className="dash-logo">
          <span>✦</span> Empower HR
        </div>

        <div className="dash-role">HR / ADMIN</div>

        <input
          className="dash-menu-toggle"
          type="checkbox"
          id="mobile-menu-adminemployees"
          aria-label="Toggle dashboard navigation"
        />

        <label
          className="dash-mobile-menu"
          htmlFor="mobile-menu-adminemployees"
        >
          <span className="dash-menu-icon" aria-hidden="true">
            ☰
          </span>
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

          <button className="dash-nav active">
            <Users />
            Employees
          </button>

          <button
            className="dash-nav"
            onClick={() => go("admin-departments")}
          >
            <Building2 />
            Departments
          </button>

          <button
            className="dash-nav"
            onClick={() => go("admin-attendance")}
          >
            <Clock3 />
            Attendance
          </button>

          <button
            className="dash-nav"
            onClick={() => go("admin-leave")}
          >
            <CalendarDays />
            Leave
          </button>

          <button
            className="dash-nav"
            onClick={() => go("admin-documents")}
          >
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

      {/* MAIN */}
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

            <div className="section-label">WORKFORCE</div>

            <h1>Employees</h1>

            <p>
              Manage your organisation's people and employee profiles.
            </p>
          </div>

          <button
            className="employee-add-button"
            onClick={openCreate}
          >
            <Plus size={18} />
            Add employee
          </button>
        </div>

        {/* SUMMARY */}
        <div className="employee-summary">
          <div className="employee-summary-icon">
            <Users size={22} />
          </div>

          <div>
            <strong>{employees.length}</strong>
            <span>Total employees</span>
          </div>

          <div className="employee-summary-divider" />

          <div>
            <strong>{departments.length}</strong>
            <span>Departments</span>
          </div>
        </div>

        {/* EMPLOYEE LIST */}
        <section className="employees-section">
          <div className="employees-section-header">
            <div>
              <h2>Employee directory</h2>

              <p>
                {filteredEmployees.length} employee
                {filteredEmployees.length !== 1 ? "s" : ""} shown
              </p>
            </div>

            <div className="employee-filters">
              <div className="employee-search">
                <Search size={17} />

                <input
                  type="text"
                  placeholder="Search employees..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="employee-filter-select">
                <Filter size={16} />

                <select
                  value={departmentFilter}
                  onChange={(e) => setDepartmentFilter(e.target.value)}
                  aria-label="Filter by department"
                >
                  <option value="">All departments</option>

                  {departments.map((department) => (
                    <option
                      key={department.id}
                      value={department.id}
                    >
                      {department.name}
                    </option>
                  ))}
                </select>
              </div>

              {hasFilters && (
                <button
                  className="employee-clear-filter"
                  onClick={clearFilters}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="employee-loading">
              <Loader2 className="spin" size={28} />
              <span>Loading employees...</span>
            </div>
          ) : error ? (
            <div className="employee-error">
              {error}
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="employee-empty">
              <Users size={42} />

              <h3>No employees found</h3>

              <p>
                {hasFilters
                  ? "Try changing or clearing your filters."
                  : "Add your first employee to get started."}
              </p>

              {hasFilters ? (
                <button
                  className="employee-add-button"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              ) : (
                <button
                  className="employee-add-button"
                  onClick={openCreate}
                >
                  <Plus size={17} />
                  Add employee
                </button>
              )}
            </div>
          ) : (
            <div className="employee-table-wrapper">
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>EMPLOYEE</th>
                    <th>ROLE</th>
                    <th>DEPARTMENT</th>
                    <th>CONTACT</th>
                    <th>JOINED</th>
                    <th />
                  </tr>
                </thead>

                <tbody>
                  {filteredEmployees.map((employee) => {
                    const initials =
                      `${employee.firstName?.[0] || ""}${
                        employee.lastName?.[0] || ""
                      }`.toUpperCase();

                    return (
                      <tr key={employee.id}>
                        <td>
                          <div className="employee-person">
                            <div className="employee-avatar">
                              {initials}
                            </div>

                            <div>
                              <strong>
                                {employee.firstName}{" "}
                                {employee.lastName}
                              </strong>

                              <span>
                                {employee.user?.email ||
                                  "No email"}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="employee-role">
                            {employee.jobTitle || "Employee"}
                          </span>
                        </td>

                        <td>
                          <span className="department-badge">
                            {employee.department?.name ||
                              "Not assigned"}
                          </span>
                        </td>

                        <td>
                          <div className="employee-contact">
                            <span>
                              <Mail size={14} />
                              {employee.user?.email || "—"}
                            </span>

                            {employee.phone && (
                              <span>
                                <Phone size={14} />
                                {employee.phone}
                              </span>
                            )}
                          </div>
                        </td>

                        <td>
                          <span className="joined-date">
                            {employee.dateJoined
                              ? new Date(
                                  employee.dateJoined
                                ).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "—"}
                          </span>
                        </td>

                        <td>
                          <div className="employee-actions">
                            <button
                              className="employee-view-button"
                              onClick={() => setViewing(employee)}
                            >
                              View
                            </button>

                            <button
                              className="employee-edit"
                              onClick={() =>
                                openEdit(employee)
                              }
                            >
                              <Pencil size={15} />
                              Edit
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* VIEW EMPLOYEE PROFILE */}
      {viewing && (
        <div
          className="employee-view-overlay"
          onClick={() => setViewing(null)}
        >
          <div
            className="employee-view-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="employee-view-header">
              <div className="employee-view-profile">
                <div className="employee-view-avatar">
                  {`${viewing.firstName?.[0] || ""}${
                    viewing.lastName?.[0] || ""
                  }`.toUpperCase()}
                </div>

                <div>
                  <h2>
                    {viewing.firstName} {viewing.lastName}
                  </h2>

                  <p>
                    {viewing.jobTitle || "Employee"}
                  </p>
                </div>
              </div>

              <button
                className="employee-view-close"
                onClick={() => setViewing(null)}
                aria-label="Close employee profile"
              >
                <X size={19} />
              </button>
            </div>

            <div className="employee-view-body">
              <div className="employee-view-grid">
                <div className="employee-view-item">
                  <span className="employee-view-item-label">
                    Employee ID
                  </span>

                  <span className="employee-view-item-value">
                    #{viewing.id}
                  </span>
                </div>

                <div className="employee-view-item">
                  <span className="employee-view-item-label">
                    Department
                  </span>

                  <span className="employee-view-item-value">
                    {viewing.department?.name || "Not assigned"}
                  </span>
                </div>

                <div className="employee-view-item">
                  <span className="employee-view-item-label">
                    Email
                  </span>

                  <span className="employee-view-item-value">
                    {viewing.user?.email || "Not available"}
                  </span>
                </div>

                <div className="employee-view-item">
                  <span className="employee-view-item-label">
                    Phone
                  </span>

                  <span className="employee-view-item-value">
                    {viewing.phone || "Not provided"}
                  </span>
                </div>

                <div className="employee-view-item">
                  <span className="employee-view-item-label">
                    Date joined
                  </span>

                  <span className="employee-view-item-value">
                    {viewing.dateJoined
                      ? new Date(
                          viewing.dateJoined
                        ).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })
                      : "Not provided"}
                  </span>
                </div>

                <div className="employee-view-item">
                  <span className="employee-view-item-label">
                    Job title
                  </span>

                  <span className="employee-view-item-value">
                    {viewing.jobTitle || "Employee"}
                  </span>
                </div>

                <div className="employee-view-item full">
                  <span className="employee-view-item-label">
                    Address
                  </span>

                  <span className="employee-view-item-value">
                    {viewing.address || "Not provided"}
                  </span>
                </div>
              </div>

              <div className="employee-view-footer">
                <button
                  className="employee-view-done"
                  onClick={() => setViewing(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL */}
      {showForm && (
        <div className="employee-modal-overlay">
          <div className="employee-modal-card">
            <div className="employee-modal-header">
              <div>
                <span className="section-label">
                  {editing
                    ? "EMPLOYEE PROFILE"
                    : "NEW EMPLOYEE"}
                </span>

                <h2>
                  {editing
                    ? "Edit employee"
                    : "Add employee"}
                </h2>

                <p>
                  {editing
                    ? "Update this employee's information."
                    : "Link a registered account, or create a new account and profile. Leave the password blank for an account that already exists."}
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
              {!editing && (
                <div className="employee-form-grid">
                  <label>
                    Email
                    <input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="employee@example.com"
                      required
                    />
                  </label>

                  <label>
                    Password (new accounts only)
                    <input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Leave blank if already registered"
                      minLength="8"
                    />
                  </label>
                </div>
              )}

              <div className="employee-form-grid">
                <label>
                  First name
                  <input
                    name="firstName"
                    value={form.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                    required
                  />
                </label>

                <label>
                  Last name
                  <input
                    name="lastName"
                    value={form.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                    required
                  />
                </label>

                <label>
                  Job title
                  <input
                    name="jobTitle"
                    value={form.jobTitle}
                    onChange={handleChange}
                    placeholder="e.g. Software Developer"
                  />
                </label>

                <label>
                  Department
                  <select
                    name="departmentId"
                    value={form.departmentId}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select department
                    </option>

                    {departments.map((department) => (
                      <option
                        key={department.id}
                        value={department.id}
                      >
                        {department.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Phone
                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone number"
                  />
                </label>

                <label>
                  Date joined
                  <input
                    name="dateJoined"
                    type="date"
                    value={form.dateJoined}
                    onChange={handleChange}
                  />
                </label>
              </div>

              <label>
                Address
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Employee address"
                  rows="3"
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
                    : "Create employee"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
