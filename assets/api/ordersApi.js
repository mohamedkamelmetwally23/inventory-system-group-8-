import { apiRequest } from "./apiClient.js";

export const getPurchaseOrders = async () => apiRequest("purchase_orders");

export const getDataById = async (id) => apiRequest(`purchase_orders/${id}`);

export const editStatus = async (id, data) => {
  return await apiRequest(`purchase_orders/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const addNewOrder = async (data) => {
  return await apiRequest("purchase_orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export const getSuppliers = async () => apiRequest("suppliers");

export const getProducts = async () => apiRequest("products");
