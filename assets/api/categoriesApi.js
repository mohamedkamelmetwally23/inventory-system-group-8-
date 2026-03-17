import Category from '../models/Category.js';
import { generateId } from '../utils/helpers.js';
import { apiRequest } from './apiClient.js';

//---------------------------------
// Get all categories
export const getCategories = async () => apiRequest('categories');

//---------------------------------
// Get category by id
export const getCategoryById = async (id) => apiRequest(`categories/${id}`);

//---------------------------------
// Get categories with product count
export const getCategoriesWithProductCount = async () => {
  const [categoriesRes, productsRes] = await Promise.all([
    apiRequest('categories'),
    apiRequest('products'),
  ]);

  const categories = categoriesRes.data;
  const products = productsRes.data;

  categories.map((category) => {
    const productCount = products.filter(
      (prd) => prd.categoryId == category.id,
    ).length;

    return { ...category, productCount };
  });

  return { success: true, data: categories };
};

//---------------------------------
// Create categories
export const createCategory = async (data) => {
  const categoryId = generateId('CAT');

  const newCategory = Category({
    id: categoryId,
    category_name: data.name,
    category_description: data.description,
  });

  const category = await apiRequest('categories', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(newCategory),
  });

  return { success: true, data: category };
};
