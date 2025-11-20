import { React, useState } from "react";
import "./signin.css";
import Logo from "../../imgs/shopngo_master.png";
import BG1 from "../../imgs/login-BG.png";
import BG2 from "../../imgs/login-BG2.png";
import google from "../../imgs/google.png";
import { Link, useNavigate } from "react-router-dom";
import { authAPI } from "../../api/client";
import { setAuthUser } from "../../Firebase";
import swal from "sweetalert";

/**
 * Signin Component - Enhanced with accessibility features
 * 
 * Accessibility improvements:
 * - ARIA labels for screen readers
 * - Keyboard navigation support
 * - Focus management
 * - Error announcements
 */
function Signin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [PasswordError, setPasswordError] = useState("");
  const [bgLoaded, setBgLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  document.title = "ShopNGo - Sign In";

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    // Clear error when user starts typing
    if (emailError) setEmailError("");
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    // Clear error when user starts typing
    if (PasswordError) setPasswordError("");
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

  /**
   * Handle Enter key press on form inputs
   */
  const handleKeyPress = (event) => {
    if (event.key === "Enter" && !loading) {
      LogInUser();
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
      const { token, user } = response.data;
      
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
      <div className="signin-page" role="main">
        <div className="login-navbar" role="banner">
          <div className="main-logo">
            <img src={Logo} className="shopngo-logo" alt="ShopNGo" />
          </div>
          <div className="signup">
            <Link to="/signup" aria-label="Navigate to sign up page">
              <button className="signup-btn" aria-label="Sign up">Sign up</button>
            </Link>
          </div>
        </div>
        <div className="background" aria-hidden="true">
          <img src={BG1} className="BG1" onLoad={handleBgLoad} alt="" />
          <img src={BG2} className="BG2" onLoad={handleBgLoad} alt="" />
        </div>
        {bgLoaded && (
          <div className="main-form">
            <div className="login-form">
              <div className="some-text">
                <h1 className="user">User Login</h1>
                <p className="user-desc">
                  Hey, Enter your details to get sign in to your account
                </p>
              </div>
              <form 
                className="user-details" 
                onSubmit={(e) => { e.preventDefault(); LogInUser(); }}
                aria-label="Login form"
              >
                <label htmlFor="email-input" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-input"
                  type="email"
                  placeholder="Enter Email"
                  className="email"
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleEmailBlur}
                  onKeyPress={handleKeyPress}
                  aria-label="Email address"
                  aria-required="true"
                  aria-invalid={!!emailError}
                  aria-describedby={emailError ? "email-error" : undefined}
                  required
                  autoComplete="email"
                />
                {emailError && (
                  <div 
                    id="email-error" 
                    className="error-message" 
                    role="alert"
                    aria-live="polite"
                  >
                    {emailError}
                  </div>
                )}
                <label htmlFor="password-input" className="sr-only">
                  Password
                </label>
                <input
                  id="password-input"
                  type="password"
                  placeholder="Passcode"
                  className="password"
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handlePasswordBlur}
                  onKeyPress={handleKeyPress}
                  aria-label="Password"
                  aria-required="true"
                  aria-invalid={!!PasswordError}
                  aria-describedby={PasswordError ? "password-error" : undefined}
                  required
                  autoComplete="current-password"
                />
                {PasswordError && (
                  <div 
                    id="password-error" 
                    className="error-message" 
                    role="alert"
                    aria-live="polite"
                  >
                    {PasswordError}
                  </div>
                )}
                <button 
                  type="submit"
                  onClick={LogInUser} 
                  className="signin-btn" 
                  disabled={loading}
                  aria-label={loading ? "Signing in, please wait" : "Sign in"}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </button>
                <div className="extra-buttons">
                  <p className="or" aria-label="Or">&#x2015; Or &#x2015;</p>
                  <button 
                    type="button"
                    onClick={GoogleAuth} 
                    className="google"
                    aria-label="Sign in with Google"
                  >
                    <p>Sign in with</p>
                    <img src={google} className="google-img" alt="Google" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default Signin;

