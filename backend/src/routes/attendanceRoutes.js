import { Router } from "express";
import { listAttendance, saveAttendance } from "../controllers/attendanceController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = Router();

router.use(authenticate);
router.get("/", listAttendance);
router.post("/", authorize("ADMIN"), saveAttendance);

export default router;
