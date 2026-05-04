import Antibiogram from "../models/antibiogramModel.js";

// Create antibiogram record
export const createAntibiogram = async (req, res) => {
  try {
    const {
      microorganism,
      antibiotic,
      sensitivity,
      zoneSize,
      MIC,
      patient_id,
      report_id,
      location,
      hospital,
      department,
      sampleDate,
      sampleType,
    } = req.body;

    const antibiogram = await Antibiogram.create({
      microorganism,
      antibiotic,
      sensitivity,
      zoneSize,
      MIC,
      patient_id,
      report_id,
      location,
      hospital,
      department,
      sampleDate,
      sampleType,
      recordedBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Antibiogram record created successfully",
      data: { antibiogram },
    });
  } catch (error) {
    console.error("CreateAntibiogram error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Get all antibiograms with filters
export const getAllAntibiograms = async (req, res) => {
  try {
    const {
      microorganism,
      antibiotic,
      sensitivity,
      location,
      hospital,
      sampleType,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    let query = {};

    if (microorganism) {
      query.microorganism = { $regex: microorganism, $options: "i" };
    }

    if (antibiotic) {
      query.antibiotic = { $regex: antibiotic, $options: "i" };
    }

    if (sensitivity) {
      query.sensitivity = sensitivity;
    }

    if (location) {
      query.location = { $regex: location, $options: "i" };
    }

    if (hospital) {
      query.hospital = { $regex: hospital, $options: "i" };
    }

    if (sampleType) {
      query.sampleType = sampleType;
    }

    if (startDate || endDate) {
      query.sampleDate = {};
      if (startDate) query.sampleDate.$gte = new Date(startDate);
      if (endDate) query.sampleDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const antibiograms = await Antibiogram.find(query)
      .populate("patient_id", "patientId firstName lastName")
      .populate("recordedBy", "fullName")
      .select("-__v")
      .sort({ sampleDate: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Antibiogram.countDocuments(query);

    res.json({
      success: true,
      data: {
        antibiograms,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
          limit: Number(limit),
        },
      },
    });
  } catch (error) {
    console.error("GetAllAntibiograms error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get sensitivity by microorganism
export const getByMicroorganism = async (req, res) => {
  try {
    const { microorganism } = req.params;
    const { startDate, endDate } = req.query;

    let query = { microorganism: { $regex: new RegExp(`^${microorganism}$`, "i") } };

    if (startDate || endDate) {
      query.sampleDate = {};
      if (startDate) query.sampleDate.$gte = new Date(startDate);
      if (endDate) query.sampleDate.$lte = new Date(endDate);
    }

    const results = await Antibiogram.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$antibiotic",
          sensitive: {
            $sum: { $cond: [{ $eq: ["$sensitivity", "sensitive"] }, 1, 0] },
          },
          intermediate: {
            $sum: { $cond: [{ $eq: ["$sensitivity", "intermediate"] }, 1, 0] },
          },
          resistant: {
            $sum: { $cond: [{ $eq: ["$sensitivity", "resistant"] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          antibiotic: "$_id",
          sensitive: 1,
          intermediate: 1,
          resistant: 1,
          total: 1,
          sensitivityRate: {
            $multiply: [
              { $divide: ["$sensitive", "$total"] },
              100,
            ],
          },
          _id: 0,
        },
      },
      { $sort: { sensitivityRate: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        microorganism,
        antibiotics: results,
      },
    });
  } catch (error) {
    console.error("GetByMicroorganism error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get sensitivity by region/location
export const getByRegion = async (req, res) => {
  try {
    const { region } = req.params;
    const { startDate, endDate } = req.query;

    let query = { location: { $regex: new RegExp(`^${region}$`, "i") } };

    if (startDate || endDate) {
      query.sampleDate = {};
      if (startDate) query.sampleDate.$gte = new Date(startDate);
      if (endDate) query.sampleDate.$lte = new Date(endDate);
    }

    const results = await Antibiogram.aggregate([
      { $match: query },
      {
        $group: {
          _id: {
            microorganism: "$microorganism",
            antibiotic: "$antibiotic",
          },
          sensitive: {
            $sum: { $cond: [{ $eq: ["$sensitivity", "sensitive"] }, 1, 0] },
          },
          intermediate: {
            $sum: { $cond: [{ $eq: ["$sensitivity", "intermediate"] }, 1, 0] },
          },
          resistant: {
            $sum: { $cond: [{ $eq: ["$sensitivity", "resistant"] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          microorganism: "$_id.microorganism",
          antibiotic: "$_id.antibiotic",
          sensitive: 1,
          intermediate: 1,
          resistant: 1,
          total: 1,
          sensitivityRate: {
            $multiply: [
              { $divide: ["$sensitive", "$total"] },
              100,
            ],
          },
          _id: 0,
        },
      },
      { $sort: { sensitivityRate: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        region,
        results,
      },
    });
  } catch (error) {
    console.error("GetByRegion error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get analytics for charts
export const getAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, location, hospital } = req.query;

    let matchStage = {};

    if (startDate || endDate) {
      matchStage.sampleDate = {};
      if (startDate) matchStage.sampleDate.$gte = new Date(startDate);
      if (endDate) matchStage.sampleDate.$lte = new Date(endDate);
    }

    if (location) {
      matchStage.location = { $regex: location, $options: "i" };
    }

    if (hospital) {
      matchStage.hospital = { $regex: hospital, $options: "i" };
    }

    // Overall sensitivity distribution
    const sensitivityDistribution = await Antibiogram.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$sensitivity",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          sensitivity: "$_id",
          count: 1,
          percentage: {
            $multiply: [
              { $divide: ["$count", { $sum: "$count" }] },
              100,
            ],
          },
          _id: 0,
        },
      },
    ]);

    // Top microorganisms
    const topMicroorganisms = await Antibiogram.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$microorganism",
          total: { $sum: 1 },
          resistantCount: {
            $sum: { $cond: [{ $eq: ["$sensitivity", "resistant"] }, 1, 0] },
          },
        },
      },
      {
        $project: {
          microorganism: "$_id",
          total: 1,
          resistantCount: 1,
          resistanceRate: {
            $multiply: [
              { $divide: ["$resistantCount", "$total"] },
              100,
            ],
          },
          _id: 0,
        },
      },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);

    // Top antibiotics by usage
    const topAntibiotics = await Antibiogram.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$antibiotic",
          total: { $sum: 1 },
          effectiveRate: {
            $avg: {
              $cond: [{ $eq: ["$sensitivity", "sensitive"] }, 100, 0],
            },
          },
        },
      },
      {
        $project: {
          antibiotic: "$_id",
          total: 1,
          effectiveRate: { $round: ["$effectiveRate", 2] },
          _id: 0,
        },
      },
      { $sort: { total: -1 } },
      { $limit: 10 },
    ]);

    // Sample type distribution
    const sampleTypeDistribution = await Antibiogram.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: "$sampleType",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          sampleType: "$_id",
          count: 1,
          _id: 0,
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      success: true,
      data: {
        sensitivityDistribution,
        topMicroorganisms,
        topAntibiotics,
        sampleTypeDistribution,
      },
    });
  } catch (error) {
    console.error("GetAnalytics error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get trends over time
export const getTrendsOverTime = async (req, res) => {
  try {
    const { microorganism, antibiotic, interval = "month" } = req.query;

    let matchStage = {};

    if (microorganism) {
      matchStage.microorganism = { $regex: new RegExp(`^${microorganism}$`, "i") };
    }

    if (antibiotic) {
      matchStage.antibiotic = { $regex: new RegExp(`^${antibiotic}$`, "i") };
    }

    // Determine date format based on interval
    let dateFormat;
    switch (interval) {
      case "day":
        dateFormat = { $dateToString: { format: "%Y-%m-%d", date: "$sampleDate" } };
        break;
      case "year":
        dateFormat = { $dateToString: { format: "%Y", date: "$sampleDate" } };
        break;
      case "month":
      default:
        dateFormat = { $dateToString: { format: "%Y-%m", date: "$sampleDate" } };
    }

    const trends = await Antibiogram.aggregate([
      { $match: matchStage },
      {
        $group: {
          _id: dateFormat,
          sensitive: {
            $sum: { $cond: [{ $eq: ["$sensitivity", "sensitive"] }, 1, 0] },
          },
          intermediate: {
            $sum: { $cond: [{ $eq: ["$sensitivity", "intermediate"] }, 1, 0] },
          },
          resistant: {
            $sum: { $cond: [{ $eq: ["$sensitivity", "resistant"] }, 1, 0] },
          },
          total: { $sum: 1 },
        },
      },
      {
        $project: {
          period: "$_id",
          sensitive: 1,
          intermediate: 1,
          resistant: 1,
          total: 1,
          sensitivityRate: {
            $multiply: [
              { $divide: ["$sensitive", "$total"] },
              100,
            ],
          },
          resistanceRate: {
            $multiply: [
              { $divide: ["$resistant", "$total"] },
              100,
            ],
          },
          _id: 0,
        },
      },
      { $sort: { period: 1 } },
    ]);

    res.json({
      success: true,
      data: {
        interval,
        trends,
      },
    });
  } catch (error) {
    console.error("GetTrendsOverTime error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get sensitivity by disease (based on diagnosis in patient records)
export const getByDisease = async (req, res) => {
  try {
    const { diseaseCode } = req.params;
    const { startDate, endDate } = req.query;

    // This would require joining with patient records to get diagnoses
    // For now, return a message indicating this needs integration
    res.json({
      success: true,
      message: "Disease-based filtering requires integration with patient diagnosis records",
      data: {
        diseaseCode,
        availableFilters: ["microorganism", "antibiotic", "location", "hospital", "sampleType"],
      },
    });
  } catch (error) {
    console.error("GetByDisease error:", error);
    res.status(500).json({ message: "Server error" });
  }
};