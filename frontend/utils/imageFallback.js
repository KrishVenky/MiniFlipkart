/**
 * Image fallback utilities
 */

export const getImageWithFallback = (imageUrl, fallback = "/imgs/default.png") => {
  if (!imageUrl || imageUrl.trim() === "") {
    return fallback;
  }
  return imageUrl;
};

export const handleImageError = (event, fallback = "/imgs/default.png") => {
  if (event.target.src !== fallback) {
    event.target.src = fallback;
  }
};

export const getSpecValue = (specs, key, defaultValue = "N/A") => {
  if (!specs || typeof specs !== "object") {
    return defaultValue;
  }
  return specs[key] || defaultValue;
};

