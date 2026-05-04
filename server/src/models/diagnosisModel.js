import { model, Schema } from "mongoose";

// Common ICD-10 codes for quick reference
const ICD_CODES = {
  // Infectious diseases
  A00: "Cholera",
  A01: "Typhoid and paratyphoid fevers",
  A02: "Other intestinal infections",
  A09: "Diarrhea and gastroenteritis",

  // Respiratory diseases
  J00: "Acute nasopharyngitis [common cold]",
  J01: "Acute sinusitis",
  J02: "Acute pharyngitis",
  J03: "Acute tonsillitis",
  J04: "Acute laryngitis and tracheitis",
  J05: "Acute obstructive laryngitis [croup]",
  J06: "Acute upper respiratory infections",
  J18: "Pneumonia",

  // Cardiovascular diseases
  I10: "Essential hypertension",
  I20: "Angina pectoris",
  I21: "Acute myocardial infarction",
  I25: "Chronic ischemic heart disease",

  // Digestive diseases
  K00: "Anomalies of jaw size",
  K01: "Embedded teeth",
  K02: "Dental caries",
  K03: "Diseases of pulp and periapical tissues",
  K04: "Diseases of dentin and cementum",
  K05: "Gingivitis and periodontal diseases",
  K08: "Other disorders of teeth",
  K29: "Gastritis and duodenitis",

  // Metabolic diseases
  E10: "Type 1 diabetes mellitus",
  E11: "Type 2 diabetes mellitus",
  E14: "Diabetes mellitus, unspecified",

  // Symptoms
  R50: "Fever of other unknown origin",
  R51: "Headache",
  R52: "Pain, unspecified",
  R10: "Abdominal and pelvic pain",
  R05: "Cough",
};

const diagnosisSchema = new Schema({
  patient: {
    type: Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
    index: true,
  },
  visit: {
    type: Schema.Types.ObjectId,
    ref: "Patient.visits",
  },
  icdCode: {
    type: String,
    required: true,
    uppercase: true,
  },
  description: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ["mild", "moderate", "severe", "critical"],
    default: "moderate",
  },
  status: {
    type: String,
    enum: ["suspected", "confirmed", "ruled_out", "resolved"],
    default: "confirmed",
  },
  diagnosedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  notes: {
    type: String,
  },
  // For secondary diagnoses
  isPrimary: {
    type: Boolean,
    default: true,
  },
  // Related symptoms
  symptoms: [{
    type: String,
  }],
  // Treatment outcome
  outcome: {
    type: String,
    enum: ["recovered", "ongoing", "referral", "deceased"],
  },
}, {
  timestamps: true,
});

// Indexes for common queries
diagnosisSchema.index({ patient: 1, createdAt: -1 });
diagnosisSchema.index({ diagnosedBy: 1, createdAt: -1 });
diagnosisSchema.index({ icdCode: 1 });
diagnosisSchema.index({ status: 1 });

// Auto-populate description from ICD code if not provided
diagnosisSchema.pre("save", function (next) {
  if (!this.description && this.icdCode && ICD_CODES[this.icdCode]) {
    this.description = ICD_CODES[this.icdCode];
  }
  next();
});

const Diagnosis = model("Diagnosis", diagnosisSchema);

// Export ICD codes for reference
Diagnosis.ICD_CODES = ICD_CODES;

export default Diagnosis;