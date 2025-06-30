// src/services/api.js
import axios from "axios";

const API_BASE_URL = "http://localhost:8080";

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("adminToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor để handle 401 và refresh token
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang refresh, queue request này
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("adminRefreshToken");

      if (!refreshToken) {
        // Không có refresh token, redirect to login
        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminRefreshToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken: refreshToken,
        });

        const { token, refreshToken: newRefreshToken } = response.data;

        // Lưu tokens mới
        localStorage.setItem("adminToken", token);
        localStorage.setItem("adminRefreshToken", newRefreshToken);

        // Update header cho original request
        originalRequest.headers.Authorization = `Bearer ${token}`;

        // Process queued requests
        processQueue(null, token);

        isRefreshing = false;

        // Retry original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token cũng hết hạn hoặc invalid
        processQueue(refreshError, null);
        isRefreshing = false;

        localStorage.removeItem("adminToken");
        localStorage.removeItem("adminRefreshToken");
        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

// User API
export const userAPI = {
  // Get all users with pagination and filtering
  getUsers: (params = {}) => {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      size: params.size || 10,
      sortBy: params.sortBy || "createdAt",
      sort: params.sort || "asc",
      ...params.filters,
    });
    return api.get(`/users?${queryParams}`);
  },

  // Get user by ID
  getUserById: (id) => api.get(`/users/${id}`),

  // Update user
  updateUser: (id, data) => api.patch(`/users/${id}`, data),

  // Update user role
  updateUserRole: (id, role) => api.put(`/admin/users/${id}/role`, { role }),

  // Block/Unblock user
  blockUser: (id) => api.patch(`/users/${id}/block`),
  unblockUser: (id) => api.patch(`/users/${id}/unblock`),

  // Delete user
  deleteUser: (id) => api.delete(`/users/${id}`),
};

// Service API
export const serviceAPI = {
  // Get all services with pagination
  getServices: (params = {}) => {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      size: params.size || 10,
      sort: params.sort || "asc",
      sortBy: params.sortBy || "createdAt",
      ...params.filters,
    });
    return api.get(`/admin/services?${queryParams}`);
  },
  // Advanced search
  searchServices: (params = {}) => {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      size: params.size || 10,
      sort: params.sort || "asc",
      sortBy: params.sortBy || "createdAt",
      ...params.filters,
    });
    return api.get(`/admin/services/search/advanced?${queryParams}`);
  },

  // Get service by ID
  getServiceById: (id) => api.get(`/admin/services/${id}`),

  // Create new service
  createService: (data) => api.post("/admin/services", data),

  // Update service
  updateService: (id, data) => api.patch(`/admin/services/${id}`, data),

  // Delete service
  deleteService: (id) => api.delete(`/admin/services/${id}`),
};

export const bookingAPI = {
  // Get all bookings with pagination and filtering
  getBookings: (params = {}) => {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      size: params.size || 10,
      sort: params.sort || "desc",
      sortBy: params.sortBy || "createdAt",
      ...params.filters,
    });
    return api.get(`/admin/bookings?${queryParams}`);
  },

  // Get booking by ID
  getBookingById: (id) => api.get(`/admin/bookings/${id}`),
};

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  refresh: (refreshToken) => api.post("/auth/refresh", { refreshToken }),
  createAdmin: (adminData) => api.post("/dev/create-admin", adminData),
};

export default api;
