export function renderTablePage(
  data,
  actionsHTML,
  page = 1,
  rowsPerPage = 10,
  tableName
) {
  const tableHead = document.getElementById('tableHead');
  const tableBody = document.getElementById('tableBody');

  tableHead.innerHTML = '';
  tableBody.innerHTML = '';

  if (!data.length) return;

  const columns = Object.keys(data[0]);

  // ========== HEADERS ==========
  columns.forEach((col) => {
    const th = document.createElement('th');
    th.classList.add('text-capitalize');
    th.textContent = col.split('_').join(' ');
    tableHead.appendChild(th);
  });

  // Actions column
  const actionTh = document.createElement('th');
  actionTh.textContent = 'Actions';
  tableHead.appendChild(actionTh);

  // ========== PAGE DATA ==========
  const start = (page - 1) * rowsPerPage;
  const end = Math.min(start + rowsPerPage, data.length);
  const pageData = data.slice(start, end);

  pageData.forEach((item) => {
    const tr = document.createElement('tr');
    tr.dataset.index = data.indexOf(item);

    columns.forEach((col) => {
      const td = document.createElement('td');
      td.textContent = item[col];
      tr.appendChild(td);
    });

    // Actions column
    const actionTd = document.createElement('td');
    actionTd.innerHTML = actionsHTML(item);
    tr.appendChild(actionTd);

    // Disable delete if product_supplied > 0
    const deleteBtn = actionTd.querySelector('.delete-btn');
    if (deleteBtn) {
      if (item.ProductsSupplied > 0) {
        deleteBtn.classList.add('disabled');
        deleteBtn.disabled = true;
        deleteBtn.title = "Cannot delete supplier with products";
      } else {
        deleteBtn.onclick = () => window.deleteSupplierHandler(deleteBtn);
      }
    }

    tableBody.appendChild(tr);
  });

  document.getElementById('tableInfo').textContent =
    `Showing ${start + 1} to ${end} of ${data.length} ${tableName}`;

  document.getElementById('pageNumber').textContent = page;

  document.getElementById('prevBtn').disabled = page === 1;
  document.getElementById('nextBtn').disabled =
    page === Math.ceil(data.length / rowsPerPage);
}