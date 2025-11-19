import { Router } from "express";
import {
  StudentPromotion,
  ClassroomAssign,
  CancelClassroomAssign,
  SeatNoAssign,
  CancelSeatNoAssign,
  DeleteStudent
} from "../controllers/classroom.controller";
import { AuthMiddleware } from "../middleware/auth";

const router = Router();

router.post("/assign", AuthMiddleware, ClassroomAssign);
router.post("/cancel", AuthMiddleware, CancelClassroomAssign);
router.post("/seat/assign", AuthMiddleware, SeatNoAssign);
router.post("/seat/cancel", AuthMiddleware, CancelSeatNoAssign);
router.post("/promotion", AuthMiddleware, StudentPromotion);
router.post("/delete", AuthMiddleware, DeleteStudent);

export default router;
