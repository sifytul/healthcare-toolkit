import { Router } from "express";
import {
  createAntibiogram,
  getAllAntibiograms,
  getByMicroorganism,
  getByRegion,
  getAnalytics,
  getTrendsOverTime,
  getByDisease,
} from "../controllers/antibiogramController.js";
import { verifyToken, authorize } from "../middleware/auth.js";

const router = Router();

// All antibiogram routes require authentication
router.use(verifyToken);

// Create antibiogram - doctor, diagnostic_center
router.post("/", authorize("doctor", "diagnostic_center"), createAntibiogram);

// Get all antibiograms - doctor, diagnostic_center, admin
router.get("/", authorize("doctor", "diagnostic_center", "admin"), getAllAntibiograms);

// Get analytics for charts - doctor, diagnostic_center, admin
router.get("/analytics", authorize("doctor", "diagnostic_center", "admin"), getAnalytics);

// Get sensitivity by microorganism
router.get("/by-microorganism/:microorganism", getByMicroorganism);

// Get sensitivity by region
router.get("/by-region/:region", getByRegion);

// Get trends over time
router.get("/trends", getTrendsOverTime);

// Get sensitivity by disease (placeholder for future integration)
router.get("/by-disease/:diseaseCode", getByDisease);

export default router;