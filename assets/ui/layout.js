import { logout } from '../pages/Session.js';

const headerEl = document.querySelector('header');
const sidebarEl = document.querySelector('aside');

const loadLayout = (pageTitle) => {
  const userRew = localStorage.getItem('loggedInUser');
  if (!userRew) return;
  const userData = JSON.parse(userRew);
  const role = userData.role.split('_').join(' ');

  const navbar = `
        <nav class="navbar">
          <div class="container-fluid">
            <div>
              <button class="navbar-toggler d-lg-none me-3 border-0 fs-5" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasSidebar">
                <span class="navbar-toggler-icon"></span>
              </button>
              <a class="navbar-brand" href="/views/dashboard.html">
                <img
                  src="../assets/imgs/logo.png"
                  class="logo me-1"
                  alt="PharmaFlow Logo"
                />
                <span class="text-primary fw-semibold"
                  >Pharma<span class="text-success text-info-dark"
                    >Flow</span
                  ></span
                >
              </a>
            </div>
            <div class="d-flex align-items-center gap-2">
              <div class="text-end d-none d-sm-block">
                <h5 class="fs-6 mb-0 text-capitalize">${role} User</h5>
                <p class="fs-12 mb-0 text-secondary user-role">
                  Inventory Manager
                </p>
              </div>
              <div
                class="user-img main-bg text-white d-flex align-items-center justify-content-center rounded-circle fs-6 fw-semibold text-uppercase"
              >
                ${role[0]}U
              </div>
              <button class="btn" id="logoutButton" onclick="logout()" title="logout">
                <i class="fa-solid fa-right-from-bracket fs-4 text-primary"></i>
              </button>
            </div>
          </div>
        </nav>
  `;

  const navLinks = [
    {
      title: 'Dashboard',
      icon: '<i class="fa fa-chart-pie me-3"></i>',
      href: '/views/dashboard.html',
    },
    {
      title: 'Products',
      icon: '<i class="fa fa-cube me-3"></i>',
      href: '/views/products.html',
    },
    {
      title: 'Categories',
      icon: '<i class="fa-regular fa-folder-open me-3"></i>',
      href: '/views/categories.html',
    },
    {
      title: 'Suppliers',
      icon: '<i class="fa fa-truck me-3"></i>',
      href: '/views/suppliers.html',
    },
    {
      title: 'Purchase Orders',
      icon: '<i class="fa fa-cart-shopping me-3"></i>',
      href: '/views/orders.html',
    },
    {
      title: 'Stock Adjustments',
      icon: '<i class="fa fa-rotate me-3"></i>',
      href: '/views/stock-adjustments.html',
    },
    {
      title: 'Reports',
      icon: '<i class="fa fa-file-lines me-3"></i>',
      href: '/views/reports.html',
    },
    {
      title: 'Activity Log',
      icon: '<i class="fa fa-history me-3"></i>',
      href: '/views/activity-log.html',
    },
  ];

  const navLists = navLinks
    .map(
      (link) =>
        `<li class="sidebar-nav rounded-2 ${pageTitle == link.title ? 'sidebar-nav-active' : ''}">
        <a
          href='${link.href}'
          class="text-white text-decoration-none d-block py-2 px-4"
        >
          ${link.icon}
          ${link.title}
        </a>
      </li>`,
    )
    .join('');

  const sidebar = `
      <nav class="py-4">
        <ul class="d-flex flex-column gap-3 list-unstyled">
          ${navLists}
        </ul>
      </nav>
  `;

  headerEl.innerHTML = navbar;
  sidebarEl.innerHTML = sidebar;
  document.querySelector('.offcanvas-body').innerHTML = sidebar;
};

export default loadLayout;
