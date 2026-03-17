function renderTablePage(
  data,
  actions,
  page = 1,
  rowsPerPage = 10,
  tableName = "items",
) {
  const tableHead = document.getElementById("tableHead");
  const tableBody = document.getElementById("tableBody");

  tableHead.innerHTML = "";
  tableBody.innerHTML = "";

  if (!data.length) return;

  const columns = Object.keys(data[0]);

  // headers
  columns.forEach((col) => {
    const th = document.createElement("th");
    th.textContent = col;
    tableHead.appendChild(th);
  });

  // actions header
  const actionTh = document.createElement("th");
  actionTh.textContent = "Actions";
  tableHead.appendChild(actionTh);

  // rows for current page
  const startIdx = (page - 1) * rowsPerPage;
  const endIdx = Math.min(startIdx + rowsPerPage, data.length);
  const pageData = data.slice(startIdx, endIdx);

  pageData.forEach((item) => {
    const tr = document.createElement("tr");
    tr.dataset.index = data.indexOf(item);

    columns.forEach((col) => {
      const td = document.createElement("td");
      td.textContent = item[col];
      tr.appendChild(td);
    });

    const actionTd = document.createElement("td");

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-sm edit-btn";
    editBtn.innerHTML = `<i class="fa-solid fa-pen-to-square edit-icon"></i>`;

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-sm delete-btn border-0";
    deleteBtn.innerHTML = `<i class="fa-solid fa-trash delete-icon"></i>`;

    
    if (item.ProductsSupplied === 0) {
      deleteBtn.classList.add("disabled");
    }

    actionTd.appendChild(editBtn);
    actionTd.appendChild(deleteBtn);

    tr.appendChild(actionTd);

    tableBody.appendChild(tr);
  });

  // update info
  document.getElementById("tableInfo").textContent =
    `Showing ${startIdx + 1} to ${endIdx} of ${data.length} ${tableName}`;

  // update page number
  document.getElementById("pageNumber").textContent = page;

  // disable/enable buttons
  document.getElementById("prevBtn").disabled = page === 1;
  document.getElementById("nextBtn").disabled = page === Math.ceil(data.length / rowsPerPage);
}
