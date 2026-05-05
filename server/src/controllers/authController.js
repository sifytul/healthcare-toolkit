import User from "../models/userModel.js";
import { generateToken, createSession, revokeAllSessions, getActiveSessions, revokeSession } from "../middleware/auth.js";

// Helper to set token cookie
const setTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: "strict",
  };
  res.cookie("token", token, cookieOptions);
};

// Register new user
export const register = async (req, res) => {
  try {
    const { fullName, username, email, password, role, specialty, licenseNumber, dateOfBirth, gender, phone, address, centerName, centerLicense } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate role
    const validRoles = ["doctor", "patient", "diagnostic_center", "admin", "government_analyst"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // Create user
    const user = await User.create({
      fullName,
      username,
      email,
      password,
      role,
      // Doctor fields
      specialty: role === "doctor" ? specialty : undefined,
      licenseNumber: role === "doctor" ? licenseNumber : undefined,
      // Patient fields
      dateOfBirth: role === "patient" ? dateOfBirth : undefined,
      gender: role === "patient" ? gender : undefined,
      phone: role === "patient" ? phone : undefined,
      address: role === "patient" ? address : undefined,
      // Diagnostic center fields
      centerName: role === "diagnostic_center" ? centerName : undefined,
      centerLicense: role === "diagnostic_center" ? centerLicense : undefined,
    });

    // Generate token
    const token = generateToken(user);
    setTokenCookie(res, token);

    // Create session record
    await createSession(user, token, req);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Login user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user);
    setTokenCookie(res, token);

    // Create session record
    await createSession(user, token, req);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          // Role-specific fields
          specialty: user.specialty,
          dateOfBirth: user.dateOfBirth,
          gender: user.gender,
          centerName: user.centerName,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: error.message || "Server error" });
  }
};

// Get current user
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { fullName, phone, address, specialty } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { fullName, phone, address, specialty },
      { new: true, runValidators: true }
    ).select("-password");

    res.json({
      success: true,
      message: "Profile updated",
      data: { user },
    });
  } catch (error) {
    console.error("UpdateProfile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Logout (clear cookie and revoke session)
export const logout = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    if (token && req.user?.id) {
      await revokeSession(token, req.user.id).catch(() => {});
    }
    res.clearCookie("token");
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    res.clearCookie("token");
    res.json({
      success: true,
      message: "Logged out successfully",
    });
  }
};

// Get active sessions
export const getSessions = async (req, res) => {
  try {
    const sessions = await getActiveSessions(req.user.id);

    // Hide token from response
    const sanitized = sessions.map(s => ({
      _id: s._id,
      device: s.device,
      browser: s.browser,
      os: s.os,
      ipAddress: s.ipAddress,
      lastActive: s.lastActive,
      isCurrentSession: s.isCurrentSession,
      createdAt: s.createdAt,
    }));

    res.json({
      success: true,
      data: { sessions: sanitized },
    });
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Revoke a specific session
export const revokeUserSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    await revokeSession(sessionId, req.user.id);

    res.json({
      success: true,
      message: "Session revoked successfully",
    });
  } catch (error) {
    console.error("Revoke session error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Revoke all other sessions
export const revokeAllOtherSessions = async (req, res) => {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    await revokeAllSessions(req.user.id, token);

    res.json({
      success: true,
      message: "All other sessions revoked successfully",
    });
  } catch (error) {
    console.error("Revoke all sessions error:", error);
    res.status(500).json({ message: "Server error" });
  }
};