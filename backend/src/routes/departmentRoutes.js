import { Router } from "express";
import {
  createDepartmentRecord,
  listDepartments,
  getDepartment,
  editDepartment,
  removeDepartment,
} from "../controllers/departmentController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = Router();

router.use(authenticate, authorize("ADMIN"));

router.post("/", createDepartmentRecord);
router.get("/", listDepartments);
router.get("/:id", getDepartment);
router.put("/:id", editDepartment);
router.delete("/:id", removeDepartment);

export default router;
