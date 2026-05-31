const PRODUCTION_API = "https://loomieloops-api-production.up.railway.app/api";
const LOCAL_API = "http://localhost:3001/api";

function normalizeApiBaseUrl(raw: string): string {
  let url = raw.trim();
  if (!url) return url;
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  url = url.replace(/\/+$/, "");
  if (!url.endsWith("/api")) url = `${url}/api`;
  return url;
}

/** Resolved at build time for prod; VITE_API_URL overrides both (normalized). */
export const API_BASE_URL = normalizeApiBaseUrl(
  import.meta.env.VITE_API_URL || (import.meta.env.PROD ? PRODUCTION_API : LOCAL_API),
);

export const api = {
  auth: {
    login: `${API_BASE_URL}/auth/login`,
  },
  admin: {
    stats: `${API_BASE_URL}/admin/stats`,
    products: `${API_BASE_URL}/admin/products`,
    product: (id: string) => `${API_BASE_URL}/admin/products/${id}`,
    uploadImage: `${API_BASE_URL}/admin/products/upload-image`,
    orders: `${API_BASE_URL}/admin/orders`,
    order: (id: string) => `${API_BASE_URL}/admin/orders/${id}`,
    orderTracking: (orderId: string) => `${API_BASE_URL}/admin/orders/${orderId}/tracking`,
    users: `${API_BASE_URL}/admin/users`,
    announcements: `${API_BASE_URL}/admin/announcements`,
    announcement: (id: string) => `${API_BASE_URL}/admin/announcements/${id}`,
    settings: `${API_BASE_URL}/admin/settings`,
  },
};

export async function adminFetch(url: string, token: string, options: RequestInit = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }
  return data;
}

export default api;
