/**
 * Auth utility functions for MongoDB backend
 * This file replaces Firebase authentication
 */

/**
 * Store user data in localStorage
 */
export const setAuthUser = (token, user) => {
  if (token) {
    localStorage.setItem("token", token);
  }
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  }
};

/**
 * Get current user from localStorage
 */
export const getAuthUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Get auth token
 */
export const getAuthToken = () => {
  return localStorage.getItem("token");
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

/**
 * Logout user
 */
export const logoutUser = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};

/**
 * No Firebase app needed anymore
 */
export const app = null;
