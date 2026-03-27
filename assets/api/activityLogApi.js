import { apiRequest } from "./apiClient.js";
import ActivyLogs from "../models/ActivityLog.js";
import { generateId } from "../utils/helpers.js";

// get all  ActivityLogs
export const getActivityLogs = async () => {
  const activeRes = await apiRequest("activity_log");
  const userRes = await apiRequest(`users`);
  const activities = activeRes.data;
  const users = userRes.data;
  const result = activities.map((active) => {
    const user = users.find((usr) => usr.id == active.user_id);
    return {
      ...active,
      userName: user ? user.name : "Unknown",
    };
  });
  return { success: true, data: result };
};
// create all  ActivityLogs
export const createActivityLog = async (data) => {
  const activityLog = new ActivyLogs({
    id: generateId("ACT"),
    action: data.action,
    entity_type: data.entity_type,
    entity_id: data.entity_id,
    description: data.description,
    user_id: data.user_id,
    timestamp: new Date().toISOString(),
  });

  return await apiRequest("activity_log", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(activityLog),
  });
};
