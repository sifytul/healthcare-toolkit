import Report from "../models/reportModel.js";

// Create a new report
export const createReport = async (req, res) => {
  try {
    const { patient, reportType, antibiogram, radiology, labResult, diagnosticCenter } = req.body;

    const report = await Report.create({
      patient,
      reportType,
      antibiogram,
      radiology,
      labResult,
      uploadedBy: req.user.id,
      diagnosticCenter,
    });

    res.status(201).json({
      success: true,
      message: "Report created successfully",
      data: { report },
    });
  } catch (error) {
    console.error("CreateReport error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Get all reports with filtering
export const getAllReports = async (req, res) => {
  try {
    const { reportType, patient, page = 1, limit = 10 } = req.query;

    let query = { isDeleted: false };

    if (reportType) {
      query.reportType = reportType;
    }

    if (patient) {
      query.patient = patient;
    }

    const skip = (page - 1) * limit;

    const reports = await Report.find(query)
      .populate("patient", "patientId firstName lastName")
      .populate("uploadedBy", "fullName")
      .populate("diagnosticCenter", "fullName")
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error("GetAllReports error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get report by ID
export const getReportById = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id)
      .populate("patient", "patientId firstName lastName phone email")
      .populate("uploadedBy", "fullName")
      .populate("diagnosticCenter", "fullName");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.isDeleted) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({
      success: true,
      data: { report },
    });
  } catch (error) {
    console.error("GetReportById error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get reports for a specific patient
export const getPatientReports = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { reportType, page = 1, limit = 10 } = req.query;

    let query = { patient: patientId, isDeleted: false };

    if (reportType) {
      query.reportType = reportType;
    }

    const skip = (page - 1) * limit;

    const reports = await Report.find(query)
      .populate("uploadedBy", "fullName")
      .populate("diagnosticCenter", "fullName")
      .select("-__v")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Report.countDocuments(query);

    res.json({
      success: true,
      data: {
        reports,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error("GetPatientReports error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update report
export const updateReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { reportType, antibiogram, radiology, labResult } = req.body;

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.isDeleted) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Update the appropriate report type data
    if (reportType === "antibiogram" && antibiogram) {
      report.antibiogram = antibiogram;
    } else if (reportType === "radiology" && radiology) {
      report.radiology = radiology;
    } else if (reportType === "lab_result" && labResult) {
      report.labResult = labResult;
    }

    await report.save();

    res.json({
      success: true,
      message: "Report updated successfully",
      data: { report },
    });
  } catch (error) {
    console.error("UpdateReport error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Delete report (soft delete)
export const deleteReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findByIdAndUpdate(
      id,
      { isDeleted: true },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.json({
      success: true,
      message: "Report deleted successfully",
    });
  } catch (error) {
    console.error("DeleteReport error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Download report (get file URL)
export const downloadReport = async (req, res) => {
  try {
    const { id } = req.params;

    const report = await Report.findById(id)
      .populate("patient", "patientId firstName lastName")
      .select("-__v");

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.isDeleted) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Get the appropriate file URL based on report type
    let fileUrl = null;
    if (report.reportType === "radiology" && report.radiology?.reportFileUrl) {
      fileUrl = report.radiology.reportFileUrl;
    } else if (report.reportType === "lab_result" && report.labResult?.reportFileUrl) {
      fileUrl = report.labResult.reportFileUrl;
    } else if (report.reportType === "antibiogram" && report.antibiogram?.reportFileUrl) {
      fileUrl = report.antibiogram.reportFileUrl;
    }

    res.json({
      success: true,
      data: {
        reportId: report._id,
        reportType: report.reportType,
        patient: report.patient,
        fileUrl,
        createdAt: report.createdAt,
      },
    });
  } catch (error) {
    console.error("DownloadReport error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Upload report file
export const uploadReportFile = async (req, res) => {
  try {
    const { id } = req.params;
    const { reportType } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const report = await Report.findById(id);

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    if (report.isDeleted) {
      return res.status(404).json({ message: "Report not found" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    // Update the file URL based on report type
    if (reportType === "radiology") {
      report.radiology = report.radiology || {};
      report.radiology.reportFileUrl = fileUrl;
    } else if (reportType === "lab_result") {
      report.labResult = report.labResult || {};
      report.labResult.reportFileUrl = fileUrl;
    } else if (reportType === "antibiogram") {
      report.antibiogram = report.antibiogram || {};
      report.antibiogram.reportFileUrl = fileUrl;
    }

    await report.save();

    res.status(200).json({
      success: true,
      message: "File uploaded successfully",
      data: { fileUrl },
    });
  } catch (error) {
    console.error("UploadReportFile error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};