import { Router } from "express";
import userRouter from "./userRoutes.js";
import authRouter from "./authRoutes.js";
import patientRouter from "./patientRoutes.js";
import consentRouter from "./consentRoutes.js";
import diagnosisRouter from "./diagnosisRoutes.js";
import prescriptionRouter from "./prescriptionRoutes.js";
import reportRouter from "./reportRoutes.js";
import antibiogramRouter from "./antibiogramRoutes.js";
import reviewRouter from "./reviewRoutes.js";

const router = Router()
router.use("/user", userRouter)
router.use("/auth", authRouter)
router.use("/patients", patientRouter)
router.use("/consents", consentRouter)
router.use("/diagnoses", diagnosisRouter)
router.use("/prescriptions", prescriptionRouter)
router.use("/reports", reportRouter)
router.use("/antibiograms", antibiogramRouter)
router.use("/reviews", reviewRouter)

export default router