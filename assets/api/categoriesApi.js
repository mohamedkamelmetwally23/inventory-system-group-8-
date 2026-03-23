import Category from '../models/Category.js';
import { generateId } from '../utils/helpers.js';
import { apiRequest } from './apiClient.js';

//---------------------------------
// Get all categories
export const getCategories = async () => await apiRequest('categories');

//---------------------------------
// Get category by id
export const getCategoryById = async (id) =>
  await apiRequest(`categories/${id}`);

//---------------------------------
// Get categories with product count
export const getCategoriesWithProductCount = async () => {
  const [categoriesRes, productsRes] = await Promise.all([
    apiRequest('categories'),
    apiRequest('products'),
  ]);

  if (!categoriesRes.success) {
    return { success: false, error: categoriesRes.error };
  }
  if (!productsRes.success) {
    return { success: false, error: productsRes.error };
  }

  const categories = categoriesRes.data;
  const products = productsRes.data;

  const categoriesWithProductCount = categories.map((category) => {
    const productCount = products.filter(
      (prd) => prd.category_id == category.id,
    ).length;

    return { ...category, productCount };
  });

  return { success: true, data: categoriesWithProductCount };
};

//---------------------------------
// Create categories
export const createCategory = async (data) => {
  const categoryId = generateId('CAT');

  const newCategory = new Category({
    id: categoryId,
    category_name: data.name,
    category_description: data.description,
  });

  return await apiRequest('categories', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(newCategory),
  });
};

//---------------------------------
// Update category by id
export const updateCategory = async (id, updatedData) => {
  return await apiRequest(`categories/${id}`, {
    method: 'PATCH',
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify(updatedData),
  });
};

//---------------------------------
// Delete category by id and delete all products related to that category
export const deleteCategory = async (id) => {
  const productsRes = await apiRequest('products');
  if (!productsRes.success) {
    return { success: false, error: productsRes.error };
  }

  const hasProducts = productsRes.data.some((prd) => prd.category_id == id);

  if (hasProducts) {
    return {
      success: false,
      error: 'Cannot delete category with products',
    };
  }

  return await apiRequest(`categories/${id}`, { method: 'DELETE' });
};
