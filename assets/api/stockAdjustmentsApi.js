import { apiRequest } from "./apiClient.js";
import { generateId } from "../utils/helpers.js";
import StockAdjustments from "../models/stockAdjustments.js";
// Get all stock adjustments
export const getAllStockAdjustments = async () => {
  return await apiRequest("stock_adjustments");
};
// Get all stock adjustments by Id
export const getAllStockAdjustmentsById = async (id) => {
  return await apiRequest(`stock_adjustments/${id}`);
};

// Get All stock adjustments and attach product name using product_id
export const getAllStockAdjustmentsByProductName = async () => {
  const stockRes = await apiRequest("stock_adjustments");
  const productRes = await apiRequest(`products`);
  const stocks = stockRes.data;
  const products = productRes.data;
  const result = stocks.map((stock) => {
    const product = products.find((prd) => prd.id == stock.product_id);
    return {
      ...stock,
      productName: product ? product.product_name : "Unknown",
    };
  });
  return { success: true, data: result };
};

// create stock
export const createStockAdjustments = async (data) => {
  const generateStockId = generateId("STK");

  const newStockAdjustments = new StockAdjustments({
    id: generateStockId,
    product_id: data.product_id,
    adjustment_type: data.adjustment_type,
    quantity: data.quantity,
    reason: data.reason,
    timestamp: data.timestamp,
    user: data.user,
  });
  const stockAdjustment = await apiRequest("stock_adjustments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newStockAdjustments),
  });
  return { success: true, data: stockAdjustment };
};
// Update Stock
export const updateStock = async (id, data) => {
  const updateOneStock = await apiRequest(`stock_adjustments/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return { success: true, data: updateOneStock };
};
// Delete Stock
export const deleteStock = async (id) => {
  const deleteOneStock = await apiRequest(`stock_adjustments/${id}`, {
    method: "DELETE",
  });
  return { success: true, data: deleteOneStock };
};
// get all product by name
export const getProductNames = async () => {
  try {
    const response = await apiRequest("products");
    const products =
      response?.products ||
      response?.data ||
      (Array.isArray(response) ? response : []);

    if (!products.length)
      return { success: false, data: [], error: "No products found" };
    const data = products.map((p) => ({
      id: p.id || p.product_id,
      name: p.product_name || p.name,
    }));
    return { success: true, data };
  } catch (err) {
    console.error("getProductNames error:", err);
    return { success: false, data: [], error: err?.message || err };
  }
};
