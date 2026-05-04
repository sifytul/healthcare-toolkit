import { Router } from "express";
import { register, login, getMe, updateProfile, logout, getSessions, revokeUserSession, revokeAllOtherSessions } from "../controllers/authController.js";
import { verifyToken, loadUser } from "../middleware/auth.js";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", verifyToken, loadUser, getMe);
router.put("/profile", verifyToken, loadUser, updateProfile);
router.post("/logout", verifyToken, logout);

// Session management
router.get("/sessions", verifyToken, getSessions);
router.delete("/sessions/:sessionId", verifyToken, revokeUserSession);
router.post("/sessions/revoke-all", verifyToken, revokeAllOtherSessions);

export default router;