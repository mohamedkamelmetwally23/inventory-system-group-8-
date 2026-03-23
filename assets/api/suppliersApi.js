import Supplier from '../models/Supplier.js';
import { apiRequest } from './apiClient.js';
import { generateId } from '../utils/helpers.js';

//-------------------------------------------
// Get all suppliers
export const getSuppliers = async () => apiRequest('suppliers');

//-------------------------------------------
// Get supplier by id
export const getSupplierById = async (id) => apiRequest(`suppliers/${id}`);

//--------------------------------------------
// Get suppliers with count of product Supplied
export const getSuppliersWithProductSupplied = async () => {
  const [suppliersRes, productsRes] = await Promise.all([
    apiRequest('suppliers'),
    apiRequest('products'),
  ]);

  const suppliers = suppliersRes.data;
  const products = productsRes.data;

  const suppliersWithProductSupplied = suppliers.map((supplier) => {
    const product_supplied = products.filter(
      (pro) => pro.supplier_id == supplier.id,
    ).length;

    return { ...supplier, product_supplied};
  });

  return { success: true, data: suppliersWithProductSupplied };
};

//----------------------------------------------
// Create suppliers
export const createSupplier = async (data) => {
  const supplierId = generateId('SUPP');

  const newSupplier = new Supplier({
    id: supplierId,
    supplierName: data.supplier_name,
    contactName: data.contact_name,
    contactEmail: data.contact_email,
    contactPhone: data.contact_phone,
    address: data.address,
  });

  return await apiRequest('suppliers', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(newSupplier),
  });
};

//----------------------------------------------
// Updata suppliers
export const updataSupplier = async (supplierId, data) => {
  const updatedSupplier = new Supplier({
    id: supplierId,
    supplierName: data.supplier_name,
    contactName: data.contact_name,
    contactEmail: data.contact_email,
    contactPhone: data.contact_phone,
    address: data.address,
  });

  return await apiRequest(`suppliers/${supplierId}`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(updatedSupplier),
  });
};

// ---------------------------------------------
// Delete suppliers
export const deleteSupplier = async (supplierId) => {
  const supplier = await apiRequest(`suppliers/${supplierId}`, {
    method: 'DELETE',
  });

  return { success: true, data: supplier };
};
