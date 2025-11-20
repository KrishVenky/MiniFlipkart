/**
 * Shared validation utilities for frontend forms
 * Provides consistent validation logic across authentication and other forms
 */

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateEmail = (email) => {
  if (!email || email.trim() === "") {
    return { isValid: false, error: "Email is required" };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }

  return { isValid: true, error: "" };
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validatePassword = (password) => {
  if (!password || password.trim() === "") {
    return { isValid: false, error: "Password is required" };
  }

  if (password.length < 6) {
    return { isValid: false, error: "Password must be at least 6 characters long" };
  }

  return { isValid: true, error: "" };
};

/**
 * Validates name field
 * @param {string} name - Name to validate
 * @returns {Object} - { isValid: boolean, error: string }
 */
export const validateName = (name) => {
  if (!name || name.trim() === "") {
    return { isValid: false, error: "Name is required" };
  }

  if (name.trim().length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters long" };
  }

  if (name.length > 50) {
    return { isValid: false, error: "Name cannot exceed 50 characters" };
  }

  return { isValid: true, error: "" };
};

/**
 * Validates complete registration form
 * @param {Object} formData - { name, email, password }
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateRegistrationForm = (formData) => {
  const { name, email, password } = formData;
  const errors = {};
  let isValid = true;

  const nameValidation = validateName(name);
  if (!nameValidation.isValid) {
    errors.name = nameValidation.error;
    isValid = false;
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
    isValid = false;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
    isValid = false;
  }

  return { isValid, errors };
};

/**
 * Validates login form
 * @param {Object} formData - { email, password }
 * @returns {Object} - { isValid: boolean, errors: Object }
 */
export const validateLoginForm = (formData) => {
  const { email, password } = formData;
  const errors = {};
  let isValid = true;

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.email = emailValidation.error;
    isValid = false;
  }

  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.password = passwordValidation.error;
    isValid = false;
  }

  return { isValid, errors };
};

/**
 * Parses API error response into user-friendly message
 * @param {Error} error - Axios error object
 * @returns {string} - User-friendly error message
 */
export const parseApiError = (error) => {
  if (!error.response) {
    return "Network error. Please check your connection and try again.";
  }

  const { status, data } = error.response;

  // Handle validation errors
  if (status === 400 && data.errors && Array.isArray(data.errors)) {
    return data.errors.map((err) => err.msg || err.message).join(", ");
  }

  // Handle specific error messages
  if (data.error) {
    return data.error;
  }

  // Handle status codes
  switch (status) {
    case 401:
      return "Invalid credentials. Please check your email and password.";
    case 403:
      return "Access denied. Please contact support.";
    case 404:
      return "Resource not found.";
    case 429:
      return "Too many requests. Please wait a moment and try again.";
    case 500:
      return "Server error. Please try again later.";
    default:
      return "An unexpected error occurred. Please try again.";
  }
};

