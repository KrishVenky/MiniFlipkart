import { ADD_TO_LIST, REMOVE_LIST, SET_FILTERS, SET_PRODUCTS, SET_LOADING } from "../action/List";

const initialState = {
  ListItems: [],
  filters: {
    category: "",
    minPrice: null,
    maxPrice: null,
    search: "",
    sortBy: "-createdAt",
  },
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  },
  loading: false,
  error: null,
};

const ListReducer = (state = initialState, action) => {
  switch (action.type) {
    case ADD_TO_LIST:
      return {
        ...state,
        ListItems: [...state.ListItems, action.payload],
      };

    case REMOVE_LIST:
      return {
        ...state,
        ListItems: state.ListItems.filter((item) => item.id !== action.payload),
      };

    case SET_FILTERS:
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
        pagination: {
          ...state.pagination,
          page: 1, // Reset to first page on filter change
        },
      };

    case SET_PRODUCTS:
      return {
        ...state,
        ListItems: action.payload.products || action.payload,
        pagination: action.payload.pagination || state.pagination,
        loading: false,
        error: null,
      };

    case SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    default:
      return state;
  }
};

export default ListReducer;

