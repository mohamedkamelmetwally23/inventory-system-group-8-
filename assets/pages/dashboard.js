// Imports
import { getActivityLogs } from '../api/activityLogApi.js';
import { getPurchaseOrders } from '../api/ordersApi.js';
import { getProducts } from '../api/reportsApi.js';
import loadLayout from '../ui/layout.js';
import { formatCurrency, formatDate, showSpinner } from '../utils/helpers.js';

// Elements
const totalValueEl = document.querySelector('.stat-value');
const totalProductsEl = document.querySelector('.stat-products');
const totalLowStockEl = document.querySelector('.stat-low-stock');
const totalOutOfStockEl = document.querySelector('.stat-out-of-stock');

const statsCardsContainer = document.querySelector('.stats-cards');
const lowStockAlertContainer = document.querySelector('.low-stock-list');
const recentActivityContainer = document.querySelector('.recent-activity-list');
const pendingOrdersContainer = document.querySelector('.pending-orders-list');
const nearExpireContainer = document.querySelector('.near-expire-list');

// States
let inventoryProducts = [];

// Display a single low stock product in the UI
const displayLowStock = (product) => {
  const markup = `
        <li
            class="list-group-item list-group-item-danger rounded-2 py-3 d-flex justify-content-between align-items-center"
          >
            <div>
              <h5 class="fs-6 fw-semibold mb-1">
                ${product.product_name}
              </h5>
              <p class="text-muted mb-0">${product.sku}</p>
            </div>
            <div class="text-center">
              <span class="badge bg-danger mb-1">${product.quantity} left</span>
              <p class="text-muted fs-12 mb-0">min: ${product.reorderLevel}</p>
            </div>
        </li>
  `;

  lowStockAlertContainer.insertAdjacentHTML('beforeend', markup);
};

// Display a single activity log entry with its action badge
const displayRecentActivity = (activity) => {
  const classes = {
    create: 'bg-success',
    update: 'bg-warning',
    delete: 'bg-danger',
    receive: 'main-bg',
    adjust: 'bg-orange',
  };

  const markup = `
      <li
          class="list-group-item list-group-item-light rounded-2 py-3 d-flex justify-content-between align-items-center"
        >
          <div class="me-4">
            <h5 class="fs-6 fw-semibold mb-1 line-clump line-clump-1">
              ${activity.description}
            </h5>
            <p class="text-muted mb-0">Updated: ${formatDate(activity.timestamp)}</p>
          </div>
          <div class="text-center">
            <span class="badge ${classes[activity.action]} text-capitalize">
              ${activity.action}
            </span>
          </div>
      </li>
  `;

  recentActivityContainer.insertAdjacentHTML('beforeend', markup);
};

// Display a single pending purchase order
const displayPendingOrder = (order) => {
  const markup = `
      <li class="list-group-item list-group-item-light rounded-2 py-3 d-flex justify-content-between align-items-center">
        <p class="mb-0"><strong>Order Number:</strong> ${order.order_number}</p>
        <p class="mb-0 badge bg-warning text-capitalize">${order.status}</p>
      </li>
  `;

  pendingOrdersContainer.insertAdjacentHTML('beforeend', markup);
};

// Display a single product that is expiring soon
const displayNearExpire = (product) => {
  const markup = `
      <li class="list-group-item list-group-item-light rounded-2 py-3">
        <h5 class="fs-6 fw-semibold mb-1 line-clump line-clump-1">${product.product_name}</h5>
        <p class="mb-0 badge bg-secondary text-capitalize">Expired: ${formatDate(product.expire_date)}</p>
      </li>
  `;

  nearExpireContainer.insertAdjacentHTML('beforeend', markup);
};

//-----------------------------------------
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

// Render the list of low stock products (up to 5), showing a message if none
const renderLowStockAlerts = () => {
  const lowStocklist = inventoryProducts
    .filter((prd) => prd.quantity <= prd.reorderLevel)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, 5);

  lowStockAlertContainer.innerHTML = '';

  if (lowStocklist.length === 0) {
    lowStockAlertContainer.innerHTML = `
      <li class="list-group-item text-center border-0 py-4">
        <i class="fa-regular fa-circle-check me-2"></i>
        No low stock alerts at the moment.
      </li>
    `;

    return;
  }

  lowStocklist.forEach(displayLowStock);
};

// Fetch and render the 5 most recent activity logs, handling errors and empty state
const renderRecentActivity = async () => {
  const result = await getActivityLogs();

  showSpinner(recentActivityContainer);
  recentActivityContainer.innerHTML = '';

  if (!result.success) {
    recentActivityContainer.innerHTML = `
      <li class="list-group-item text-center text-danger border-0">
        <i class="fa-solid fa-circle-exclamation me-2"></i>
        Failed to load activity log.
      </li>`;

    return;
  }

  if (!result.data || result.data.length === 0) {
    recentActivityContainer.innerHTML = `
    <li class="list-group-item text-center text-muted border-0">
    <i class="fa-regular fa-clock me-2"></i>
    No recent activity yet.
    </li>`;

    return;
  }

  const latest = result.data
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  latest.forEach(displayRecentActivity);
};

//
const renderPendingOrders = async () => {
  const result = await getPurchaseOrders();

  showSpinner(pendingOrdersContainer);
  pendingOrdersContainer.innerHTML = '';

  if (!result.success) {
    pendingOrdersContainer.innerHTML = `
      <li class="list-group-item text-center text-danger border-0">
        <i class="fa-solid fa-circle-exclamation me-2"></i>
        Failed to load pending orders.
      </li>`;

    return;
  }

  const pendingOrders = result.data
    .filter((ord) => ord.status.toLowerCase() === 'pending')
    .sort((a, b) => new Date(b.creation_date) - new Date(a.creation_date))
    .slice(0, 5);

  if (!pendingOrders || pendingOrders.length === 0) {
    pendingOrdersContainer.innerHTML = `
        <li class="list-group-item text-center text-muted border-0">
          <i class="fa-regular fa-clock me-2"></i>
          No pending orders at the moment.
        </li>`;

    return;
  }

  pendingOrders.forEach(displayPendingOrder);
};

// Fetch and render the 5 most recent pending purchase orders, with error/empty handling
const renderNearExpire = () => {
  const today = new Date();
  const threeMonthsLater = new Date(today);
  threeMonthsLater.setMonth(today.getMonth() + 3);

  const nearExpire = inventoryProducts.filter(
    (prd) =>
      new Date(prd.expire_date) <= threeMonthsLater &&
      new Date(prd.expire_date) > new Date(),
  );

  nearExpireContainer.innerHTML = '';

  if (nearExpire.length === 0) {
    nearExpireContainer.innerHTML = `
        <li class="list-group-item text-center text-muted border-0">
          <i class="fa-regular fa-clock me-2"></i>
          No products expiring soon.
        </li>`;

    return;
  }

  nearExpire.forEach(displayNearExpire);
};

//-----------------------------------------------
// Initialize the dashboard: load layout, fetch products, and trigger all render functions
const init = async () => {
  const result = await getProducts();

  renderRecentActivity();
  renderPendingOrders();

  showSpinner(lowStockAlertContainer);
  showSpinner(nearExpireContainer);

  if (result.success) {
    inventoryProducts = result.data;

    renderStatsOverview();
    renderLowStockAlerts();
    renderNearExpire();

    //
  } else {
    statsCardsContainer.innerHTML = `
        <div class="alert alert-danger">
          Failed to load inventory data. Please check your connection or try again later.
        </div>
    `;

    lowStockAlertContainer.innerHTML = `
      <li class="list-group-item text-center text-danger border-0 py-4">
        Failed to load inventory data.
      </li>
    `;

    nearExpireContainer.innerHTML = `
      <li class="list-group-item text-center text-danger border-0 py-4">
        Failed to load product expiry data.
      </li>
    `;
    console.error('Failed to load products:', result.error);
    return;
  }
};

loadLayout('Dashboard');
init();
