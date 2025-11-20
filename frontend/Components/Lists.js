import { React, useState, useEffect } from "react";
import { AddToList, RemoveList } from "../../action/List";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import Added from "../../imgs/red-heart.png";
import Add from "../../imgs/heart.png";
import Footer from "./Footer";
import rating from "../../imgs/rating.png";
import Navbar from "./Navbar";
import empty from "../../imgs/empty.png";
import { NavLink } from "react-router-dom";
import LowerNav from "./LowerNav";
import "./lists.css";
import { wishlistAPI } from "../../api/client";
import { getProductImage } from "../../utils/imageMap";

/**
 * Lists Component - Enhanced with responsive grid and skeleton loading
 * 
 * Improvements:
 * - Responsive grid layout
 * - Skeleton loading states
 * - Empty state handling
 * - Better error handling
 */
function Lists() {
  const [AddedIds, setAddedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const ListItems = useSelector((state) => state.ItemsAdded.ListItems);
  const dispatch = useDispatch();

  document.title = "Wishlist section";

  // Fetch wishlist from backend on mount
  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const wishlistData = await wishlistAPI.get();
        // Sync Redux with backend data if needed
        setError(null);
      } catch (error) {
        console.error("Error fetching wishlist:", error);
        setError("Failed to load wishlist. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchWishlist();
  }, []);

  useEffect(() => {
    // Update the added ids whenever the list items change
    const ids = ListItems.map((item) => item.id);
    setAddedIds(ids);
  }, [ListItems]);

  const isAdded = (itemId) => {
    // Check if the item id is in the added ids
    return AddedIds.includes(itemId);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  /**
   * Skeleton loader component for product cards
   */
  const SkeletonCard = () => (
    <div className="card skeleton-card" aria-hidden="true">
      <div className="card-img-data">
        <div className="skeleton-image" />
        <div className="skeleton-heart" />
        <div className="skeleton-button" />
      </div>
      <div className="card-data">
        <div className="skeleton-title" />
        <div className="skeleton-category" />
        <div className="skeleton-price" />
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ height: "100%" }} className="content">
          <div className="lists">
            <p className="wishlist-head">Wishlist</p>
            <div className="lists-items">
              {[...Array(8)].map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </div>
          </div>
          <div className="lowerNav">
            <LowerNav />
          </div>
          <Footer />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div style={{ height: "100%" }} className="content">
          <div className="lists">
            <p className="wishlist-head">Wishlist</p>
            <div className="error-state">
              <p className="error-message">{error}</p>
              <button onClick={() => window.location.reload()} className="retry-button">
                Retry
              </button>
            </div>
          </div>
          <div className="lowerNav">
            <LowerNav />
          </div>
          <Footer />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ height: "100%" }} className="content">
        <div className={ListItems ? `lists animate` : `lists`}>
          <p className="wishlist-head">Wishlist</p>
          <div
            style={
              ListItems.length === 0 ? { display: "flex" } : { display: "none" }
            }
            className="empty-list"
          >
            <img src={empty} className="empty-img" alt="Empty wishlist" />
            <div className="empty-text">
              <p className="empty-head">It"s empty here!</p>
              <p className="empty-desc">
                "Don"t let your wishlist collect dust. Add some items that bring
                joy to your life and watch as they become a reality with just a
                few clicks."
              </p>
              <Link to="/home">
                <button className="shopping">Go Shopping</button>
              </Link>
            </div>
          </div>
          <div className="lists-items responsive-grid">
            {ListItems &&
              ListItems.length > 0 &&
              ListItems.map((items) => {
                return (
                  <div className="card" key={items.id}>
                    <div className="card-img-data">
                      <img 
                        src={getProductImage(items.image)} 
                        className="card-img" 
                        alt={items.title}
                        loading="lazy"
                      />
                      <img
                        onClick={async () => {
                          if (!isAdded(items.id)) {
                            dispatch(AddToList(items));
                            try {
                              await wishlistAPI.add(items.id);
                            } catch (error) {
                              console.error("Error adding to wishlist:", error);
                            }
                          } else {
                            dispatch(RemoveList(items.id));
                            try {
                              await wishlistAPI.remove(items.id);
                            } catch (error) {
                              console.error("Error removing from wishlist:", error);
                            }
                          }
                        }}
                        src={isAdded(items.id) ? Added : Add}
                        className="add-list2"
                        alt={isAdded(items.id) ? "Remove from wishlist" : "Add to wishlist"}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.target.click();
                          }
                        }}
                      />
                      <NavLink to={`/product/${items.id}`} key={items.id}>
                        <button className="view">View product</button>
                      </NavLink>
                    </div>
                    <div className="card-data">
                      <p className="card-title">
                        {items.title.length >= 32
                          ? items.title.slice(0, 32) + ".."
                          : items.title}
                      </p>
                      <div className="category-rating">
                        <p className="card-category">{items.category}</p>
                        <div className="rating">
                          <img src={rating} className="rating-img" alt="Rating" />
                          <img src={rating} className="rating-img" alt="Rating" />
                          <img src={rating} className="rating-img" alt="Rating" />
                          <img src={rating} className="rating-img" alt="Rating" />
                          <img src={rating} className="rating-img" alt="Rating" />
                          <p className="rating-text">5</p>
                        </div>
                      </div>
                      <div className="card-price">
                        <p className="discount">${items.price}</p>
                        <p className="mrp">${Math.round(items.price * 1.66)}</p>
                        <p className="price-off">(60% OFF)</p>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        <div className="lowerNav">
          <LowerNav />
        </div>
        <Footer />
      </div>
    </>
  );
}

export default Lists;

