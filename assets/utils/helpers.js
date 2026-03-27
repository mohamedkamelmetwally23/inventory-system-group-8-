import { v4 as uuidv4 } from 'https://jspm.dev/uuid';

// Generate ID
export const generateId = (prefix) => {
  const shortId = uuidv4().substring(0, 8);
  return `${prefix.toUpperCase()}-${shortId}`;
};

// Check valid email
export function isEmailAddress(email) {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  return emailPattern.test(email);
}

// Formats a numeric value into a localized currency string.
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

// Format date ==> (Mar 3 2026)
export const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

// Generate a color based on text.
export function stringToColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
}

// Generate monochromatic blue shades based on array index
export function getBlueShade(index) {
  const hue = 218;
  const saturation = 72;

  let lightness = 21 + index * 10;
  lightness = Math.min(lightness, 85);

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

// Show Sppiner
export const showSpinner = (container) => {
  container.innerHTML =
    '<div class="text-center text-secondary py-2">Loading...</div>';
};

// Show Sppiner for Table
export const showTableLoader = (container) => {
  container.innerHTML =
    '<tr><td colspan="4" class="text-center text-secondary py-2">Loading...</td></tr>';
};

// Generate Chart
export const generateChart = (
  canvasElement,
  type,
  labels,
  chartData,
  colors,
  chartOptions,
) => {
  const existingChart = Chart.getChart(canvasElement);
  if (existingChart) existingChart.destroy();

  return new Chart(canvasElement, {
    type,
    data: {
      labels,
      datasets: [
        {
          label: 'Total Value ($)',
          data: chartData,
          backgroundColor: colors,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            usePointStyle: true,
            pointStyle: 'rect',
          },
        },
      },

      ...chartOptions,
    },
  });
};
