import { React, useState, useEffect } from "react";
import "./NotificationPreferences.css";

/**
 * NotificationPreferences Component
 * Allows users to configure notification channels
 */
function NotificationPreferences() {
  const [preferences, setPreferences] = useState({
    email: true,
    sms: false,
    push: true,
    trackingUpdates: true,
    orderUpdates: true,
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/profile/notifications", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setPreferences(data.data);
      }
    } catch (error) {
      console.error("Error fetching preferences:", error);
    }
  };

  const handleToggle = async (key) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(newPreferences);

    try {
      setSaving(true);
      const response = await fetch("/api/profile/notifications", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(newPreferences),
      });

      if (!response.ok) {
        throw new Error("Failed to save preferences");
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      // Revert on error
      setPreferences(preferences);
      alert("Failed to save preferences. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="notification-preferences">
      <h3>Notification Preferences</h3>
      <div className="preference-item">
        <label>
          <input
            type="checkbox"
            checked={preferences.email}
            onChange={() => handleToggle("email")}
            disabled={saving}
          />
          Email Notifications
        </label>
      </div>
      <div className="preference-item">
        <label>
          <input
            type="checkbox"
            checked={preferences.sms}
            onChange={() => handleToggle("sms")}
            disabled={saving}
          />
          SMS Notifications
        </label>
      </div>
      <div className="preference-item">
        <label>
          <input
            type="checkbox"
            checked={preferences.push}
            onChange={() => handleToggle("push")}
            disabled={saving}
          />
          Push Notifications
        </label>
      </div>
      <div className="preference-item">
        <label>
          <input
            type="checkbox"
            checked={preferences.trackingUpdates}
            onChange={() => handleToggle("trackingUpdates")}
            disabled={saving}
          />
          Shipment Tracking Updates
        </label>
      </div>
      <div className="preference-item">
        <label>
          <input
            type="checkbox"
            checked={preferences.orderUpdates}
            onChange={() => handleToggle("orderUpdates")}
            disabled={saving}
          />
          Order Status Updates
        </label>
      </div>
    </div>
  );
}

export default NotificationPreferences;

