/**
 * Maps product image names to actual image paths
 */
export const getProductImage = (imageName) => {
  if (!imageName) {
    return require("../imgs/default.png");
  }

  try {
    return require(`../imgs/${imageName}`);
  } catch (error) {
    return require("../imgs/default.png");
  }
};
