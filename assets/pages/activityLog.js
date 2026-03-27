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

/**
 * Adds global CSS styles for animations and transitions
 */
const addStyles = () => {
  const style = document.createElement("style");
  style.textContent = `
    .hover-shadow {
      transition: all 0.3s ease;
    }
    .hover-shadow:hover {
      transform: translateY(-2px);
      box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15) !important;
    }
    .transition {
      transition: all 0.3s ease;
    }
    .filter-section {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 1rem;
      margin-bottom: 1.5rem;
    }
    .form-label {
      font-size: 0.875rem;
      color: #6c757d;
    }
  `;
  document.head.appendChild(style);
};

const getActionBadgeClass = (action) => {
  const actionLower = (action || "").toLowerCase().trim();

  if (["add", "create", "new"].includes(actionLower)) {
    return "bg-success bg-opacity-10 text-success border-0";
  }

  if (["edit", "update", "modified"].includes(actionLower)) {
    return "bg-warning bg-opacity-10 text-warning border-0";
  }

  if (["delete", "remove", "deleted"].includes(actionLower)) {
    return "bg-danger bg-opacity-10 text-danger border-0";
  }

  return "bg-primary bg-opacity-10 text-primary border-0";
};

const getActionIcon = (action) => {
  const actionLower = (action || "").toLowerCase().trim();

  if (["add", "create", "new"].includes(actionLower)) {
    return "fa-plus-circle";
  }

  if (["edit", "update", "modified"].includes(actionLower)) {
    return "fa-edit";
  }

  if (["delete", "remove", "deleted"].includes(actionLower)) {
    return "fa-trash-alt";
  }

  return "fa-info-circle";
};

const getEntityIcon = (entityType) => {
  const typeLower = (entityType || "").toLowerCase().trim();

  const iconMap = {
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

  return iconMap[typeLower] || "fa-tag";
};

const getActionTextColor = (action) => {
  const badgeClass = getActionBadgeClass(action);

  if (badgeClass.includes("text-success")) return "text-success";
  if (badgeClass.includes("text-warning")) return "text-warning";
  if (badgeClass.includes("text-danger")) return "text-danger";

  return "text-primary";
};

// ===================== FILTER SYSTEM =====================

let allActivities = []; // Store original activities
let activitiesContainer = null;

const updateFilterOptions = (activities) => {
  const actionFilter = document.getElementById("actionFilter");
  if (actionFilter) {
    const actions = new Set();
    activities.forEach((act) => {
      if (act.action) actions.add(act.action.toLowerCase());
    });

    let options = '<option value="">All Actions</option>';
    Array.from(actions)
      .sort()
      .forEach((action) => {
        options += `<option value="${action}">${action}</option>`;
      });
    actionFilter.innerHTML = options;
  }

  const entityFilter = document.getElementById("entityFilter");
  if (entityFilter) {
    const entities = new Set();
    activities.forEach((act) => {
      if (act.entity_type) entities.add(act.entity_type.toLowerCase());
    });

    let options = '<option value="">All Types</option>';
    Array.from(entities)
      .sort()
      .forEach((entity) => {
        options += `<option value="${entity}">${entity}</option>`;
      });
    entityFilter.innerHTML = options;
  }

  const userFilter = document.getElementById("userFilter");
  if (userFilter) {
    const users = new Set();
    activities.forEach((act) => {
      if (act.userName) users.add(act.userName);
    });

    let options = '<option value="">All Users</option>';
    Array.from(users)
      .sort()
      .forEach((user) => {
        options += `<option value="${user}">${user}</option>`;
      });
    userFilter.innerHTML = options;
  }
};

const filterActivities = () => {
  const actionFilter = document.getElementById("actionFilter");
  const entityFilter = document.getElementById("entityFilter");
  const userFilter = document.getElementById("userFilter");
  const searchInput = document.getElementById("searchInput");

  const selectedAction = actionFilter?.value || "";
  const selectedEntity = entityFilter?.value || "";
  const selectedUser = userFilter?.value || "";
  const searchTerm = searchInput?.value.toLowerCase().trim() || "";

  return allActivities.filter((activity) => {
    if (selectedAction && activity.action?.toLowerCase() !== selectedAction)
      return false;
    if (
      selectedEntity &&
      activity.entity_type?.toLowerCase() !== selectedEntity
    )
      return false;
    if (selectedUser && activity.userName !== selectedUser) return false;

    if (searchTerm) {
      const searchableText = [
        activity.description,
        activity.action,
        activity.userName,
        activity.entity_type,
      ]
        .join(" ")
        .toLowerCase();

      if (!searchableText.includes(searchTerm)) return false;
    }

    return true;
  });
};

const applyFilters = () => {
  if (!activitiesContainer) return;
  const filteredActivities = filterActivities();
  renderActivities(filteredActivities, activitiesContainer);
};

const setupFilters = () => {
  const actionFilter = document.getElementById("actionFilter");
  const entityFilter = document.getElementById("entityFilter");
  const userFilter = document.getElementById("userFilter");
  const searchInput = document.getElementById("searchInput");

  if (actionFilter) actionFilter.addEventListener("change", applyFilters);
  if (entityFilter) entityFilter.addEventListener("change", applyFilters);
  if (userFilter) userFilter.addEventListener("change", applyFilters);

  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener("input", () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(applyFilters, 300);
    });
  }
};

// ===================== ACTIVITY DISPLAY =====================

const displayActivity = (activity, container) => {
  const badgeClass = getActionBadgeClass(activity.action);
  const actionIcon = getActionIcon(activity.action);
  const entityIcon = getEntityIcon(activity.entity_type);
  const textColor = getActionTextColor(activity.action);

  const markup = `
    <div class="col-md-6 col-lg-12 mb-3" data-id="${activity.id}">
      <div class="card border-0 shadow-sm rounded-3 hover-shadow transition">
        <div class="card-body p-3">
          <div class="d-flex align-items-start justify-content-between mb-2">
            <div class="d-flex align-items-center gap-2">
              <div class="rounded-circle p-2 bg-opacity-20" 
                   style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.05);">
                <i class="fas ${actionIcon} ${textColor}"></i>
              </div>
              <h6 class="fw-semibold text-dark mb-0">
                ${activity.description || activity.action || "N/A"}
              </h6>
            </div>
            <span class="badge ${badgeClass} px-3 py-1 rounded-pill fw-medium text-capitalize">
              <i class="fas ${actionIcon} me-1"></i>
              ${activity.action || "N/A"}
            </span>
          </div>
          <div class="d-flex align-items-center flex-wrap gap-3 mt-3 pt-1">
            <span class="small text-secondary">
              <i class="fas fa-user-circle me-1"></i>
              ${activity.userName || "Unknown User"}
            </span>
            <span class="small text-secondary">
              <i class="fas ${entityIcon} me-1"></i>
              ${activity.entity_type || "Unknown"}
            </span>
            <span class="small text-secondary">
              <i class="fas fa-calendar-alt me-1"></i>
              ${formatDate(activity.timestamp) || "N/A"}
            </span>
          </div>
        </div>
      </div>
    </div>
  `;

  container.insertAdjacentHTML("beforeend", markup);
};

const renderActivities = (activities, container) => {
  container.innerHTML = "";

  if (!activities || activities.length === 0) {
    container.innerHTML = `
      <div class="text-center py-5">
        <i class="fas fa-inbox fa-3x text-secondary mb-3 opacity-50"></i>
        <p class="text-secondary">No activities found.</p>
      </div>
    `;
    return;
  }

  activities.forEach((activity) => displayActivity(activity, container));
};

// ===================== ERROR HANDLING =====================

const showError = (container) => {
  container.innerHTML = `
    <div class="text-center py-5">
      <i class="fas fa-exclamation-circle fa-3x text-danger mb-3"></i>
      <p class="text-danger">Error loading activities</p>
      <button class="btn btn-outline-primary btn-sm mt-2" onclick="location.reload()">
        <i class="fas fa-sync-alt me-1"></i> Try Again
      </button>
    </div>
  `;
};

// ===================== INITIALIZATION =====================

const init = async () => {
  loadLayout("Activity Log");
  activitiesContainer = document.querySelector(".activity-container");

  if (!activitiesContainer) {
    console.error("activity-container not found");
    return;
  }

  try {
    const response = await getActivityLogs();
    console.log("API Response:", response);

    allActivities = response.data || response;

    updateFilterOptions(allActivities);
    setupFilters();
    renderActivities(allActivities, activitiesContainer);
  } catch (err) {
    console.error("Failed to load activities:", err);
    showError(activitiesContainer);
  }
};

// ===================== START APPLICATION =====================

addStyles();
init();
