const API_BASE = (
  import.meta.env.VITE_API_URL || 'http://localhost:3000/api'
).replace(/\/$/, '');

export function getToken() {
  return localStorage.getItem('sr_token');
}

export async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  };
  if (token && options.auth !== false)
    headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
      body:
        options.body && typeof options.body !== 'string'
          ? JSON.stringify(options.body)
          : options.body,
    });
  } catch {
    throw new Error(
      `Cannot reach API. Check that your Express server is running and the port is correct.`,
    );
  }

  const raw = await response.text();
  let data = null;
  try {
    data = raw ? JSON.parse(raw) : null;
  } catch {
    data = raw;
  }

  if (!response.ok) {
    const message =
      data?.message ||
      data?.error ||
      (typeof data === 'string' ? data : '') ||
      `Request failed (${response.status})`;
    throw new Error(`${message}`);
  }
  return data;
}

export const api = {
  health: () =>
    fetch(API_BASE.replace(/\/api$/, '/')).then(async (r) => {
      const t = await r.text();
      if (!r.ok) throw new Error(`API health check failed`);
      return t;
    }),
  signup: (body) =>
    request('/auth/signup', { method: 'POST', body, auth: false }),
  login: (body) =>
    request('/auth/login', { method: 'POST', body, auth: false }),
  updatePassword: (body) => request('/auth/password', { method: 'PUT', body }),

  adminDashboard: () => request('/admin/dashboard'),
  getUsers: (params = {}) => request(`/admin/users${queryString(params)}`),
  getStoresAdmin: (params = {}) =>
    request(`/admin/stores${queryString(params)}`),
  getUserDetails: (id) => request(`/admin/users/${id}`),
  createUser: (body) => request('/admin/users', { method: 'POST', body }),
  createStore: (body) => request('/admin/stores', { method: 'POST', body }),

  getStores: (params = {}) => request(`/stores${queryString(params)}`),
  ownerDashboard: () => request('/stores/owner/dashboard'),
  submitRating: (body) => request('/ratings', { method: 'POST', body }),
};

function queryString(params) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '')
      q.set(key, value);
  });
  const s = q.toString();
  return s ? `?${s}` : '';
}

export function unwrapList(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];
  for (const key of ['data', 'users', 'stores', 'ratings', 'results', 'rows']) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  return [];
}
