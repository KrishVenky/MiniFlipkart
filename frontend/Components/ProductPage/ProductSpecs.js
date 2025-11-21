import { React } from "react";
import "./ProductSpecs.css";

/**
 * ProductSpecs Component
 * Displays product specifications in a table format
 */
function ProductSpecs({ specs = {} }) {
  if (!specs || Object.keys(specs).length === 0) {
    return (
      <div className="product-specs">
        <h3>Specifications</h3>
        <p className="no-specs">No specifications available</p>
      </div>
    );
  }

  return (
    <div className="product-specs">
      <h3>Specifications</h3>
      <table className="specs-table">
        <tbody>
          {Object.entries(specs).map(([key, value]) => (
            <tr key={key}>
              <td className="spec-key">{key}</td>
              <td className="spec-value">{value || "N/A"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ProductSpecs;

