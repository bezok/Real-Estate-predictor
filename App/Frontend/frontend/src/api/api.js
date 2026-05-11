// Simple fetch wrapper for API calls
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

// helper to read cookie (for CSRF token)
function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Make GET that includes credentials so cookie is sent/received
export async function get(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, { method: 'GET', credentials: 'include', ...opts });
  if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
  return res.json();
}

// POST includes CSRF header and credentials by default
export async function post(path, body, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  const csrfToken = getCookie('csrftoken');
  if (csrfToken) headers['X-CSRFToken'] = csrfToken;

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: JSON.stringify(body),
    ...opts,
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

// POST multipart/form-data (for file uploads). Pass a FormData object as body.
export async function postForm(path, formData, opts = {}) {
  const headers = {};
  const csrfToken = getCookie('csrftoken');
  if (csrfToken) headers['X-CSRFToken'] = csrfToken;

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: formData,
    ...opts,
  });
  if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
  return res.json();
}

export async function fetchCsrf() {
  // Call the backend CSRF endpoint to set csrftoken cookie
  await fetch(`${API_BASE}/api/csrf/`, { method: 'GET', credentials: 'include' });
}

export default { get, post, postForm, fetchCsrf };
