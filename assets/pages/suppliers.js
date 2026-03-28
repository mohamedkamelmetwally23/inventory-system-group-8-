import loadLayout from '../ui/layout.js';
import {
  createSupplier,
  deleteSupplier,
  getSuppliersWithProductSupplied,
  updateSupplier,
} from '../api/suppliersApi.js';
import { renderTablePage } from '../components/table.js';

// =======================
// Load Layout
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
async function loadSuppliers() {
  try {
    const res = await getSuppliersWithProductSupplied();
    suppliers = res?.data || [];
    updateCaption();
    renderTablePage(
      suppliers,
      actionsHTML,
      currentPage,
      rowsPerPage,
      'suppliers',
    );
  } catch (err) {
    console.error('Error loading suppliers:', err);
    alert('Failed to load suppliers data.');
  }
}

loadSuppliers();

// =======================
// Actions Template
function actionsHTML(supplier) {
  const isDisabled = supplier.ProductsSupplied > 0;
  return `
    <button class="btn btn-sm edit-btn border-0">
      <i class="fa-solid fa-pen-to-square edit-icon text-primary"></i>
    </button>

    <button 
        class="btn btn-sm delete-btn border-0 ${isDisabled ? 'disabled' : ''}"
        ${isDisabled ? 'disabled' : ''}
    >
        <i class="fa-solid fa-trash delete-icon text-danger"></i>
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
      actionsHTML,
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
      actionsHTML,
      currentPage,
      rowsPerPage,
      'suppliers',
    );
  }
});

// =======================
// Open Add Modal
document.getElementById('addSupplier').addEventListener('click', () => {
  editIndex = null;
  document.getElementById('addSupplierForm').reset();
  document.getElementById('addSupplierModalLabel').textContent =
    'Add New Supplier';
  document.getElementById('supplierModalSubtitle').textContent =
    'Enter the details for the new supplier';
  const modal = new bootstrap.Modal(
    document.getElementById('addSupplierModal'),
  );
  modal.show();
});

// =======================
// Submit Add / Edit
document
  .getElementById('addSupplierForm')
  .addEventListener('submit', async (e) => {
    e.preventDefault();

    const data = {
      supplier_name: document.getElementById('supplierName').value.trim(),
      contact_name: document.getElementById('contactName').value.trim(),
      contact_email: document.getElementById('contactEmail').value.trim(),
      contact_phone: document.getElementById('contactPhone').value.trim(),
      address: document.getElementById('address').value.trim(),
    };

    if (
      !data.supplier_name ||
      !data.contact_name ||
      !data.contact_email ||
      !data.contact_phone ||
      !data.address
    ) {
      alert('Please fill all fields');
      return;
    }

    try {
      if (editIndex === null) {
        await createSupplier(data);
      } else {
        await updateSupplier(suppliers[editIndex].id, data);
      }
      await loadSuppliers();
      const modal = bootstrap.Modal.getInstance(
        document.getElementById('addSupplierModal'),
      );
      modal.hide();
    } catch (err) {
      console.error('Error saving supplier:', err);
      alert('Failed to save supplier.');
    }
  });

// =======================
// Table Events (Edit / Delete)
document.getElementById('tableBody').addEventListener('click', function (e) {
  const row = e.target.closest('tr');
  if (!row) return;
  const index = Number(row.dataset.index);

  // EDIT
  if (e.target.closest('.edit-btn')) {
    editIndex = index;
    const s = suppliers[index];
    document.getElementById('supplierName').value = s.supplier_name;
    document.getElementById('contactName').value = s.contact_name;
    document.getElementById('contactPhone').value = s.contact_phone;
    document.getElementById('contactEmail').value = s.contact_email;
    document.getElementById('address').value = s.address;

    document.getElementById('addSupplierModalLabel').textContent =
      'Edit Supplier';
    document.getElementById('supplierModalSubtitle').textContent =
      'Update the supplier information below';

    const modal = new bootstrap.Modal(
      document.getElementById('addSupplierModal'),
    );
    modal.show();
  }

  // DELETE
  if (e.target.closest('.delete-btn')) {
    deleteIndex = index;
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
  }
});

// =======================
// Confirm Delete
document.getElementById('confirmDelete').addEventListener('click', async () => {
  if (deleteIndex === null) return;

  const supplier = suppliers[deleteIndex];

  if (supplier.ProductsSupplied > 0) {
    alert('Cannot delete this supplier because it supplies products.');
    return;
  }

  try {
    await deleteSupplier(supplier.id);
    await loadSuppliers();
    deleteIndex = null;
    const modal = bootstrap.Modal.getInstance(
      document.getElementById('deleteModal'),
    );
    modal.hide();
  } catch (err) {
    console.error('Error deleting supplier:', err);
    alert('Failed to delete supplier.');
  }
});

// =======================
// Delete Handler (used in button)
// window.deleteSupplierHandler = function (button) {
//   const row = button.closest('tr');
//   if (!row) return;

//   deleteIndex = Number(row.dataset.index);
//   const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
//   modal.show();
// };
