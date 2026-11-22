export const roleLabel = (role = '') =>
  ({
    ADMIN: 'Administrator',
    USER: 'Normal user',
    OWNER: 'Store owner',
  })[String(role).toUpperCase()] || role;

export const getRole = (user) =>
  String(user?.role || user?.user?.role || '').toUpperCase();

export function getUserFromResponse(data) {
  return data?.user || data?.data?.user || data?.data || data;
}

export function getTokenFromResponse(data) {
  return (
    data?.token || data?.accessToken || data?.access_token || data?.data?.token
  );
}

export function getErrorMessage(error) {
  return error?.message || 'Something went wrong. Please try again.';
}

export function validateName(name) {
  return name.trim().length >= 20 && name.trim().length <= 60
    ? ''
    : 'Name must be between 20 and 60 characters.';
}
export function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? ''
    : 'Enter a valid email address.';
}
export function validatePassword(password) {
  return password.length >= 8 &&
    password.length <= 16 &&
    /[A-Z]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
    ? ''
    : 'Use 8–16 characters with at least one uppercase letter and one special character.';
}
export function validateAddress(address) {
  return address.length <= 400
    ? ''
    : 'Address must be 400 characters or fewer.';
}
export function formatRating(value) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n.toFixed(1) : '—';
}
