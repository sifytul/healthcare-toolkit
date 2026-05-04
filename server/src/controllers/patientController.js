import Patient from "../models/patientModel.js";

// Generate unique patient ID
const generatePatientId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PT-${timestamp}-${random}`;
};

// Create new patient
export const createPatient = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      email,
      address,
      height,
      weight,
      emergencyContact,
    } = req.body;

    // Generate unique patient ID
    const patientId = generatePatientId();

    // Calculate BMI if height and weight provided
    let bmi = null;
    if (height && weight) {
      const heightInMeters = height / 100;
      bmi = (weight / (heightInMeters * heightInMeters)).toFixed(2);
    }

    const patient = await Patient.create({
      patientId,
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      email,
      address,
      height,
      weight: Number(weight),
      bmi: bmi ? Number(bmi) : null,
      emergencyContact,
      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: "Patient created successfully",
      data: { patient },
    });
  } catch (error) {
    console.error("CreatePatient error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Get all patients (with optional search)
export const getAllPatients = async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    let query = {};

    // Search by patientId or name
    if (search) {
      query = {
        $or: [
          { patientId: { $regex: search, $options: "i" } },
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
        ],
      };
    }

    const skip = (page - 1) * limit;

    const patients = await Patient.find(query)
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Patient.countDocuments(query);

    res.json({
      success: true,
      data: {
        patients,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error("GetAllPatients error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get patient by ID
export const getPatientById = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findOne({ patientId: id })
      .populate("assignedDoctors", "fullName specialty")
      .populate("createdBy", "fullName");

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({
      success: true,
      data: { patient },
    });
  } catch (error) {
    console.error("GetPatientById error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update patient
export const updatePatient = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      phone,
      email,
      address,
      height,
      weight,
      emergencyContact,
      previousConditions,
      currentConditions,
      allergies,
    } = req.body;

    // Calculate BMI if height or weight is being updated
    let bmi = undefined;
    const currentPatient = await Patient.findOne({ patientId: id });
    const newHeight = height ?? currentPatient?.height;
    const newWeight = weight ?? currentPatient?.weight;

    if (newHeight && newWeight) {
      const heightInMeters = newHeight / 100;
      bmi = Number((newWeight / (heightInMeters * heightInMeters)).toFixed(2));
    }

    const patient = await Patient.findOneAndUpdate(
      { patientId: id },
      {
        firstName,
        lastName,
        dateOfBirth,
        gender,
        phone,
        email,
        address,
        height,
        weight,
        bmi,
        emergencyContact,
        previousConditions,
        currentConditions,
        allergies,
      },
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({
      success: true,
      message: "Patient updated successfully",
      data: { patient },
    });
  } catch (error) {
    console.error("UpdatePatient error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Delete patient (soft delete)
export const deletePatient = async (req, res) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findOneAndUpdate(
      { patientId: id },
      { isDeleted: true },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json({
      success: true,
      message: "Patient deleted successfully",
    });
  } catch (error) {
    console.error("DeletePatient error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add visit to patient
export const addVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { department, doctor, startDate, endDate, reason, diagnosis, treatment } = req.body;

    const patient = await Patient.findOne({ patientId: id });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const newVisit = {
      department,
      doctor: doctor || req.user?.id,
      startDate,
      endDate,
      reason,
      diagnosis,
      treatment,
      status: "active",
    };

    patient.visits.push(newVisit);
    patient.activeVisit = patient.visits[patient.visits.length - 1]._id;

    await patient.save();

    res.status(201).json({
      success: true,
      message: "Visit added successfully",
      data: { visit: patient.visits[patient.visits.length - 1] },
    });
  } catch (error) {
    console.error("AddVisit error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Add relationship to patient
export const addRelationship = async (req, res) => {
  try {
    const { id } = req.params;
    const { relativeName, relationship, phone, startDate } = req.body;

    const patient = await Patient.findOne({ patientId: id });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const newRelationship = {
      relativeName,
      relationship,
      phone,
      startDate,
    };

    patient.relationships.push(newRelationship);
    await patient.save();

    res.status(201).json({
      success: true,
      message: "Relationship added successfully",
      data: { relationship: patient.relationships[patient.relationships.length - 1] },
    });
  } catch (error) {
    console.error("AddRelationship error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Add medication to patient
export const addMedication = async (req, res) => {
  try {
    const { id } = req.params;
    const { medicationName, dosage, frequency, startDate, endDate, notes } = req.body;

    const patient = await Patient.findOne({ patientId: id });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const newMedication = {
      medicationName,
      dosage,
      frequency,
      startDate,
      endDate,
      prescribedBy: req.user?.id,
      notes,
    };

    patient.medications.push(newMedication);
    await patient.save();

    res.status(201).json({
      success: true,
      message: "Medication added successfully",
      data: { medication: patient.medications[patient.medications.length - 1] },
    });
  } catch (error) {
    console.error("AddMedication error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// End active visit
export const endVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { endDate } = req.body;

    const patient = await Patient.findOne({ patientId: id });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    if (!patient.activeVisit) {
      return res.status(400).json({ message: "No active visit to end" });
    }

    const activeVisit = patient.visits.id(patient.activeVisit);
    if (activeVisit) {
      activeVisit.endDate = endDate || new Date();
      activeVisit.status = "completed";
      patient.activeVisit = null;
    }

    await patient.save();

    res.json({
      success: true,
      message: "Visit ended successfully",
      data: { visit: activeVisit },
    });
  } catch (error) {
    console.error("EndVisit error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};