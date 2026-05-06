import { Router } from "express";
import {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  addVisit,
  addRelationship,
  addMedication,
  endVisit,
  getPatientTimeline,
  searchPatients,
} from "../controllers/patientController.js";
import { verifyToken, authorize } from "../middleware/auth.js";

const router = Router();

// All patient routes require authentication
// Doctors, diagnostic centers, and admins can manage patients
router.use(verifyToken);
router.use(authorize("doctor", "diagnostic_center", "admin"));

// CRUD operations
router.post("/", createPatient);
router.get("/", getAllPatients);
router.get("/search", searchPatients);
router.get("/:id", getPatientById);
router.put("/:id", updatePatient);
router.delete("/:id", deletePatient);

// Visit management
router.post("/:id/visits", addVisit);
router.put("/:id/visits/end", endVisit);

// Relationship management
router.post("/:id/relationships", addRelationship);

// Medication management
router.post("/:id/medications", addMedication);

// Timeline (combined visits, diagnoses, prescriptions)
router.get("/:id/timeline", getPatientTimeline);

export default router;