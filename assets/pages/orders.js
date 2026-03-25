import loadLayout from '../ui/layout.js';
import { generateModal } from '../components/FormRender.js';
import { editStatus, getData, getPurchaseOrders } from '../api/ordersApi.js';
import { renderTablePage } from '../components/table.js';

let createOrder = document.getElementsByClassName('create-order')[0];

loadLayout('Purchase Orders');

createOrder.addEventListener('click', async function () {
  let saveButton = await generateModal('Orders', 'purchase_order');
  saveButton.addEventListener('click', function () {
    getFormData();
  });
});

//=========================
//rendering Table function
let currentPage = 1;
const rowsPerPage = 10;
let orders = [];
getPurchaseOrders().then((data) => {
  orders = data.data;
  if (!orders.length) return;
  updateCaption();
  renderTablePage(orders, actionsHTML, currentPage, rowsPerPage, 'Orders');
  setStatusStyle();
  ChangeStatus();
  updateCards(orders);
});
//==========
//actions...
function actionsHTML() {
  return `
        <button class="btn btn-sm edit-btn">
            <i class="fa-regular fa-eye"></i>
        </button>
        <button class="btn btn-sm delete-btn">
           <i class="fa-regular fa-box-open"></i>
        </button>
    `;
}
//Table captions...
function updateCaption() {
  document.getElementById('tableCaption').innerHTML =
    ` <i class="fa-solid fa-cart-shopping"></i> Purchase Orders (${orders.length})`;
}

//set status Style...
function setStatusStyle() {
  let rows = document.getElementsByTagName('tr');
  for (let i = 0; i < rows.length; i++) {
    let status = rows[i].children[4];
    let p = document.createElement('p');

    if (status.textContent == 'Received') {
      p.textContent = status.textContent;
      status.textContent = '';
      p.classList.add('status-recieved');
      status.appendChild(p);
    } else if (status.textContent == 'Pending') {
      p.textContent = status.textContent;
      status.textContent = '';
      p.classList.add('status-pending');
      status.appendChild(p);
    }
  }
}
//change status...
function ChangeStatus() {
  let showOrder = document.getElementsByClassName('edit-btn');
  for (let i = 0; i < showOrder.length; i++) {
    showOrder[i].addEventListener('click', async function (e) {
      const row = e.target.closest('tr');
      if (row.children[4].children[0].textContent == 'Pending') {
        row.children[4].children[0].textContent = 'Recieved';
        row.children[4].children[0].classList.remove('status-pending');
        row.children[4].children[0].classList.add('status-recieved');
        let rowData = await getData(row.children[0].textContent);
        console.log(rowData);
        rowData[status] = 'Recieved';
        editStatus(row.children[0].textContent, rowData);

        e.target.remove();
      }
    });
  }
}

//pagination
let prevButton = document.getElementById('prevBtn');
prevButton.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderTablePage(orders, actionsHTML(), currentPage, rowsPerPage, 'Orders');
    setStatusStyle();
    ChangeStatus();
  }
});

let nextButton = document.getElementById('nextBtn');

nextButton.addEventListener('click', () => {
  if (currentPage < Math.ceil(orders.length / rowsPerPage)) {
    currentPage++;
    renderTablePage(orders, actionsHTML(), currentPage, rowsPerPage, 'Orders');
    setStatusStyle();
    ChangeStatus();
  }
});

let addOrder = document.getElementsByClassName('create-order')[0];
addOrder.addEventListener('click', function () {});

//update cards values...
function updateCards(orders) {
  let totalOrders = document.getElementsByClassName('total-order')[0];
  let recieved = document.getElementsByClassName('recieved')[0];
  let pending = document.getElementsByClassName('pending')[0];
  let ordersCount = orders.length;
  let recievedcount = 0;
  let pendingcount = 0;
  orders.forEach((elm) => {
    if (elm.status == 'Pending') {
      pendingcount += 1;
    } else if (elm.status == 'Received') {
      recievedcount += 1;
    }
  });
  totalOrders.textContent = ordersCount;
  recieved.textContent = recievedcount;
  pending.textContent = pendingcount;
}
