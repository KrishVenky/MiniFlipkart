/**
 * Analytics utilities for recommendation tracking
 */

export const trackRecommendationView = (position, productIds) => {
  // Track recommendation widget view
  if (window.gtag) {
    window.gtag("event", "recommendation_view", {
      position,
      product_count: productIds.length,
    });
  }
};

export const trackRecommendationClick = (position, productId) => {
  // Track recommendation click
  if (window.gtag) {
    window.gtag("event", "recommendation_click", {
      position,
      product_id: productId,
    });
  }
};

export const trackOptOut = (optedOut) => {
  // Track opt-out preference change
  if (window.gtag) {
    window.gtag("event", "recommendation_opt_out", {
      opted_out: optedOut,
    });
  }
};

