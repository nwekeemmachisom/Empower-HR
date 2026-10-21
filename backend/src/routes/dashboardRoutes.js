import { Router } from "express";
import { dashboardStats } from "../controllers/dashboardController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.use(authenticate);
router.get("/stats", dashboardStats);

export default router;
