// Elements
const notification = document.createElement('p');
notification.className = 'notification notification-hidden';
document.body.appendChild(notification);

// State
let notificationTimer;

// Show Notification
const showNotification = (status, message) => {
  clearTimeout(notificationTimer);
  notification.classList.remove('error', 'success', 'notification-hidden');

  let markup = '';
  switch (status) {
    case 'error':
      markup = `<span class="close-notification">X</span>${message}`;
      notification.classList.add('error');
      break;

    case 'warning':
      markup = `<span>⚠️</span>${message}`;
      notification.classList.add('warning');
      break;

    case 'success':
      markup = `<span>✅</span>${message}`;
      notification.classList.add('success');
      break;
  }

  notification.innerHTML = markup;

  startTimeout();
};

// Close Notification
const closeNotification = () => {
  notification.classList.add('notification-hidden');
  clearTimeout(notificationTimer);
};

// Start Timer (3000 Second)
const startTimeout = () => {
  clearTimeout(notificationTimer);
  notificationTimer = setTimeout(closeNotification, 3000);
};

// Event Listener
notification.addEventListener('mouseover', (e) => {
  clearTimeout(notificationTimer);
});
//
notification.addEventListener('mouseleave', startTimeout);
//
notification.addEventListener('click', (e) => {
  if (e.target.classList.contains('close-notification')) closeNotification();
});

//
export default showNotification;
