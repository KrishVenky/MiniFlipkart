import { React } from "react";
import "./ProductReviews.css";

/**
 * ProductReviews Component
 * Displays product reviews and ratings
 */
function ProductReviews({ reviews = [], averageRating = 0 }) {
  return (
    <div className="product-reviews">
      <h3>Customer Reviews</h3>
      <div className="rating-summary">
        <span className="average-rating">{averageRating.toFixed(1)}</span>
        <div className="rating-stars">
          {[...Array(5)].map((_, i) => (
            <span key={i} className={i < Math.floor(averageRating) ? "star filled" : "star"}>
              ★
            </span>
          ))}
        </div>
        <span className="review-count">({reviews.length} reviews)</span>
      </div>
      <div className="reviews-list">
        {reviews.length > 0 ? (
          reviews.map((review, index) => (
            <div key={index} className="review-item">
              <div className="review-header">
                <span className="reviewer-name">{review.name || "Anonymous"}</span>
                <span className="review-date">{new Date(review.date).toLocaleDateString()}</span>
              </div>
              <div className="review-rating">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={i < review.rating ? "star filled" : "star"}>
                    ★
                  </span>
                ))}
              </div>
              <p className="review-text">{review.comment}</p>
            </div>
          ))
        ) : (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  );
}

export default ProductReviews;

