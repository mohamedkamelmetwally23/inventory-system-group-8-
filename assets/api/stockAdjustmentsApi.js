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
    type: data.type,
    quantity: data.quantity,
    status: data.status,
    note: data.note,
    date: data.date,
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
