// Imports
import { getCategoriesWithProductCount } from '../api/categoriesApi.js';

// Selectors
const categoriesContainer = document.querySelector('.categories-container');

// Display one category in DOM
const displayCategory = (category) => {
  const markup = `
      <div class="col-md-6 col-lg-4" data-categoryId="${category.id}">
        <div class="card h-100 border shadow-sm rounded-4 p-2">
          <div class="card-body">
            <div class="d-flex align-items-center mb-3">
              <div
                class="bg-primary-light rounded-3 d-flex align-items-center justify-content-center me-3 p-2"
              >
                <i
                  class="fa-regular fa-folder-open fs-4 text-primary"
                ></i>
              </div>
              <div>
                <h5 class="fw-bold text-dark-blue mb-1 text-capitalize">
                  ${category.name}
                </h5>
                <span class="bg-gray rounded-pill">${category.productCount} products</span>
              </div>
            </div>
            <p class="text-secondary mb-4">
              ${category.description}
            </p>

            <hr class="text-secondary opacity-25 mb-2" />
            <div class="d-flex gap-2 mb-3">
              <button
                class="btn btn-outline-custom w-50 rounded-3 py-2 fw-medium"
                data-bs-toggle="modal"
                data-bs-target="#addCategoryModal"
                data-action="edit"
                data-id="${category.id}"
                data-name="${category.name}"
                data-desc="${category.description}"
              >
                <i class="fa-regular fa-pen-to-square me-2"></i> Edit
              </button>
              <button
                class="btn btn-outline-danger-custom w-50 rounded-3 py-2 fw-medium"
                ${category.productCount > 0 ? 'disabled' : ''}
              >
                <i
                  class="fa-regular fa-trash-can me-2 text-danger"
                ></i>
                Delete
              </button>
            </div>
            ${
              category.productCount > 0
                ? `<p class="text-secondary mb-0 fs-14">
                  * Cannot delete category with products
                </p>`
                : ''
            }
          </div>
        </div>
      </div>
  `;

  categoriesContainer.insertAdjacentHTML('beforeend', markup);
};

// Display all categories in DOM
const renderCategories = (categories) => {
  categoriesContainer.innerHTML = '';

  if (!categories || categories.length == 0) {
    categoriesContainer.innerHTML =
      '<p class="text-center text-secondary">No categories found.</p>';
  } else {
    categories.forEach(displayCategory);
  }
};

// Initialize  Category Page
const init = async () => {
  const categories = await getCategoriesWithProductCount();

  if (categories.success) {
    renderCategories(categories.data);
  } else {
    categoriesContainer.innerHTML = `<p class="text-center text-danger">Error loading categories: ${categories.error}</p>`;
  }
};
init();
