import { Schema, model } from "mongoose";

const antibiogramRecordSchema = new Schema({
  microorganism: {
    type: String,
    required: true,
    trim: true,
  },
  antibiotic: {
    type: String,
    required: true,
    trim: true,
  },
  sensitivity: {
    type: String,
    enum: ["sensitive", "intermediate", "resistant"],
    required: true,
  },
  zoneSize: {
    type: Number,
  },
  MIC: {
    type: Number, // Minimum inhibitory concentration
  },
  patient_id: {
    type: Schema.Types.ObjectId,
    ref: "Patient",
  },
  report_id: {
    type: Schema.Types.ObjectId,
    ref: "Report",
  },
  location: {
    type: String,
    trim: true,
  },
  hospital: {
    type: String,
    trim: true,
  },
  department: {
    type: String,
    trim: true,
  },
  sampleDate: {
    type: Date,
    required: true,
  },
  sampleType: {
    type: String,
    enum: ["blood", "urine", "sputum", "wound", "stool", "cerebrospinal_fluid", "respiratory", "other"],
    required: true,
  },
  recordedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
}, {
  timestamps: true,
});

// Indexes for analytics queries
antibiogramRecordSchema.index({ microorganism: 1, antibiotic: 1 });
antibiogramRecordSchema.index({ location: 1, sampleDate: 1 });
antibiogramRecordSchema.index({ sensitivity: 1 });
antibiogramRecordSchema.index({ sampleDate: 1 });
antibiogramRecordSchema.index({ hospital: 1, department: 1 });

const Antibiogram = model("Antibiogram", antibiogramRecordSchema);

export default Antibiogram;