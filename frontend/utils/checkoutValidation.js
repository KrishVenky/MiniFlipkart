/**
 * Checkout validation utilities
 */

export const validateAddress = (address) => {
  const errors = [];

  if (!address.fullName || address.fullName.trim() === "") {
    errors.push("Full name is required");
  }

  if (!address.addressLine1 || address.addressLine1.trim() === "") {
    errors.push("Address line 1 is required");
  }

  if (!address.city || address.city.trim() === "") {
    errors.push("City is required");
  }

  if (!address.zipCode || !/^\d{5}(-\d{4})?$/.test(address.zipCode)) {
    errors.push("Valid ZIP code is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePayment = (payment) => {
  const errors = [];

  if (!payment.cardNumber || !/^\d{13,19}$/.test(payment.cardNumber.replace(/\s/g, ""))) {
    errors.push("Valid card number is required");
  }

  if (!payment.expiryDate || !/^\d{2}\/\d{2}$/.test(payment.expiryDate)) {
    errors.push("Valid expiry date (MM/YY) is required");
  }

  if (!payment.cvv || !/^\d{3,4}$/.test(payment.cvv)) {
    errors.push("Valid CVV is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const detectFraudHints = (orderData) => {
  const hints = [];

  // Simple fraud detection hints
  if (orderData.total > 1000) {
    hints.push("HIGH_VALUE_ORDER");
  }

  if (orderData.shippingAddress.country !== orderData.billingAddress?.country) {
    hints.push("ADDRESS_MISMATCH");
  }

  return hints;
};

