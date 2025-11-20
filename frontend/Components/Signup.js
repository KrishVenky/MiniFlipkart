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
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/**
 * Signup Component - Enhanced with accessibility features
 * 
 * Accessibility improvements:
 * - ARIA labels for screen readers
 * - Keyboard navigation support
 * - Focus management
 * - Error announcements
 */
function Signup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [bgLoaded, setBgLoaded] = useState(false);
  const [PasswordError, setPasswordError] = useState("");
  const [NameError, setNameError] = useState("");
  const [loading, setLoading] = useState(false);

  document.title = "ShopNGo - Sign Up";

  const notify1 = () =>
    toast.error("Please fill-up all the credentials properly!", {
      position: "top-center",
      autoClose: 1200,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "colored",
    });

  const navigate = useNavigate();
  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    if (emailError) setEmailError("");
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
    if (NameError) setNameError("");
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
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

  const handleNameBlur = (event) => {
    if (event.target.value === "") {
      setNameError("Please enter your name.");
    } else {
      setNameError("");
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
      CreateUser();
    }
  };

  const CreateUser = async () => {
    if (emailError || PasswordError || NameError || !email || !password || !name) {
      notify1();
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register(name, email, password);
      const { token, user } = response.data;
      
      // Store token and user data
      setAuthUser(token, user);
      
      swal({
        title: "Success!",
        text: "Account created successfully!",
        icon: "success",
        buttons: "Ok",
      }).then(() => {
        // Reload the entire page to refresh App state
        window.location.replace("/home");
      });
    } catch (error) {
      swal({
        title: "Error!",
        text: error.response?.data?.error || "Registration failed. Please try again.",
        icon: "error",
        buttons: "Ok",
      });
      setLoading(false);
    }
  };

  const GoogleAuth = async () => {
    swal({
      title: "Info",
      text: "Google Sign-In is not available in this version. Please use email/password registration.",
      icon: "info",
      buttons: "Ok",
    });
  };

  const handleBgLoad = () => {
    setBgLoaded(true);
  };

  return (
    <>
      <ToastContainer />
      <div className="signin-page" role="main">
        <div className="login-navbar" role="banner">
          <div className="main-logo">
            <img src={Logo} className="shopngo-logo" alt="ShopNGo" />
          </div>
          <div className="signup">
            <Link to="/" aria-label="Navigate to sign in page">
              <button className="signup-btn" aria-label="Sign in">Sign in</button>
            </Link>
          </div>
        </div>
        <div className="background" aria-hidden="true">
          <img src={BG1} className="BG1" onLoad={handleBgLoad} alt="" />
          <img src={BG2} className="BG2" onLoad={handleBgLoad} alt="" />
        </div>
        {bgLoaded && (
          <div className="main-form2">
            <div className="login-form">
              <div className="some-text">
                <h1 className="user">User Registration</h1>
                <p className="user-desc">
                  Hey, Enter your details to create a new account
                </p>
              </div>
              <form 
                className="user-details"
                onSubmit={(e) => { e.preventDefault(); CreateUser(); }}
                aria-label="Registration form"
              >
                <label htmlFor="name-input" className="sr-only">
                  Full name
                </label>
                <input
                  id="name-input"
                  type="text"
                  placeholder="Name"
                  className="name"
                  value={name}
                  onBlur={handleNameBlur}
                  onChange={handleNameChange}
                  onKeyPress={handleKeyPress}
                  aria-label="Full name"
                  aria-required="true"
                  aria-invalid={!!NameError}
                  aria-describedby={NameError ? "name-error" : undefined}
                  required
                  autoComplete="name"
                />
                {NameError && (
                  <div 
                    id="name-error" 
                    className="error-message" 
                    role="alert"
                    aria-live="polite"
                  >
                    {NameError}
                  </div>
                )}
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
                  autoComplete="new-password"
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
                  onClick={() => {
                    if (name === "" || email === "" || password === "") {
                      notify1();
                    } else {
                      CreateUser();
                    }
                  }}
                  className="signin-btn"
                  disabled={loading}
                  aria-label={loading ? "Creating account, please wait" : "Sign up"}
                >
                  {loading ? "Creating account..." : "Sign up"}
                </button>
                <div className="extra-buttons">
                  <p className="or" aria-label="Or">&#x2015; Or &#x2015;</p>
                  <button 
                    type="button"
                    onClick={GoogleAuth} 
                    className="google"
                    aria-label="Sign up with Google"
                  >
                    <p>Sign up with</p>
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

export default Signup;

