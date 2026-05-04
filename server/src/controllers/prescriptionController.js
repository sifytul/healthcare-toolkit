import Prescription from "../models/prescriptionModel.js";

// Create a prescription
export const createPrescription = async (req, res) => {
  try {
    const {
      patient,
      visit,
      diagnosis,
      drugName,
      genericName,
      dosage,
      frequency,
      route,
      duration,
      durationDays,
      instructions,
      startDate,
      refillsAllowed,
      estimatedCost,
      notes,
    } = req.body;

    const prescription = await Prescription.create({
      patient,
      visit,
      diagnosis,
      prescribedBy: req.user.id,
      drugName,
      genericName,
      dosage,
      frequency,
      route,
      duration,
      durationDays,
      instructions,
      startDate: startDate ? new Date(startDate) : new Date(),
      refillsAllowed,
      refillsRemaining: refillsAllowed,
      estimatedCost,
      notes,
    });

    await prescription.populate("prescribedBy", "fullName specialty");

    res.status(201).json({
      success: true,
      message: "Prescription created successfully",
      data: { prescription },
    });
  } catch (error) {
    console.error("CreatePrescription error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Get prescriptions for a patient
export const getPatientPrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status, drugName, startDate, endDate, doctorId, page = 1, limit = 20 } = req.query;

    const query = { patient: patientId };

    // Filters
    if (status) query.status = status;
    if (doctorId) query.prescribedBy = doctorId;
    if (drugName) {
      query.$or = [
        { drugName: new RegExp(drugName, "i") },
        { genericName: new RegExp(drugName, "i") },
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const prescriptions = await Prescription.find(query)
      .populate("prescribedBy", "fullName specialty")
      .populate("diagnosis", "icdCode description")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit));

    const total = await Prescription.countDocuments(query);

    res.json({
      success: true,
      data: {
        prescriptions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("GetPatientPrescriptions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get a single prescription
export const getPrescriptionById = async (req, res) => {
  try {
    const { id } = req.params;

    const prescription = await Prescription.findById(id)
      .populate("prescribedBy", "fullName email specialty")
      .populate("patient", "firstName lastName patientId")
      .populate("diagnosis", "icdCode description");

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    res.json({
      success: true,
      data: { prescription },
    });
  } catch (error) {
    console.error("GetPrescriptionById error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update prescription (e.g., stop, cancel)
export const updatePrescription = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      dosage,
      frequency,
      duration,
      instructions,
      status,
      stopReason,
      refillsRemaining,
    } = req.body;

    const updateData = {
      dosage,
      frequency,
      duration,
      instructions,
      status,
      refillsRemaining,
    };

    if (status === "stopped" || status === "cancelled") {
      updateData.stopReason = stopReason;
      updateData.stoppedAt = new Date();
    }

    const prescription = await Prescription.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate("prescribedBy", "fullName specialty");

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found" });
    }

    res.json({
      success: true,
      message: "Prescription updated successfully",
      data: { prescription },
    });
  } catch (error) {
    console.error("UpdatePrescription error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Get active prescriptions for a patient
export const getActivePrescriptions = async (req, res) => {
  try {
    const { patientId } = req.params;

    const prescriptions = await Prescription.find({
      patient: patientId,
      status: "active",
      $or: [
        { endDate: { $gte: new Date() } },
        { endDate: { $exists: false } },
      ],
    })
      .populate("prescribedBy", "fullName specialty")
      .sort("-createdAt");

    res.json({
      success: true,
      data: { prescriptions },
    });
  } catch (error) {
    console.error("GetActivePrescriptions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all prescriptions (for doctors/admin)
export const getAllPrescriptions = async (req, res) => {
  try {
    const { status, drugName, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (drugName) {
      query.$or = [
        { drugName: new RegExp(drugName, "i") },
        { genericName: new RegExp(drugName, "i") },
      ];
    }

    const skip = (page - 1) * limit;

    const prescriptions = await Prescription.find(query)
      .populate("prescribedBy", "fullName specialty")
      .populate("patient", "firstName lastName patientId")
      .sort("-createdAt")
      .skip(skip)
      .limit(Number(limit));

    const total = await Prescription.countDocuments(query);

    res.json({
      success: true,
      data: {
        prescriptions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("GetAllPrescriptions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default {
  createPrescription,
  getPatientPrescriptions,
  getPrescriptionById,
  updatePrescription,
  getActivePrescriptions,
  getAllPrescriptions,
};