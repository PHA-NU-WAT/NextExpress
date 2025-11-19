import { Router } from "express";
import { FetchCurriculums, FetchSubjects, EditCurriculums } from "../controllers/curriculums.controller";
import { AuthMiddleware } from "../middleware/auth";

const router = Router();

router.get("/curriculums/fetch", AuthMiddleware, FetchCurriculums);
router.get("/subjects/fetch", AuthMiddleware, FetchSubjects);
router.post("/edit", AuthMiddleware, EditCurriculums);

export default router;
