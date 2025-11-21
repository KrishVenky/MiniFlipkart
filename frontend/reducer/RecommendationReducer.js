const initialState = {
  slots: {
    home: [],
    catalog: [],
    pdp: [],
  },
  loading: {
    home: false,
    catalog: false,
    pdp: false,
  },
  errors: {},
};

const RecommendationReducer = (state = initialState, action) => {
  switch (action.type) {
    case "FETCH_RECOMMENDATIONS_START":
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.position]: true,
        },
      };

    case "FETCH_RECOMMENDATIONS_SUCCESS":
      return {
        ...state,
        slots: {
          ...state.slots,
          [action.payload.position]: action.payload.recommendations,
        },
        loading: {
          ...state.loading,
          [action.payload.position]: false,
        },
        errors: {
          ...state.errors,
          [action.payload.position]: null,
        },
      };

    case "FETCH_RECOMMENDATIONS_ERROR":
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.position]: false,
        },
        errors: {
          ...state.errors,
          [action.payload.position]: action.payload.error,
        },
      };

    default:
      return state;
  }
};

export default RecommendationReducer;

