import { React, useState, useEffect } from "react";
import "./SecurityDashboard.css";

/**
 * SecurityDashboard Component
 * Admin dashboard for compliance and security monitoring
 */
function SecurityDashboard() {
  const [metrics, setMetrics] = useState({
    recentAlerts: [],
    complianceScore: 0,
    auditLogs: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // Refresh every 5 minutes
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/security/dashboard", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setMetrics(data.data);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading security dashboard...</div>;
  }

  return (
    <div className="security-dashboard">
      <h2>Security & Compliance Dashboard</h2>

      <div className="compliance-summary">
        <h3>Compliance Score</h3>
        <div className="score-circle">
          <span className="score-value">{metrics.complianceScore}%</span>
        </div>
      </div>

      <div className="recent-alerts">
        <h3>Recent Security Alerts</h3>
        <ul>
          {metrics.recentAlerts.map((alert, index) => (
            <li key={index} className={`alert ${alert.severity}`}>
              <span className="alert-time">{new Date(alert.timestamp).toLocaleString()}</span>
              <span className="alert-message">{alert.message}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="audit-log-summary">
        <h3>Recent Audit Events</h3>
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Action</th>
              <th>User</th>
              <th>Resource</th>
            </tr>
          </thead>
          <tbody>
            {metrics.auditLogs.map((log, index) => (
              <tr key={index}>
                <td>{new Date(log.timestamp).toLocaleString()}</td>
                <td>{log.action}</td>
                <td>{log.userId}</td>
                <td>{log.resource}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SecurityDashboard;

