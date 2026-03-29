// ===================== SESSION & TOKEN MANAGEMENT =====================
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

function clearAuthToken() {
  document.cookie =
    'authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  localStorage.removeItem('loggedInUser');
}

function isAuthenticated() {
  const token = getCookie('authToken');
  return token !== null && token.length > 0;
}

export function logout() {
  clearAuthToken();
  window.location.href = '/index.html';
}

function startTokenMonitor() {
  setInterval(() => {
    if (!isAuthenticated()) {
      logout();
    }
  }, 60000);
}

function protectPage() {
  if (!isAuthenticated()) {
    window.location.href = '/index.html';
  }
}

window.logout = logout;

protectPage();
startTokenMonitor();
