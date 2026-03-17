import { apiRequest } from "./apiClient.js";

export const getSuppliers = async () => apiRequest('suppliers');