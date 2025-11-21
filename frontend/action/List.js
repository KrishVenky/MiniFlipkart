// ... existing imports ...

export const SET_FILTERS = "SET_FILTERS";
export const SET_PRODUCTS = "SET_PRODUCTS";
export const SET_LOADING = "SET_LOADING";

export const setFilters = (filters) => ({
  type: SET_FILTERS,
  payload: filters,
});

export const setProducts = (products, pagination) => ({
  type: SET_PRODUCTS,
  payload: {
    products,
    pagination,
  },
});

export const setLoading = (loading) => ({
  type: SET_LOADING,
  payload: loading,
});

// ... existing actions ...

