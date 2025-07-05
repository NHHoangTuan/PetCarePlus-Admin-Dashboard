// src/services/api.js
import axios from "axios";

//const API_BASE_URL = "http://localhost:8080";
//const API_BASE_URL = "https://petcareplus-backend-dev.up.railway.app";
//const API_BASE_URL = "https://petcareplus-sqp6.onrender.com";

export const SERVERS = {
  local: {
    id: "local",
    name: "Local Development",
    url: "http://localhost:8080",
    description: "Local development server",
  },
  railway: {
    id: "railway",
    name: "Railway (Dev)",
    url: "https://petcareplus-backend-dev.up.railway.app",
    description: "Railway dev server",
  },
  render: {
    id: "render",
    name: "Render (Dev Backup)",
    url: "https://petcareplus-sqp6.onrender.com",
    description: "Render backup dev server",
  },
};

// Get current server from localStorage or default to railway
export const getCurrentServer = () => {
  const saved = localStorage.getItem("selectedServer");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      return SERVERS[parsed.id] || SERVERS.railway;
    } catch {
      return SERVERS.railway;
    }
  }
  return SERVERS.railway;
};

// Set current server
export const setCurrentServer = (server) => {
  localStorage.setItem("selectedServer", JSON.stringify(server));
  // Recreate axios instance with new base URL
  updateApiBaseURL(server.url);
};

// Get current API base URL
export const getCurrentApiBaseURL = () => {
  return getCurrentServer().url;
};

// Create axios instance with dynamic base URL
let API_BASE_URL = getCurrentApiBaseURL();

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Function to update base URL
const updateApiBaseURL = (newBaseURL) => {
  API_BASE_URL = newBaseURL;
  api.defaults.baseURL = newBaseURL;
};

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
        const response = await axios.post(
          `${getCurrentApiBaseURL()}/auth/refresh`,
          {
            refreshToken: refreshToken,
          }
        );

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

// Health check API
export const healthAPI = {
  checkHealth: (serverUrl) => {
    return axios.get(`${serverUrl}/health`, {
      timeout: 5000,
      headers: {
        "Content-Type": "application/json",
      },
    });
  },
};

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

// Notification API
export const notificationAPI = {
  // Get all notifications
  getAllNotifications: () => api.get("/admin/notifications"),

  // Get single notification
  getNotification: (id) => api.get(`/admin/notifications/${id}`),

  // Create new notification
  createNotification: (data) => api.post("/notifications", data),

  // Mark notification as read
  markAsRead: (id) => api.put(`/notifications/read/${id}`),

  // Delete notification (if needed)
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// Add withdrawal API
export const withdrawalAPI = {
  // Get all withdrawals with pagination
  getWithdrawals: (params = {}) => {
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      size: params.size || 10,
      sortBy: params.sortBy || "createdAt",
      sort: params.sort || "desc",
      ...params.filters,
    });
    return api.get(`/admin/withdrawals?${queryParams}`);
  },

  // Approve withdrawal
  approveWithdrawal: (withdrawalId, adminNote = "Approved by admin") => {
    return api.post(`/admin/withdrawals/${withdrawalId}/approve`, {
      adminNote,
    });
  },

  // Complete withdrawal
  completeWithdrawal: (
    withdrawalId,
    transactionNote = "Bank transfer completed"
  ) => {
    return api.post(`/admin/withdrawals/${withdrawalId}/complete`, {
      transactionNote,
    });
  },

  // Reject withdrawal
  rejectWithdrawal: (withdrawalId, rejectionReason) => {
    return api.post(`/admin/withdrawals/${withdrawalId}/reject`, {
      rejectionReason,
    });
  },
};

// Add terms API
export const termsAPI = {
  // Get all terms with language filter
  getAllTerms: (language = null) => {
    const params = language ? `?language=${language}` : "";
    return api.get(`/admin/terms${params}`);
  },

  // Get terms by type
  getTermsByType: (type, language = null) => {
    const params = language ? `?language=${language}` : "";
    return api.get(`/admin/terms/${type}${params}`);
  },

  // Get all terms in all languages (admin only)
  getAllTermsAllLanguages: () => {
    return api.get("/admin/terms/all-languages");
  },

  // Create new terms (admin only)
  createTerms: (data) => {
    return api.post("/admin/terms", data);
  },

  // Update terms (admin only)
  updateTerms: (id, data) => {
    return api.patch(`/admin/terms/${id}`, data);
  },

  // Delete terms (admin only)
  deleteTerms: (id) => {
    return api.delete(`/admin/terms/${id}`);
  },
};

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  refresh: (refreshToken) => api.post("/auth/refresh", { refreshToken }),
  createAdmin: (adminData) => api.post("/dev/create-admin", adminData),
};

export { api };
