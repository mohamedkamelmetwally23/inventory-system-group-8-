import loadLayout from "../ui/layout.js";
import {
  getProductsWithRelations,
  createProduct,
  deleteProduct,
  updateProduct,
} from "../api/productsApi.js";
import { renderTablePage } from "../components/table.js";

// =======================
// Load Layout
// =======================
loadLayout("Products");

// =======================
// Variables
// =======================
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

    productsTable = productsRaw.map((p) => {
      let statusText = "";
      let statusClass = "";
      let statusKey = "";

      if (p.quantity === 0) {
        statusText = "Out of Stock";
        statusClass = "badge bg-danger";
        statusKey = "out-stock";
      } else if (p.quantity <= p.reorderLevel) {
        statusText = "Low Stock";
        statusClass = "badge bg-warning";
        statusKey = "low-stock";
      } else {
        statusText = "In Stock";
        statusClass = "badge bg-success";
        statusKey = "in-stock";
      }

      return {
        id: p.id,
        sku: p.sku,
        product_name: p.product_name,
        category: p.category_name,
        supplier: p.supplier_name,
        quantity: p.quantity,
        status: `<span class="${statusClass}">${statusText}</span>`,
        statusKey,
        price: p.price,
        expire_date: p.expire_date,
      };
    });

    filteredProducts = null; // reset filters on load

    renderTablePage(
      productsTable,
      actionsHTML,
      currentPage,
      rowsPerPage,
      "products",
    );

    updateCaption();
  } catch (err) {
    console.error("Error loading products:", err);
    alert("Failed to load products data.");
  }
}

loadProducts();

// =======================
// Filters
// =======================

// DOM Elements
const searchInput = document.getElementById("productSearchInput");
const categoryFilter = document.getElementById("filterCategory");
const stockFilter = document.getElementById("filterStock");
const clearBtn = document.querySelector(".btn-clear-filter");

// Apply Filters
function applyFilters() {
  filteredProducts = [...productsTable];

  // Search filter
  const searchValue = searchInput.value.toLowerCase().trim();
  if (searchValue) {
    filteredProducts = filteredProducts.filter(
      (p) =>
        p.product_name.toLowerCase().includes(searchValue) ||
        p.sku.toLowerCase().includes(searchValue)
    );
  }

  // Category filter
  const selectedCategory = categoryFilter.value.trim();
  if (selectedCategory) {
    filteredProducts = filteredProducts.filter(
      (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
    );
  }

  // Stock filter
  const stockValue = stockFilter.value;
  if (stockValue) {
    filteredProducts = filteredProducts.filter(
      (p) => p.statusKey === stockValue
    );
  }

  currentPage = 1;

  renderTablePage(
    filteredProducts,
    actionsHTML,
    currentPage,
    rowsPerPage,
    "products"
  );
}

// Events
searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);
stockFilter.addEventListener("change", applyFilters);

// Clear Filters
clearBtn.addEventListener("click", () => {
  searchInput.value = "";
  categoryFilter.value = "";
  stockFilter.value = "";

  filteredProducts = null;

  currentPage = 1;

  renderTablePage(
    productsTable,
    actionsHTML,
    currentPage,
    rowsPerPage,
    "products"
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
  document.getElementById("tableCaption").innerHTML = `
    <i class="fa-solid fa-box"></i> All Products (${productsRaw.length})
  `;
}

// =======================
// Pagination Events
// =======================
function getCurrentList() {
  return filteredProducts ?? productsTable;
}

document.getElementById("prevBtn").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderTablePage(
      getCurrentList(),
      actionsHTML,
      currentPage,
      rowsPerPage,
      "products"
    );
  }
});

document.getElementById("nextBtn").addEventListener("click", () => {
  const list = getCurrentList();
  if (currentPage < Math.ceil(list.length / rowsPerPage)) {
    currentPage++;
    renderTablePage(
      list,
      actionsHTML,
      currentPage,
      rowsPerPage,
      "products"
    );
  }
});

// =======================
// Open Add Modal
// =======================
document.getElementById("addProduct").addEventListener("click", () => {
  editIndex = null;
  document.getElementById("addProductForm").reset();
  document.getElementById("addProductModalLabel").textContent =
    "Add New Product";
  document.getElementById("productModalSubtitle").textContent =
    "Enter the details for the new product";

  const modal = new bootstrap.Modal(document.getElementById("addProductModal"));
  modal.show();
});

// =======================
// Submit Add / Edit
// =======================
document
  .getElementById("addProductForm")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      sku: document.getElementById("productSKU").value.trim(),
      product_name: document.getElementById("productName").value.trim(),
      category_id: document.getElementById("productCategory").value.trim(),
      quantity: Number(document.getElementById("quantity").value),
      reorderLevel: Number(document.getElementById("reorderLevel").value),
      price: Number(document.getElementById("price").value),
      expire_date: document.getElementById("productExpireDate").value.trim(),
      supplier_id: document.getElementById("productSupplierId").value.trim(),
      created_at: document.getElementById("productCreatedDate").value.trim(),
    };

    for (let key in data) {
      if (!data[key]) {
        alert("Please fill all fields");
        return;
      }
    }

    try {
      if (editIndex === null) {
        await createProduct(data);
      } else {
        await updateProduct(productsRaw[editIndex].id, data);
      }

      await loadProducts();

      const modal = bootstrap.Modal.getInstance(
        document.getElementById("addProductModal")
      );
      modal.hide();
    } catch (err) {
      console.error("Error saving product:", err);
      alert("Failed to save product.");
    }
  });

// =======================
// Table Events (Edit / Delete)
// =======================
document.getElementById("tableBody").addEventListener("click", function (e) {
  const row = e.target.closest("tr");
  if (!row) return;

  const index = Number(row.dataset.index);

  // EDIT
  if (e.target.closest(".edit-btn")) {
    editIndex = index;
    const p = productsRaw[index];

    document.getElementById("productSKU").value = p.sku;
    document.getElementById("productName").value = p.product_name;
    document.getElementById("productCategory").value = p.category_id;
    document.getElementById("quantity").value = p.quantity;
    document.getElementById("reorderLevel").value = p.reorderLevel;
    document.getElementById("price").value = p.price;
    document.getElementById("productExpireDate").value = p.expire_date;
    document.getElementById("productSupplierId").value = p.supplier_id;
    document.getElementById("productCreatedDate").value = p.created_at;

    document.getElementById("addProductModalLabel").textContent =
      "Edit Product";
    document.getElementById("productModalSubtitle").textContent =
      "Update the product information below";

    const modal = new bootstrap.Modal(
      document.getElementById("addProductModal")
    );
    modal.show();
  }

  // DELETE
  if (e.target.closest(".delete-btn")) {
    deleteIndex = index;

    const modal = new bootstrap.Modal(document.getElementById("deleteModal"));
    modal.show();
  }
});

// =======================
// Confirm Delete
// =======================
document.getElementById("confirmDelete").addEventListener("click", async () => {
  if (deleteIndex === null) return;

  const product = productsRaw[deleteIndex];

  try {
    await deleteProduct(product.id);
    await loadProducts();

    deleteIndex = null;

    const modal = bootstrap.Modal.getInstance(
      document.getElementById("deleteModal")
    );
    modal.hide();
  } catch (err) {
    console.error("Error deleting product:", err);
    alert("Failed to delete product.");
  }
});