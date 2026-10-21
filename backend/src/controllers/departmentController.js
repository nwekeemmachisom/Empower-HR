import {
  createDepartment,
  getAllDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
} from "../services/departmentService.js";

function validId(id) {
  return /^\d+$/.test(id) && Number(id) > 0;
}

function handleError(res, error) {
  if (error.code === "P2002") {
    return res.status(409).json({
      success: false,
      message: "A department with this name already exists",
    });
  }

  if (error.code === "P2025") {
    return res.status(404).json({
      success: false,
      message: "Department not found",
    });
  }

  console.error("Department error:", error.message);

  return res.status(500).json({
    success: false,
    message: "An unexpected error occurred",
  });
}

export async function createDepartmentRecord(req, res) {
  const { name } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Department name is required",
    });
  }

  try {
    const department = await createDepartment(name);
    return res.status(201).json({ success: true, department });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function listDepartments(req, res) {
  try {
    const departments = await getAllDepartments();
    return res.status(200).json({ success: true, departments });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function getDepartment(req, res) {
  if (!validId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid department ID",
    });
  }

  try {
    const department = await getDepartmentById(req.params.id);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    return res.status(200).json({ success: true, department });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function editDepartment(req, res) {
  if (!validId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid department ID",
    });
  }

  const { name } = req.body;

  if (typeof name !== "string" || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Department name is required",
    });
  }

  try {
    const department = await updateDepartment(req.params.id, name);
    return res.status(200).json({ success: true, department });
  } catch (error) {
    return handleError(res, error);
  }
}

export async function removeDepartment(req, res) {
  if (!validId(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid department ID",
    });
  }

  try {
    const result = await deleteDepartment(req.params.id);

    if (result.notFound) {
      return res.status(404).json({
        success: false,
        message: "Department not found",
      });
    }

    if (result.hasEmployees) {
      return res.status(409).json({
        success: false,
        message: "Cannot delete a department that has employees",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Department deleted successfully",
    });
  } catch (error) {
    return handleError(res, error);
  }
}
