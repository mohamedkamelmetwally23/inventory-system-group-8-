import {
  addNewOrder,
  editStatus,
  getDataById,
  getPurchaseOrders,
  markOrderUpdated,
  updateProductQuantity,
} from '../api/ordersApi.js';
import { getProducts } from '../api/productsApi.js';
import { getSuppliers } from '../api/suppliersApi.js';
import { renderTablePage } from '../components/table.js';
import loadLayout from '../ui/layout.js';
import { formatCurrency, formatDate } from '../utils/helpers.js';
import showNotification from '../utils/notification.js';

loadLayout('Purchase Orders');
// ========== Form Calling ==========

// ========== Data ==========

let total_amount = 0;
let creation_date = '';
let supplier_id = '';
let items = [];
let total_quantity = 0;
let total = 0;
const data2 = await getProducts();
let productList = data2.data;

const data = await getSuppliers();
let suppliersList = data.data;

let createOrderBtn = document.getElementsByClassName('create-order')[0];
createOrderBtn.addEventListener('click', async () => {
  // ========== Suppliers Selector ==========
  let supplierNames = document.getElementsByClassName('supplierName')[0];
  let selectElm = document.createElement('select');
  selectElm.setAttribute('class', 'form-control supplierSelector');
  selectElm.setAttribute('name', 'suppliers');
  supplierNames.innerHTML = '';
  // ========== Default option ==========
  let defaultOption = document.createElement('option');
  defaultOption.setAttribute('value', 'default');
  defaultOption.textContent = 'select supplier';
  selectElm.appendChild(defaultOption);
  // ========== Suppliers options ==========
  suppliersList.forEach((elm) => {
    let option = document.createElement('option');
    option.setAttribute('value', `${elm.supplier_name}`);
    option.textContent = `${elm.supplier_name}`;
    selectElm.appendChild(option);
  });
  supplierNames.appendChild(selectElm);

  // ========== Product Selector ==========
  let selectElm2 = document.getElementsByClassName('productSelector')[0];
  selectElm2.setAttribute('name', 'products');

  // ========== Default option ==========
  let defoption = document.createElement('option');
  defoption.setAttribute('value', 'default');
  defoption.textContent = 'select product';
  selectElm2.appendChild(defoption);

  // ========== Product Options ==========
  productList.forEach((elm) => {
    let option = document.createElement('option');
    option.setAttribute('value', `${elm.product_name}`);
    option.textContent = `${elm.product_name}`;
    selectElm2.appendChild(option);
  });
  // ========== change Listner ==========
  selectElm2.addEventListener('change', (e) => {
    const product_name = e.target.value;
    const productVal = productList.find((elm) => {
      return elm.product_name === product_name;
    });
    const row = e.target.closest('tr');
    const priceCell = row.querySelector('.price');
    const quantity = row.querySelector('.quantity');
    const total = row.querySelector('.total');
    priceCell.textContent = formatCurrency(productVal.price);
    total.textContent = formatCurrency(productVal.price * quantity.value);
    recalculateTotalAmount();
  });
});

document.getElementById('NewOrder').addEventListener('input', (e) => {
  if (e.target.classList.contains('quantity')) {
    recalculateTotalAmount();
  }
});
const modal = document.getElementById('NewOrder');
modal.addEventListener('hidden.bs.modal', resetOrderForm);

// ========== Add new Product Row ==========
let addRowBtn = document.getElementsByClassName('addRow')[0];
addRowBtn.addEventListener('click', () => {
  let newtr = document.createElement('tr');
  let newtd = document.createElement('td');
  let productselector = document.createElement('select');
  productselector.setAttribute('class', 'form-control productSelector');

  let rowDefaultOption = document.createElement('option');
  rowDefaultOption.setAttribute('value', 'default');
  rowDefaultOption.textContent = 'select product';
  productselector.appendChild(rowDefaultOption);

  productList.forEach((elm) => {
    let option = document.createElement('option');
    option.setAttribute('value', `${elm.product_name}`);
    option.textContent = `${elm.product_name}`;
    productselector.appendChild(option);
  });
  productselector.addEventListener('change', (e) => {
    const product_name = e.target.value;
    const productVal = productList.find((elm) => {
      return elm.product_name === product_name;
    });
    const row = e.target.closest('tr');
    const priceCell = row.querySelector('.price');
    const quantity = row.querySelector('.quantity');
    const total = row.querySelector('.total');
    priceCell.textContent = formatCurrency(productVal.price);
    total.textContent = formatCurrency(productVal.price * quantity.value);
    recalculateTotalAmount();
  });
  newtd.appendChild(productselector);
  newtr.appendChild(newtd);
  // ── Quantity cell ──
  let newtd1 = document.createElement('td');
  newtd1.innerHTML = `<input type="number"class="quantity w-custom border-1 border-light rounded form-control" value="1" min="1"/>`;
  newtr.appendChild(newtd1);
  // ── Price cell ──
  let newtd2 = document.createElement('td');
  newtd2.setAttribute('class', 'price');
  newtr.appendChild(newtd2);
  // ── Total cell ──
  let newtd3 = document.createElement('td');
  newtd3.setAttribute('class', 'total');
  newtr.appendChild(newtd3);
  // ── Delete cell ──
  let newtd4 = document.createElement('td');
  let deleteIcon = document.createElement('i');
  deleteIcon.setAttribute('class', 'fa-regular fa-trash-can mx-3');
  deleteIcon.addEventListener('click', (e) => {
    e.target.closest('tr').remove();
  });
  newtd4.appendChild(deleteIcon);
  newtr.appendChild(newtd4);
  addRowBtn.parentElement.parentElement.insertAdjacentElement(
    'beforebegin',
    newtr,
  );
  document.getElementById('NewOrder').addEventListener('input', (e) => {
    if (e.target.classList.contains('quantity')) {
      recalculateTotalAmount();
    }
  });
});

//
function generateOrderNumber(existingOrders) {
  const currentYear = new Date().getFullYear();

  const thisYearOrders = existingOrders.filter((order) =>
    order.order_number.startsWith(`PO-${currentYear}-`),
  );

  let maxSeq = 0;
  thisYearOrders.forEach((order) => {
    const seq = parseInt(order.order_number.split('-')[2], 10);
    if (seq > maxSeq) maxSeq = seq;
  });

  const nextSeq = (maxSeq + 1).toString().padStart(3, '0');
  return `PO-${currentYear}-${nextSeq}`;
}

document.querySelector('.save').addEventListener('click', async (e) => {
  e.preventDefault();
  const supplierSelector = document.querySelector('.supplierSelector');
  const supplierName = supplierSelector?.value;
  const foundSupplier = suppliersList.find(
    (elm) => elm.supplier_name === supplierName,
  );

  supplier_id = foundSupplier ? foundSupplier.id : '';

  creation_date = document.querySelector('.date')?.value;

  total = recalculateTotalAmount();
  total_amount = total.total_amount;
  total_quantity = total.total_quantity;

  items = [];
  let rows = document.querySelector('.newProduct').querySelectorAll('tr');

  // data Validation ..
  const isValid = validateOrderForm({
    supplierSelector,
    creation_date,
    rows,
  });
  if (!isValid) return;
  rows.forEach((row) => {
    if (!row.classList.contains('newrow')) {
      let value = row.querySelector('.productSelector').value;
      let item = productList.find((elm) => {
        return elm.product_name === value;
      });

      if (!item) return;
      items.push({
        product_id: item.id,
        quantity: Number(row.querySelector('.quantity').value),
        unit_price: Number(
          row.querySelector('.price').textContent.replace(/[^0-9.]/g, ''),
        ),
      });
    }
  });

  const newOrderPurchase = {
    order_number: generateOrderNumber(orders),
    supplier_id,
    creation_date,
    items,
    status: 'pending',
    total_quantity,
    total_amount,
  };

  const result = await addNewOrder(newOrderPurchase);
  if (!result.success) {
    showNotification('error', 'Failed to create order.');
    return;
  }

  showNotification('success', 'Order created successfully');
  resetOrderForm();

  // close modal
  bootstrap.Modal.getInstance(document.getElementById('NewOrder')).hide();
});
// ========== Table Rendering ==========
let products = productList.map((prod) => ({
  product_id: prod.id,
  product_name: prod.product_name,
}));

let suppliers = suppliersList.map((sup) => ({
  supplier_id: sup.id,
  supplier_name: sup.supplier_name,
}));
let currentPage = 1;
const rowsPerPage = 10;
let orders = [];
let hasRun = false;
let isUpdating = false;
let ordersRecieved = [];
let receivedItems = [];

getPurchaseOrders().then(async (data) => {
  orders = data.data;
  ordersRecieved = data.data;

  if (!ordersRecieved.length) return;

  ordersRecieved.forEach((order) => {
    if (order.status === 'received' && !order.quantityUpdated) {
      order.items.forEach((item) => {
        receivedItems.push({
          product_id: item.product_id,
          quantity: item.quantity,
          updated: false,
        });
      });
    }
  });

  if (!isUpdating) {
    isUpdating = true;
    await productQuantityUpdate(receivedItems);
  }

  if (!orders.length) return;
  orders = orders.map((elm) => {
    let supplier = suppliers.find((sup) => sup.supplier_id == elm.supplier_id);
    return {
      id: elm.id,
      order_number: elm.order_number,
      supplier_name: supplier?.supplier_name,
      status: elm.status,
      Total_Items: elm.items.length,
      total_quantity: elm.total_quantity,
      total_amount: elm.total_amount,
    };
  });

  updateCaption();
  renderTablePage(orders, actionsHTML, currentPage, rowsPerPage, 'Orders');
  setStatusStyle();
  updateCards(orders);
});

// ========== Actions ==========
function actionsHTML(item) {
  return `
        <button class="btn btn-sm show-btn" data-id="${item.id}" data-bs-toggle="modal" data-bs-target="#orderModal">
            <i class="fa-regular fa-eye"></i>
        </button>
        <button class="btn btn-sm status-btn" data-id="${item.id}">
          <i class="fa-solid fa-check-double text-success"></i>
        </button>
    `;
}

//
async function handleOrderActionClick(e) {
  if (e.target.closest('.show-btn')) {
    const btn = e.target.closest('.show-btn');
    const orderId = btn.dataset.id;

    const res = await getDataById(orderId);
    const rowDetails = res.data;

    let ordNum = document.getElementsByClassName('order-number');
    ordNum[0].textContent = `${rowDetails.order_number}`;
    ordNum[1].textContent = `${rowDetails.order_number}`;

    let statusVal = document.getElementsByClassName('status')[0];
    statusVal.textContent = `${rowDetails.status}`;

    statusVal.className = 'status';
    if (rowDetails.status == 'received') {
      statusVal.classList.add('status-received');
    } else {
      statusVal.classList.add('status-pending');
    }

    document.getElementsByClassName('creation-date')[0].textContent =
      formatDate(rowDetails.creation_date);

    let { supplier_name } =
      suppliers.find((sup) => {
        if (sup.supplier_id == rowDetails.supplier_id) return sup.supplier_name;
      }) || {};

    document.getElementsByClassName('supplier')[0].textContent =
      `${supplier_name || ''}`;

    let tableBody = document
      .getElementsByClassName('product-table')[0]
      .getElementsByClassName('productBody')[0];
    let totalQuantity = rowDetails.total_quantity;
    let totalAmount = rowDetails.total_amount;
    tableBody.innerHTML = '';

    for (let x = 0; x < rowDetails.items.length; x++) {
      let item = rowDetails.items[x];

      let prodVal = products.find((prod) => prod.product_id == item.product_id);

      let tr = document.createElement('tr');
      tr.innerHTML = `
          <td>${prodVal?.product_name || 'Unknown Product'}</td>
          <td>${item.quantity}</td>
          <td>${formatCurrency(item.unit_price)}</td>
          <td>${formatCurrency(item.unit_price * item.quantity)}</td>
      `;
      tableBody.appendChild(tr);
    }
    document.getElementsByClassName('tq')[0].textContent = totalQuantity;
    document.getElementsByClassName('ta')[0].textContent =
      formatCurrency(totalAmount);
  }

  if (e.target.closest('.status-btn')) {
    e.preventDefault();
    const btn = e.target.closest('.status-btn');
    const orderId = btn.dataset.id;
    const container = btn.closest('[data-index]');

    const order = orders.find((o) => o.id == orderId);

    if (order && order.status == 'pending') {
      order.status = 'received';
      console.log(order);
      const result = await editStatus(orderId, { status: 'received' });

      if (!result.success) {
        showNotification('error', 'Failed to edit order.');
        return;
      }

      const statusEl =
        container.querySelector('.status-pending') ||
        container.querySelector('.status-badge');
      if (statusEl) {
        statusEl.textContent = 'received';
        statusEl.classList.remove('status-pending');
        statusEl.classList.add('status-received');
      }

      updateCards(orders);
    }
  }
}

const tableBodyEl = document.getElementById('tableBody');
if (tableBodyEl) {
  tableBodyEl.addEventListener('click', handleOrderActionClick);
}

const cardsContainerEl = document.getElementById('cardsContainer');
if (cardsContainerEl) {
  cardsContainerEl.addEventListener('click', handleOrderActionClick);
}

// ========== Table Caption==========
function updateCaption() {
  document.getElementById('tableCaption').innerHTML =
    ` <i class="fa-solid fa-cart-shopping"></i> Purchase Orders (${orders.length})`;
}

// ========== Status Styling ==========
function setStatusStyle() {
  let dataTable = document.getElementById('dataTable');
  if (!dataTable) return;

  let rows = dataTable.getElementsByTagName('tr');
  for (let i = 0; i < rows.length; i++) {
    let statusCell = rows[i].children[3];

    if (!statusCell || !statusCell.textContent.trim()) continue;

    let currentStatus = statusCell.textContent.trim().toLowerCase();

    if (statusCell.querySelector('p')) continue;

    let p = document.createElement('p');
    p.textContent = currentStatus;
    p.classList.add('m-0');

    if (currentStatus === 'received') {
      statusCell.textContent = '';
      p.className += ' status-received';
      statusCell.appendChild(p);
    } else if (currentStatus === 'pending') {
      statusCell.textContent = '';
      p.className += ' status-pending';
      statusCell.appendChild(p);
    }
  }
}

// ========== Pagination ==========
let prevButton = document.getElementById('prevBtn');
prevButton.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderTablePage(orders, actionsHTML, currentPage, rowsPerPage, 'Orders');
    setStatusStyle();
  }
});

let nextButton = document.getElementById('nextBtn');
nextButton.addEventListener('click', () => {
  if (currentPage < Math.ceil(orders.length / rowsPerPage)) {
    currentPage++;
    renderTablePage(orders, actionsHTML, currentPage, rowsPerPage, 'Orders');
    setStatusStyle();
  }
});

// ========== Updating Cards ==========
function updateCards(orders) {
  let totalOrders = document.getElementsByClassName('total-order')[0];
  let recieved = document.getElementsByClassName('received')[0];
  let pending = document.getElementsByClassName('pending')[0];
  let ordersCount = orders.length;
  let recievedcount = 0;
  let pendingcount = 0;
  orders.forEach((elm) => {
    if (elm.status == 'pending') {
      pendingcount += 1;
    } else if (elm.status == 'received') {
      recievedcount += 1;
    }
  });
  totalOrders.textContent = ordersCount;
  recieved.textContent = recievedcount;
  pending.textContent = pendingcount;
}

// ========== Search ==========
let search = document.getElementById('search');
let currentDisplayOrders = orders;
search.addEventListener('input', () => {
  let searchVal = search.value.toLowerCase();

  if (searchVal === '') {
    currentDisplayOrders = orders;
  } else {
    currentDisplayOrders = orders.filter((elm) => {
      return (
        elm.supplier_name?.toLowerCase().includes(searchVal) ||
        elm.order_number?.toLowerCase().includes(searchVal) ||
        elm.status.includes(searchVal)
      );
    });
  }

  currentPage = 1;
  renderTablePage(
    currentDisplayOrders,
    actionsHTML,
    currentPage,
    rowsPerPage,
    'Orders',
  );

  if (currentDisplayOrders.length > 0) {
    setStatusStyle();
  } else {
    const cardsContainer = document.getElementById('cardsContainer');
    if (cardsContainer) {
      cardsContainer.innerHTML = `
          <p class="text-center py-4 text-muted">
            <i class="fa-solid fa-circle-exclamation me-2"></i>
            No orders found matching "${searchVal}"
          </p>`;
    }
  }

  updateCards(currentDisplayOrders);
});

// ========== Update Product Quantity ==========
async function productQuantityUpdate(Items) {
  if (hasRun) return;
  hasRun = true;
  if (!Items.length) return;

  try {
    const data = await getProducts();
    const allProducts = data.data;

    for (const order of ordersRecieved) {
      if (order.status === 'received' && !order.quantityUpdated) {
        for (const item of order.items) {
          const product = allProducts.find((p) => p.id === item.product_id);
          if (product) {
            product.quantity += item.quantity;
            await updateProductQuantity(product.id, product);
          }
        }
        await markOrderUpdated(order.id);
      }
    }
  } catch (err) {
    console.error('Error updating product quantities:', err);
    showNotification('error', 'Failed to update product quantities');
  }
}
// ================ recalculate Total==========
function recalculateTotalAmount() {
  let total_amount = 0;
  let total_quantity = 0;
  const rows = document.querySelectorAll('#NewOrder tbody tr:not(:last-child)');

  rows.forEach((row) => {
    const priceCell = row.querySelector('.price');
    const quantity = row.querySelector('.quantity');
    const total = row.querySelector('.total');

    if (priceCell && quantity && priceCell.textContent) {
      const price = Number(priceCell.textContent.replace(/[^0-9.]/g, ''));
      const qty = Number(quantity.value);
      total_quantity += qty;
      const rowTotal = price * qty;

      total.textContent = formatCurrency(rowTotal);
      total_amount += rowTotal;
    }
  });

  const totalValue = document
    .getElementById('NewOrder')
    .querySelector('.tamount');
  if (totalValue) totalValue.textContent = formatCurrency(total_amount);
  return { total_amount, total_quantity };
}

function validateOrderForm({ supplierSelector, creation_date, rows }) {
  // Supplier validation
  if (!supplierSelector || supplierSelector.value === 'default') {
    showNotification('error', 'Please select a supplier');
    return false;
  }
  // Date validation
  if (!creation_date) {
    showNotification('error', 'Please select a date');
    return false;
  }
  let hasValidItem = false;
  rows.forEach((row) => {
    if (row.classList.contains('d-flex')) return;

    const product = row.querySelector('.productSelector')?.value;
    const quantity = Number(row.querySelector('.quantity')?.value);

    if (product && product !== 'default' && quantity > 0) {
      hasValidItem = true;
    }
  });
  if (!hasValidItem) {
    showNotification('error', 'Please add at least one valid product');
    return false;
  }
  return true;
}

function resetOrderForm() {
  // Reset supplier
  const supplier = document.querySelector('.supplierSelector');
  if (supplier) supplier.value = 'default';

  // Reset date
  const date = document.querySelector('.date');
  if (date) date.value = '';

  // Get all rows
  const rows = document.querySelectorAll('.newProduct tr');

  rows.forEach((row, index) => {
    // Skip "Add Row" button row
    if (row.classList.contains('newrow')) return;

    if (index === 0) {
      // Reset first row
      const productSelect = row.querySelector('.productSelector');
      const quantity = row.querySelector('.quantity');
      const price = row.querySelector('.price');
      const total = row.querySelector('.total');

      if (productSelect) productSelect.value = 'default';
      if (quantity) quantity.value = 1;
      if (price) price.textContent = '';
      if (total) total.textContent = '';
    } else {
      // Remove extra rows
      row.remove();
    }
  });

  // Reset total amount
  const totalAmount = document.querySelector('.tamount');
  if (totalAmount) totalAmount.textContent = '$0.00';
}

// ========== Export to CSV ==========
function exportOrdersToCSV() {
  const searchTerm =
    document.getElementById('search')?.value.toLowerCase().trim() || '';

  let filteredOrders = orders;
  if (searchTerm) {
    filteredOrders = orders.filter(
      (order) =>
        order.supplier_name?.toLowerCase().includes(searchTerm) ||
        order.order_number?.toLowerCase().includes(searchTerm) ||
        order.status?.toLowerCase().includes(searchTerm),
    );
  }

  if (filteredOrders.length === 0) {
    showNotification('error', 'No orders to export');
    return;
  }

  const headers = [
    'Order Number',
    'Supplier',
    'Status',
    'Total Items',
    'Total Quantity',
    'Total Amount',
  ];
  const rows = filteredOrders.map((order) => [
    order.order_number,
    order.supplier_name,
    order.status,
    order.Total_Items,
    order.total_quantity,
    order.total_amount,
  ]);

  const csvContent = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell}"`).join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.setAttribute(
    'download',
    `purchase_orders_${new Date().toISOString().slice(0, 19)}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

document
  .getElementById('exportOrdersBtn')
  ?.addEventListener('click', exportOrdersToCSV);
