import { getCategories } from './categoriesApi.js';
import { apiRequest } from './apiClient.js';

//
export const getProducts = async () => await apiRequest('products');

//
export const getCategoriesSummary = async (productsData = null) => {
  const [categoriesRes, productsRes] = await Promise.all([
    getCategories(),
    productsData ? { success: true, data: productsData } : getProducts(),
    ,
  ]);

  if (!categoriesRes.success) {
    return { success: false, error: categoriesRes.error };
  }
  if (!productsRes.success) {
    return { success: false, error: productsRes.error };
  }

  const categories = categoriesRes.data;
  const products = productsRes.data;

  //
  const group = products.reduce((acc, prd) => {
    const catId = prd.category_id;
    if (!acc[catId]) {
      acc[catId] = {
        productCount: 0,
        totalValue: 0,
        totalQuantity: 0,
      };
    }

    acc[catId].productCount++;
    acc[catId].totalValue += prd.price * (prd.quantity ?? 0);
    acc[catId].totalQuantity += prd.quantity ?? 0;

    return acc;
  }, {});

  //
  const summary = categories.map((category) => {
    const avgPrice =
      group[category.id].totalQuantity > 0
        ? group[category.id].totalValue / group[category.id].totalQuantity
        : 0;

    return {
      categoryName: category.name,
      productCount: group[category.id].productCount,
      totalValue: group[category.id].totalValue,
      avgPrice,
    };
  });

  return { success: true, data: summary };
};

//
