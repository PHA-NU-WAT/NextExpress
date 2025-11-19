import { Router } from "express";
import {
  FetchConfig,
  AssignConfig,
  CancelConfig,
  EditConfig,
  AssignConfigMaxAddCr2,
  EditConfigMaxAddCr2,
  CancelConfigMaxAddCr2,
  ToggleOpenEnroll,
  FetchManageSubjects,
  ToggleOpenSubject,
  FetchManageSections,
  FetchManageSectionsTeachers
} from "../controllers/enroll.controller";
import { AuthMiddleware } from "../middleware/auth";

const router = Router();

router.get("/config/fetch", AuthMiddleware, FetchConfig);
router.post("/config/assign", AuthMiddleware, AssignConfig);
router.post("/config/cancel", AuthMiddleware, CancelConfig);
router.post("/config/edit", AuthMiddleware, EditConfig);

router.post("/config/assign/maxaAddCr2", AuthMiddleware, AssignConfigMaxAddCr2);
router.post("/config/edit/maxaAddCr2", AuthMiddleware, EditConfigMaxAddCr2);
router.post("/config/cancel/maxaAddCr2", AuthMiddleware, CancelConfigMaxAddCr2);

router.post("/config/open/enroll", AuthMiddleware, ToggleOpenEnroll);

router.get("/manage/subjects/fetch", AuthMiddleware, FetchManageSubjects);
router.post("/manage/open/subject", AuthMiddleware, ToggleOpenSubject);
router.get("/manage/section/fetch", AuthMiddleware, FetchManageSections);
router.get("/manage/sectionTeacher/fetch", AuthMiddleware, FetchManageSectionsTeachers);

export default router;
