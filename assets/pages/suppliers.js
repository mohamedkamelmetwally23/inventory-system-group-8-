import {
  createSupplier,
  deleteSupplier,
  getSuppliersWithProductSupplied,
  updateSupplier,
} from '../api/suppliersApi.js';
import { getCategories } from '../api/categoriesApi.js';
import { renderTablePage } from '../components/table.js';
import loadLayout from '../ui/layout.js';
import showNotification from '../utils/notification.js';

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
    showNotification('error', 'Failed to load suppliers data.');
    console.error('Error loading suppliers:', err);
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
      contact_name: document.getElementById('categoriesFilter').value.trim(),
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
      showNotification('warning', 'Please fill all fields');
      return;
    }

    try {
      if (editIndex === null) {
        const result = await createSupplier(data);
        result.success &&
          showNotification('success', 'Created Supplier successfully');
      } else {
        const result = await updateSupplier(suppliers[editIndex].id, data);
        result.success &&
          showNotification('success', 'Updated Supplier successfully');
      }
      await loadSuppliers();
      const modal = bootstrap.Modal.getInstance(
        document.getElementById('addSupplierModal'),
      );
      modal.hide();
    } catch (err) {
      showNotification('error', 'Failed to save supplier.');
      console.error('Error saving supplier:', err);
    }
  });

// =======================
// Table & Cards Events (Edit / Delete)
// =======================
const handleActionClick = function (e) {
  // بنشوف العنصر اللي اتداس عليه سواء كان صف في جدول أو كارت موبايل
  const container = e.target.closest('[data-id]');
  if (!container) return;

  const supplierId = container.dataset.id;
  // بنجيب البيانات الحقيقية من المصفوفة الأصلية باستخدام الـ ID
  const s = suppliers.find((item) => item.id == supplierId);
  const realIndex = suppliers.indexOf(s);

  // --- EDIT ---
  if (e.target.closest('.edit-btn')) {
    editIndex = realIndex;

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

  // --- DELETE ---
  if (e.target.closest('.delete-btn')) {
    // التأكد إن الزرار مش Disabled (عشان الموبايل أحياناً بيتخطى الـ CSS disabled)
    if (e.target.closest('.delete-btn').classList.contains('disabled')) return;

    deleteIndex = realIndex;
    const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
    modal.show();
  }
};

// تشغيل الـ Listener على الجدول (Desktop)
const tableBodyEl = document.getElementById('tableBody');
if (tableBodyEl) {
  tableBodyEl.addEventListener('click', handleActionClick);
}

// تشغيل الـ Listener على الكروت (Mobile)
const cardsContainerEl = document.getElementById('cardsContainer');
if (cardsContainerEl) {
  cardsContainerEl.addEventListener('click', handleActionClick);
}

// =======================
// Confirm Delete
document.getElementById('confirmDelete').addEventListener('click', async () => {
  if (deleteIndex === null) return;

  const supplier = suppliers[deleteIndex];

  if (supplier.ProductsSupplied > 0) {
    showNotification(
      'error',
      'Cannot delete this supplier because it supplies products.',
    );
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
    showNotification('error', 'Failed to delete supplier');
    console.error('Error deleting supplier:', err);
  }
});
