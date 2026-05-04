import Review from "../models/reviewModel.js";
import Diagnosis from "../models/diagnosisModel.js";

// Create a new review request
export const createReview = async (req, res) => {
  try {
    const { diagnosis, patient, reviewLevel, priority, requestNotes, reviewerIds } = req.body;

    // Verify diagnosis exists
    const existingDiagnosis = await Diagnosis.findById(diagnosis);
    if (!existingDiagnosis) {
      return res.status(404).json({ message: "Diagnosis not found" });
    }

    // Build reviewers array if provided
    let reviewers = [];
    if (reviewerIds && reviewerIds.length > 0) {
      reviewers = reviewerIds.map(userId => ({
        user: userId,
        level: reviewLevel || "general_physician",
        status: "pending",
      }));
    }

    const review = await Review.create({
      diagnosis,
      patient,
      reviewLevel: reviewLevel || "general_physician",
      priority: priority || "routine",
      requestNotes,
      reviewers,
      requestedBy: req.user.id,
      status: "pending",
    });

    // Update diagnosis status to indicate review requested
    await Diagnosis.findByIdAndUpdate(diagnosis, { status: "under_review" });

    res.status(201).json({
      success: true,
      message: "Review request created successfully",
      data: { review },
    });
  } catch (error) {
    console.error("CreateReview error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Get all reviews with filters
export const getAllReviews = async (req, res) => {
  try {
    const { status, priority, reviewLevel, page = 1, limit = 10 } = req.query;

    let query = { isDeleted: false };

    if (status) {
      query.status = status;
    }

    if (priority) {
      query.priority = priority;
    }

    if (reviewLevel) {
      query.reviewLevel = reviewLevel;
    }

    const skip = (page - 1) * limit;

    const reviews = await Review.find(query)
      .populate("diagnosis", "icdCode description")
      .populate("patient", "patientId firstName lastName")
      .populate("requestedBy", "fullName")
      .populate("reviewers.user", "fullName specialty")
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error("GetAllReviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get review by ID
export const getReviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id)
      .populate("diagnosis", "icdCode description severity notes")
      .populate("patient", "patientId firstName lastName phone email")
      .populate("requestedBy", "fullName specialty")
      .populate("reviewers.user", "fullName specialty");

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.isDeleted) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({
      success: true,
      data: { review },
    });
  } catch (error) {
    console.error("GetReviewById error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get reviews for a specific patient
export const getPatientReviews = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status, page = 1, limit = 10 } = req.query;

    let query = { patient: patientId, isDeleted: false };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const reviews = await Review.find(query)
      .populate("diagnosis", "icdCode description")
      .populate("requestedBy", "fullName")
      .populate("reviewers.user", "fullName")
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments(query);

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error("GetPatientReviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update review status (approve/reject/request revision)
export const updateReviewStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, decisionNotes, nextReviewLevel } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.isDeleted) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Update status
    review.status = status;
    review.decisionNotes = decisionNotes;

    // Update reviewer's status
    const reviewerIndex = review.reviewers.findIndex(
      r => r.user.toString() === req.user.id
    );

    if (reviewerIndex !== -1) {
      review.reviewers[reviewerIndex].status = status === "approved" ? "approved" : "rejected";
      review.reviewers[reviewerIndex].reviewedAt = new Date();
    }

    // If moving to next level
    if (nextReviewLevel) {
      review.reviewLevel = nextReviewLevel;
      review.version += 1;
    }

    await review.save();

    // Update diagnosis status based on review decision
    if (status === "approved") {
      await Diagnosis.findByIdAndUpdate(review.diagnosis, { status: "confirmed" });
    } else if (status === "rejected") {
      await Diagnosis.findByIdAndUpdate(review.diagnosis, { status: "rejected" });
    } else if (status === "revision_requested") {
      await Diagnosis.findByIdAndUpdate(review.diagnosis, { status: "needs_revision" });
    }

    res.json({
      success: true,
      message: `Review ${status} successfully`,
      data: { review },
    });
  } catch (error) {
    console.error("UpdateReviewStatus error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Add comment to review
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    if (review.isDeleted) {
      return res.status(404).json({ message: "Review not found" });
    }

    review.comments = review.comments || [];
    review.comments.push({
      comment,
      author: req.user.id,
      authorName: req.user.fullName || req.user.name,
    });

    await review.save();

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: { comments: review.comments },
    });
  } catch (error) {
    console.error("AddComment error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Delete review (soft delete)
export const deleteReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    res.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("DeleteReview error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get reviews pending for current user
export const getMyPendingReviews = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    // Find reviews where current user is a reviewer with pending status
    const reviews = await Review.find({
      "reviewers.user": req.user.id,
      "reviewers.status": "pending",
      isDeleted: false,
      status: { $in: ["pending", "in_review"] },
    })
      .populate("diagnosis", "icdCode description")
      .populate("patient", "patientId firstName lastName")
      .populate("requestedBy", "fullName")
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Review.countDocuments({
      "reviewers.user": req.user.id,
      "reviewers.status": "pending",
      isDeleted: false,
    });

    res.json({
      success: true,
      data: {
        reviews,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error("GetMyPendingReviews error:", error);
    res.status(500).json({ message: "Server error" });
  }
};