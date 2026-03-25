import Supplier from '../models/Supplier.js';
import { apiRequest } from './apiClient.js';
import { generateId } from '../utils/helpers.js';

// ===============================
// Get All Suppliers
export const getSuppliers = async () => apiRequest('suppliers');

// ===============================
// Get Supplier By ID
export const getSupplierById = async (id) =>
  apiRequest(`suppliers/${id}`);

// ===============================
// Suppliers + Products Supplied Count
export const getSuppliersWithProductSupplied = async () => {
  const [suppliersRes, productsRes] = await Promise.all([
    apiRequest('suppliers'),
    apiRequest('products'),
  ]);

  const suppliers = suppliersRes.data || [];
  const products = productsRes.data || [];

  const suppliersWithCount = suppliers.map((s) => {
    const count = products.filter((p) => p.supplier_id === s.id).length;
    return { ...s, ProductsSupplied: count };
  });

  return { success: true, data: suppliersWithCount };
};

// ===============================
// Create Supplier
export const createSupplier = async (data) => {
  const supplierId = generateId('SUP');

  const newSupplier = new Supplier({
    id: supplierId,
    supplierName: data.supplier_name,
    contactName: data.contact_name,
    contactEmail: data.contact_email,
    contactPhone: data.contact_phone,
    address: data.address
  });

  return await apiRequest('suppliers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newSupplier)
  });
};

// ===============================
// Update Supplier
export const updateSupplier = async (supplierId, data) => {
  const updatedSupplier = new Supplier({
    id: supplierId,
    supplierName: data.supplier_name,
    contactName: data.contact_name,
    contactEmail: data.contact_email,
    contactPhone: data.contact_phone,
    address: data.address
  });

  return await apiRequest(`suppliers/${supplierId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updatedSupplier)
  });
};

// ===============================
// Delete Supplier
export const deleteSupplier = async (supplierId) => {
  return await apiRequest(`suppliers/${supplierId}`, {
    method: 'DELETE'
  });
};