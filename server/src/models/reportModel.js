import { model, Schema } from "mongoose";

const antibiogramSchema = new Schema({
  microorganism: {
    type: String,
    required: true,
  },
  sampleType: {
    type: String,
    required: true,
  },
  sampleDate: {
    type: Date,
    required: true,
  },
  antibiotics: [{
    antibiotic: {
      type: String,
      required: true,
    },
    sensitivity: {
      type: String,
      enum: ["sensitive", "resistant", "intermediate"],
      required: true,
    },
    zoneSize: {
      type: Number,
    },
    mic: {
      type: String, // Minimum Inhibitory Concentration
    },
  }],
  labName: {
    type: String,
  },
  reportDate: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

const radiologySchema = new Schema({
  studyType: {
    type: String,
    required: true,
    enum: ["xray", "ultrasound", "ct_scan", "mri", "ecg", "echo", "other"],
  },
  findings: {
    type: String,
    required: true,
  },
  impressions: {
    type: String,
  },
  reportDate: {
    type: Date,
    required: true,
  },
  reportFileUrl: {
    type: String,
  },
  performedBy: {
    type: String,
  },
  reviewedBy: {
    type: String,
  },
}, {
  timestamps: true,
});

const labResultSchema = new Schema({
  testType: {
    type: String,
    required: true,
  },
  testDate: {
    type: Date,
    required: true,
  },
  // CBC parameters
  cbc: {
    rbc: { type: Number },
    wbc: { type: Number },
    platelet: { type: Number },
    hb: { type: Number },
    esr: { type: Number },
    hct: { type: Number },
    mcv: { type: Number },
  },
  // Blood sugar
  bloodSugar: {
    fasting: { type: Number },
    random: { type: Number },
    postPrandial: { type: Number },
    hba1c: { type: Number },
  },
  // Lipid profile
  lipidProfile: {
    totalCholesterol: { type: Number },
    ldl: { type: Number },
    hdl: { type: Number },
    triglycerides: { type: Number },
    vldl: { type: Number },
  },
  // Electrolytes
  electrolytes: {
    sodium: { type: Number },
    potassium: { type: Number },
    chloride: { type: Number },
    bicarbonate: { type: Number },
  },
  // Liver function
  liverFunction: {
    alt: { type: Number },
    ast: { type: Number },
    bilirubin: { type: Number },
    albumin: { type: Number },
  },
  // Kidney function
  kidneyFunction: {
    creatinine: { type: Number },
    bun: { type: Number },
    egfr: { type: Number },
  },
  // Raw report data
  rawData: {
    type: Schema.Types.Mixed,
  },
  reportFileUrl: {
    type: String,
  },
  labName: {
    type: String,
  },
}, {
  timestamps: true,
});

const reportSchema = new Schema({
  patient: {
    type: Schema.Types.ObjectId,
    ref: "Patient",
    required: true,
  },
  // Report type
  reportType: {
    type: String,
    required: true,
    enum: ["antibiogram", "radiology", "lab_result"],
  },
  // Reference to specific report data
  antibiogram: antibiogramSchema,
  radiology: radiologySchema,
  labResult: labResultSchema,
  // Metadata
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  diagnosticCenter: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  // Status
  isDeleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Index for queries
reportSchema.index({ patient: 1, reportType: 1 });
reportSchema.index({ "antibiogram.microorganism": 1 });
reportSchema.index({ "radiology.studyType": 1 });

const Report = model("Report", reportSchema);

export default Report;