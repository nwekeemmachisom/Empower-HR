import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  getEmployeeByUserId,
  updateEmployee,
} from "../services/employeeService.js";

export async function createEmployeeRecord(req, res) {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      departmentId,
      dateJoined,
    } = req.body;

    if (
      typeof email !== "string" ||
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      !email.trim() ||
      !firstName.trim() ||
      !lastName.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Email, first name and last name are required",
      });
    }

    if (
      password !== undefined &&
      password !== "" &&
      typeof password !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Password must be text",
      });
    }

    if (
      typeof password === "string" &&
      password.length > 0 &&
      password.length < 8
    ) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address",
      });
    }

    if (
      departmentId !== undefined &&
      departmentId !== null &&
      departmentId !== "" &&
      (!Number.isInteger(Number(departmentId)) ||
        Number(departmentId) < 1)
    ) {
      return res.status(400).json({
        success: false,
        message: "Department ID must be a positive integer",
      });
    }

    if (
      dateJoined &&
      (Number.isNaN(Date.parse(dateJoined)) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(dateJoined))
    ) {
      return res.status(400).json({
        success: false,
        message: "Date joined must use YYYY-MM-DD format",
      });
    }

    const employee = await createEmployee({
      ...req.body,
      departmentId:
        departmentId === "" ? null : departmentId,
    });

    return res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee,
    });
  } catch (error) {
    console.error("Create employee error:", error);

    if (error.statusCode === 409 || error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: error.message || "This account cannot be linked",
      });
    }

    if (error.code === "P2025" || error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "The selected department does not exist",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message || "Failed to create employee",
    });
  }
}

export async function listEmployees(req, res) {
  try {
    const employees = await getAllEmployees();

    return res.json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    console.error("List employees error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve employees",
    });
  }
}

export async function getEmployee(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID",
      });
    }

    const employee = await getEmployeeById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.json({ success: true, employee });
  } catch (error) {
    console.error("Get employee error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve employee",
    });
  }
}

export async function getMyEmployeeProfile(req, res) {
  try {
    const employee = await getEmployeeByUserId(req.user.userId);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Your employee profile has not been created yet",
      });
    }

    return res.json({ success: true, employee });
  } catch (error) {
    console.error("Get my profile error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to retrieve your profile",
    });
  }
}

export async function editEmployee(req, res) {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid employee ID",
      });
    }

    const { firstName, lastName, departmentId, dateJoined } = req.body;

    for (const [field, value] of Object.entries({
      firstName,
      lastName,
    })) {
      if (
        value !== undefined &&
        (typeof value !== "string" || !value.trim())
      ) {
        return res.status(400).json({
          success: false,
          message: `${field} must be a non-empty string`,
        });
      }
    }

    if (
      departmentId !== undefined &&
      departmentId !== null &&
      departmentId !== "" &&
      (!Number.isInteger(Number(departmentId)) ||
        Number(departmentId) < 1)
    ) {
      return res.status(400).json({
        success: false,
        message: "Department ID must be a positive integer",
      });
    }

    if (
      dateJoined &&
      (Number.isNaN(Date.parse(dateJoined)) ||
        !/^\d{4}-\d{2}-\d{2}$/.test(dateJoined))
    ) {
      return res.status(400).json({
        success: false,
        message: "Date joined must use YYYY-MM-DD format",
      });
    }

    const employee = await updateEmployee(id, {
      ...req.body,
      departmentId:
        departmentId === "" ? null : departmentId,
    });

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    return res.json({
      success: true,
      message: "Employee updated successfully",
      employee,
    });
  } catch (error) {
    console.error("Update employee error:", error);

    if (error.code === "P2025" || error.code === "P2003") {
      return res.status(400).json({
        success: false,
        message: "The selected department does not exist",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update employee",
    });
  }
}
