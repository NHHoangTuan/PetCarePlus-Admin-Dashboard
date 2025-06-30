// src/utils/formatUtils.js

// Format number with thousand separators
export const formatNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) return "0";
  return new Intl.NumberFormat("en-US").format(number);
};

// Format currency (USD with commas)
export const formatCurrency = (amount, currency = "VND") => {
  if (amount === null || amount === undefined || isNaN(amount)) return "$0.00";

  if (currency === "VND") {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Format currency without symbol (just number with commas)
export const formatPrice = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) return "0.00";
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Format large numbers (K, M, B)
export const formatCompactNumber = (number) => {
  if (number === null || number === undefined || isNaN(number)) return "0";
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(number);
};

// Vietnamese number format (spaces instead of commas)
export const formatNumberVN = (number) => {
  if (number === null || number === undefined || isNaN(number)) return "0";
  return new Intl.NumberFormat("vi-VN").format(number);
};
