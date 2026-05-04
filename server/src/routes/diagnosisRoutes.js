import express from "express";
import {
  createDiagnosis,
  getPatientDiagnoses,
  getDiagnosisById,
  updateDiagnosis,
  getAllDiagnoses,
  getICDCodes,
} from "../controllers/diagnosisController.js";
import { verifyToken, authorize } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// ICD codes lookup (public for authenticated users)
router.get("/icd-codes", getICDCodes);

// Create diagnosis
router.post("/", authorize("doctor"), createDiagnosis);

// Get all diagnoses (for doctor/admin)
router.get("/all", authorize("doctor", "admin"), getAllDiagnoses);

// Get diagnoses for a patient
router.get("/patient/:patientId", authorize("doctor", "patient", "admin"), getPatientDiagnoses);

// Get single diagnosis
router.get("/:id", getDiagnosisById);

// Update diagnosis
router.put("/:id", authorize("doctor"), updateDiagnosis);

export default router;