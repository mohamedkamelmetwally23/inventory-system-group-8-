import {
  getAllStockAdjustmentsByProductName,
  createStockAdjustments,
  updateStock,
  deleteStock,
} from "../api/stockAdjustmentsApi.js";

import { getProductNames } from "../api/productsApi.js";

// ===================== ELEMENTS =====================
const productSelect = document.getElementById("productSelect");
const stockForm = document.querySelector("#addStockForm");
const tableBody = document.querySelector(".table-body");
const filterSelect = document.getElementById("filterSelect");
const addBtn = document.querySelector('[data-action="add"]');
const modalEl = document.getElementById("addStockModal");
const modalTitle = document.getElementById("addStockModalLabel");

// Cards
const totalAdjustments = document.querySelector("#totalAdjustments");
const totalCorrection = document.querySelector("#totalCorrection");
const totalInitialStock = document.querySelector("#totalinItial_stock");
const totalStockIn = document.querySelector("#totalStock_in");
const totalStockOut = document.querySelector("#totalStock_out");
const totalExpiryWriteoff = document.querySelector("#totslExpiry_writeoff");

// ===================== STATE =====================
let allStocks = [];

// ===================== LOAD PRODUCTS =====================
const loadProducts = async () => {
  const res = await getProductNames();

  if (res.success && res.data.length > 0) {
    productSelect.innerHTML = `<option value="">Select Product</option>`;
    res.data.forEach((product) => {
      const option = `<option value="${product.id}">${product.name}</option>`;
      productSelect.insertAdjacentHTML("beforeend", option);
    });
  } else {
    console.error("Failed to load products:", res.error);
  }
};

// ===================== CALCULATIONS =====================
const displayCalc = (stocks) => {
  let totalCorrectionVal = 0;
  let totalStockInVal = 0;
  let totalExpiryWriteoffVal = 0;
  let totalStockOutVal = 0;
  let totalInitialStockVal = 0;

  stocks.forEach((stock) => {
    switch (stock.type) {
      case "correction":
        totalCorrectionVal += Number(stock.quantity);
        break;
      case "initial_stock":
        totalInitialStockVal += Number(stock.quantity);
        break;
      case "stock_in":
        totalStockInVal += Number(stock.quantity);
        break;
      case "stock_out":
        totalStockOutVal += Number(stock.quantity);
        break;
      case "expiry_writeoff":
        totalExpiryWriteoffVal += Number(stock.quantity);
        break;
    }
  });

  return {
    totalAdjustment: stocks.length,
    totalCorrection: totalCorrectionVal,
    totalStockIn: totalStockInVal,
    totalStockOut: totalStockOutVal,
    totalExpiryWriteoff: totalExpiryWriteoffVal,
    totalInitialStock: totalInitialStockVal,
  };
};

// ===================== RENDER CARDS =====================
const renderCards = (stats) => {
  totalAdjustments.textContent = stats.totalAdjustment;
  totalCorrection.textContent = stats.totalCorrection;
  totalInitialStock.textContent = stats.totalInitialStock;
  totalStockIn.textContent = stats.totalStockIn;
  totalStockOut.textContent = stats.totalStockOut;
  totalExpiryWriteoff.textContent = stats.totalExpiryWriteoff;
};

// ===================== TABLE =====================
const displayStockAdjustments = (stock) => {
  const markup = `
  <tr>
    <td class="text-muted">${stock.productName}</td>
    <td class="text-muted">${stock.type}</td>
    <td class="text-muted">${stock.quantity}</td>
    <td class="text-muted">${stock.status}</td>
    <td class="text-muted">${stock.note}</td>
    <td class="text-muted">${stock.date}</td>
    <td>
      <div class="d-flex justify-content-center gap-2">

        <button
          class="btn btn-sm btn-outline-primary d-flex align-items-center justify-content-center"
          style="width:35px; height:35px;"
          data-bs-toggle="modal"
          data-bs-target="#addStockModal"
          data-action="edit"
          data-id="${stock.id}"
          data-product-id="${stock.product_id}"
          data-type="${stock.type}"
          data-quantity="${stock.quantity}"
          data-status="${stock.status}"
          data-note="${stock.note}"
          data-date="${stock.date}"
        >
          <i class="fa-regular fa-pen-to-square"></i>
        </button>

        <button
          class="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
          style="width:35px; height:35px;"
          data-action="delete"
          data-id="${stock.id}"
        >
          <i class="fa-regular fa-trash-can"></i>
        </button>

      </div>
    </td>
  </tr>
`;

  tableBody.insertAdjacentHTML("beforeend", markup);
};

const renderStock = (stocks) => {
  tableBody.innerHTML = "";
  if (!stocks || stocks.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center text-secondary">
          No Stock found.
        </td>
      </tr>
    `;
    return;
  }
  stocks.forEach(displayStockAdjustments);
};

// ===================== INIT =====================
const init = async () => {
  const res = await getAllStockAdjustmentsByProductName();

  if (res.success) {
    allStocks = res.data;
    renderStock(allStocks);
    renderCards(displayCalc(allStocks));
  } else {
    tableBody.innerHTML = `
      <p class="text-center text-danger">
        Error: ${res.error}
      </p>
    `;
  }
};

// ===================== FILTER =====================
const filterStocks = (type) => {
  if (!type) {
    renderStock(allStocks);
    renderCards(displayCalc(allStocks));
    return;
  }

  const filtered = allStocks.filter((stock) => stock.type === type);
  renderStock(filtered);
  renderCards(displayCalc(filtered));
};

filterSelect.addEventListener("change", (e) => {
  filterStocks(e.target.value);
});

// ===================== DELETE & EDIT =====================
tableBody.addEventListener("click", async (e) => {
  // DELETE
  const deleteBtn = e.target.closest('[data-action="delete"]');
  if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    const result = await deleteStock(id);
    if (result.success) init();
    else alert(result.error);
    return;
  }

  // EDIT
  const editBtn = e.target.closest('[data-action="edit"]');
  if (editBtn) {
    const id = editBtn.dataset.id;

    productSelect.value = editBtn.dataset.productId;
    document.getElementById("Type").value = editBtn.dataset.type;
    document.getElementById("Quantity").value = editBtn.dataset.quantity;
    document.getElementById("Status").value = editBtn.dataset.status;
    document.getElementById("Note").value = editBtn.dataset.note;
    document.getElementById("Date").value = editBtn.dataset.date;

    stockForm.dataset.editId = id;

    modalTitle.textContent = "Edit Stock";
  }
});

// ===================== FORM =====================
stockForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const id = stockForm.dataset.editId;

  const newStock = {
    product_id: productSelect.value,
    type: document.getElementById("Type").value,
    quantity: document.getElementById("Quantity").value,
    status: document.getElementById("Status").value,
    note: document.getElementById("Note").value,
    date: document.getElementById("Date").value,
  };

  let result;

  if (id) {
    result = await updateStock(id, newStock);
    delete stockForm.dataset.editId;
  } else {
    result = await createStockAdjustments(newStock);
  }

  if (result.success) {
    init();
    stockForm.reset();

    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();
  } else {
    alert(result.error);
  }
});

// ===================== RESET FOR ADD =====================
addBtn.addEventListener("click", () => {
  stockForm.reset();
  delete stockForm.dataset.editId;
  modalTitle.textContent = "Add New Stock Adjustments";
});

// ===================== CLEAN MODAL =====================
modalEl.addEventListener("hidden.bs.modal", () => {
  stockForm.reset();
  delete stockForm.dataset.editId;
  modalTitle.textContent = "Add New Stock Adjustments";
});

// ===================== START =====================
loadProducts();
init();
