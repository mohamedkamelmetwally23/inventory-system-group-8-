import { apiRequest } from "./apiClient.js";

export const getUsersData = async () => apiRequest("users");
