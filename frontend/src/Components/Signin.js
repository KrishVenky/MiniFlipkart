import { React, useState } from "react";
import "./signin.css";
import Logo from "../imgs/shopngo_master.png";
import BG1 from "../imgs/login-BG.png";
import BG2 from "../imgs/login-BG2.png";
import google from "../imgs/google.png";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../api/client";
import { setAuthUser } from "../Firebase";
import swal from "sweetalert";

function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [PasswordError, setPasswordError] = useState("");
  const [bgLoaded, setBgLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  document.title = "ShopNGo - Sign In"

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleEmailBlur = (event) => {
    if (
      event.target.value === "" ||
      !event.target.value.includes("@") ||
      !event.target.value.includes(".com")
    ) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  };

  const handlePasswordBlur = (event) => {
    if (event.target.value === "") {
      setPasswordError("Please enter your password.");
    } else if (event.target.value.length < 4) {
      setPasswordError("Password is too small.");
    } else {
      setPasswordError("");
    }
  };

  const LogInUser = async () => {
    if (emailError || PasswordError || !email || !password) {
      swal({
        title: "Error!",
        text: "Please fill in all fields correctly.",
        icon: "error",
        buttons: "Ok",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.login(email, password);
      const token = response.data.token;
      const user = response.data.data || response.data.user;
      
      // Store token and user data
      setAuthUser(token, user);
      
      swal({
        title: "Success!",
        text: "Logged in successfully!",
        icon: "success",
        buttons: "Ok",
      }).then(() => {
        // Reload the entire page to refresh App state
        window.location.replace("/home");
      });
    } catch (error) {
      swal({
        title: "Error!",
        text: error.response?.data?.error || "Login failed. Please check your credentials.",
        icon: "error",
        buttons: "Ok",
      });
      setLoading(false);
    }
  };

  const GoogleAuth = async () => {
    swal({
      title: "Info",
      text: "Google Sign-In is not available in this version. Please use email/password login.",
      icon: "info",
      buttons: "Ok",
    });
  };

  const handleBgLoad = () => {
    setBgLoaded(true);
  };

  return (
    <>
      <div className="signin-page">
        <div className="login-navbar">
          <div className="main-logo">
            <img src={Logo} className="shopngo-logo" alt="ShopNGo" />
          </div>
          <div className="signup">
            <Link to="/signup">
              <button className="signup-btn">Sign up</button>
            </Link>
          </div>
        </div>
        <div className="background">
          <img src={BG1} className="BG1" onLoad={handleBgLoad} alt="Background 1" />
          <img src={BG2} className="BG2" onLoad={handleBgLoad} alt="Background 2" />
        </div>
        {bgLoaded && (
          <div className="main-form">
            <div className="login-form">
              <div className="some-text">
                <p className="user">User Login</p>
                <p className="user-desc">
                  Hey, Enter your details to get sign in to your account
                </p>
              </div>
              <div className="user-details">
                <input
                  type="email"
                  placeholder="Enter Email"
                  className="email"
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  required
                />
                {emailError && (
                  <div className="error-message">{emailError}</div>
                )}
                <input
                  type="password"
                  placeholder="Passcode"
                  className="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  required
                />
                {PasswordError && (
                  <div className="error-message">{PasswordError}</div>
                )}
                <button onClick={LogInUser} className="signin-btn" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </button>
                <div className="extra-buttons">
                  <p className="or">&#x2015; Or &#x2015;</p>
                  <button onClick={GoogleAuth} className="google">
                    <p>Sign in with</p>
                    <img src={google} className="google-img" alt="Google" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Signin;
