import { Router } from "express";
import { login, register, me, logout, updateProfile, changePassword } from "../controllers/auth.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { refreshToken } from "../token/refreshToken.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", requireAuth, me);
router.put("/profile", requireAuth, updateProfile);
router.put("/change-password", requireAuth, changePassword);
router.post("/refresh-token", refreshToken); // TOKEN FOLDER: refreshToken.js - Refresh expired tokens
router.post("/logout", logout);

export default router;
