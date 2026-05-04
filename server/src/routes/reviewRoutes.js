import { Router } from "express";
import {
  createReview,
  getAllReviews,
  getReviewById,
  getPatientReviews,
  updateReviewStatus,
  addComment,
  deleteReview,
  getMyPendingReviews,
} from "../controllers/reviewController.js";
import { verifyToken, authorize } from "../middleware/auth.js";

const router = Router();

// All review routes require authentication
router.use(verifyToken);

// Create review request - doctor
router.post("/", authorize("doctor"), createReview);

// Get all reviews - doctor, admin
router.get("/", authorize("doctor", "admin"), getAllReviews);

// Get my pending reviews - doctor
router.get("/my-pending", authorize("doctor"), getMyPendingReviews);

// Get reviews for a specific patient
router.get("/patient/:patientId", getPatientReviews);

// Get single review
router.get("/:id", getReviewById);

// Update review status (approve/reject/revision)
router.put("/:id/status", authorize("doctor"), updateReviewStatus);

// Add comment to review
router.post("/:id/comments", authorize("doctor", "admin"), addComment);

// Delete review (soft delete)
router.delete("/:id", authorize("doctor", "admin"), deleteReview);

export default router;