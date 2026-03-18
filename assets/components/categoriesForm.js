// Imports
import showNotification from '../utils/notification.js';
import {
  createCategory,
  updateCategory,
  deleteCategory,
} from '../api/categoriesApi.js';

// Elements
const categoryModalForm = document.getElementById('addCategoryModal');
const btnSubmit = categoryModalForm.querySelector('button[type="submit"]');

// State
let editingId = null;

// Event Handler
categoryModalForm.addEventListener('show.bs.modal', (e) => {
  const categoryData = e.relatedTarget.dataset;
  const { action } = categoryData;

  //
  const categoryIdInput = categoryModalForm.querySelector('#categoryId');
  const modalTitle = categoryModalForm.querySelector('.modal-title');
  const categoryNameInput = categoryModalForm.querySelector('#categoryName');
  const categoryDescInput = categoryModalForm.querySelector(
    '#categoryDescription',
  );
  const submitBtn = categoryModalForm.querySelector('button[type="submit"]');

  //
  if (action == 'edit') {
    modalTitle.textContent = 'Edit Category';
    submitBtn.textContent = 'Save Changes';

    editingId = categoryData.id;
    categoryIdInput.value = categoryData.id;
    categoryNameInput.value = categoryData.name;
    categoryDescInput.value = categoryData.desc;

    //
  } else {
    modalTitle.textContent = 'Add New Category';
    submitBtn.textContent = 'Add Category';

    editingId = null;
    categoryIdInput.value = '';
    categoryNameInput.value = '';
    categoryDescInput.value = '';
  }
});

categoryModalForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('categoryName').value.trim();
  const description = document
    .getElementById('categoryDescription')
    .value.trim();

  if (!name) {
    showNotification('error', 'Category name is required');
    return;
  }

  const originalBtnSubmitText = btnSubmit.textContent;
  btnSubmit.disabled = true;
  btnSubmit.textContent = 'Saving...';
  let result;

  if (editingId) {
    result = await updateCategory(editingId, { name, description });
  } else {
    result = await createCategory({ name, description });
  }

  if (result.success) {
    showNotification(
      'success',
      `${editingId ? 'Updated' : 'Created'} category successfully`,
    );
    const modal = bootstrap.Modal.getInstance(categoryModalForm);
    modal.hide();

    //
  } else {
    showNotification('error', `Error ${result.error}`);
  }

  btnSubmit.disabled = false;
  btnSubmit.textContent = originalBtnSubmitText;
});
