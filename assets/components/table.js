export function renderTablePage(
  data,
  actionsHTML,
  page = 1,
  rowsPerPage = 10,
  tableName,
) {
  const tableHead = document.getElementById('tableHead');
  const tableBody = document.getElementById('tableBody');
  const tableCaption = document.getElementById('tableCaption');
  const tableFooter = document.querySelector('.table-footer');
  const cardsContainer = document.getElementById('cardsContainer');

  tableHead.innerHTML = '';
  tableBody.innerHTML = '';
  if (cardsContainer) cardsContainer.innerHTML = '';

  if (data.length === 0) {
    tableBody.innerHTML = `
        <tr>
          <td class="text-muted text-center border-0 py-4 d-block" colspan="10" style="max-width:100%">
            <i class="fa-solid fa-circle-exclamation me-2"></i>
            No ${tableName} found matching your search.
          </td>
        </tr>
    `;

    if (cardsContainer) {
      cardsContainer.innerHTML = `
          <div class="text-center text-muted py-5">
            <i class="fa-solid fa-circle-exclamation me-2"></i>
            No matching ${tableName} found.
          </div>
        `;
    }

    tableFooter?.classList.add('visually-hidden');
    tableCaption?.classList.add('visually-hidden');
    return;
  }

  tableFooter.classList.remove('visually-hidden');
  tableCaption.classList.remove('visually-hidden');

  const columns = Object.keys(data[0]);

  // ========== HEADERS ==========
  columns.forEach((col, i) => {
    if (col == 'statusKey') return;
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
    tr.dataset.id = item.id;

    columns.forEach((col) => {
      if (col == 'statusKey') return;
      const td = document.createElement('td');

      if ((col === 'status' || col === 'adjustment_type') && item[col]) {
        const sClass = item[col]?.statusClass || '';
        const sText = item[col]?.statusText || item[col] || '';
        td.innerHTML = `<span class="badge fs-14 text-capitalize ${sClass}">${sText}</span>`;
      } else {
        typeof item[col] == 'number' && td.classList.add('text-center');
        td.textContent = item[col] ?? '';
      }
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
        deleteBtn.title = 'Cannot delete supplier with products';
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

  // ============= RENDER MOBILE CARDS =============
  pageData.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.index = data.indexOf(item);
    card.dataset.id = item.id;

    let statusBadgeHTML = '';

    if (item.status) {
      const sClass = item.status?.statusClass || '';
      const sText = item.status?.statusText || item.status || '';
      statusBadgeHTML = `<span class="badge fs-14 text-capitalize ${sClass}">${sText}</span>`;
    }

    let cardHTML = `
      <div class="product-header align-items-start">
        <h5>${Object.values(item)[0]}</h5>
        ${statusBadgeHTML}
      </div>
      <div class="card-body">
      `;

    Object.entries(item).forEach(([key, value]) => {
      if (key === 'status') return;
      if (key === 'id') return;
      if (key == 'statusKey') return;

      cardHTML += `
      <div class="product-row">
        <span class="text-capitalize">${key.replace('_', ' ')}:</span>
        <span>${value}</span>
      </div>
    `;
    });

    cardHTML += '</div>';

    cardHTML += `
    <div class="product-actions text-end mt-3">
      ${actionsHTML(item)}
    </div>
  `;

    card.innerHTML = cardHTML;

    const deleteBtn = card.querySelector('.delete-btn');
    if (deleteBtn && item.ProductsSupplied > 0) {
      deleteBtn.classList.add('disabled');
      deleteBtn.disabled = true;
      deleteBtn.title = 'Cannot delete supplier with products';
    }

    cardsContainer.appendChild(card);
  });
}
