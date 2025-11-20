/**
 * Server-side filter validation and anomaly detection
 */

const logAnomaly = (req, filters) => {
  // Log suspicious filter combinations
  const anomalies = [];

  if (filters.minPrice && filters.maxPrice && filters.minPrice > filters.maxPrice) {
    anomalies.push("Invalid price range");
  }

  if (filters.search && filters.search.length > 100) {
    anomalies.push("Oversized search query");
  }

  if (anomalies.length > 0) {
    console.warn("Filter anomaly detected:", {
      ip: req.ip,
      filters,
      anomalies,
      timestamp: new Date(),
    });
  }

  return anomalies;
};

module.exports = { logAnomaly };

