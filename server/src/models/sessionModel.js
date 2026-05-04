import { model, Schema } from "mongoose";

const sessionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  device: {
    type: String, // Device type (mobile, desktop, tablet)
  },
  browser: {
    type: String, // Browser name
  },
  os: {
    type: String, // Operating system
  },
  ipAddress: {
    type: String,
  },
  location: {
    city: String,
    country: String,
  },
  userAgent: {
    type: String,
  },
  isCurrentSession: {
    type: Boolean,
    default: false,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["active", "revoked", "expired"],
    default: "active",
  },
}, {
  timestamps: true,
});

// Index for cleanup queries
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
sessionSchema.index({ user: 1, status: 1 });

// Method to revoke session
sessionSchema.methods.revoke = async function () {
  this.status = "revoked";
  return await this.save();
};

// Static method to clean up expired sessions
sessionSchema.statics.cleanupExpired = async function () {
  return await this.deleteMany({
    status: "expired",
    expiresAt: { $lt: new Date() },
  });
};

// Static method to get active sessions for user
sessionSchema.statics.getActiveSessions = async function (userId) {
  return await this.find({
    user: userId,
    status: "active",
    expiresAt: { $gt: new Date() },
  }).sort("-lastActive");
};

const Session = model("Session", sessionSchema);

export default Session;