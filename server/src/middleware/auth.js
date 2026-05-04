import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import Session from "../models/sessionModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "healthcare_toolkit_secret_key";

// Parse user agent for device info
const parseUserAgent = (userAgent) => {
  const device = /Mobile|Android|iPhone|iPad/i.test(userAgent) ? "mobile" : "desktop";

  let browser = "Unknown";
  if (userAgent.includes("Chrome")) browser = "Chrome";
  else if (userAgent.includes("Firefox")) browser = "Firefox";
  else if (userAgent.includes("Safari")) browser = "Safari";
  else if (userAgent.includes("Edge")) browser = "Edge";

  let os = "Unknown";
  if (userAgent.includes("Windows")) os = "Windows";
  else if (userAgent.includes("Mac")) os = "MacOS";
  else if (userAgent.includes("Linux")) os = "Linux";
  else if (userAgent.includes("Android")) os = "Android";
  else if (userAgent.includes("iOS")) os = "iOS";

  return { device, browser, os };
};

// Generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Create session record after login
export const createSession = async (user, token, req) => {
  const userAgent = req.headers["user-agent"] || "";
  const { device, browser, os } = parseUserAgent(userAgent);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await Session.create({
    user: user._id,
    token,
    device,
    browser,
    os,
    ipAddress: req.ip || req.connection?.remoteAddress,
    userAgent,
    isCurrentSession: true,
    expiresAt,
  });
};

// Revoke a session
export const revokeSession = async (sessionId, userId) => {
  const session = await Session.findOne({ _id: sessionId, user: userId });
  if (session) {
    session.status = "revoked";
    await session.save();
  }
};

// Revoke all sessions except current
export const revokeAllSessions = async (userId, currentToken) => {
  await Session.updateMany(
    { user: userId, token: { $ne: currentToken }, status: "active" },
    { status: "revoked" }
  );
};

// Get active sessions for user
export const getActiveSessions = async (userId) => {
  return await Session.getActiveSessions(userId);
};

// Update last active timestamp
export const updateSessionActivity = async (token) => {
  await Session.findOneAndUpdate(
    { token, status: "active" },
    { lastActive: new Date() }
  );
};

// Verify JWT token
export const verifyToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    // Update session activity (non-blocking)
    updateSessionActivity(token).catch(() => {});
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Role-based access control
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required roles: ${roles.join(", ")}`,
      });
    }

    next();
  };
};

// Optional auth - doesn't fail if no token
export const optionalAuth = async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token invalid, continue without user
    }
  }
  next();
};

// Load full user object
export const loadUser = async (req, res, next) => {
  if (req.user?.id) {
    try {
      const user = await User.findById(req.user.id).select("-password");
      req.user = { ...req.user, ...user.toObject() };
    } catch (error) {
      // Continue without full user
    }
  }
  next();
};

export default { generateToken, verifyToken, authorize, optionalAuth, loadUser, createSession, revokeSession, revokeAllSessions, getActiveSessions, updateSessionActivity };