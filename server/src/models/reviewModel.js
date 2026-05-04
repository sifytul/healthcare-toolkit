import { Schema, model } from "mongoose";

const reviewCommentSchema = new Schema({
  comment: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  authorName: {
    type: String,
  },
}, {
  timestamps: true,
});

const reviewSchema = new Schema({
  diagnosis: {
    type: Schema.Types.ObjectId,
    ref: "Diagnosis",
    required: true,
  },
  patient: {
    type: Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  // Review workflow status
  status: {
    type: String,
    enum: ["pending", "in_review", "approved", "rejected", "revision_requested"],
    default: "pending",
  },
  // Current level of review (for multi-tier workflow)
  reviewLevel: {
    type: String,
    enum: ["general_physician", "specialist", "consultant", "final"],
    default: "general_physician",
  },
  // Reviewers at each level
  reviewers: [{
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    level: {
      type: String,
      enum: ["general_physician", "specialist", "consultant", "final"],
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    reviewedAt: Date,
  }],
  // Requester (who initiated the review)
  requestedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Priority of the review
  priority: {
    type: String,
    enum: ["routine", "urgent", "critical"],
    default: "routine",
  },
  // Notes/reason for review request
  requestNotes: {
    type: String,
  },
  // Final decision notes
  decisionNotes: {
    type: String,
  },
  // Version tracking
  version: {
    type: Number,
    default: 1,
  },
  // Soft delete
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Indexes
reviewSchema.index({ diagnosis: 1 });
reviewSchema.index({ patient: 1 });
reviewSchema.index({ status: 1 });
reviewSchema.index({ requestedBy: 1 });
reviewSchema.index({ createdAt: -1 });

const Review = model("Review", reviewSchema);

export default Review;