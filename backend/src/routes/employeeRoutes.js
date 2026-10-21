import { Router } from "express";
import {
  createEmployeeRecord,
  listEmployees,
  getEmployee,
  getMyEmployeeProfile,
  editEmployee,
} from "../controllers/employeeController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = Router();

// Every route requires a valid login.
router.use(authenticate);

// Employees can view their own profile.
router.get("/me", getMyEmployeeProfile);

// Only administrators can manage employee records.
router.post("/", authorize("ADMIN"), createEmployeeRecord);
router.get("/", authorize("ADMIN"), listEmployees);
router.get("/:id", authorize("ADMIN"), getEmployee);
router.put("/:id", authorize("ADMIN"), editEmployee);

export default router;
