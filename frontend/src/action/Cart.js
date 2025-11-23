export const AddToCart = (data) => {
  return {
    type: "ADD_TO_CART",
    data,
  };
};

export const RemoveFromCart = (id) => {
  return {
    type: "REMOVE_FROM_CART",
    id,
  };
};

export const IncreaseQuantity = (id) => {
  return {
    type: "INCREASE_QUANTITY",
    id,
  };
};

export const DecreaseQuantity = (id) => {
  return {
    type: "DECREASE_QUANTITY",
    id,
  };
};
