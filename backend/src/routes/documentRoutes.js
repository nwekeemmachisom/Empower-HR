import { Router } from "express";
import {
  listDocuments,
  addDocument,
  removeDocument,
} from "../controllers/documentController.js";
import { authenticate } from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/roleMiddleware.js";

const router = Router();

router.use(authenticate);
router.get("/", listDocuments);
router.post("/", authorize("ADMIN"), addDocument);
router.delete("/:id", authorize("ADMIN"), removeDocument);

export default router;
