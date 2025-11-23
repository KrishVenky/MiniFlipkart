import { React, useEffect, useState } from "react";
import "../deals.css";
import Add from "./Img/heart.png";
import Added from "./Img/red-heart.png";
import rating from "./Img/rating.png";
import { AddToList, RemoveList } from "../../action/List";
import { useSelector, useDispatch } from "react-redux";
import { NavLink } from "react-router-dom";
import Footer from "../Footer";
import Spinner from "../Spinner";
import LowerNav from "../LowerNav";
import { productsAPI } from "../../api/client";
import { getProductImage } from "../../utils/imageMap";

function Jewelery() {
  const [AllProducts, setAllProducts] = useState([]);
  const [AddedIds, setAddedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  const ListItems = useSelector((state) => state.ItemsAdded.ListItems);
  const dispatch = useDispatch();

  useEffect(() => {
    const GetProducts = async () => {
      try {
        const response = await productsAPI.getByCategory("jewelery");
        const products = response.data.data;
        
        const formattedProducts = products.map((item) => ({
          id: item._id,
          title: item.title,
          description: item.description,
          price: item.price,
          category: item.category,
          image: item.image,
          rating: item.rating,
          reviewNumber: item.rating?.count || Math.floor(Math.random() * (150 - 50 + 1)) + 50,
        }));
        
        setAllProducts(formattedProducts);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching jewelery:", error);
        setLoading(false);
      }
    };

    GetProducts();
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

  return (
    <div className="Deals">
      <p className="deals-head">Jewelery</p>
      {loading && <Spinner />}
      <div className="deal-items">
        {AllProducts &&
          AllProducts.map((items) => {
            return (
              <div className="card" key={items.id}>
                <div className="card-img-data">
                  <img src={getProductImage(items.image)} className="card-img" alt={items.title} />
                  <img
                    onClick={() => {
                      if (!isAdded(items.id)) {
                        dispatch(AddToList(items));
                      } else {
                        dispatch(RemoveList(items.id));
                      }
                    }}
                    src={isAdded(items.id) ? Added : Add}
                    className="add-list"
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
                      <img src={rating} className="rating-img" />
                      <img src={rating} className="rating-img" />
                      <img src={rating} className="rating-img" />
                      <img src={rating} className="rating-img" />
                      <img src={rating} className="rating-img" />
                      <p className="rating-text">
                        {"5 " + "(" + items.reviewNumber + " reviews)"}
                      </p>
                    </div>
                  </div>
                  <div className="card-price">
                    <p className="discount">${items.price}</p>
                    <p className="mrp">${Math.round(items.price * 1.66)}</p>
                  </div>
                </div>
              </div>
            );
          })}
      </div>
      <div className="lowerNav">
        <LowerNav />
      </div>
      <Footer />
    </div>
  );
}

export default Jewelery;
