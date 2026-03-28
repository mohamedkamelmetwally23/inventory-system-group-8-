import loadLayout from "../ui/layout.js";
import { getActivityLogs } from "../api/activityLogApi.js";

// ===================== UTILITIES =====================

const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";

  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch (error) {
    return timestamp;
  }
};
// ===================== ACTIVITY HELPERS =====================

const getActionBadgeClass = (action) => {
  const a = (action || "").toLowerCase().trim();
  if (["add", "create", "new"].includes(a))
    return "bg-success bg-opacity-10 text-success border-0";
  if (["edit", "update", "modified"].includes(a))
    return "bg-warning bg-opacity-10 text-warning border-0";
  if (["delete", "remove", "deleted"].includes(a))
    return "bg-danger bg-opacity-10 text-danger border-0";
  return "bg-primary bg-opacity-10 text-primary border-0";
};

const getActionIcon = (action) => {
  const a = (action || "").toLowerCase().trim();
  if (["add", "create", "new"].includes(a)) return "fa-plus-circle";
  if (["edit", "update", "modified"].includes(a)) return "fa-edit";
  if (["delete", "remove", "deleted"].includes(a)) return "fa-trash-alt";
  return "fa-info-circle";
};

const getEntityIcon = (entityType) => {
  const type = (entityType || "").toLowerCase().trim();
  const map = {
    product: "fa-box",
    products: "fa-box",
    user: "fa-user-circle",
    users: "fa-user-circle",
    order: "fa-shopping-cart",
    orders: "fa-shopping-cart",
    category: "fa-tags",
    categories: "fa-tags",
    review: "fa-star",
    reviews: "fa-star",
  };
  return map[type] || "fa-tag";
};

const getActionTextColor = (action) => {
  const cls = getActionBadgeClass(action);
  if (cls.includes("text-success")) return "text-success";
  if (cls.includes("text-warning")) return "text-warning";
  if (cls.includes("text-danger")) return "text-danger";
  return "text-primary";
};

// ===================== FILTERS =====================

let allActivities = [];
let activitiesContainer = null;

const updateFilterOptions = (activities) => {
  const actions = new Set(),
    entities = new Set(),
    users = new Set();

  activities.forEach((a) => {
    if (a.action) actions.add(a.action.toLowerCase());
    if (a.entity_type) entities.add(a.entity_type.toLowerCase());
    if (a.userName) users.add(a.userName);
  });

  const setOptions = (selectId, set, defaultText) => {
    const select = document.getElementById(selectId);
    if (!select) return;
    let html = `<option value="">${defaultText}</option>`;
    Array.from(set)
      .sort()
      .forEach((v) => (html += `<option value="${v}">${v}</option>`));
    select.innerHTML = html;
  };

  setOptions("actionFilter", actions, "All Actions");
  setOptions("entityFilter", entities, "All Types");
  setOptions("userFilter", users, "All Users");
};

const filterActivities = () => {
  const action = document.getElementById("actionFilter")?.value || "";
  const entity = document.getElementById("entityFilter")?.value || "";
  const user = document.getElementById("userFilter")?.value || "";
  const search =
    document.getElementById("searchInput")?.value.toLowerCase().trim() || "";

  return allActivities.filter((a) => {
    if (action && a.action?.toLowerCase() !== action) return false;
    if (entity && a.entity_type?.toLowerCase() !== entity) return false;
    if (user && a.userName !== user) return false;
    if (search) {
      const text = [a.description, a.action, a.userName, a.entity_type]
        .join(" ")
        .toLowerCase();
      if (!text.includes(search)) return false;
    }
    return true;
  });
};

const setupFilters = () => {
  ["actionFilter", "entityFilter", "userFilter"].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", applyFilters);
  });

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    let timer;
    searchInput.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(applyFilters, 300);
    });
  }
};

// ===================== RENDER ACTIVITIES =====================

const displayActivity = (a, container) => {
  const badge = getActionBadgeClass(a.action);
  const actionIcon = getActionIcon(a.action);
  const entityIcon = getEntityIcon(a.entity_type);
  const textColor = getActionTextColor(a.action);

  const markUp = `
   <div class="col-12 col-md-12 col-xl-12 mb-3" data-id="${a.id}">
  <div class="card border-0 shadow-sm rounded-3 hover-shadow transition">
    <div class="card-body p-3">

      <div class="d-flex flex-column flex-md-row align-items-start justify-content-between mb-2 gap-2">

        <div class="d-flex align-items-center gap-2">
          <div class="rounded-circle p-2 bg-opacity-20" 
               style="width:32px;height:32px;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,0.05);">
            <i class="fas ${actionIcon} ${textColor}"></i>
          </div>

          <h6 class="fw-semibold text-dark mb-0 text-break">
            ${a.description || a.action || "N/A"}
          </h6>
        </div>

        <span class="badge ${badge} px-3 py-1 rounded-pill fw-medium text-capitalize align-self-start align-self-md-center">
          <i class="fas ${actionIcon} me-1"></i>
          ${a.action || "N/A"}
        </span>

      </div>

      <div class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center flex-wrap gap-2 gap-sm-3 mt-3 pt-1">
        <span class="small text-secondary">
          <i class="fas fa-user-circle me-1"></i>${a.userName || "Unknown User"}
        </span>

        <span class="small text-secondary">
          <i class="fas ${entityIcon} me-1"></i>${a.entity_type || "Unknown"}
        </span>

        <span class="small text-secondary">
          <i class="fas fa-calendar-alt me-1"></i>${formatDate(a.timestamp) || "N/A"}
        </span>
      </div>

    </div>
  </div>
</div>`;
  container.insertAdjacentHTML("beforeend", markUp);
};

const renderActivities = (activities, container) => {
  container.innerHTML = "";
  if (!activities || activities.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5">
        <i class="fas fa-inbox fa-3x text-secondary mb-3 opacity-50"></i>
        <p class="text-secondary">No activities found.</p>
      </div>`;
    return;
  }
  activities.forEach((a) => displayActivity(a, container));
};
let currentPage = 1;
const itemsPerPage = 5;

const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageNumber = document.getElementById("pageNumber");

// ===================== PAGINATION + FILTER =====================
const applyFilters = () => {
  if (!activitiesContainer) return;

  const filtered = filterActivities();

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  if (currentPage > totalPages) currentPage = 1;
  const start = (currentPage - 1) * itemsPerPage;
  const paginated = filtered.slice(start, start + itemsPerPage);

  renderActivities(paginated, activitiesContainer);

  pageNumber.textContent = `${currentPage}`;

  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
};

prevBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    applyFilters();
  }
});

nextBtn.addEventListener("click", () => {
  const filtered = filterActivities();
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  if (currentPage < totalPages) {
    currentPage++;
    applyFilters();
  }
});
// ===================== INITIALIZATION =====================

const init = async () => {
  loadLayout("Activity Log");
  activitiesContainer = document.querySelector(".activity-container");
  if (!activitiesContainer)
    return console.error("activity-container not found");

  try {
    const res = await getActivityLogs();
    allActivities = res.data || res;
    updateFilterOptions(allActivities);
    setupFilters();
    applyFilters();
  } catch (err) {
    console.error("Failed to load activities:", err);
    activitiesContainer.innerHTML = `
      <div class="text-center py-5">
        <i class="fas fa-exclamation-circle fa-3x text-danger mb-3"></i>
        <p class="text-danger">Error loading activities</p>
      </div>`;
  }
};

// ===================== START =====================

init();
