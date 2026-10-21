import { Router } from "express";
import {
  getCurrentUser,
  listAdmins,
  createAdmin,
  deleteAdmin,
} from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = Router();

router.get("/me", authenticate, getCurrentUser);

router.get("/admins", authenticate, authorize("ADMIN"), listAdmins);
router.post("/admins", authenticate, authorize("ADMIN"), createAdmin);
router.delete("/admins/:id", authenticate, authorize("ADMIN"), deleteAdmin);

export default router;
