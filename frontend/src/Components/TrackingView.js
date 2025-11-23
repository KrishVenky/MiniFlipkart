import { React, useState, useEffect } from "react";
import "./TrackingView.css";

/**
 * TrackingView Component
 * Displays shipment tracking with map/timeline
 */
function TrackingView({ orderId }) {
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeline, setTimeline] = useState([]);

  useEffect(() => {
    fetchTracking();
    // Poll every 30 seconds for updates
    const interval = setInterval(fetchTracking, 30000);
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchTracking = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/tracking`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setTracking(data.data);
      setTimeline(data.data.timeline || []);
    } catch (error) {
      console.error("Error fetching tracking:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="tracking-loading">Loading tracking information...</div>;
  }

  if (!tracking) {
    return <div className="tracking-error">Tracking information not available</div>;
  }

  return (
    <div className="tracking-view">
      <h3>Shipment Tracking</h3>
      <div className="tracking-header">
        <div className="tracking-number">
          <strong>Tracking Number:</strong> {tracking.trackingNumber}
        </div>
        <div className="tracking-status">
          <span className={`status-badge ${tracking.status}`}>
            {tracking.status.replace("_", " ").toUpperCase()}
          </span>
        </div>
      </div>

      <div className="tracking-timeline">
        <h4>Tracking Timeline</h4>
        {timeline.map((event, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-dot" />
            <div className="timeline-content">
              <div className="timeline-location">{event.location}</div>
              <div className="timeline-time">{new Date(event.timestamp).toLocaleString()}</div>
              <div className="timeline-description">{event.description}</div>
            </div>
          </div>
        ))}
      </div>

      {tracking.currentLocation && (
        <div className="tracking-map">
          <h4>Current Location</h4>
          <p>{tracking.currentLocation}</p>
          {/* Map integration would go here */}
        </div>
      )}
    </div>
  );
}

export default TrackingView;

