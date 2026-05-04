import Diagnosis from "../models/diagnosisModel.js";

// Create a diagnosis
export const createDiagnosis = async (req, res) => {
  try {
    const { patient, visit, icdCode, description, severity, status, notes, isPrimary, symptoms, outcome } = req.body;

    const diagnosis = await Diagnosis.create({
      patient,
      visit,
      icdCode,
      description,
      severity,
      status: status || "confirmed",
      diagnosedBy: req.user.id,
      notes,
      isPrimary: isPrimary !== false,
      symptoms,
      outcome,
    });

    await diagnosis.populate("diagnosedBy", "fullName specialty");

    res.status(201).json({
      success: true,
      message: "Diagnosis created successfully",
      data: { diagnosis },
    });
  } catch (error) {
    console.error("CreateDiagnosis error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Get diagnoses for a patient
export const getPatientDiagnoses = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status, severity, startDate, endDate, doctorId, page = 1, limit = 20 } = req.query;

    const query = { patient: patientId };

    // Filters
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (doctorId) query.diagnosedBy = doctorId;

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const diagnoses = await Diagnosis.find(query)
      .populate("diagnosedBy", "fullName specialty")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit));

    const total = await Diagnosis.countDocuments(query);

    res.json({
      success: true,
      data: {
        diagnoses,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("GetPatientDiagnoses error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a single diagnosis
export const getDiagnosisById = async (req, res) => {
  try {
    const { id } = req.params;

    const diagnosis = await Diagnosis.findById(id)
      .populate("diagnosedBy", "fullName email specialty")
      .populate("patient", "firstName lastName patientId");

    if (!diagnosis) {
      return res.status(404).json({ message: "Diagnosis not found" });
    }

    res.json({
      success: true,
      data: { diagnosis },
    });
  } catch (error) {
    console.error("GetDiagnosisById error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update diagnosis
export const updateDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    const { icdCode, description, severity, status, notes, symptoms, outcome } = req.body;

    const diagnosis = await Diagnosis.findByIdAndUpdate(
      id,
      { icdCode, description, severity, status, notes, symptoms, outcome },
      { new: true, runValidators: true }
    ).populate("diagnosedBy", "fullName specialty");

    if (!diagnosis) {
      return res.status(404).json({ message: "Diagnosis not found" });
    }

    res.json({
      success: true,
      message: "Diagnosis updated successfully",
      data: { diagnosis },
    });
  } catch (error) {
    console.error("UpdateDiagnosis error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Get all diagnoses (for doctors/admin)
export const getAllDiagnoses = async (req, res) => {
  try {
    const { status, severity, icdCode, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (severity) query.severity = severity;
    if (icdCode) query.icdCode = new RegExp(icdCode, "i");

    const skip = (page - 1) * limit;

    const diagnoses = await Diagnosis.find(query)
      .populate("diagnosedBy", "fullName specialty")
      .populate("patient", "firstName lastName patientId")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit));

    const total = await Diagnosis.countDocuments(query);

    res.json({
      success: true,
      data: {
        diagnoses,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("GetAllDiagnoses error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get ICD codes list
export const getICDCodes = async (req, res) => {
  try {
    const { search } = req.query;

    let codes = Diagnosis.ICD_CODES;

    if (search) {
      const searchUpper = search.toUpperCase();
      codes = Object.fromEntries(
        Object.entries(codes).filter(
          ([code, desc]) =>
            code.includes(searchUpper) ||
            desc.toLowerCase().includes(search.toLowerCase())
        )
      );
    }

    res.json({
      success: true,
      data: { codes },
    });
  } catch (error) {
    console.error("GetICDCodes error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default {
  createDiagnosis,
  getPatientDiagnoses,
  getDiagnosisById,
  updateDiagnosis,
  getAllDiagnoses,
  getICDCodes,
};