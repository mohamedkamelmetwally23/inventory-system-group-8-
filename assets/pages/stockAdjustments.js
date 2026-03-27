import {
  getAllStockAdjustmentsByProductName,
  createStockAdjustments,
  updateStock,
  deleteStock,
  getProductNames,
} from '../api/stockAdjustmentsApi.js';
import loadLayout from '../ui/layout.js';
import { renderTablePage } from '../components/table.js';

// ===================== STATE =====================
let stocksRaw = [];
let currentPage = 1;
const rowsPerPage = 10;
let allProducts = [];
let currentEditId = null;
let editingStockData = null;

// ===================== HELPER FUNCTION =====================
function getCurrentTimestamp() {
  return new Date().toISOString();
}

function formatDateForInput(dateString) {
  if (!dateString) return '';
  return dateString.split('T')[0];
}

// ===================== LOAD PRODUCTS =====================
async function loadProducts() {
  try {
    const products = await getProductNames();

    if (products && products.success) {
      allProducts = products.data || [];
    } else if (Array.isArray(products)) {
      allProducts = products;
    } else if (products?.data) {
      allProducts = products.data;
    } else {
      allProducts = [];
    }

    const productSelect = document.getElementById('productSelect');
    if (allProducts.length > 0 && productSelect) {
      productSelect.innerHTML = '<option value="">Select Product</option>';
      allProducts.forEach((product) => {
        productSelect.insertAdjacentHTML(
          'beforeend',
          `<option value="${product.id}">${product.name}</option>`,
        );
      });
    }

    updateFilterOptions();
  } catch (err) {
    console.error('Error loading products:', err);
  }
}

// ===================== UPDATE FILTER DROPDOWN =====================
function updateFilterOptions() {
  const filterSelect = document.getElementById('filterSelect');
  if (!filterSelect) return;

  let options = '<option value="">All</option>';
  options += '<option value="increase">Increase</option>';
  options += '<option value="decrease">Decrease</option>';

  filterSelect.innerHTML = options;
}

// ===================== LOAD STOCK ADJUSTMENTS =====================
async function loadStocks() {
  try {
    const res = await getAllStockAdjustmentsByProductName();

    if (res && res.success) {
      stocksRaw = res.data || [];
    } else if (Array.isArray(res)) {
      stocksRaw = res;
    } else if (res?.data) {
      stocksRaw = res.data;
    } else {
      stocksRaw = [];
    }

    const formattedData = stocksRaw.map((item) => {
      const product = allProducts.find((p) => p.id == item.product_id);
      const productName = product
        ? product.name
        : item.productName || item.product_name || 'N/A';

      // ===================== STATUS BADGE =====================
      let typeText = item.adjustment_type || 'N/A';

      const adjustmentTypeClass = {
        increase: 'badge bg-success',
        decrease: 'badge bg-danger',
        'N/A': 'badge bg-secondary',
      };

      return {
        id: item.id,
        product_name: productName,
        adjustment_type: `<span class="${adjustmentTypeClass[typeText]}">${typeText}</span>`,
        quantity: item.quantity || 0,
        reason: item.reason || 'N/A',
        timestamp: item.timestamp
          ? new Date(item.timestamp).toLocaleString()
          : 'N/A',
        user: item.user || 'System',
      };
    });

    renderTablePage(
      formattedData,
      actionsHTML,
      currentPage,
      rowsPerPage,
      'stock_adjustments',
    );

    updateCards();
    updateCaption();
    updatePageNumber();
    updateFilterOptions();
  } catch (err) {
    console.error('Error loading stocks:', err);
    const tableBody = document.getElementById('tableBody');
    if (tableBody) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center text-danger">
            Failed to load data: ${err.message}
        </tr>
      `;
    }
  }
}

// ===================== ACTION BUTTONS HTML =====================
function actionsHTML(stock) {
  return `
    <button class="btn btn-sm edit-btn border-0" data-id="${stock.id}">
      <i class="fa-solid fa-pen-to-square text-primary"></i>
    </button>
    <button class="btn btn-sm delete-btn border-0" data-id="${stock.id}">
      <i class="fa-solid fa-trash text-danger"></i>
    </button>
  `;
}

// ===================== UPDATE STATISTICS CARDS =====================
function updateCards() {
  let totalIncrease = 0;
  let totalDecrease = 0;

  stocksRaw.forEach((stock) => {
    if (stock.adjustment_type === 'increase') {
      totalIncrease += Number(stock.quantity) || 0;
    } else if (stock.adjustment_type === 'decrease') {
      totalDecrease += Number(stock.quantity) || 0;
    }
  });

  const totalAdjustments = document.querySelector('#totalAdjustments');
  const totalIncreaseEl = document.querySelector('#totalIncrease');
  const totalDecreaseEl = document.querySelector('#totalDecrease');
  const totalNetChangeEl = document.querySelector('#totalNetChange');

  if (totalAdjustments) totalAdjustments.textContent = stocksRaw.length;
  if (totalIncreaseEl) totalIncreaseEl.textContent = totalIncrease;
  if (totalDecreaseEl) totalDecreaseEl.textContent = totalDecrease;
  if (totalNetChangeEl)
    totalNetChangeEl.textContent = totalIncrease - totalDecrease;
}

// ===================== UPDATE TABLE CAPTION =====================
function updateCaption() {
  const captionEl = document.getElementById('tableCaption');
  if (captionEl) {
    captionEl.innerHTML = `
      <i class="fa-solid fa-box"></i> All Stock Adjustments (${stocksRaw.length})
    `;
  }
}

// ===================== UPDATE PAGE NUMBER DISPLAY =====================
function updatePageNumber() {
  const pageNumberEl = document.getElementById('pageNumber');
  if (pageNumberEl) {
    pageNumberEl.textContent = currentPage;
  }
}

// ===================== POPULATE FORM WITH STOCK DATA =====================
function populateFormWithStockData(stock) {
  const productSelect = document.getElementById('productSelect');
  const typeSelect = document.getElementById('Type');
  const quantityInput = document.getElementById('Quantity');
  const reasonInput = document.getElementById('reason');
  const userInput = document.getElementById('user');
  const dateInput = document.getElementById('Date');

  if (productSelect) productSelect.value = stock.product_id || '';
  if (typeSelect) typeSelect.value = stock.adjustment_type;
  if (quantityInput) quantityInput.value = stock.quantity;
  if (reasonInput) reasonInput.value = stock.reason || '';
  if (userInput) userInput.value = stock.user || '';

  if (dateInput && stock.timestamp) {
    dateInput.value = formatDateForInput(stock.timestamp);
  }
}

// ===================== MODAL OPEN HANDLER =====================
document
  .getElementById('addStockModal')
  ?.addEventListener('show.bs.modal', () => {
    const form = document.getElementById('addStockForm');
    const dateInput = document.getElementById('Date');

    if (currentEditId && editingStockData) {
      populateFormWithStockData(editingStockData);

      const modalTitle = document.getElementById('addStockModalLabel');
      if (modalTitle) modalTitle.textContent = 'Edit Stock Adjustment';

      const subtitle = document.getElementById('productModalSubtitle');
      if (subtitle)
        subtitle.textContent = 'Update the stock adjustment information below';
    } else {
      if (form) form.reset();

      if (dateInput) {
        dateInput.value = formatDateForInput(getCurrentTimestamp());
      }

      const modalTitle = document.getElementById('addStockModalLabel');
      if (modalTitle) modalTitle.textContent = 'Add New Stock Adjustment';

      const subtitle = document.getElementById('productModalSubtitle');
      if (subtitle)
        subtitle.textContent = 'Enter the details for the new stock adjustment';
    }
  });

// ===================== FORM SUBMIT HANDLER =====================
document
  .getElementById('addStockForm')
  ?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const editId = currentEditId;
    const currentTimestamp = getCurrentTimestamp();

    const data = {
      product_id: document.getElementById('productSelect')?.value.trim(),
      adjustment_type: document.getElementById('Type')?.value.trim(),
      quantity: Number(document.getElementById('Quantity')?.value),
      reason: document.getElementById('reason')?.value.trim(),
      user: document.getElementById('user')?.value.trim(),
      timestamp: currentTimestamp,
    };

    if (
      !data.product_id ||
      !data.adjustment_type ||
      !data.quantity ||
      !data.reason ||
      !data.user
    ) {
      console.error('Please fill all required fields');
      return;
    }

    try {
      let result;

      if (editId && editId !== 'null' && editId !== 'undefined') {
        result = await updateStock(editId, data);
      } else {
        result = await createStockAdjustments(data);
      }

      if (result && result.success) {
        await loadStocks();

        const modal = bootstrap.Modal.getInstance(
          document.getElementById('addStockModal'),
        );
        if (modal) modal.hide();

        currentEditId = null;
        editingStockData = null;
      } else {
        console.error(result?.error || 'Failed to save stock adjustment');
      }
    } catch (err) {
      console.error('Error saving stock adjustment:', err);
    }
  });

// ===================== TABLE EVENT HANDLER (EDIT/DELETE) =====================
document.getElementById('tableBody')?.addEventListener('click', function (e) {
  if (e.target.closest('.edit-btn')) {
    const id = e.target.closest('.edit-btn').dataset.id;
    const stock = stocksRaw.find((s) => s.id == id);

    if (stock) {
      currentEditId = id;
      editingStockData = { ...stock };

      const modal = new bootstrap.Modal(
        document.getElementById('addStockModal'),
      );
      modal.show();
    }
  }

  if (e.target.closest('.delete-btn')) {
    const id = e.target.closest('.delete-btn').dataset.id;
    window.currentDeleteId = id;

    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
  }
});

// ===================== CONFIRM DELETE HANDLER =====================
document
  .getElementById('confirmDelete')
  ?.addEventListener('click', async () => {
    if (!window.currentDeleteId) return;

    try {
      const result = await deleteStock(window.currentDeleteId);

      if (result && result.success) {
        await loadStocks();
        window.currentDeleteId = null;

        const modal = bootstrap.Modal.getInstance(
          document.getElementById('deleteModal'),
        );
        if (modal) modal.hide();
      } else {
        console.error(result?.error || 'Failed to delete stock adjustment');
      }
    } catch (err) {
      console.error('Error deleting stock adjustment:', err);
    }
  });

// ===================== FILTER HANDLER =====================
document.getElementById('filterSelect')?.addEventListener('change', (e) => {
  const filterValue = e.target.value;

  if (!filterValue) {
    loadStocks();
    return;
  }

  let filtered = [];

  if (filterValue === 'increase') {
    filtered = stocksRaw.filter(
      (stock) => stock.adjustment_type === 'increase',
    );
  } else if (filterValue === 'decrease') {
    filtered = stocksRaw.filter(
      (stock) => stock.adjustment_type === 'decrease',
    );
  } else if (filterValue.startsWith('product_')) {
    const productName = filterValue.replace('product_', '');
    filtered = stocksRaw.filter((stock) => {
      const stockProductName = stock.productName || stock.product_name;
      return stockProductName === productName;
    });
  }

  const formattedData = filtered.map((item) => {
    const product = allProducts.find((p) => p.id == item.product_id);
    const productName = product ? product.name : item.productName || 'N/A';

    return {
      id: item.id,
      product_name: productName,
      adjustment_type: item.adjustment_type || 'N/A',
      quantity: item.quantity || 0,
      reason: item.reason || 'N/A',
      timestamp: item.timestamp
        ? new Date(item.timestamp).toLocaleString()
        : 'N/A',
      user: item.user || 'System',
    };
  });

  renderTablePage(
    formattedData,
    actionsHTML,
    currentPage,
    rowsPerPage,
    'stock_adjustments',
  );

  let totalIncrease = 0;
  let totalDecrease = 0;
  filtered.forEach((stock) => {
    if (stock.adjustment_type === 'increase') {
      totalIncrease += Number(stock.quantity) || 0;
    } else if (stock.adjustment_type === 'decrease') {
      totalDecrease += Number(stock.quantity) || 0;
    }
  });

  const totalAdjustments = document.querySelector('#totalAdjustments');
  const totalIncreaseEl = document.querySelector('#totalIncrease');
  const totalDecreaseEl = document.querySelector('#totalDecrease');
  const totalNetChangeEl = document.querySelector('#totalNetChange');

  if (totalAdjustments) totalAdjustments.textContent = filtered.length;
  if (totalIncreaseEl) totalIncreaseEl.textContent = totalIncrease;
  if (totalDecreaseEl) totalDecreaseEl.textContent = totalDecrease;
  if (totalNetChangeEl)
    totalNetChangeEl.textContent = totalIncrease - totalDecrease;
});

// ===================== PAGINATION HANDLERS =====================
document.getElementById('prevBtn')?.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    loadStocks();
  }
});

document.getElementById('nextBtn')?.addEventListener('click', () => {
  const totalPages = Math.ceil(stocksRaw.length / rowsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    loadStocks();
  }
});

// ===================== MODAL CLOSE HANDLER =====================
document
  .getElementById('addStockModal')
  ?.addEventListener('hidden.bs.modal', () => {
    const form = document.getElementById('addStockForm');
    if (form && !currentEditId) {
      form.reset();
    }

    currentEditId = null;
    editingStockData = null;

    const modalTitle = document.getElementById('addStockModalLabel');
    if (modalTitle) modalTitle.textContent = 'Add New Stock Adjustment';

    const subtitle = document.getElementById('productModalSubtitle');
    if (subtitle)
      subtitle.textContent = 'Enter the details for the new stock adjustment';
  });

// ===================== INITIALIZATION =====================
async function init() {
  loadLayout('Stock Adjustments');
  await loadProducts();
  await loadStocks();
}

init();
