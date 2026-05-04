import { Router } from "express";
import userRouter from "./userRoutes.js";
import authRouter from "./authRoutes.js";
import patientRouter from "./patientRoutes.js";
import consentRouter from "./consentRoutes.js";
import diagnosisRouter from "./diagnosisRoutes.js";
import prescriptionRouter from "./prescriptionRoutes.js";

const router = Router()
router.use("/user", userRouter)
router.use("/auth", authRouter)
router.use("/patients", patientRouter)
router.use("/consents", consentRouter)
router.use("/diagnoses", diagnosisRouter)
router.use("/prescriptions", prescriptionRouter)

export default router