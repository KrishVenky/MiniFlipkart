export const AddToList = (data) => {
  return {
    type: "ADD",
    data,
  };
};

export const RemoveList = (id) => {
  return {
    type: "REMOVE",
    id,
  };
};
