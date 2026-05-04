import express from "express";
import { verifyToken, authorize } from "../middleware/auth.js";
import {
  getMyConsents,
  getGrantedConsents,
  grantConsent,
  revokeConsent,
  checkConsent,
  getAllConsents,
} from "../controllers/consentController.js";

const router = express.Router();

// Patient: Get my consents
router.get("/my", verifyToken, authorize("patient"), getMyConsents);

// Patient: Grant consent
router.post("/", verifyToken, authorize("patient"), grantConsent);

// Patient: Revoke consent
router.delete("/:consentId", verifyToken, authorize("patient"), revokeConsent);

// Doctor/Diagnostic Center: Get consents granted to me
router.get("/granted-to-me", verifyToken, authorize("doctor", "diagnostic_center"), getGrantedConsents);

// Doctor: Check if patient has granted consent
router.get("/check", verifyToken, authorize("doctor", "diagnostic_center"), checkConsent);

// Admin: Get all consents
router.get("/all", verifyToken, authorize("admin"), getAllConsents);

export default router;