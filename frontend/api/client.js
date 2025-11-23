import axios from "axios";

/**
 * API client configuration
 */
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Add auth token to requests
 */
client.interceptors.request.use(
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
 * Handle auth errors
 */
client.interceptors.response.use(
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
  /**
   * Register a new user
   */
  register: async (name, email, password) => {
    const response = await client.post("/auth/register", {
      name,
      email,
      password,
    });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data));
    }
    return response;
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    const response = await client.post("/auth/login", {
      email,
      password,
    });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data));
    }
    return response;
  },

  /**
   * Get current user
   */
  getCurrentUser: async () => {
    return await client.get("/auth/me");
  },
};

/**
 * Products API
 */
export const productsAPI = {
  /**
   * Get all products
   */
  getAll: async () => {
    return await client.get("/products");
  },

  /**
   * Get product by ID
   */
  getById: async (id) => {
    return await client.get(`/products/${id}`);
  },

  /**
   * Get recommendations
   */
  getRecommendations: async (limit = 6) => {
    return await client.get(`/products/recommendations/list?limit=${limit}`);
  },
};

/**
 * Orders API
 */
export const ordersAPI = {
  /**
   * Submit order
   */
  submit: async (orderData) => {
    return await client.post("/orders/submit", orderData);
  },

  /**
   * Get order status
   */
  getStatus: async (orderId) => {
    return await client.get(`/orders/${orderId}/status`);
  },

  /**
   * Get tracking information
   */
  getTracking: async (orderId) => {
    return await client.get(`/orders/${orderId}/tracking`);
  },
};

export default client;

