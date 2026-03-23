import { apiRequest } from "./apiClient.js";

export const getPurchaseOrders = async () => apiRequest("purchase_orders");

export async function getData(id) {
  const response = await fetch(` http://localhost:3000/purchase_orders/${id}`);
  return response.json();
}
export async function editStatus(id, data) {
  await fetch(` http://localhost:3000/purchase_orders/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function addNewOrder(data) {
  await fetch(` http://localhost:3000/purchase_orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function getSuppliers() {
  const response = await fetch(` http://localhost:3000/suppliers`);
  return response.json();
}
