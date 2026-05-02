import { model, Schema } from "mongoose";

const visitSchema = new Schema({
  department: {
    type: String,
    required: true,
  },
  doctor: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  reason: {
    type: String,
  },
  diagnosis: {
    type: String,
  },
  treatment: {
    type: String,
  },
  status: {
    type: String,
    enum: ["active", "completed", "cancelled"],
    default: "active",
  },
}, {
  timestamps: true,
});

const relationshipSchema = new Schema({
  relativeName: {
    type: String,
    required: true,
  },
  relationship: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
}, {
  timestamps: true,
});

const medicationSchema = new Schema({
  medicationName: {
    type: String,
    required: true,
  },
  dosage: {
    type: String,
  },
  frequency: {
    type: String,
  },
  startDate: {
    type: Date,
  },
  endDate: {
    type: Date,
  },
  prescribedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  notes: {
    type: String,
  },
}, {
  timestamps: true,
});

const patientSchema = new Schema({
  // Basic identification
  patientId: {
    type: String,
    required: true,
    unique: true,
  },
  // Demographics
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  address: {
    type: String,
  },
  // Physical measurements
  height: {
    type: Number, // in cm
  },
  weight: {
    type: Number, // in kg
  },
  bmi: {
    type: Number,
  },
  // Medical conditions
  previousConditions: [{
    conditionName: String,
    diagnosedDate: Date,
    notes: String,
  }],
  currentConditions: [{
    conditionName: String,
    diagnosedDate: Date,
    notes: String,
  }],
  // Allergies
  allergies: [{
    allergen: String,
    reaction: String,
    severity: {
      type: String,
      enum: ["mild", "moderate", "severe"],
    },
  }],
  // Emergency contact
  emergencyContact: {
    name: String,
    relationship: String,
    phone: String,
  },
  // Relationships (family members, caregivers)
  relationships: [relationshipSchema],
  // Visits
  visits: [visitSchema],
  // Medications
  medications: [medicationSchema],
  // Active visit
  activeVisit: {
    type: Schema.Types.ObjectId,
    ref: "Visit",
  },
  // Assigned doctors
  assignedDoctors: [{
    type: Schema.Types.ObjectId,
    ref: "User",
  }],
  // Created by (for audit)
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  // Diagnostic center access
  authorizedDiagnosticCenters: [{
    type: Schema.Types.ObjectId,
    ref: "User",
  }],
}, {
  timestamps: true,
});

// Calculate BMI before saving
patientSchema.pre("save", function (next) {
  if (this.height && this.weight) {
    const heightInMeters = this.height / 100;
    this.bmi = (this.weight / (heightInMeters * heightInMeters)).toFixed(2);
  }
  next();
});

// Index for searching
patientSchema.index({ firstName: 1, lastName: 1 });
patientSchema.index({ patientId: 1 });

const Patient = model("Patient", patientSchema);

export default Patient;