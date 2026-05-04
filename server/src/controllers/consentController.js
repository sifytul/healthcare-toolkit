import Consent from "../models/consentModel.js";

// Get all consents for current patient
export const getMyConsents = async (req, res) => {
  try {
    const consents = await Consent.find({ patient: req.user.id })
      .populate("grantedTo", "fullName email role")
      .sort("-grantedAt");

    res.json({
      success: true,
      data: { consents },
    });
  } catch (error) {
    console.error("Get consents error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get consents granted to a specific user (for doctors/diagnostic centers)
export const getGrantedConsents = async (req, res) => {
  try {
    const consents = await Consent.find({
      grantedTo: req.user.id,
      status: "granted",
    })
      .populate("patient", "fullName email")
      .sort("-grantedAt");

    res.json({
      success: true,
      data: { consents },
    });
  } catch (error) {
    console.error("Get granted consents error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Grant consent (patient grants access to a doctor/center)
export const grantConsent = async (req, res) => {
  try {
    const { consentType, grantedTo, grantedToRole, expiresAt, conditions, allowedFields } = req.body;

    // Check if consent already exists
    const existing = await Consent.findOne({
      patient: req.user.id,
      consentType,
      grantedTo,
      status: "granted",
    });

    if (existing) {
      return res.status(400).json({
        message: "Consent already granted to this user for this purpose",
      });
    }

    const consent = await Consent.create({
      patient: req.user.id,
      consentType,
      grantedTo,
      grantedToRole,
      status: "granted",
      grantedAt: new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
      conditions,
      allowedFields,
      ipAddress: req.ip,
    });

    res.status(201).json({
      success: true,
      message: "Consent granted successfully",
      data: { consent },
    });
  } catch (error) {
    console.error("Grant consent error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Revoke consent
export const revokeConsent = async (req, res) => {
  try {
    const { consentId } = req.params;

    const consent = await Consent.findOne({
      _id: consentId,
      patient: req.user.id,
    });

    if (!consent) {
      return res.status(404).json({ message: "Consent not found" });
    }

    consent.status = "revoked";
    consent.revokedAt = new Date();
    await consent.save();

    res.json({
      success: true,
      message: "Consent revoked successfully",
      data: { consent },
    });
  } catch (error) {
    console.error("Revoke consent error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Check if consent exists (for doctors to verify access)
export const checkConsent = async (req, res) => {
  try {
    const { patientId, consentType } = req.query;

    const consent = await Consent.findOne({
      patient: patientId,
      consentType,
      grantedTo: req.user.id,
      status: "granted",
    });

    const hasConsent = consent ? consent.isValid() : false;

    res.json({
      success: true,
      data: {
        hasConsent,
        consent: consent || null,
      },
    });
  } catch (error) {
    console.error("Check consent error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Admin: Get all consents (for compliance)
export const getAllConsents = async (req, res) => {
  try {
    const { status, consentType, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;
    if (consentType) query.consentType = consentType;

    const consents = await Consent.find(query)
      .populate("patient", "fullName email")
      .populate("grantedTo", "fullName email role")
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort("-grantedAt");

    const total = await Consent.countDocuments(query);

    res.json({
      success: true,
      data: {
        consents,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get all consents error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default {
  getMyConsents,
  getGrantedConsents,
  grantConsent,
  revokeConsent,
  checkConsent,
  getAllConsents,
};