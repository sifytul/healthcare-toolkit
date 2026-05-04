import { model, Schema } from "mongoose";

const consentSchema = new Schema({
  patient: {
    type: Schema.Types.ObjectId,
    ref: "User", // The patient user
    required: true,
    index: true,
  },
  consentType: {
    type: String,
    required: true,
    enum: [
      "view_medical_records",    // Allow doctors to view medical records
      "share_reports",           // Allow sharing reports with other providers
      "allow_research",          // Allow anonymized data for research
      "data_access",             // Access to personal health data
      "third_party_access",      // Access by third parties (insurance, etc.)
    ],
  },
  grantedTo: {
    type: Schema.Types.ObjectId,
    ref: "User", // Who was granted access (doctor, diagnostic center)
  },
  grantedToRole: {
    type: String,
    enum: ["doctor", "diagnostic_center", "admin", "government_analyst"],
  },
  status: {
    type: String,
    enum: ["granted", "revoked", "pending"],
    default: "granted",
  },
  grantedAt: {
    type: Date,
    default: Date.now,
  },
  revokedAt: {
    type: Date,
  },
  expiresAt: {
    type: Date, // Optional expiration
  },
  conditions: {
    type: String, // Any specific conditions or limitations
  },
  ipAddress: {
    type: String, // IP address when consent was given
  },
  // For granular field-level access
  allowedFields: [{
    type: String,
    enum: [
      "demographics",
      "visits",
      "diagnoses",
      "prescriptions",
      "reports",
      "allergies",
      "medications",
      "lab_results",
    ],
  }],
}, {
  timestamps: true,
});

// Index for queries
consentSchema.index({ patient: 1, consentType: 1 });
consentSchema.index({ grantedTo: 1 });
consentSchema.index({ status: 1 });

// Check if consent is valid
consentSchema.methods.isValid = function () {
  if (this.status !== "granted") return false;
  if (this.expiresAt && this.expiresAt < new Date()) return false;
  return true;
};

const Consent = model("Consent", consentSchema);

export default Consent;