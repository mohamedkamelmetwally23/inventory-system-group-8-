import { Order } from '../models/Order.js';
import { generateId } from '../utils/helpers.js';
import { createActivityLog } from './activityLogApi.js';
import { apiRequest } from './apiClient.js';

export const getPurchaseOrders = async () => apiRequest('purchase_orders');

export const getDataById = async (id) => apiRequest(`purchase_orders/${id}`);

export const editStatus = async (id, data) => {
  const order = await getDataById(id);

  const result = await apiRequest(`purchase_orders/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  const orderData = order.data;

  return await createActivityLog({
    action: 'receive',
    entity_type: 'purchase_order',
    entity_id: id,
    description: `Purchase order received: ${orderData.order_number}`,
    user_id: 'USR-4c3e2a1f',
  });
};

export const addNewOrder = async (data) => {
  const orderId = generateId('ORD');

  const newOrderPurchase = new Order({
    id: orderId,
    order_number: data.order_number,
    supplier_id: data.supplier_id,
    creation_date: data.creation_date,
    items: data.items,
    status: data.status,
    total_quantity: data.total_quantity,
    total_amount: data.total_amount,
  });

  const result = await apiRequest('purchase_orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return await createActivityLog({
    action: 'create',
    entity_type: 'purchase_order',
    entity_id: data.id,
    description: `Created purchase order ${newOrderPurchase.order_number}`,
    user_id: 'USR-4c3e2a1f',
  });
};

export const updateProductQuantity = async (id, data) => {
  const result = await apiRequest(`products/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return result;
};

export const markOrderUpdated = async (id) => {
  return await apiRequest(`purchase_orders/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quantityUpdated: true }),
  });
};

export const deletePurchaseOrder = async (id) => {
  const order = await getDataById(id);

  const result = await apiRequest(`purchase_orders/${id}`, {
    method: 'DELETE',
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  const data = order.data;

  return await createActivityLog({
    action: 'delete',
    entity_type: 'purchase_order',
    entity_id: id,
    description: `Removed purchase order ${data.order_number}`,
    user_id: 'USR-4c3e2a1f',
  });
};
