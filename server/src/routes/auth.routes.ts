import { Router } from "express";
import { Login, LoginWithGoogle } from "../controllers/auth.controller";
import { AuthMiddleware, AuthProfile } from "../middleware/auth";

const router = Router();

router.post("/login", Login);
router.post("/auth/google", LoginWithGoogle);

router.get("/auth/profile", AuthMiddleware, AuthProfile);

export default router;
