import { getSuppliers } from "../api/suppliersApi.js";

let currentPage = 1;
const rowsPerPage = 10;

let suppliers = [];
let editIndex = null;
let deleteIndex = null;

// fetch data
getSuppliers()
  .then((data) => {
    suppliers = data.data;

    if (!suppliers.length) return;

    updateCaption();

    renderTablePage(
      suppliers,
      actionsHTML(),
      currentPage,
      rowsPerPage,
      "suppliers",
    );
  });

// actions buttons
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

// caption
function updateCaption() {
  document.getElementById("tableCaption").innerHTML =
    `<i class="fa-solid fa-users"></i> All Suppliers (${suppliers.length})`;
}

// pagination
document.getElementById("prevBtn").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;

    renderTablePage(
      suppliers,
      actionsHTML(),
      currentPage,
      rowsPerPage,
      "suppliers",
    );
  }
});

document.getElementById("nextBtn").addEventListener("click", () => {
  if (currentPage < Math.ceil(suppliers.length / rowsPerPage)) {
    currentPage++;

    renderTablePage(
      suppliers,
      actionsHTML(),
      currentPage,
      rowsPerPage,
      "suppliers",
    );
  }
});

// ADD

document.getElementById("addSupplier").addEventListener("click", () => {
  editIndex = null;

  document.getElementById("supplierForm").reset();

  const modal = new bootstrap.Modal(document.getElementById("supplierModal"));

  modal.show();
});

// SAVE (ADD / EDIT)

document.getElementById("saveSupplier").addEventListener("click", (e) => {
  e.preventDefault();

  const supplierName = document.getElementById("name").value.trim();
  const contactPerson = document.getElementById("contactPerson").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();
  const address = document.getElementById("address").value.trim();
//   const productsSupplied = Number(document.getElementById("productsSupplied").value.trim());

  if (!supplierName || !contactPerson || !phone || !email || !address ) {
    alert("Please fill all fields");
    return;
  }

  if (editIndex === null) {

    const newSupplier = {
        id: Date.now(),
        SupplierName: supplierName,
        ContactPerson: contactPerson,
        Phone: phone,
        Email: email,
        Address: address,
        // ProductsSupplied: productsSupplied,
    };

    suppliers.push(newSupplier);

  } else {
    suppliers[editIndex]["supplier_name"] = supplierName;
    suppliers[editIndex]["contact_name"] = contactPerson;
    suppliers[editIndex]["contact_phone"] = phone;
    suppliers[editIndex]["contact_email"] = email;
    suppliers[editIndex]["address"] = address;
    // suppliers[editIndex]["ProductsSupplied"] = productsSupplied;
  }

  updateCaption();

  renderTablePage(
    suppliers,
    actionsHTML(),
    currentPage,
    rowsPerPage,
    "suppliers",
  );

  bootstrap.Modal.getInstance(document.getElementById("supplierModal")).hide();
});

// TABLE EVENTS (EDIT + DELETE)

document.getElementById("tableBody").addEventListener("click", function (e) {
  const row = e.target.closest("tr");

  if (!row) return;

  const index = Number(row.dataset.index);

  // EDIT
  const editBtn = e.target.closest(".edit-btn");
  if (editBtn) {
    editIndex = index;

    const supplier = suppliers[index];

    document.getElementById("name").value = supplier.SupplierName;
    document.getElementById("contactPerson").value = supplier.ContactPerson;
    document.getElementById("phone").value = supplier.Phone;
    document.getElementById("email").value = supplier.Email;
    document.getElementById("address").value = supplier.Address;
    // document.getElementById("productsSupplied").value = supplier.ProductsSupplied;

    const modal = new bootstrap.Modal(document.getElementById("supplierModal"));

    modal.show();
  }

  // DELETE
  const deleteBtn = e.target.closest(".delete-btn");
  if (deleteBtn && !deleteBtn.classList.contains("disabled")) {
    deleteIndex = index;

    const modal = new bootstrap.Modal(document.getElementById("deleteModal"));

    modal.show();
  }
});

// CONFIRM DELETE

document.getElementById("confirmDelete").addEventListener("click", () => {
  suppliers.splice(deleteIndex, 1);

  updateCaption();

  // fix pagination
  const totalPages = Math.ceil(suppliers.length / rowsPerPage);

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  renderTablePage(
    suppliers,
    actionsHTML(),
    currentPage,
    rowsPerPage,
    "suppliers",
  );

  bootstrap.Modal.getInstance(document.getElementById("deleteModal")).hide();
});
