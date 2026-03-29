import loadLayout from '../ui/layout.js';
import {
  getProductsWithRelations,
  createProduct,
  deleteProduct,
  updateProduct,
} from '../api/productsApi.js';
import { getCategories } from '../api/categoriesApi.js';
import { getSuppliers } from '../api/suppliersApi.js';
import { renderTablePage } from '../components/table.js';
import showNotification from '../utils/notification.js';

// =======================
// Load Layout
// =======================
loadLayout('Products');

// =======================
// Variables
// =======================
const filterCategory = document.querySelector('#filterCategory');
const productCategory = document.querySelector('#productCategory');
const supplierProduct = document.querySelector('#supplierProduct');

let productsRaw = [];
let productsTable = [];
let filteredProducts = null;
let editIndex = null;
let deleteIndex = null;
let currentPage = 1;
const rowsPerPage = 10;

// =======================
// Load Data
// =======================
async function loadProducts() {
  try {
    const res = await getProductsWithRelations();
    productsRaw = res?.data || [];

    const categoriesRes = await getCategories();
    const suppliersRes = await getSuppliers();

    categoriesRes.data.forEach((category) => {
      filterCategory.innerHTML += `
        <option class="text-capetalize" value="${category.name}">${category.name}</option>
      `;
      productCategory.innerHTML += `
        <option class="text-capetalize" value="${category.id}">${category.name}</option>
      `;
    });
    suppliersRes.data.forEach((supplier) => {
      supplierProduct.innerHTML += `
        <option class="text-capetalize" value="${supplier.id}">${supplier.supplier_name}</option>
      `;
    });

    productsTable = productsRaw.map((p) => {
      let statusText = '';
      let statusClass = '';
      let statusKey = '';

      if (p.quantity === 0) {
        statusText = 'Out of Stock';
        statusClass = 'badge bg-danger';
        statusKey = 'out-stock';
      } else if (p.quantity <= p.reorderLevel) {
        statusText = 'Low Stock';
        statusClass = 'badge bg-warning';
        statusKey = 'low-stock';
      } else {
        statusText = 'In Stock';
        statusClass = 'badge bg-success';
        statusKey = 'in-stock';
      }

      return {
        id: p.id,
        sku: p.sku,
        product_name: p.product_name,
        category: p.category_name,
        supplier: p.supplier_name,
        quantity: p.quantity,
        status: { statusClass, statusText },
        statusKey,
        price: p.price,
        expire_date: p.expire_date,
      };
    });

    filteredProducts = [...productsTable];

    renderTablePage(
      productsTable,
      actionsHTML,
      currentPage,
      rowsPerPage,
      'products',
    );

    updateCaption();
  } catch (err) {
    console.error('Error loading products:', err);
    showNotification('error', 'Failed to load products data.');
  }
}

loadProducts();

// =======================
// Filters
// =======================

// DOM Elements
const searchInput = document.getElementById('productSearchInput');
const categoryFilter = document.getElementById('filterCategory');
const stockFilter = document.getElementById('filterStock');
const clearBtn = document.querySelector('.btn-clear-filter');

// Apply Filters
function applyFilters() {
  filteredProducts = [...productsTable];

  // Search filter
  const searchValue = searchInput.value.toLowerCase().trim();
  if (searchValue) {
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.product_name.toLowerCase().includes(searchValue) ||
        p.sku.toLowerCase().includes(searchValue),
    );
  }

  // Category filter
  const selectedCategory = categoryFilter.value.trim();
  if (selectedCategory) {
    filteredProducts = filteredProducts.filter(
      (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase(),
    );
  }

  // Stock filter
  const stockValue = stockFilter.value;
  if (stockValue) {
    filteredProducts = filteredProducts.filter(
      (p) => p.statusKey === stockValue,
    );
  }

  currentPage = 1;

  updateCaption();

  renderTablePage(
    filteredProducts,
    actionsHTML,
    currentPage,
    rowsPerPage,
    'products',
  );
}

// Events
searchInput.addEventListener('input', applyFilters);
categoryFilter.addEventListener('change', applyFilters);
stockFilter.addEventListener('change', applyFilters);

// Clear Filters
clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  categoryFilter.value = '';
  stockFilter.value = '';

  filteredProducts = null;

  currentPage = 1;

  renderTablePage(
    productsTable,
    actionsHTML,
    currentPage,
    rowsPerPage,
    'products',
  );
});

// =======================
// Actions Icons
// =======================
function actionsHTML(product) {
  return `
    <button class="btn btn-sm edit-btn border-0">
      <i class="fa-solid fa-pen-to-square edit-icon text-primary"></i>
    </button>

    <button class="btn btn-sm delete-btn border-0">
      <i class="fa-solid fa-trash delete-icon text-danger"></i>
    </button>
  `;
}

// =======================
// Caption
// =======================
function updateCaption() {
  document.getElementById('tableCaption').innerHTML = `
    <i class="fa-solid fa-box"></i> All Products (${filteredProducts.length})
  `;
}

// =======================
// Pagination Events
// =======================
function getCurrentList() {
  return filteredProducts !== null ? filteredProducts : productsTable;
}

document.getElementById('prevBtn').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderTablePage(
      getCurrentList(),
      actionsHTML,
      currentPage,
      rowsPerPage,
      'products',
    );
  }
});

document.getElementById('nextBtn').addEventListener('click', () => {
  const list = getCurrentList();
  if (currentPage < Math.ceil(list.length / rowsPerPage)) {
    currentPage++;
    renderTablePage(list, actionsHTML, currentPage, rowsPerPage, 'products');
  }
});

// =======================
// Open Add Modal
// =======================
document.getElementById('addProduct').addEventListener('click', () => {
  editIndex = null;
  document.getElementById('addProductForm').reset();
  document.getElementById('addProductModalLabel').textContent =
    'Add New Product';
  document.getElementById('productModalSubtitle').textContent =
    'Enter the details for the new product';

  const modal = new bootstrap.Modal(document.getElementById('addProductModal'));
  modal.show();
});

// =======================
// Submit Add / Edit
// =======================
document
  .getElementById('addProductForm')
  .addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      sku: document.getElementById('productSKU').value.trim(),
      product_name: document.getElementById('productName').value.trim(),
      category_id: document.getElementById('productCategory').value.trim(),
      quantity: Number(document.getElementById('quantity').value),
      reorderLevel: Number(document.getElementById('reorderLevel').value),
      price: Number(document.getElementById('price').value),
      expire_date: document.getElementById('productExpireDate').value.trim(),
      supplier_id: document.getElementById('supplierProduct').value.trim(),
      // created_at: document.getElementById('productCreatedDate').value.trim(),
    };

    for (let key in data) {
      const value = data[key];
      if (
        (value === '' || value === null || value === undefined) &&
        value !== 0
      ) {
        showNotification('warning', 'Please fill all fields');
        return;
      }
    }

    try {
      if (editIndex === null) {
        const result = await createProduct(data);
        result.success &&
          showNotification('success', 'Created product successfully');
      } else {
        const result = await updateProduct(productsRaw[editIndex].id, data);
        result.success &&
          showNotification('success', 'Updated product successfully');
      }

      await loadProducts();

      const modal = bootstrap.Modal.getInstance(
        document.getElementById('addProductModal'),
      );
      modal.hide();
    } catch (err) {
      console.error('Error saving product:', err);
      showNotification('error', 'Failed to save product.');
    }
  });

// =======================
// Table Events (Edit / Delete)
// =======================
const handleActionClick = function (e) {
  const row = e.target.closest('[data-index]');
  if (!row) return;

  const index = Number(row.dataset.index);

  // EDIT
  if (e.target.closest('.edit-btn')) {
    editIndex = index;
    const p = productsRaw[index];

    document.getElementById('productSKU').value = p.sku;
    document.getElementById('productName').value = p.product_name;
    document.getElementById('productCategory').value = p.category_id;
    document.getElementById('quantity').value = p.quantity;
    document.getElementById('reorderLevel').value = p.reorderLevel;
    document.getElementById('price').value = p.price;
    document.getElementById('productExpireDate').value = p.expire_date;
    document.getElementById('supplierProduct').value = p.supplier_id;
    // document.getElementById('productCreatedDate').value = p.created_at;

    document.getElementById('addProductModalLabel').textContent =
      'Edit Product';
    document.getElementById('productModalSubtitle').textContent =
      'Update the product information below';

    const modal = new bootstrap.Modal(
      document.getElementById('addProductModal'),
    );
    modal.show();
  }

  // DELETE
  if (e.target.closest('.delete-btn')) {
    deleteIndex = index;

    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
  }
};

const tableBodyEl = document.getElementById('tableBody');
if (tableBodyEl) {
  tableBodyEl.addEventListener('click', handleActionClick);
}

const cardsContainerEl = document.getElementById('cardsContainer');
if (cardsContainerEl) {
  cardsContainerEl.addEventListener('click', handleActionClick);
}

// =======================
// Confirm Delete
// =======================
document
  .getElementById('confirmDelete')
  ?.addEventListener('click', async () => {
    if (deleteIndex === null) return;

    const product = productsRaw[deleteIndex];

    try {
      const result = await deleteProduct(product.id);
      result.success &&
        showNotification('success', 'Deleted product successfullay');
      await loadProducts();

      deleteIndex = null;

      const modal = bootstrap.Modal.getInstance(
        document.getElementById('deleteModal'),
      );
      modal.hide();
    } catch (err) {
      console.error('Error deleting product:', err);
      showNotification('error', 'Failed to delete product.');
    }
  });
