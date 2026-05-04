import { Router } from "express";
import {
  createReport,
  getAllReports,
  getReportById,
  getPatientReports,
  updateReport,
  deleteReport,
  downloadReport,
} from "../controllers/reportController.js";
import { verifyToken, authorize } from "../middleware/auth.js";

const router = Router();

// All report routes require authentication
router.use(verifyToken);

// Create report - doctor, diagnostic_center
router.post("/", authorize("doctor", "diagnostic_center"), createReport);

// Get all reports - doctor, admin
router.get("/", authorize("doctor", "admin"), getAllReports);

// Get reports for a specific patient - authorized users (doctor, patient, diagnostic_center)
router.get("/patient/:patientId", getPatientReports);

// Get single report
router.get("/:id", getReportById);

// Update report
router.put("/:id", authorize("doctor", "diagnostic_center"), updateReport);

// Delete report (soft delete)
router.delete("/:id", authorize("doctor", "diagnostic_center", "admin"), deleteReport);

// Download report - get file URL
router.get("/:id/download", downloadReport);

export default router;