import { model, Schema } from "mongoose";

const auditLogSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    index: true,
  },
  userEmail: {
    type: String,
  },
  userRole: {
    type: String,
    enum: ["doctor", "patient", "diagnostic_center", "admin", "government_analyst"],
  },
  action: {
    type: String,
    required: true,
    index: true,
  },
  resource: {
    type: String,
    required: true,
    index: true,
  },
  resourceId: {
    type: Schema.Types.ObjectId,
    index: true,
  },
  details: {
    type: Schema.Types.Mixed, // Store additional context
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  status: {
    type: String,
    enum: ["success", "failure"],
    default: "success",
  },
  errorMessage: {
    type: String,
  },
}, {
  timestamps: true,
});

// Index for common queries
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ resource: 1, resourceId: 1 });

// Static method to log an action
auditLogSchema.statics.log = async function (data) {
  try {
    return await this.create(data);
  } catch (error) {
    // Don't fail the main request if audit logging fails
    console.error("Audit log error:", error.message);
  }
};

const AuditLog = model("AuditLog", auditLogSchema);

export default AuditLog;