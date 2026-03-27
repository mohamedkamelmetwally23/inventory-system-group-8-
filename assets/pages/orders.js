import loadLayout from "../ui/layout.js";
import { generateModal } from "../components/FormRender.js";
import {
  getProducts,
  editStatus,
  getDataById,
  addNewOrder,
  getPurchaseOrders,
  getSuppliers,
} from "../api/ordersApi.js";

import { renderTablePage } from "../components/table.js";
loadLayout("Purchase Orders");
// ========== Form Calling ==========
let createOrder = document.getElementsByClassName("create-order")[0];
createOrder.addEventListener("click", async function () {
  let saveButton = await generateModal("Orders", "purchase_order");
  saveButton.addEventListener("click", function () {
    getFormData();
  });
});

// ========== Table Rendering ==========

let currentPage = 1;
const rowsPerPage = 10;
let orders = [];
// ========== Get Products ==========

let products = [];
getProducts().then((data) => {
  products = data.data;
  products = products.map((prod) => {
    return { product_id: prod.id, product_name: prod.product_name };
  });
});
// ========== Get Suppliers ==========

let suppliers = [];
getSuppliers().then((data) => {
  suppliers = data.data;
  suppliers = suppliers.map((sup) => {
    return { supplier_id: sup.id, supplier_name: sup.supplier_name };
  });
});
getPurchaseOrders().then((data) => {
  orders = data.data;
  orders = orders.map((elm) => {
    let { supplier_name } = suppliers.find((sup) => {
      if (sup.supplier_id == elm.supplier_id) return sup.supplier_name;
    });
    return {
      id: elm.id,
      order_number: elm.order_number,
      supplier_name: supplier_name,
      status: elm.status,
      Total_Items: elm.items.length,
      total_quantity: elm.total_quantity,
      total_amount: elm.total_amount,
    };
  });
  if (!orders.length) return;
  updateCaption();
  renderTablePage(orders, actionsHTML, currentPage, rowsPerPage, "Orders");
  setStatusStyle();
  ChangeStatus();
  updateCards(orders);
  showDetails();
});
// ========== Actions ==========
function actionsHTML() {
  return `
        <button class="btn btn-sm show-btn" data-bs-toggle="modal" data-bs-target="#orderModal">
            <i class="fa-regular fa-eye"></i>
        </button>
        <button class="btn btn-sm status-btn" >
          <i class="fa-solid fa-check-double text-success"></i>

        </button>
    `;
}
// ========== Table Caption==========
function updateCaption() {
  document.getElementById("tableCaption").innerHTML =
    ` <i class="fa-solid fa-cart-shopping"></i> Purchase Orders (${orders.length})`;
}

// ========== Status Styling ==========
function setStatusStyle() {
  let rows = document.getElementsByTagName("tr");
  for (let i = 0; i < rows.length; i++) {
    let status = rows[i].children[3];
    let p = document.createElement("p");

    if (status.textContent == "received") {
      p.textContent = status.textContent;
      status.textContent = "";
      p.classList.add("status-received");
      status.appendChild(p);
    } else if (status.textContent == "pending") {
      p.textContent = status.textContent;
      status.textContent = "";
      p.classList.add("status-pending");
      status.appendChild(p);
    }
  }
}
// ========== Change Status ==========
function ChangeStatus() {
  let orderStatus = document.getElementsByClassName("status-btn");
  for (let i = 0; i < orderStatus.length; i++) {
    orderStatus[i].addEventListener("click", async function (e) {
      const row = e.target.closest("tr");
      if (row.children[3].children[0].textContent == "pending") {
        row.children[3].children[0].textContent = "received";
        row.children[3].children[0].classList.remove("status-pending");
        row.children[3].children[0].classList.add("status-received");
        editStatus(row.children[0].textContent, { status: "received" });
      }
    });
  }
}

// ========== Pagination ==========
let prevButton = document.getElementById("prevBtn");
prevButton.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderTablePage(orders, actionsHTML, currentPage, rowsPerPage, "Orders");
    setStatusStyle();
    ChangeStatus();
    showDetails();
  }
});

let nextButton = document.getElementById("nextBtn");
nextButton.addEventListener("click", () => {
  if (currentPage < Math.ceil(orders.length / rowsPerPage)) {
    currentPage++;
    renderTablePage(orders, actionsHTML, currentPage, rowsPerPage, "Orders");
    setStatusStyle();
    ChangeStatus();
    showDetails();
  }
});

// ========== Updating Cards ==========
function updateCards(orders) {
  let totalOrders = document.getElementsByClassName("total-order")[0];
  let recieved = document.getElementsByClassName("received")[0];
  let pending = document.getElementsByClassName("pending")[0];
  let ordersCount = orders.length;
  let recievedcount = 0;
  let pendingcount = 0;
  orders.forEach((elm) => {
    if (elm.status == "pending") {
      pendingcount += 1;
    } else if (elm.status == "received") {
      recievedcount += 1;
    }
  });
  totalOrders.textContent = ordersCount;
  recieved.textContent = recievedcount;
  pending.textContent = pendingcount;
}

// ========== Search ==========

let search = document.getElementById("search");
search.addEventListener("input", () => {
  let searchVal = search.value.toLowerCase();
  let newOrders = orders.filter((elm) => {
    if (elm.supplier_name.toLowerCase().includes(searchVal)) {
      return elm;
    } else if (elm.order_number.toLowerCase().includes(searchVal)) {
      return elm;
    } else if (elm.status == searchVal) {
      return elm;
    }
  });
  if (newOrders.length > 0) {
    let Page = 1;
    renderTablePage(newOrders, actionsHTML, Page, rowsPerPage, "Orders");
    setStatusStyle();
    nextButton.addEventListener("click", () => {
      if (Page < Math.ceil(newOrders.length / rowsPerPage)) {
        Page++;
        renderTablePage(newOrders, actionsHTML, Page, rowsPerPage, "Orders");
        setStatusStyle();
        ChangeStatus();
        showDetails();
      }
    });
    prevButton.addEventListener("click", () => {
      if (Page > 1) {
        Page--;
        renderTablePage(newOrders, actionsHTML, Page, rowsPerPage, "Orders");
        setStatusStyle();
        ChangeStatus();
        showDetails();
      }
    });
  } else {
    renderTablePage(orders, actionsHTML, currentPage, rowsPerPage, "Orders");
    setStatusStyle();
    ChangeStatus();
    showDetails();
  }
});

// ========== show Order Details ==========

function showDetails() {
  let showbtn = document.getElementsByClassName("show-btn");

  for (let i = 0; i < showbtn.length; i++) {
    showbtn[i].addEventListener("click", async (e) => {
      const row = e.target.closest("tr");
      const rowDetails = (await getDataById(row.children[0].textContent)).data;

      let ordNum = document.getElementsByClassName("order-number");
      ordNum[0].textContent = `${rowDetails.order_number}`;
      ordNum[1].textContent = `${rowDetails.order_number}`;

      let statusVal = document.getElementsByClassName("status")[0];
      statusVal.textContent = `${rowDetails.status}`;

      if (rowDetails.status == "received") {
        statusVal.classList.add("status-received");
      } else {
        statusVal.classList.add("status-pending");
      }

      document.getElementsByClassName("creation-date")[0].textContent =
        `${rowDetails.creation_date.split("T")[0]}`;
      let { supplier_name } = suppliers.find((sup) => {
        if (sup.supplier_id == rowDetails.supplier_id) return sup.supplier_name;
      });

      document.getElementsByClassName("supplier")[0].textContent =
        `${supplier_name}`;

      let tableBody = document
        .getElementsByClassName("product-table")[0]
        .getElementsByClassName("productBody")[0];
      let totalQuantity = 0;
      let totalAmount = 0;
      tableBody.innerHTML = "";
      for (let x = 0; x < rowDetails.items.length; x++) {
        let prodVal = products.find((prod) => {
          if (prod.product_id == rowDetails.items[x].product_id)
            return prod.product_name;
        });
        let tr = document.createElement("tr");

        const td = document.createElement("td");
        td.textContent = `${prodVal.product_name}`;
        tr.appendChild(td);

        const td1 = document.createElement("td");
        td1.textContent = `${rowDetails.items[x].quantity}`;
        tr.appendChild(td1);

        const td2 = document.createElement("td");
        td2.textContent = `${rowDetails.items[x].unit_price}`;
        tr.appendChild(td2);

        const td3 = document.createElement("td");
        td3.textContent = `${Number(rowDetails.items[x].unit_price * rowDetails.items[x].quantity)} `;
        tr.appendChild(td3);

        totalQuantity += rowDetails.items[x].quantity;
        totalAmount +=
          rowDetails.items[x].unit_price * rowDetails.items[x].quantity;

        tableBody.appendChild(tr);

        prodVal = [];
      }
      document.getElementsByClassName("tq")[0].textContent = totalQuantity;
      document.getElementsByClassName("ta")[0].textContent = totalAmount;
    });
  }
}
