import React, { useState } from "react";

import Landing from "./pages/Landing";
import EmployeeLogin from "./pages/EmployeeLogin";
import EmployeeRegister from "./pages/EmployeeRegister";
import AdminLogin from "./pages/AdminLogin";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEmployees from "./pages/AdminEmployees";
import AdminDepartments from "./pages/AdminDepartments";
import AdminLeaves from "./pages/AdminLeaves";
import AdminAttendance from "./pages/AdminAttendance";
import EmployeeLeave from "./pages/EmployeeLeave";
import EmployeeProfile from "./pages/EmployeeProfile";
import EmployeeAttendance from "./pages/EmployeeAttendance";
import AdminDocuments from "./pages/AdminDocuments";
import EmployeeDocuments from "./pages/EmployeeDocuments";
import AdminManagement from "./pages/AdminManagement";

export default function App() {
  const path = window.location.pathname;

  const [page, setPage] = useState(() => {
    if (path === "/login/admin") return "admin";
    if (path === "/login/employee") return "employee";
    if (path === "/register/employee") return "employee-register";
    if (path === "/admin/employees") return "admin-employees";
    if (path === "/admin/departments") return "admin-departments";
    if (path === "/admin/leaves") return "admin-leaves";
    if (path === "/admin/attendance") return "admin-attendance";
    if (path === "/employee/leave") return "employee-leave";
    if (path === "/employee/profile") return "employee-profile";
    if (path === "/employee/attendance") return "employee-attendance";
    if (path === "/employee/documents") return "employee-documents";
    if (path === "/admin/documents") return "admin-documents";
    if (path === "/admin/management") return "admin-management";
    if (path === "/admin/dashboard") return "admin-dashboard";
    if (path === "/employee/dashboard") return "employee-dashboard";

    return "home";
  });

  const go = (next) => {
    const routes = {
      home: "/",
      employee: "/login/employee",
      "employee-register": "/register/employee",
      admin: "/login/admin",
      "employee-dashboard": "/employee/dashboard",
      "admin-dashboard": "/admin/dashboard",
      "admin-employees": "/admin/employees",
      "admin-departments": "/admin/departments",
      "admin-leaves": "/admin/leaves",
      "admin-attendance": "/admin/attendance",
      "employee-leave": "/employee/leave",
      "employee-profile": "/employee/profile",
      "employee-attendance": "/employee/attendance",
      "employee-documents": "/employee/documents",
      "admin-documents": "/admin/documents",
      "admin-management": "/admin/management",
    };

    const route = routes[next];

    if (!route) return;

    window.history.pushState({}, "", route);
    setPage(next);
    window.scrollTo(0, 0);
  };

  if (page === "home") return <Landing go={go} />;
  if (page === "employee") return <EmployeeLogin go={go} />;
  if (page === "employee-register") return <EmployeeRegister go={go} />;
  if (page === "admin") return <AdminLogin go={go} />;
  if (page === "employee-dashboard") {
    return <EmployeeDashboard go={go} />;
  }
  if (page === "admin-dashboard") {
    return <AdminDashboard go={go} />;
  }
  if (page === "admin-employees") {
    return <AdminEmployees go={go} />;
  }
  if (page === "admin-departments") {
    return <AdminDepartments go={go} />;
  }

  if (page === "admin-leaves") return <AdminLeaves go={go} />;
  if (page === "admin-attendance") return <AdminAttendance go={go} />;
  if (page === "employee-leave") return <EmployeeLeave go={go} />;
  if (page === "employee-profile") return <EmployeeProfile go={go} />;
  if (page === "employee-attendance") return <EmployeeAttendance go={go} />;
  if (page === "employee-documents") return <EmployeeDocuments go={go} />;
  if (page === "admin-documents") return <AdminDocuments go={go} />;
  if (page === "admin-management") return <AdminManagement go={go} />;

  return <Landing go={go} />;
}
