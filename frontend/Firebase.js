/**
 * Firebase configuration stub
 * Replace with actual Firebase config if needed
 */

/**
 * Set authenticated user in Firebase (or localStorage)
 */
export const setAuthUser = (user) => {
  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
  } else {
    localStorage.removeItem("user");
  }
};

/**
 * Get authenticated user
 */
export const getAuthUser = () => {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
};

/**
 * Clear authenticated user
 */
export const clearAuthUser = () => {
  localStorage.removeItem("user");
  localStorage.removeItem("token");
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

