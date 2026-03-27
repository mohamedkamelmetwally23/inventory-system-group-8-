// Imports
import { getCategoriesWithProductCount } from '../api/categoriesApi.js';
import { getCategoriesSummary, getProducts } from '../api/reportsApi.js';
import {
  formatCurrency,
  generateChart,
  getBlueShade,
  showSpinner,
  showTableLoader,
} from '../utils/helpers.js';
import loadLayout from '../ui/layout.js';

// Elements
const totalValueEl = document.querySelector('.stat-value');
const totalProductsEl = document.querySelector('.stat-products');
const totalLowStockEl = document.querySelector('.stat-low-stock');
const totalOutOfStockEl = document.querySelector('.stat-out-of-stock');

const selectedDateText = document.getElementById('selectedDateText');

const statsCardsContainer = document.querySelector('.stats-cards');
const tableBody = document.querySelector('tbody');
const categoryChartCanvas = document.getElementById('category-chart');
const stockStatusChartCanvas = document.getElementById('stock-status-chart');
const topProductsCanvas = document.getElementById('top-products-chart');

// States
let inventoryProducts = [];

// Display a summary of the categories in a table
const displayCategorySummary = (catSummary, i) => {
  const markup = `
        <tr class="border-bottom">
          <td class="text-start px-4 py-2 fw-medium text-capitalize">
            <span class="string-to-color" style="background-color: ${getBlueShade(i)}"></span>
            ${catSummary.categoryName}
          </td>
          <td class="text-end px-4 py-2">${catSummary.productCount}</td>
          <td class="text-end px-4 py-2 fw-medium">${formatCurrency(catSummary.totalValue)}</td>
          <td class="text-end px-4 py-2 text-muted">${formatCurrency(catSummary.avgPrice)}</td>
        </tr>
  `;

  tableBody.insertAdjacentHTML('beforeend', markup);
};

//------------------------------------------
// Calculate and Display Stats total==> products, values, low stock, and out of stock
const renderStatsOverview = () => {
  const stats = inventoryProducts.reduce(
    (acc, prd) => {
      acc.value += prd.price * (prd.quantity ?? 0);

      if (prd.quantity == 0) acc.outOfStock++;
      else if (prd.quantity <= prd.reorderLevel) acc.lowStock++;

      return acc;
    },
    {
      value: 0,
      lowStock: 0,
      outOfStock: 0,
    },
  );

  totalValueEl.textContent = formatCurrency(stats.value);
  totalProductsEl.textContent = inventoryProducts.length;
  totalLowStockEl.textContent = stats.lowStock;
  totalOutOfStockEl.textContent = stats.outOfStock;
};

// Retrieve a summary of the categories
const renderSummaryCategories = async () => {
  const result = await getCategoriesSummary(inventoryProducts);

  showTableLoader(tableBody);
  if (result.success) {
    tableBody.innerHTML = '';
    result.data.forEach(displayCategorySummary);

    //
  } else {
    tableBody.innerHTML =
      '<tr><td colspan="4" class="text-center text-danger py-2">Failed to load categories summary</td></tr>';
  }
};

//
const renderCategoriesChart = async () => {
  const result = await getCategoriesWithProductCount();

  showSpinner(categoryChartCanvas);
  categoryChartCanvas.innerHTML = '';
  if (!result.success) {
    categoryChartCanvas.parentElement.innerHTML = `
      <div class="text-danger text-center py-4">
        <i class="fa-solid fa-circle-exclamation me-2"></i>
        Failed to load category data. Please try again later.
      </div>
    `;
    return;
  }

  if (!result.data || result.data.length === 0) {
    categoryChartCanvas.parentElement.innerHTML = `
      <div class="text-muted text-center py-4">
        <i class="fa-regular fa-folder-open me-2"></i>
        No categories found. Add some categories to see the distribution.
      </div>
    `;
    return;
  }

  const chartData = result.data.reduce(
    (acc, cat, i) => {
      acc.labels.push(cat.name);
      acc.count.push(cat.productCount);
      acc.colors.push(getBlueShade(i));
      return acc;
    },
    { labels: [], count: [], colors: [] },
  );

  generateChart(
    categoryChartCanvas,
    'pie',
    chartData.labels,
    chartData.count,
    chartData.colors,
  );
};

//
const renderStockStatusChart = () => {
  const chartData = inventoryProducts.reduce(
    (acc, prd) => {
      if (prd.quantity == 0) acc.outOfStock++;
      else if (prd.quantity <= prd.reorderLevel) acc.lowStock++;
      else acc.inStock++;

      return acc;
    },
    {
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
    },
  );
  const labels = ['In Stock', 'Low Stock', 'Out of Stock'];
  const data = [chartData.inStock, chartData.lowStock, chartData.outOfStock];
  const colors = ['#10b981', '#f59e0b', '#ef4444'];

  generateChart(stockStatusChartCanvas, 'pie', labels, data, colors);

  const stockStatus = document.querySelector('.stock-status-value');
  const inStockEl = stockStatus.querySelector('.in-stock');
  const lowStockEl = stockStatus.querySelector('.low-stock');
  const outStockEl = stockStatus.querySelector('.out-stock');

  inStockEl.textContent = `${chartData.inStock} items`;
  lowStockEl.textContent = `${chartData.lowStock} items`;
  outStockEl.textContent = `${chartData.outOfStock} items`;
};

//
const renderTopProducts = () => {
  const topProducts = inventoryProducts
    .map((prd) => ({
      name: prd.product_name,
      totalValue: (prd.price || 0) * (prd.quantity || 0),
    }))
    .sort((a, b) => b.totalValue - a.totalValue)
    .slice(0, 5);

  const labels = topProducts.map((p) => p.name);
  const chartData = topProducts.map((p) => p.totalValue);

  generateChart(topProductsCanvas, 'bar', labels, chartData, '#1e3a8a', {
    scales: { y: { beginAtZero: true } },
  });
};

//----------------------------------------------
// Event Listeners for filter options
document.querySelectorAll('.filter-opt').forEach((item) => {
  item.addEventListener('click', (e) => {
    e.preventDefault();

    document.querySelectorAll('.filter-opt').forEach((opt) => {
      opt.classList.remove('filter-opt--active');
    });

    // const selectedValue = clickedOption.getAttribute('data-value');
    const clickedOption = e.currentTarget;

    selectedDateText.textContent = clickedOption.textContent.trim();
    clickedOption.classList.add('filter-opt--active');
  });
});

//-----------------------------------------------
// Initialization
const init = async () => {
  const result = await getProducts();

  renderSummaryCategories();
  renderCategoriesChart();

  if (result.success) {
    inventoryProducts = result.data;

    renderStatsOverview();
    renderStockStatusChart();
    renderTopProducts();

    //
  } else {
    statsCardsContainer.innerHTML = `
        <div class="alert alert-danger text-center">
          Failed to load inventory data. Please check your connection or try again later.
        </div>
    `;

    stockStatusChartCanvas.parentElement.parentElement.innerHTML = `
      <div class="text-danger text-center py-4">
        <i class="fa-solid fa-circle-exclamation me-2"></i>
        Failed to load low stock data.
      </div>
    `;

    topProductsCanvas.parentElement.innerHTML = `
        <div class="text-danger text-center py-4">
          <i class="fa-solid fa-circle-exclamation me-2"></i>
          No product data available.
        </div>
    `;

    tableBody.innerHTML =
      '<tr><td colspan="4" class="text-center text-danger py-2">Error loading data</td></tr>';

    console.error('Failed to load products:', result.error);
  }
};

loadLayout('Reports');
init();
