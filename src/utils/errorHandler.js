// src/utils/errorHandler.js

export const parseValidationErrors = (error) => {
  if (
    error.response?.data?.message === "Validation error" &&
    error.response?.data?.items
  ) {
    // Trả về object với field errors
    return {
      type: "validation",
      fieldErrors: error.response.data.items,
      message: "Please fix the validation errors below",
    };
  }

  // Trả về lỗi thông thường
  return {
    type: "general",
    message:
      error.response?.data?.message || error.message || "An error occurred",
  };
};

export const formatFieldError = (fieldName, errorMessage) => {
  // Format field name để hiển thị user-friendly
  const fieldDisplayNames = {
    password: "Password",
    passwordConfirm: "Password Confirmation",
    email: "Email",
    name: "First Name",
    lastName: "Last Name",
  };

  return `${fieldDisplayNames[fieldName] || fieldName}: ${errorMessage}`;
};
