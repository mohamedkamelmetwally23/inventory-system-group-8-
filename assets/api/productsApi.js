import { apiRequest } from "./apiClient.js";
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
