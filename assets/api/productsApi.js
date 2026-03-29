import Product from '../models/Product.js';
import { apiRequest } from './apiClient.js';
import { generateId } from '../utils/helpers.js';
import { createActivityLog } from './activityLogApi.js';

// ===============================
// Get All Products
// ===============================
export const getProducts = async () => {
  return await apiRequest('products');
};

// ===============================
// Get Product By ID
// ===============================
export const getProductById = async (id) => {
  return await apiRequest(`products/${id}`);
};

// ===============================
// Get Products + Category Name + Supplier Name
// ===============================
export const getProductsWithRelations = async () => {
  const [productsRes, categoriesRes, suppliersRes] = await Promise.all([
    apiRequest('products'),
    apiRequest('categories'),
    apiRequest('suppliers'),
  ]);

  const products = productsRes.data || [];
  const categories = categoriesRes.data || [];
  const suppliers = suppliersRes.data || [];

  //
  const mappedProducts = products.map((p) => {
    const categoryName =
      categories.find((c) => c.id === p.category_id)?.name || 'Unknown';

    const supplierName =
      suppliers.find((s) => s.id === p.supplier_id)?.supplier_name || 'Unknown';

    return {
      ...p,
      category_name: categoryName,
      supplier_name: supplierName,
    };
  });

  return { success: true, data: mappedProducts };
};

// ===============================
// Create Product
// ===============================
export const createProduct = async (data) => {
  const productId = generateId('PRD');

  const newProduct = new Product({
    id: productId,
    sku: data.sku,
    product_name: data.product_name,
    category_id: data.category_id,
    quantity: data.quantity,
    reorderLevel: data.reorderLevel,
    price: data.price,
    expire_date: data.expire_date,
    supplier_id: data.supplier_id,
    created_at: new Date().toISOString(),
  });

  const result = await apiRequest('products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newProduct),
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  await createActivityLog({
    action: 'create',
    entity_type: 'product',
    entity_id: productId,
    description: `Added new product: ${data.product_name}`,
    user_id: 'USR-4c3e2a1f',
  });

  return result;
};

// ===============================
// Update Product
// ===============================
export const updateProduct = async (productId, data) => {
  const result = await apiRequest(`products/${productId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  await createActivityLog({
    action: 'update',
    entity_type: 'product',
    entity_id: productId,
    description: `Updated product: ${data.product_name}`,
    user_id: 'USR-4c3e2a1f',
  });

  return result;
};

// ===============================
// Delete Product
// ===============================
export const deleteProduct = async (productId) => {
  const productRes = await getProductById(productId);
  if (!productRes.success) {
    return { success: false, error: productRes.error };
  }

  const productName = productRes.data?.product_name || 'Unknown';

  const result = await apiRequest(`products/${productId}`, {
    method: 'DELETE',
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  await createActivityLog({
    action: 'delete',
    entity_type: 'product',
    entity_id: productId,
    description: `Deleted discontinued product: Old ${productName} Modal`,
    user_id: 'USR-4c3e2a1f',
  });

  return result;
};
