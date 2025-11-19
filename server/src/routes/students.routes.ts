import { Router } from "express";
import { FetchStudents, FetchStudentsPublic, EditStudent } from "../controllers/students.controller";
import { AuthMiddleware, Authorize } from "../middleware/auth";

const router = Router();

router.get(
  "/fetch",
  AuthMiddleware,
  Authorize({ roles: ["teacher", "school_admin"], permissions: ["manage_student"] }),
  FetchStudents
);

router.get("/public/fetch", FetchStudentsPublic);

router.post("/edit", AuthMiddleware, EditStudent);

export default router;
