import Supplier from '../models/Supplier.js';
import { apiRequest } from './apiClient.js';
import { generateId } from '../utils/helpers.js';

//------------------------------------------
// Get all suppliers
export const getSuppliers = async () => apiRequest('suppliers');

//-------------------------------------------
// Get supplier by id
export const getSupplierById = async (id) => apiRequest(`suppliers/${id}`);

//--------------------------------------------
// Get suppliers with product Supplied

// ( ..................... loading ..........................)
export const getSuppliersWithProductSupplied = async () => {
  const [suppliersRes, productsRes] = await Promise.all([
    apiRequest('suppliers'),
    apiRequest('products'),
  ]);

  const suppliers = suppliersRes.data;
  const products = productsRes.data;

  suppliers.map((supplier) => {
    const productSupplied = products.filter(
      (pro) => pro.supplierId == supplier.id,
    ).length;

    return { ...supplier, productSupplied };
  });

  return { success: true, data: suppliers };
};
// ( ..................... loading ..........................)

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

  const supplier = await apiRequest('suppliers', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(newSupplier),
  });

  return { success: true, data: supplier };
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

  const supplier = await apiRequest(`suppliers/${supplierId}`, {
    method: 'PUT',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(updatedSupplier),
  });

  return { success: true, data: supplier };
};

// ---------------------------------------------
// Delete suppliers
export const deleteSupplier = async (supplierId) => {
  const supplier = await apiRequest(`suppliers/${supplierId}`, {
    method: 'DELETE',
  });

  return { success: true, data: supplier };
};
