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
