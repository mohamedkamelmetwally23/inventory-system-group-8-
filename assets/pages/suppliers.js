import {
  createSupplier,
  deleteSupplier,
  getSuppliersWithProductSupplied,
  updataSupplier,
} from '../api/suppliersApi.js';
import loadLayout from '../ui/layout.js';

//
loadLayout('Suppliers');

// =======================
// Variables
let suppliers = [];
let editIndex = null;
let deleteIndex = null;

let currentPage = 1;
const rowsPerPage = 10;

// =======================
// Load Data
const loadSuppliers = async () => {
  const res = await getSuppliersWithProductSupplied();

  if (!res || !res.data) return;

  suppliers = res.data;

  updateCaption();

  renderTablePage(
    suppliers,
    actionsHTML(),
    currentPage,
    rowsPerPage,
    'suppliers',
  );
};

loadSuppliers();

// =======================
// Actions Buttons
function actionsHTML() {
  return `
    <button class="btn btn-sm edit-btn"> 
      <i class="fa-solid fa-pen-to-square edit-icon"></i> 
    </button> 
    <button class="btn btn-sm delete-btn"> 
      <i class="fa-solid fa-trash delete-icon"></i> 
    </button> 
  `;
}

// =======================
// Caption
function updateCaption() {
  document.getElementById('tableCaption').innerHTML =
    `<i class="fa-solid fa-users"></i> All Suppliers (${suppliers.length})`;
}

// =======================
// Pagination
document.getElementById('prevBtn').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;

    renderTablePage(
      suppliers,
      actionsHTML(),
      currentPage,
      rowsPerPage,
      'suppliers',
    );
  }
});

document.getElementById('nextBtn').addEventListener('click', () => {
  if (currentPage < Math.ceil(suppliers.length / rowsPerPage)) {
    currentPage++;

    renderTablePage(
      suppliers,
      actionsHTML(),
      currentPage,
      rowsPerPage,
      'suppliers',
    );
  }
});

// =======================
// ADD
document.getElementById('addSupplier').addEventListener('click', () => {
  editIndex = null;

  document.getElementById('supplierForm').reset();

  const modal = new bootstrap.Modal(document.getElementById('supplierModal'));

  modal.show();
});

// =======================
// SAVE (ADD + EDIT)
document.getElementById('saveSupplier').addEventListener('click', async (e) => {
  e.preventDefault();

  const supplierName = document.getElementById('name').value.trim();
  const contactPerson = document.getElementById('contactPerson').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();

  if (!supplierName || !contactPerson || !email || !phone || !address) {
    alert('Please fill all fields');
    return;
  }

  const data = {
    supplier_name: supplierName,
    contact_name: contactPerson,
    contact_email: email,
    contact_phone: phone,
    address: address,
  };

  if (editIndex === null) {
    // ADD
    await createSupplier(data);
  } else {
    // EDIT
    const id = suppliers[editIndex].id;
    await updataSupplier(id, data);
  }

  await loadSuppliers();

  bootstrap.Modal.getInstance(document.getElementById('supplierModal')).hide();
});

// =======================
// TABLE EVENTS (EDIT + DELETE)
document.getElementById('tableBody').addEventListener('click', function (e) {
  const row = e.target.closest('tr');
  if (!row) return;

  const index = Number(row.dataset.index);

  // EDIT
  const editBtn = e.target.closest('.edit-btn');
  if (editBtn) {
    editIndex = index;

    const supplier = suppliers[index];

    document.getElementById('name').value = supplier.supplier_name;
    document.getElementById('contactPerson').value = supplier.contact_name;
    document.getElementById('phone').value = supplier.contact_phone;
    document.getElementById('email').value = supplier.contact_email;
    document.getElementById('address').value = supplier.address;

    const modal = new bootstrap.Modal(document.getElementById('supplierModal'));

    modal.show();
  }

  // DELETE
  const deleteBtn = e.target.closest('.delete-btn');
  if (deleteBtn) {
    deleteIndex = index;

    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));

    modal.show();
  }
});

// =======================
// CONFIRM DELETE
document.getElementById('confirmDelete').addEventListener('click', async () => {
  if (deleteIndex === null) return;

  const id = suppliers[deleteIndex].id;

  await deleteSupplier(id);

  await loadSuppliers();

  deleteIndex = null;

  bootstrap.Modal.getInstance(document.getElementById('deleteModal')).hide();
});
