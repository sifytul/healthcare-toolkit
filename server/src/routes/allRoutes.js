import { Router } from "express";
import userRouter from "./userRoutes.js";
import authRouter from "./authRoutes.js";
import patientRouter from "./patientRoutes.js";

const router = Router()
router.use("/user", userRouter)
router.use("/auth", authRouter)
router.use("/patients", patientRouter)

export default router