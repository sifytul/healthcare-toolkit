import { Router } from "express";
import { register, login, getMe, updateProfile, logout } from "../controllers/authController.js";
import { verifyToken, loadUser } from "../middleware/auth.js";

const router = Router();

// Public routes
router.post("/register", register);
router.post("/login", login);

// Protected routes
router.get("/me", verifyToken, loadUser, getMe);
router.put("/profile", verifyToken, loadUser, updateProfile);
router.post("/logout", verifyToken, logout);

export default router;