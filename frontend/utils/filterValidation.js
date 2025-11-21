/**
 * Client-side filter validation
 */

export const validateFilterCombo = (filters) => {
  const errors = [];

  // Price range validation
  if (filters.minPrice && filters.maxPrice) {
    if (filters.minPrice > filters.maxPrice) {
      errors.push("Minimum price cannot be greater than maximum price");
    }
    if (filters.minPrice < 0 || filters.maxPrice < 0) {
      errors.push("Price values must be positive");
    }
  }

  // Search query validation
  if (filters.search && filters.search.length > 100) {
    errors.push("Search query is too long (max 100 characters)");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

