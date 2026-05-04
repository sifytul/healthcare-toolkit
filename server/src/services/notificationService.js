import { WebSocketServer } from "ws";

// Store connected clients: Map<userId, Set<WebSocket>>
const clients = new Map();

// Create WebSocket server
let wss = null;

export const initializeWebSocket = (server) => {
  wss = new WebSocketServer({ server });

  wss.on("connection", (ws, req) => {
    console.log("WebSocket client connected");

    ws.on("message", (message) => {
      try {
        const data = JSON.parse(message);
        handleClientMessage(ws, data);
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      handleClientDisconnect(ws);
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  console.log("WebSocket server initialized");
  return wss;
};

// Handle incoming messages from clients
const handleClientMessage = (ws, data) => {
  if (data.type === "authenticate" && data.userId) {
    // Register user connection
    if (!clients.has(data.userId)) {
      clients.set(data.userId, new Set());
    }
    clients.get(data.userId).add(ws);
    ws.userId = data.userId;

    // Send confirmation
    ws.send(JSON.stringify({
      type: "authenticated",
      message: "Connected successfully",
    }));

    console.log(`User ${data.userId} authenticated on WebSocket`);
  }
};

// Handle client disconnect
const handleClientDisconnect = (ws) => {
  if (ws.userId && clients.has(ws.userId)) {
    const userClients = clients.get(ws.userId);
    userClients.delete(ws);

    if (userClients.size === 0) {
      clients.delete(ws.userId);
    }
    console.log(`User ${ws.userId} disconnected from WebSocket`);
  }
};

// Send notification to a specific user
export const sendNotification = (userId, notification) => {
  const userClients = clients.get(userId);

  if (!userClients || userClients.size === 0) {
    console.log(`No active connections for user ${userId}`);
    return false;
  }

  const message = JSON.stringify({
    type: "notification",
    data: notification,
    timestamp: new Date().toISOString(),
  });

  userClients.forEach((ws) => {
    if (ws.readyState === 1) { // WebSocket.OPEN
      ws.send(message);
    }
  });

  console.log(`Notification sent to user ${userId}:`, notification.title);
  return true;
};

// Send notification to multiple users
export const sendNotificationToUsers = (userIds, notification) => {
  userIds.forEach((userId) => sendNotification(userId, notification));
};

// Broadcast to all connected clients
export const broadcast = (message) => {
  if (!wss) return;

  const data = JSON.stringify({
    type: "broadcast",
    data: message,
    timestamp: new Date().toISOString(),
  });

  wss.clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(data);
    }
  });
};

// Notification types
export const NotificationType = {
  REPORT_UPLOADED: "report_uploaded",
  REVIEW_REQUESTED: "review_requested",
  REVIEW_COMPLETED: "review_completed",
  DIAGNOSIS_CONFIRMED: "diagnosis_confirmed",
  DIAGNOSIS_REJECTED: "diagnosis_rejected",
  CRITICAL_VALUE: "critical_value",
  GENERAL: "general",
};

// Helper functions for specific notifications
export const notifyReportUploaded = (userId, reportId, patientName) => {
  sendNotification(userId, {
    type: NotificationType.REPORT_UPLOADED,
    title: "New Report Uploaded",
    message: `A new report has been uploaded for patient ${patientName}`,
    reportId,
    patientName,
  });
};

export const notifyReviewRequested = (reviewerId, diagnosisId, patientName) => {
  sendNotification(reviewerId, {
    type: NotificationType.REVIEW_REQUESTED,
    title: "New Review Request",
    message: `A new review has been requested for patient ${patientName}`,
    diagnosisId,
    patientName,
  });
};

export const notifyReviewCompleted = (requesterId, diagnosisId, status, patientName) => {
  sendNotification(requesterId, {
    type: NotificationType.REVIEW_COMPLETED,
    title: `Review ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: `The review for patient ${patientName} has been ${status}`,
    diagnosisId,
    patientName,
    status,
  });
};

export const notifyCriticalValue = (doctorId, patientName, value, testType) => {
  sendNotification(doctorId, {
    type: NotificationType.CRITICAL_VALUE,
    title: "Critical Value Alert",
    message: `Critical ${testType} value detected for patient ${patientName}: ${value}`,
    patientName,
    value,
    testType,
  });
};

export default {
  initializeWebSocket,
  sendNotification,
  sendNotificationToUsers,
  broadcast,
  notifyReportUploaded,
  notifyReviewRequested,
  notifyReviewCompleted,
  notifyCriticalValue,
  NotificationType,
};