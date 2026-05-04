import express from "express";
import {
  createPrescription,
  getPatientPrescriptions,
  getPrescriptionById,
  updatePrescription,
  getActivePrescriptions,
  getAllPrescriptions,
} from "../controllers/prescriptionController.js";
import { verifyToken, authorize } from "../middleware/auth.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// Create prescription
router.post("/", authorize("doctor"), createPrescription);

// Get all prescriptions (for doctor/admin)
router.get("/all", authorize("doctor", "admin"), getAllPrescriptions);

// Get active prescriptions for a patient
router.get("/patient/:patientId/active", getActivePrescriptions);

// Get prescriptions for a patient
router.get("/patient/:patientId", authorize("doctor", "patient", "admin"), getPatientPrescriptions);

// Get single prescription
router.get("/:id", getPrescriptionById);

// Update prescription (stop, cancel)
router.put("/:id", authorize("doctor"), updatePrescription);

export default router;