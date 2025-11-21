import { React, useState, useEffect } from "react";
import "./InventoryDashboard.css";

/**
 * InventoryDashboard Component
 * Admin-only inventory management view
 */
function InventoryDashboard() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ lowStock: false, outOfStock: false });

  useEffect(() => {
    fetchInventory();
    // Poll every 30 seconds for real-time updates
    const interval = setInterval(fetchInventory, 30000);
    return () => clearInterval(interval);
  }, [filters]);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/inventory", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await response.json();
      setInventory(data.data || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter((item) => {
    if (filters.lowStock && item.stock >= 10) return false;
    if (filters.outOfStock && item.stock > 0) return false;
    return true;
  });

  return (
    <div className="inventory-dashboard">
      <h2>Inventory Dashboard</h2>
      <div className="inventory-filters">
        <label>
          <input
            type="checkbox"
            checked={filters.lowStock}
            onChange={(e) => setFilters({ ...filters, lowStock: e.target.checked })}
          />
          Low Stock (< 10)
        </label>
        <label>
          <input
            type="checkbox"
            checked={filters.outOfStock}
            onChange={(e) => setFilters({ ...filters, outOfStock: e.target.checked })}
          />
          Out of Stock
        </label>
      </div>
      <div className="inventory-table">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Stock</th>
              <th>Reserved</th>
              <th>Available</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map((item) => (
              <tr key={item.id} className={item.stock === 0 ? "out-of-stock" : item.stock < 10 ? "low-stock" : ""}>
                <td>{item.name}</td>
                <td>{item.stock}</td>
                <td>{item.reservedCount || 0}</td>
                <td>{item.stock - (item.reservedCount || 0)}</td>
                <td>
                  {item.stock === 0 ? "Out of Stock" : item.stock < 10 ? "Low Stock" : "In Stock"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default InventoryDashboard;

