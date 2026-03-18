import {
  getAllStockAdjustments,
  getAllStockAdjustmentsById,
  getAllStockAdjustmentsByProductName,
  createStockAdjustments,
  updateStock,
  deleteStock,
} from "../api/stockAdjustmentsApi.js";

// ===================== CARDS =====================
const totalAdjustments = document.querySelector("#totalAdjustments");
const totalCorrection = document.querySelector("#totalCorrection");
const totalinItial_stock = document.querySelector("#totalinItial_stock");
const totalStock_in = document.querySelector("#totalStock_in");
const totalStock_out = document.querySelector("#totalStock_out");
const totslExpiry_writeoff = document.querySelector("#totslExpiry_writeoff");

// Calculate stats
const displayCalc = (stocks) => {
  let totalCorrectionVal = 0;
  let totalStockInVal = 0;
  let totalExpiryWriteoffVal = 0;
  let totalStockOutVal = 0;
  let totalInitialStockVal = 0;

  stocks.forEach((stock) => {
    if (stock.type === "correction") {
      totalCorrectionVal += Number(stock.quantity);
    } else if (stock.type === "initial_stock") {
      totalInitialStockVal += Number(stock.quantity);
    } else if (stock.type === "stock_in") {
      totalStockInVal += Number(stock.quantity);
    } else if (stock.type === "stock_out") {
      totalStockOutVal += Number(stock.quantity);
    } else if (stock.type === "expiry_writeoff") {
      totalExpiryWriteoffVal += Number(stock.quantity);
    }
  });

  return {
    totalAdjustment: stocks.length,
    totalCorrection: totalCorrectionVal,
    totalStockIn: totalStockInVal,
    totalExpiryWriteoff: totalExpiryWriteoffVal,
    totalStockOut: totalStockOutVal,
    totalInitialStock: totalInitialStockVal,
  };
};

// Render cards
const renderCards = (stats) => {
  totalAdjustments.textContent = stats.totalAdjustment;
  totalCorrection.textContent = stats.totalCorrection;
  totalinItial_stock.textContent = stats.totalInitialStock;
  totalStock_in.textContent = stats.totalStockIn;
  totalStock_out.textContent = stats.totalStockOut;
  totslExpiry_writeoff.textContent = stats.totalExpiryWriteoff;
};

// ===================== TABLE =====================
const tableBody = document.querySelector(".table-body");

// Add one stock
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
        <div class="d-flex gap-3">
          <button class="btn btn-outline-custom w-50 rounded-3 py-2 ">
            <i class="fa-regular fa-pen-to-square me-2"></i>
          </button>
          <button class="btn btn-outline-danger-custom w-50 rounded-3 py-2 fw-medium">
            <i class="fa-regular fa-trash-can me-2 text-danger"></i>
          </button>
        </div>
      </td>
    </tr>
  `;

  tableBody.insertAdjacentHTML("beforeend", markup);
};

// Display all stocks
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
  const stockAdjustments = await getAllStockAdjustmentsByProductName();

  if (stockAdjustments.success) {
    const stocks = stockAdjustments.data;

    // render table
    renderStock(stocks);

    // calculate + render cards
    const stats = displayCalc(stocks);
    renderCards(stats);
  } else {
    tableBody.innerHTML = `<p class="text-center text-danger">Error loading Stock Adjustments: ${stocks.error}</p>`;
  }
};

init();
