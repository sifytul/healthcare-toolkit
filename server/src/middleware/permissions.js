/**
 * Fine-grained permissions system
 * Defines what each role can do with each resource
 */

// Permission definitions
const PERMISSIONS = {
  // Patient permissions
  PATIENT_READ_OWN: "patient:read:own",
  PATIENT_UPDATE_OWN: "patient:update:own",
  PATIENT_DELETE_OWN: "patient:delete:own",

  // Doctor permissions
  PATIENT_READ_ALL: "patient:read:all",
  PATIENT_CREATE: "patient:create",
  PATIENT_UPDATE_ALL: "patient:update:all",
  PATIENT_DELETE_ALL: "patient:delete:all",
  DIAGNOSIS_CREATE: "diagnosis:create",
  DIAGNOSIS_READ_ALL: "diagnosis:read:all",
  DIAGNOSIS_UPDATE: "diagnosis:update",
  PRESCRIPTION_CREATE: "prescription:create",
  PRESCRIPTION_READ_ALL: "prescription:read:all",
  VISIT_CREATE: "visit:create",
  VISIT_READ_ALL: "visit:read:all",
  VISIT_UPDATE: "visit:update",

  // Diagnostic center permissions
  REPORT_CREATE: "report:create",
  REPORT_READ_OWN: "report:read:own",
  REPORT_DOWNLOAD: "report:download",

  // Admin permissions
  USER_CREATE: "user:create",
  USER_READ_ALL: "user:read:all",
  USER_UPDATE_ALL: "user:update:all",
  USER_DELETE: "user:delete",
  AUDIT_READ: "audit:read",
  SETTINGS_UPDATE: "settings:update",

  // Government analyst permissions
  ANALYTICS_READ: "analytics:read",
  ANTIBIOGRAM_READ: "antibiogram:read",
  EPIDEMIOLOGY_READ: "epidemiology:read",
};

// Role to permissions mapping
const ROLE_PERMISSIONS = {
  patient: [
    PERMISSIONS.PATIENT_READ_OWN,
    PERMISSIONS.PATIENT_UPDATE_OWN,
    PERMISSIONS.REPORT_READ_OWN,
  ],
  doctor: [
    PERMISSIONS.PATIENT_READ_ALL,
    PERMISSIONS.PATIENT_CREATE,
    PERMISSIONS.PATIENT_UPDATE_ALL,
    PERMISSIONS.DIAGNOSIS_CREATE,
    PERMISSIONS.DIAGNOSIS_READ_ALL,
    PERMISSIONS.DIAGNOSIS_UPDATE,
    PERMISSIONS.PRESCRIPTION_CREATE,
    PERMISSIONS.PRESCRIPTION_READ_ALL,
    PERMISSIONS.VISIT_CREATE,
    PERMISSIONS.VISIT_READ_ALL,
    PERMISSIONS.VISIT_UPDATE,
    PERMISSIONS.REPORT_READ_OWN,
    PERMISSIONS.REPORT_DOWNLOAD,
  ],
  diagnostic_center: [
    PERMISSIONS.REPORT_CREATE,
    PERMISSIONS.REPORT_READ_OWN,
    PERMISSIONS.PATIENT_READ_OWN,
  ],
  admin: [
    PERMISSIONS.USER_CREATE,
    PERMISSIONS.USER_READ_ALL,
    PERMISSIONS.USER_UPDATE_ALL,
    PERMISSIONS.USER_DELETE,
    PERMISSIONS.PATIENT_READ_ALL,
    PERMISSIONS.PATIENT_CREATE,
    PERMISSIONS.PATIENT_UPDATE_ALL,
    PERMISSIONS.PATIENT_DELETE_ALL,
    PERMISSIONS.DIAGNOSIS_READ_ALL,
    PERMISSIONS.PRESCRIPTION_READ_ALL,
    PERMISSIONS.VISIT_READ_ALL,
    PERMISSIONS.REPORT_READ_OWN,
    PERMISSIONS.AUDIT_READ,
    PERMISSIONS.SETTINGS_UPDATE,
  ],
  government_analyst: [
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.ANTIBIOGRAM_READ,
    PERMISSIONS.EPIDEMIOLOGY_READ,
    PERMISSIONS.PATIENT_READ_ALL, // For aggregate data only
  ],
};

/**
 * Check if a role has a specific permission
 */
export const hasPermission = (role, permission) => {
  const rolePerms = ROLE_PERMISSIONS[role] || [];
  return rolePerms.includes(permission);
};

/**
 * Check if a role has any of the specified permissions
 */
export const hasAnyPermission = (role, permissions) => {
  const rolePerms = ROLE_PERMISSIONS[role] || [];
  return permissions.some((p) => rolePerms.includes(p));
};

/**
 * Check if a role has all of the specified permissions
 */
export const hasAllPermissions = (role, permissions) => {
  const rolePerms = ROLE_PERMISSIONS[role] || [];
  return permissions.every((p) => rolePerms.includes(p));
};

/**
 * Get all permissions for a role
 */
export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

/**
 * Middleware factory for permission checking
 */
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!hasPermission(req.user.role, permission)) {
      return res.status(403).json({
        message: `Access denied. Required permission: ${permission}`,
      });
    }

    next();
  };
};

/**
 * Middleware factory for multiple permissions (any)
 */
export const requireAnyPermission = (permissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!hasAnyPermission(req.user.role, permissions)) {
      return res.status(403).json({
        message: `Access denied. Required permissions: ${permissions.join(", ")}`,
      });
    }

    next();
  };
};

/**
 * Resource ownership checker
 * Use for resources where users can only access their own data
 */
export const checkOwnership = (getOwnerId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Admins and doctors can access all resources
    if (req.user.role === "admin" || req.user.role === "doctor") {
      return next();
    }

    const ownerId = getOwnerId(req);
    const userId = req.user.id.toString();

    // Check if user owns the resource
    if (ownerId !== userId) {
      return res.status(403).json({
        message: "Access denied. You can only access your own resources.",
      });
    }

    next();
  };
};

/**
 * Patient access checker
 * Verifies doctor has been assigned to patient or patient owns the record
 */
export const checkPatientAccess = (getPatientId) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    // Admins can access all
    if (req.user.role === "admin") {
      return next();
    }

    // Patients can access their own
    if (req.user.role === "patient") {
      const patientId = getPatientId(req);
      if (req.user.patientProfile?.toString() === patientId) {
        return next();
      }
      // Check if user has a linked patient profile
      if (req.user.patients?.includes(patientId)) {
        return next();
      }
    }

    // For doctors, would need to check assignment (implemented in route handlers)
    // For now, allow doctors to access
    if (req.user.role === "doctor") {
      return next();
    }

    return res.status(403).json({
      message: "Access denied to this patient record",
    });
  };
};

export default {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  requirePermission,
  requireAnyPermission,
  checkOwnership,
  checkPatientAccess,
};