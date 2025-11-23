import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

/**
 * Create axios instance with base configuration
 */
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Add token to requests
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Handle response errors
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/signin";
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication API
 */
export const authAPI = {
  register: (name, email, password) =>
    api.post("/auth/register", { name, email, password }),

  login: (email, password) =>
    api.post("/auth/login", { email, password }),

  getMe: () =>
    api.get("/auth/me"),

  updatePassword: (currentPassword, newPassword) =>
    api.put("/auth/updatepassword", { currentPassword, newPassword }),
};

/**
 * Products API
 */
export const productsAPI = {
  getAll: (params) =>
    api.get("/products", { params }),

  getById: (id) =>
    api.get(`/products/${id}`),

  getRecommendations: (limit = 6) =>
    api.get(`/products/recommendations/list?limit=${limit}`),
};

/**
 * Orders API - Updated to match current backend
 */
export const ordersAPI = {
  submit: (orderData) =>
    api.post("/orders/submit", orderData),

  getStatus: (orderId) =>
    api.get(`/orders/${orderId}/status`),

  getTracking: (orderId) =>
    api.get(`/orders/${orderId}/tracking`),

  getAll: (params) =>
    api.get("/orders", { params }).catch(() => ({ data: { data: [] } })),

  getById: (id) =>
    api.get(`/orders/${id}`).catch(() => ({ data: { data: null } })),
};

/**
 * Wishlist API - Stub for future implementation
 */
export const wishlistAPI = {
  get: () =>
    api.get("/wishlist").catch(() => ({ data: { data: [] } })),

  add: (productId) =>
    api.post("/wishlist/add", { productId }).catch(() => ({ data: {} })),

  remove: (itemId) =>
    api.delete(`/wishlist/remove/${itemId}`).catch(() => ({ data: {} })),
};

/**
 * Cart API - Stub for future implementation
 */
export const cartAPI = {
  get: () =>
    api.get("/cart").catch(() => ({ data: { data: [] } })),

  add: (productId, quantity = 1) =>
    api.post("/cart/add", { productId, quantity }).catch(() => ({ data: {} })),

  update: (itemId, quantity) =>
    api.put(`/cart/update/${itemId}`, { quantity }).catch(() => ({ data: {} })),

  remove: (itemId) =>
    api.delete(`/cart/remove/${itemId}`).catch(() => ({ data: {} })),

  clear: () =>
    api.delete("/cart/clear").catch(() => ({ data: {} })),
};

/**
 * Payment API - Updated to match current backend
 * Uses orders/submit endpoint
 */
export const paymentAPI = {
  confirmOrder: (orderData) =>
    api.post("/orders/submit", orderData),
  
  calculateTotal: () =>
    api.post("/payment/calculate-total").catch(() => ({ data: { total: 0 } })),
};

/**
 * Profile API - Stub for future implementation
 */
export const profileAPI = {
  get: () =>
    api.get("/profile").catch(() => ({ data: { data: {} } })),

  update: (data) =>
    api.put("/profile", data).catch(() => ({ data: {} })),
};

export default api;
