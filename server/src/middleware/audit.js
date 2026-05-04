import AuditLog from "../models/auditLogModel.js";

/**
 * Audit logging middleware factory
 * @param {string} action - The action being performed (e.g., 'view', 'create', 'update', 'delete')
 * @param {string} resource - The resource type (e.g., 'patient', 'report', 'diagnosis')
 * @param {function} getResourceId - Optional function to extract resource ID from request
 * @param {function} getDetails - Optional function to extract additional details from request
 */
export const auditLog = (action, resource, getResourceId, getDetails) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    // Override json to log after response
    res.json = function (data) {
      // Only log for successful operations (2xx status)
      const statusCode = res.statusCode;
      const isSuccess = statusCode >= 200 && statusCode < 300;

      // Async log (don't block response)
      (async () => {
        try {
          const logData = {
            user: req.user?.id,
            userEmail: req.user?.email,
            userRole: req.user?.role,
            action,
            resource,
            resourceId: getResourceId ? getResourceId(req) : null,
            details: getDetails ? getDetails(req, data) : null,
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.headers["user-agent"],
            status: isSuccess ? "success" : "failure",
            errorMessage: !isSuccess ? (data?.message || "Error") : null,
          };

          await AuditLog.log(logData);
        } catch (error) {
          console.error("Audit logging error:", error.message);
        }
      })();

      return originalJson(data);
    };

    next();
  };
};

/**
 * Simplified audit middleware for GET requests (view operations)
 */
export const auditView = (resource, getResourceId) => {
  return auditLog("view", resource, getResourceId);
};

/**
 * Simplified audit middleware for POST requests (create operations)
 */
export const auditCreate = (resource, getResourceId, getDetails) => {
  return auditLog("create", resource, getResourceId, getDetails);
};

/**
 * Simplified audit middleware for PUT/PATCH requests (update operations)
 */
export const auditUpdate = (resource, getResourceId, getDetails) => {
  return auditLog("update", resource, getResourceId, getDetails);
};

/**
 * Simplified audit middleware for DELETE requests
 */
export const auditDelete = (resource, getResourceId) => {
  return auditLog("delete", resource, getResourceId);
};

/**
 * Manual audit log function for complex scenarios
 */
export const logAudit = async (data) => {
  return await AuditLog.log(data);
};

export default { auditLog, auditView, auditCreate, auditUpdate, auditDelete, logAudit };