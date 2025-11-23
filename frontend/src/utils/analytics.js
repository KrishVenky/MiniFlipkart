/**
 * Analytics utilities for recommendation tracking
 */
export const trackRecommendationView = (position, productIds) => {
  if (window.gtag) {
    window.gtag("event", "recommendation_view", {
      position,
      product_count: productIds.length,
    });
  }
};

export const trackRecommendationClick = (position, productId) => {
  if (window.gtag) {
    window.gtag("event", "recommendation_click", {
      position,
      product_id: productId,
    });
  }
};

export const trackOptOut = (optedOut) => {
  if (window.gtag) {
    window.gtag("event", "recommendation_opt_out", {
      opted_out: optedOut,
    });
  }
};

