import { Router } from "express";
import {
  createLeave,
  listLeaves,
  decideLeave,
} from "../controllers/leaveController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = Router();

router.use(authenticate);
router.get("/", listLeaves);
router.post("/", authorize("EMPLOYEE"), createLeave);
router.patch("/:id/status", authorize("ADMIN"), decideLeave);

export default router;
