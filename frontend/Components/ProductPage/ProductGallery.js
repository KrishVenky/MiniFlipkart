import { React, useState } from "react";
import "./ProductGallery.css";

/**
 * ProductGallery Component
 * Displays product images with thumbnail navigation
 */
function ProductGallery({ images = [], productTitle = "" }) {
  const [selectedImage, setSelectedImage] = useState(0);
  const displayImages = images.length > 0 ? images : ["/imgs/default.png"];

  return (
    <div className="product-gallery">
      <div className="gallery-main">
        <img
          src={displayImages[selectedImage]}
          alt={`${productTitle} - Image ${selectedImage + 1}`}
          className="main-image"
          loading="lazy"
        />
      </div>
      {displayImages.length > 1 && (
        <div className="gallery-thumbnails">
          {displayImages.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`${productTitle} thumbnail ${index + 1}`}
              className={`thumbnail ${selectedImage === index ? "active" : ""}`}
              onClick={() => setSelectedImage(index)}
              onKeyPress={(e) => {
                if (e.key === "Enter") setSelectedImage(index);
              }}
              tabIndex={0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ProductGallery;

