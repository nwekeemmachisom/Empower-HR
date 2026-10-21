import { Router } from "express";
import { getCurrentUser } from "../controllers/userController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/me", authenticate, getCurrentUser);

export default router;
