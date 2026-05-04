import { model, Schema } from "mongoose";

const prescriptionSchema = new Schema({
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
  diagnosis: {
    type: Schema.Types.ObjectId,
    ref: "Diagnosis",
  },
  prescribedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  // Medication details
  drugName: {
    type: String,
    required: true,
  },
  genericName: {
    type: String,
  },
  dosage: {
    type: String,
    required: true,
  },
  frequency: {
    type: String,
    required: true,
    enum: ["once_daily", "twice_daily", "three_times_daily", "four_times_daily",
           "every_morning", "every_evening", "as_needed", "other"],
  },
  route: {
    type: String,
    enum: ["oral", "intravenous", "intramuscular", "subcutaneous", "topical",
           "inhalation", "rectal", "sublingual", "other"],
    default: "oral",
  },
  duration: {
    type: String, // e.g., "7 days", "2 weeks"
    required: true,
  },
  durationDays: {
    type: Number, // Numeric value for filtering
  },
  instructions: {
    type: String, // Special instructions
  },
  // Timing
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  // Refills
  refillsAllowed: {
    type: Number,
    default: 0,
  },
  refillsRemaining: {
    type: Number,
    default: 0,
  },
  // Status
  status: {
    type: String,
    enum: ["active", "completed", "stopped", "cancelled"],
    default: "active",
  },
  // For stopped/cancelled prescriptions
  stopReason: {
    type: String,
  },
  stoppedAt: {
    type: Date,
  },
  // Cost
  estimatedCost: {
    type: Number,
  },
  // Notes
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

// Indexes
prescriptionSchema.index({ patient: 1, createdAt: -1 });
prescriptionSchema.index({ prescribedBy: 1, createdAt: -1 });
prescriptionSchema.index({ diagnosis: 1 });
prescriptionSchema.index({ status: 1 });
prescriptionSchema.index({ drugName: 1 });

// Calculate end date before saving
prescriptionSchema.pre("save", function (next) {
  if (this.durationDays && !this.endDate) {
    const end = new Date(this.startDate);
    end.setDate(end.getDate() + this.durationDays);
    this.endDate = end;
  }
  next();
});

const Prescription = model("Prescription", prescriptionSchema);

export default Prescription;