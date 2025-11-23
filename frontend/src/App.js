import "./App.css";
import { useState, useEffect } from "react";
import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import Home from "./Components/Home";
import Lists from "./Components/Lists";
import Signin from "./Components/Signin";
import Signup from "./Components/Signup";
import Load from "./imgs/spin.gif";
import { isAuthenticated, getAuthUser } from "./Firebase";
import { authAPI } from "./api/client";
import ProductPage from "./Components/ProductPage";
import CartSection from "./Components/CartSection";
import Payment from "./Components/Payment";
import Profile from "./Components/Profile";
import Orders from "./Components/Orders";
import Error from "./Components/Error";
// Import new components if they exist
import TrackingView from "./Components/TrackingView";
import CheckoutStepper from "./Components/CheckoutStepper";
import InventoryDashboard from "./Components/InventoryDashboard";
import SecurityDashboard from "./Components/SecurityDashboard";
import RecommendationWidget from "./Components/RecommendationWidget";
import NotificationPreferences from "./Components/NotificationPreferences";
import RecommendationOptOut from "./Components/RecommendationOptOut";

function App() {
  const [user, setUser] = useState(() => {
    return isAuthenticated() ? getAuthUser() : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated()) {
      const storedUser = getAuthUser();
      setUser(storedUser);

      authAPI.getMe()
        .then((response) => {
          setUser(response.data.data);
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          setUser(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <>
        <div className="loading">
          <img src={Load} className="loading-img" alt="Loading" />
        </div>
      </>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/home" /> : <Signin />} />
        <Route path="/signin" element={user ? <Navigate to="/home" /> : <Signin />} />
        <Route path="/signup" element={user ? <Navigate to="/home" /> : <Signup />} />
        <Route path="/home" element={user ? <Home /> : <Navigate to="/signin" />} />
        <Route path="/wishlists" element={user ? <Lists /> : <Navigate to="/signin" />} />
        <Route path="/lists" element={user ? <Lists /> : <Navigate to="/signin" />} />
        <Route path="/cart" element={user ? <CartSection /> : <Navigate to="/signin" />} />
        <Route path="/payment" element={user ? <Payment /> : <Navigate to="/signin" />} />
        <Route path="/checkout" element={user ? <CheckoutStepper /> : <Navigate to="/signin" />} />
        <Route path="/orders" element={user ? <Orders /> : <Navigate to="/signin" />} />
        <Route path="/account" element={user ? <Profile /> : <Navigate to="/signin" />} />
        <Route path="/product/:id" element={user ? <ProductPage /> : <Navigate to="/signin" />} />
        <Route path="/tracking/:orderId" element={user ? <TrackingView /> : <Navigate to="/signin" />} />
        <Route path="/inventory" element={user ? <InventoryDashboard /> : <Navigate to="/signin" />} />
        <Route path="/security" element={user ? <SecurityDashboard /> : <Navigate to="/signin" />} />
        <Route path="/recommendations" element={user ? <RecommendationWidget /> : <Navigate to="/signin" />} />
        <Route path="/notifications" element={user ? <NotificationPreferences /> : <Navigate to="/signin" />} />
        <Route path="/opt-out" element={user ? <RecommendationOptOut /> : <Navigate to="/signin" />} />
        <Route path="*" element={<Error />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
