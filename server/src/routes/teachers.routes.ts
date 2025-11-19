import { Router } from "express";
import { FetchTeachers } from "../controllers/teachers.controller";
import { AuthMiddleware, Authorize } from "../middleware/auth";

const router = Router();

router.get(
  "/fetch",
  AuthMiddleware,
  Authorize({ roles: ["school_admin"], permissions: ["manage_teacher"] }),
  FetchTeachers
);

export default router;
