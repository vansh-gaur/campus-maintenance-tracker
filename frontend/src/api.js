export function getToken() {
  return localStorage.getItem("token");
}

export function setSession(user, token) {
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("token", token);
}

export function clearSession() {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

export const api = {
  login: (body) => request("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),
  register: (body) => request("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),
  stats: () => request("/api/stats"),
  complaints: (query = "") => request(`/api/complaints${query}`),
  complaint: (id) => request(`/api/complaints/${id}`),
  createComplaint: (body) => request("/api/complaints", { method: "POST", body: JSON.stringify(body) }),
  updateStatus: (id, status) =>
    request(`/api/complaints/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  addComment: (id, message) =>
    request(`/api/complaints/${id}/comments`, { method: "POST", body: JSON.stringify({ message }) }),
};
