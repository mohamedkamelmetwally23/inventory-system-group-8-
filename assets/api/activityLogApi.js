import { apiRequest } from './apiClient.js';

//
export const getActivityLogs = async () => await apiRequest('activity_log');
