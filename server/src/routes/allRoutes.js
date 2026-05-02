import { Router } from "express";
import userRouter from "./userRoutes.js";
import authRouter from "./authRoutes.js";

const router = Router()
router.use("/user", userRouter)
router.use("/auth", authRouter)

export default router