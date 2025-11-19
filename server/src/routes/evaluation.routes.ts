import { Router } from "express";
import { FetchScore, SaveScore } from "../controllers/evaluation.controller";
import { AuthMiddleware } from "../middleware/auth";

const router = Router();

router.get("/score/fetch", AuthMiddleware, FetchScore);
router.post("/score/save", AuthMiddleware, SaveScore);

export default router;
