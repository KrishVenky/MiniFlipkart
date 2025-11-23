import rootReducer from "./reducer/reducer";
import { createStore } from "redux";

/**
 * Redux store configuration
 * The 2nd argument is for Redux Devtool Extension
 */
const store = createStore(
  rootReducer,
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);

export default store;
