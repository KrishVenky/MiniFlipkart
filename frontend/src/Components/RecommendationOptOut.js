import { React, useState } from "react";
import "./RecommendationOptOut.css";

/**
 * RecommendationOptOut Component
 * Allows users to disable personalization
 */
function RecommendationOptOut({ userId, onOptOutChange }) {
  const [optedOut, setOptedOut] = useState(
    localStorage.getItem("recommendationOptOut") === "true"
  );
  const [saving, setSaving] = useState(false);

  const handleToggle = async (e) => {
    const newValue = e.target.checked;
    setSaving(true);

    try {
      // Update user preference
      await fetch(`/api/profile/recommendations`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ recommendationOptOut: newValue }),
      });

      localStorage.setItem("recommendationOptOut", newValue.toString());
      setOptedOut(newValue);
      if (onOptOutChange) onOptOutChange(newValue);
    } catch (error) {
      console.error("Error updating preference:", error);
      alert("Failed to update preference. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="recommendation-opt-out">
      <label>
        <input
          type="checkbox"
          checked={optedOut}
          onChange={handleToggle}
          disabled={saving}
        />
        <span>Disable personalized recommendations</span>
      </label>
      {optedOut && (
        <p className="opt-out-message">
          You will see popular items instead of personalized recommendations.
        </p>
      )}
    </div>
  );
}

export default RecommendationOptOut;

