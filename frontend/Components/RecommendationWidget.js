import { React, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./RecommendationWidget.css";

/**
 * RecommendationWidget Component
 * Displays personalized product recommendations
 */
function RecommendationWidget({ userId, position = "home", limit = 6 }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [optedOut, setOptedOut] = useState(false);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        // Check if user opted out
        const userPrefs = localStorage.getItem("recommendationOptOut");
        if (userPrefs === "true") {
          setOptedOut(true);
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/products/recommendations?userId=${userId}&limit=${limit}`);
        if (!response.ok) throw new Error("Failed to fetch recommendations");
        
        const data = await response.json();
        setRecommendations(data.data || []);
        setError(null);
      } catch (err) {
        console.error("Recommendation error:", err);
        setError("Recommendations unavailable");
        // Fail gracefully - show popular items instead
        setRecommendations([]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchRecommendations();
    }
  }, [userId, limit]);

  if (optedOut) {
    return null; // Don't show widget if user opted out
  }

  if (loading) {
    return (
      <div className="recommendation-widget">
        <h3>Recommended for You</h3>
        <div className="recommendations-loading">Loading recommendations...</div>
      </div>
    );
  }

  if (error || recommendations.length === 0) {
    return null; // Fail gracefully
  }

  return (
    <div className="recommendation-widget">
      <h3>Recommended for You</h3>
      <div className="recommendations-grid">
        {recommendations.map((product) => (
          <Link key={product.id} to={`/product/${product.id}`} className="recommendation-card">
            <img src={product.image} alt={product.title} />
            <p className="recommendation-title">{product.title}</p>
            <p className="recommendation-price">${product.price}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default RecommendationWidget;

