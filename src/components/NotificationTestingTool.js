// src/components/NotificationTestingTool.js
import React, { useState, useEffect } from "react";
import {
  Play,
  RefreshCw,
  Send,
  Eye,
  Check,
  Trash2,
  Copy,
  Download,
  Upload,
  AlertCircle,
  CheckCircle,
  Bell,
  User,
  MessageSquare,
  Calendar,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Filter,
  Search,
} from "lucide-react";
import { notificationAPI } from "../services/api";
import { formatDate } from "../utils/dateUtils";
import { useToast } from "../context/ToastContext";

const ResponseDisplay = ({ apiResponse, apiError, onCopy, onClear }) => {
  if (!apiResponse && !apiError) return null;

  const isError = !!apiError;
  const data = apiResponse || apiError;
  console.log("API Response Data:", data);

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return "text-green-600 bg-green-100";
    if (status >= 400 && status < 500) return "text-red-600 bg-red-100";
    if (status >= 500) return "text-red-600 bg-red-100";
    return "text-gray-600 bg-gray-100";
  };

  const renderNotificationCard = (notification, index) => (
    <div
      key={notification.id || index}
      className="bg-white border border-gray-200 rounded-lg p-4 mb-3"
    >
      <div className="flex items-start gap-3">
        {notification.imageUrl && (
          <img
            src={notification.imageUrl}
            alt="Notification"
            className="w-12 h-12 object-cover rounded-lg"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h4 className="font-medium text-gray-900">{notification.title}</h4>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                {
                  BOOKING: "bg-blue-100 text-blue-800",
                  PAYMENT: "bg-green-100 text-green-800",
                  REVIEW: "bg-yellow-100 text-yellow-800",
                  CHAT: "bg-purple-100 text-purple-800",
                  SYSTEM: "bg-gray-100 text-gray-800",
                }[notification.type] || "bg-gray-100 text-gray-800"
              }`}
            >
              {notification.type}
            </span>
            {notification.isRead ? (
              <CheckCircle className="w-4 h-4 text-green-500" title="Read" />
            ) : (
              <AlertCircle className="w-4 h-4 text-yellow-500" title="Unread" />
            )}
          </div>

          <p className="text-sm text-gray-600 mb-3">{notification.message}</p>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-medium text-gray-700">ID:</span>
              <div className="font-mono text-gray-600 break-all">
                {notification.id}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Created:</span>
              <div className="text-gray-600">
                {formatDate(notification.createdAt)}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Receiver:</span>
              <div className="font-mono text-gray-600 break-all">
                {notification.userIdReceive}
              </div>
            </div>
            {notification.userIdSend && (
              <div>
                <span className="font-medium text-gray-700">Sender:</span>
                <div className="font-mono text-gray-600 break-all">
                  {notification.userIdSend}
                </div>
              </div>
            )}
            {notification.relatedId && (
              <div>
                <span className="font-medium text-gray-700">Related ID:</span>
                <div className="font-mono text-gray-600 break-all">
                  {notification.relatedId}
                </div>
              </div>
            )}
            {notification.deletedAt && (
              <div>
                <span className="font-medium text-gray-700">Deleted:</span>
                <div className="text-red-600">
                  {formatDate(notification.deletedAt)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSingleNotification = (notification) => (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
      <div className="flex items-start gap-4">
        {notification.imageUrl && (
          <img
            src={notification.imageUrl}
            alt="Notification"
            className="w-16 h-16 object-cover rounded-lg border-2 border-white shadow-sm"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        )}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-lg font-semibold text-gray-900">
              {notification.title}
            </h3>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                {
                  BOOKING: "bg-blue-100 text-blue-800",
                  PAYMENT: "bg-green-100 text-green-800",
                  REVIEW: "bg-yellow-100 text-yellow-800",
                  CHAT: "bg-purple-100 text-purple-800",
                  SYSTEM: "bg-gray-100 text-gray-800",
                }[notification.type] || "bg-gray-100 text-gray-800"
              }`}
            >
              {notification.type}
            </span>
            <div
              className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                notification.isRead
                  ? "bg-green-100 text-green-800"
                  : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {notification.isRead ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  Read
                </>
              ) : (
                <>
                  <AlertCircle className="w-3 h-3" />
                  Unread
                </>
              )}
            </div>
          </div>

          <p className="text-gray-700 mb-4 leading-relaxed">
            {notification.message}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700 w-20">ID:</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-800 break-all">
                  {notification.id}
                </code>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700 w-20">Created:</span>
                <span className="text-gray-600">
                  {formatDate(notification.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700 w-20">Updated:</span>
                <span className="text-gray-600">
                  {formatDate(notification.updatedAt)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-700 w-20">
                  Receiver:
                </span>
                <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-800 break-all">
                  {notification.userIdReceive}
                </code>
              </div>
              {notification.userIdSend && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 w-20">
                    Sender:
                  </span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-800 break-all">
                    {notification.userIdSend}
                  </code>
                </div>
              )}
              {notification.relatedId && (
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700 w-20">
                    Related:
                  </span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-800 break-all">
                    {notification.relatedId}
                  </code>
                </div>
              )}
            </div>
          </div>

          {notification.deletedAt && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Deleted:</span>
                <span>{formatDate(notification.deletedAt)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${
                isError ? "bg-red-500" : "bg-green-500"
              }`}
            ></div>
            <h3 className="text-lg font-semibold text-gray-900">
              {isError ? "API Error Response" : "API Response"}
            </h3>
            {data.status && (
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                  data.status
                )}`}
              >
                {data.status}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onCopy(data)}
              className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 text-sm"
            >
              <Copy className="w-4 h-4" />
              Copy JSON
            </button>
            <button
              onClick={onClear}
              className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-2 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              Clear
            </button>
          </div>
        </div>

        {/* Request Info */}
        <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <span className="font-medium">Method:</span>
            <code
              className={`px-2 py-1 rounded text-xs font-mono ${
                data.method === "GET"
                  ? "bg-blue-100 text-blue-800"
                  : data.method === "POST"
                  ? "bg-green-100 text-green-800"
                  : data.method === "PUT"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {data.method}
            </code>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Endpoint:</span>
            <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono text-gray-800">
              {data.endpoint}
            </code>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Time:</span>
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Response Body */}
      <div className="p-6">
        {isError ? (
          // Error Display
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-red-900 mb-2">Error Details</h4>
                <div className="text-sm text-red-800">
                  {typeof data.error === "string" ? (
                    <p>{data.error}</p>
                  ) : (
                    <pre className="whitespace-pre-wrap font-mono text-xs bg-red-100 p-3 rounded border">
                      {JSON.stringify(data.error, null, 2)}
                    </pre>
                  )}
                </div>
                {data.requestBody && (
                  <div className="mt-4">
                    <h5 className="font-medium text-red-900 mb-2">
                      Request Body:
                    </h5>
                    <pre className="whitespace-pre-wrap font-mono text-xs bg-red-100 p-3 rounded border">
                      {JSON.stringify(data.requestBody, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Success Display
          <div>
            {Array.isArray(data.data.items) ? (
              // Multiple Notifications (List)
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium text-gray-900">
                    Notifications ({data.data.items.length})
                  </h4>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>
                        Read: {data.data.items.filter((n) => n.isRead).length}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>
                        Unread:{" "}
                        {data.data.items.filter((n) => !n.isRead).length}
                      </span>
                    </div>
                  </div>
                </div>

                {data.data.items.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No notifications found</p>
                  </div>
                ) : (
                  <div className="max-h-96 overflow-y-auto">
                    {data.data.items.map((notification, index) =>
                      renderNotificationCard(notification, index)
                    )}
                  </div>
                )}
              </div>
            ) : data.data && typeof data.data === "object" && data.data.id ? (
              // Single Notification
              <div>
                <h4 className="font-medium text-gray-900 mb-4">
                  Notification Details
                </h4>
                {renderSingleNotification(data.data)}
              </div>
            ) : (
              // Other Response Types
              <div>
                <h4 className="font-medium text-gray-900 mb-4">
                  Response Data
                </h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <pre className="text-sm overflow-x-auto whitespace-pre-wrap font-mono text-gray-800">
                    {JSON.stringify(data.data.items, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Request Body Display (for POST requests) */}
            {data.requestBody && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-gray-900 mb-3">Request Body</h4>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Title:</span>
                      <p className="text-gray-600 mt-1">
                        {data.requestBody.title}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Type:</span>
                      <span
                        className={`ml-2 px-2 py-1 rounded text-xs ${
                          {
                            BOOKING: "bg-blue-100 text-blue-800",
                            PAYMENT: "bg-green-100 text-green-800",
                            REVIEW: "bg-yellow-100 text-yellow-800",
                            CHAT: "bg-purple-100 text-purple-800",
                            SYSTEM: "bg-gray-100 text-gray-800",
                          }[data.requestBody.type] ||
                          "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {data.requestBody.type}
                      </span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-700">
                        Message:
                      </span>
                      <p className="text-gray-600 mt-1">
                        {data.requestBody.message}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">
                        Receiver ID:
                      </span>
                      <code className="bg-white px-2 py-1 rounded text-xs font-mono text-gray-800 ml-2">
                        {data.requestBody.userIdReceive}
                      </code>
                    </div>
                    {data.requestBody.relatedId && (
                      <div>
                        <span className="font-medium text-gray-700">
                          Related ID:
                        </span>
                        <code className="bg-white px-2 py-1 rounded text-xs font-mono text-gray-800 ml-2">
                          {data.requestBody.relatedId}
                        </code>
                      </div>
                    )}
                    {data.requestBody.imageUrl && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-700">
                          Image:
                        </span>
                        <div className="mt-2">
                          <img
                            src={data.requestBody.imageUrl}
                            alt="Notification"
                            className="w-16 h-16 object-cover rounded border"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const NotificationTestingTool = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [activeTab, setActiveTab] = useState("list"); // list, create, single, read

  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

  // Add filters state
  const [filters, setFilters] = useState({
    type: "",
    isRead: "",
    search: "",
  });

  // Create notification form data
  const [createForm, setCreateForm] = useState({
    userIdReceive: "",
    type: "BOOKING",
    imageUrl: "",
    message: "",
    title: "",
    relatedId: "",
  });

  // Single notification form
  const [singleNotificationId, setSingleNotificationId] = useState("");
  const [readNotificationId, setReadNotificationId] = useState("");

  // API Response states
  const [apiResponse, setApiResponse] = useState(null);
  const [apiError, setApiError] = useState(null);
  const [apiLoading, setApiLoading] = useState(false);

  // Add toast hook
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  // Load all notifications on component mount
  useEffect(() => {
    if (activeTab === "list") {
      handleGetAllNotifications();
    }
  }, [activeTab, pagination.page, pagination.size]);

  // API Handlers
  const handleGetAllNotifications = async (resetPage = false) => {
    if (resetPage) {
      setPagination((prev) => ({ ...prev, page: 1 }));
    }

    setApiLoading(true);
    setApiError(null);
    try {
      const params = {
        page: resetPage ? 1 : pagination.page,
        size: pagination.size,
        ...(filters.type && { type: filters.type }),
        ...(filters.isRead !== "" && { isRead: filters.isRead === "true" }),
        ...(filters.search && { search: filters.search }),
      };
      const response = await notificationAPI.getAllNotifications(params);
      //console.log("API Response:", response);
      const responseData = response.data;
      setNotifications(responseData.data || []);

      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.paging.totalPage,
        totalElements: response.data.paging.totalItem,
        page: response.data.paging.pageNumber,
        size: response.data.paging.pageSize,
      }));

      setApiResponse({
        method: "GET",
        endpoint: "/notifications",
        status: response.status,
        data: response.data,
      });

      // Show success toast
      // showSuccess(
      //   `Successfully loaded ${response.data.data?.length || 0} notifications`,
      //   3000
      // );
    } catch (error) {
      setApiError({
        method: "GET",
        endpoint: "/notifications",
        error: error.response?.data || error.message,
      });

      // Show error toast
      showError(
        `Failed to load notifications: ${
          error.response?.data?.message || error.message
        }`,
        5000
      );
    } finally {
      setApiLoading(false);
    }
  };

  const handleCreateNotification = async () => {
    // Validate required fields
    if (!createForm.userIdReceive.trim()) {
      showWarning("Please enter User ID Receive", 3000);
      return;
    }
    if (!createForm.title.trim()) {
      showWarning("Please enter notification title", 3000);
      return;
    }
    if (!createForm.message.trim()) {
      showWarning("Please enter notification message", 3000);
      return;
    }

    setApiLoading(true);
    setApiError(null);
    try {
      const response = await notificationAPI.createNotification(createForm);
      setApiResponse({
        method: "POST",
        endpoint: "/notifications",
        status: response.status,
        data: response.data,
        requestBody: createForm,
      });

      // Show success toast with details
      showSuccess(
        `Notification "${createForm.title}" sent successfully!`,
        4000
      );
      // Show info toast for next step
      showInfo("Refreshing notifications list...", 2000);

      // Refresh notifications list
      setTimeout(() => {
        handleGetAllNotifications();
      }, 1000);

      // Clear form after successful creation
      setCreateForm({
        userIdReceive: "",
        type: "BOOKING",
        imageUrl: "",
        message: "",
        title: "",
        relatedId: "",
      });
    } catch (error) {
      setApiError({
        method: "POST",
        endpoint: "/notifications",
        error: error.response?.data || error.message,
        requestBody: createForm,
      });
      // Show detailed error toast
      const errorMessage = error.response?.data?.message || error.message;
      showError(`Failed to send notification: ${errorMessage}`, 6000);
    } finally {
      setApiLoading(false);
    }
  };

  const handleGetSingleNotification = async () => {
    if (!singleNotificationId.trim()) {
      showWarning("Please enter a notification ID", 3000);
      return;
    }

    setApiLoading(true);
    setApiError(null);
    try {
      const response = await notificationAPI.getNotification(
        singleNotificationId
      );
      setSelectedNotification(response.data);
      setApiResponse({
        method: "GET",
        endpoint: `/notifications/${singleNotificationId}`,
        status: response.status,
        data: response.data,
      });

      // Show success toast
      showSuccess(`Found notification: "${response.data.title}"`, 3000);
    } catch (error) {
      setApiError({
        method: "GET",
        endpoint: `/notifications/${singleNotificationId}`,
        error: error.response?.data || error.message,
      });

      // Show error toast
      if (error.response?.status === 404) {
        showError(
          `Notification with ID "${singleNotificationId}" not found`,
          4000
        );
      } else {
        showError(
          `Failed to get notification: ${
            error.response?.data?.message || error.message
          }`,
          5000
        );
      }
    } finally {
      setApiLoading(false);
    }
  };

  const handleMarkAsRead = async () => {
    if (!readNotificationId.trim()) return;

    setApiLoading(true);
    setApiError(null);
    try {
      const response = await notificationAPI.markAsRead(readNotificationId);
      setApiResponse({
        method: "PUT",
        endpoint: `/notifications/read/${readNotificationId}`,
        status: response.status,
        data: response.data,
      });

      // Show success toast
      showSuccess(`✅ Notification marked as read successfully!`, 3000);

      // Show info toast for refresh
      showInfo("Refreshing notifications list...", 2000);

      // Refresh notifications list
      setTimeout(() => {
        handleGetAllNotifications();
      }, 1000);

      // Clear the input
      setReadNotificationId("");
    } catch (error) {
      setApiError({
        method: "PUT",
        endpoint: `/notifications/read/${readNotificationId}`,
        error: error.response?.data || error.message,
      });

      // Show error toast
      if (error.response?.status === 404) {
        showError(
          `Notification with ID "${readNotificationId}" not found`,
          4000
        );
      } else {
        showError(
          `Failed to mark as read: ${
            error.response?.data?.message || error.message
          }`,
          5000
        );
      }
    } finally {
      setApiLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newSize) => {
    setPagination((prev) => ({ ...prev, size: newSize, page: 1 }));
  };

  // Filter handlers
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // Reset to page 1 when filters change
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const applyFilters = () => {
    handleGetAllNotifications(true);
  };

  const clearFilters = () => {
    setFilters({
      type: "",
      isRead: "",
      search: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
    setTimeout(() => {
      handleGetAllNotifications(true);
    }, 100);
  };

  // Helper functions
  const handleInputChange = (field, value) => {
    setCreateForm((prev) => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(JSON.stringify(text, null, 2));
    showSuccess("📋 Response copied to clipboard!", 2000);
  };

  const generateSampleData = () => {
    setCreateForm({
      userIdReceive: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      type: "BOOKING",
      imageUrl: "https://via.placeholder.com/150",
      message:
        "Your booking has been confirmed! We'll be there at the scheduled time.",
      title: "Booking Confirmed",
      relatedId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    });
  };

  const getNotificationTypeColor = (type) => {
    const colors = {
      BOOKING: "bg-blue-100 text-blue-800",
      PAYMENT: "bg-green-100 text-green-800",
      REVIEW: "bg-yellow-100 text-yellow-800",
      CHAT: "bg-purple-100 text-purple-800",
      SYSTEM: "bg-gray-100 text-gray-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Bell className="w-8 h-8 text-blue-600" />
                Notification API Testing Tool
              </h1>
              <p className="text-gray-600 mt-2">
                Test notification APIs easily with this interactive tool
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setApiResponse(null);
                  setApiError(null);
                }}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Clear Response
              </button>
              <button
                onClick={handleGetAllNotifications}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - API Endpoints */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                API Endpoints
              </h2>

              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab("list")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "list"
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Eye className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Get All Notifications</div>
                      <div className="text-sm text-gray-500">
                        GET /notifications
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("create")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "create"
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Send className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Create Notification</div>
                      <div className="text-sm text-gray-500">
                        POST /notifications
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("single")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "single"
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Eye className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Get Single Notification</div>
                      <div className="text-sm text-gray-500">
                        GET /notifications/:id
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("read")}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === "read"
                      ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Check className="w-4 h-4" />
                    <div>
                      <div className="font-medium">Mark as Read</div>
                      <div className="text-sm text-gray-500">
                        PUT /notifications/read/:id
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {/* Get All Notifications Tab with Pagination */}
              {activeTab === "list" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      All Notifications
                    </h3>
                    <button
                      onClick={() => handleGetAllNotifications()}
                      disabled={apiLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {apiLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      Execute
                    </button>
                  </div>

                  {/* Filters Section */}
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Filter className="w-4 h-4 text-gray-600" />
                      <h4 className="font-medium text-gray-900">Filters</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Search Filter */}
                      {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Search
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <input
                            type="text"
                            value={filters.search}
                            onChange={(e) =>
                              handleFilterChange("search", e.target.value)
                            }
                            placeholder="Search notifications..."
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div> */}

                      {/* Type Filter */}
                      {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type
                        </label>
                        <select
                          value={filters.type}
                          onChange={(e) =>
                            handleFilterChange("type", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">All Types</option>
                          <option value="BOOKING">BOOKING</option>
                          <option value="PAYMENT">PAYMENT</option>
                          <option value="REVIEW">REVIEW</option>
                          <option value="CHAT">CHAT</option>
                          <option value="SYSTEM">SYSTEM</option>
                        </select>
                      </div> */}

                      {/* Read Status Filter */}
                      {/* <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Read Status
                        </label>
                        <select
                          value={filters.isRead}
                          onChange={(e) =>
                            handleFilterChange("isRead", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">All Status</option>
                          <option value="true">Read</option>
                          <option value="false">Unread</option>
                        </select>
                      </div> */}

                      {/* Page Size */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Page Size
                        </label>
                        <select
                          value={pagination.size}
                          onChange={(e) =>
                            handlePageSizeChange(parseInt(e.target.value))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="5">5 per page</option>
                          <option value="10">10 per page</option>
                          <option value="20">20 per page</option>
                          <option value="50">50 per page</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={applyFilters}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                      >
                        <Filter className="w-4 h-4" />
                        Apply Filters
                      </button>
                      <button
                        onClick={clearFilters}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>

                  {/* Pagination Info */}
                  {pagination.totalElements > 0 && (
                    <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                      <div>
                        Showing {(pagination.page - 1) * pagination.size + 1} to{" "}
                        {Math.min(
                          pagination.page * pagination.size,
                          pagination.totalElements
                        )}{" "}
                        of {pagination.totalElements} notifications
                      </div>
                      <div>
                        Page {pagination.page} of {pagination.totalPages}
                      </div>
                    </div>
                  )}

                  {/* Notifications List */}
                  {apiLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mr-3" />
                      <span className="text-gray-600">
                        Loading notifications...
                      </span>
                    </div>
                  ) : notifications.length > 0 ? (
                    <div className="space-y-3 mb-6">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                            notification.isRead
                              ? "bg-gray-50"
                              : "bg-blue-50 border-blue-200"
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {notification.imageUrl && (
                              <img
                                src={notification.imageUrl}
                                alt="Notification"
                                className="w-12 h-12 object-cover rounded"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                }}
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">
                                  {notification.title}
                                </span>
                                <span
                                  className={`px-2 py-1 rounded text-xs font-medium ${
                                    {
                                      BOOKING: "bg-blue-100 text-blue-800",
                                      PAYMENT: "bg-green-100 text-green-800",
                                      REVIEW: "bg-yellow-100 text-yellow-800",
                                      CHAT: "bg-purple-100 text-purple-800",
                                      SYSTEM: "bg-gray-100 text-gray-800",
                                    }[notification.type] ||
                                    "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {notification.type}
                                </span>
                                {notification.isRead ? (
                                  <CheckCircle
                                    className="w-4 h-4 text-green-500"
                                    title="Read"
                                  />
                                ) : (
                                  <AlertCircle
                                    className="w-4 h-4 text-yellow-500"
                                    title="Unread"
                                  />
                                )}
                              </div>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <span title="Notification ID">
                                  ID: {notification.id.slice(0, 8)}...
                                </span>
                                <span title="Created At">
                                  Created: {formatDate(notification.createdAt)}
                                </span>
                                <span title="Receiver">
                                  To: {notification.userIdReceive.slice(0, 8)}
                                  ...
                                </span>
                                {notification.userIdSend && (
                                  <span title="Sender">
                                    From: {notification.userIdSend.slice(0, 8)}
                                    ...
                                  </span>
                                )}
                                {notification.deletedAt && (
                                  <span
                                    className="text-red-500"
                                    title="Deleted At"
                                  >
                                    Deleted:{" "}
                                    {formatDate(notification.deletedAt)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-lg">
                        No notifications found
                      </p>
                      <p className="text-gray-400 text-sm mt-2">
                        Try adjusting your filters or create a new notification
                      </p>
                    </div>
                  )}

                  {/* Pagination Controls */}
                  {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(1)}
                          disabled={pagination.page === 1}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="First page"
                        >
                          <ChevronsLeft className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handlePageChange(pagination.page - 1)}
                          disabled={pagination.page === 1}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Previous page"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Page Numbers */}
                        {[...Array(Math.min(pagination.totalPages, 5))].map(
                          (_, index) => {
                            const pageNumber =
                              Math.max(1, pagination.page - 2) + index;
                            if (pageNumber > pagination.totalPages) return null;

                            return (
                              <button
                                key={pageNumber}
                                onClick={() => handlePageChange(pageNumber)}
                                className={`px-3 py-2 rounded-lg text-sm font-medium ${
                                  pageNumber === pagination.page
                                    ? "bg-blue-600 text-white"
                                    : "border border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {pageNumber}
                              </button>
                            );
                          }
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(pagination.page + 1)}
                          disabled={pagination.page === pagination.totalPages}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Next page"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handlePageChange(pagination.totalPages)
                          }
                          disabled={pagination.page === pagination.totalPages}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Last page"
                        >
                          <ChevronsRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Create Notification Tab */}
              {activeTab === "create" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Create Notification
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={generateSampleData}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                      >
                        Sample Data
                      </button>
                      <button
                        onClick={handleCreateNotification}
                        disabled={apiLoading}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                      >
                        {apiLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Send Notification
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        User ID Receive *
                      </label>
                      <input
                        type="text"
                        value={createForm.userIdReceive}
                        onChange={(e) =>
                          handleInputChange("userIdReceive", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="3fa85f64-5717-4562-b3fc-2c963f66afa6"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type *
                      </label>
                      <select
                        value={createForm.type}
                        onChange={(e) =>
                          handleInputChange("type", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="BOOKING">BOOKING</option>
                        <option value="PAYMENT">PAYMENT</option>
                        <option value="REVIEW">REVIEW</option>
                        <option value="CHAT">CHAT</option>
                        <option value="SYSTEM">SYSTEM</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MessageSquare className="w-4 h-4 inline mr-2" />
                        Title *
                      </label>
                      <input
                        type="text"
                        value={createForm.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Notification title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <textarea
                        value={createForm.message}
                        onChange={(e) =>
                          handleInputChange("message", e.target.value)
                        }
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Notification message content"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <ImageIcon className="w-4 h-4 inline mr-2" />
                        Image URL
                      </label>
                      <input
                        type="text"
                        value={createForm.imageUrl}
                        onChange={(e) =>
                          handleInputChange("imageUrl", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="https://example.com/image.jpg"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Related ID
                      </label>
                      <input
                        type="text"
                        value={createForm.relatedId}
                        onChange={(e) =>
                          handleInputChange("relatedId", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="3fa85f64-5717-4562-b3fc-2c963f66afa6"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Get Single Notification Tab */}
              {activeTab === "single" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Get Single Notification
                    </h3>
                    <button
                      onClick={handleGetSingleNotification}
                      disabled={apiLoading || !singleNotificationId.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {apiLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Play className="w-4 h-4" />
                      )}
                      Get Notification
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notification ID *
                    </label>
                    <input
                      type="text"
                      value={singleNotificationId}
                      onChange={(e) => setSingleNotificationId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="3fa85f64-5717-4562-b3fc-2c963f66afa6"
                    />
                  </div>

                  {selectedNotification && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">
                        Notification Details:
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Title:</strong> {selectedNotification.title}
                        </div>
                        <div>
                          <strong>Message:</strong>{" "}
                          {selectedNotification.message}
                        </div>
                        <div>
                          <strong>Type:</strong> {selectedNotification.type}
                        </div>
                        <div>
                          <strong>Is Read:</strong>{" "}
                          {selectedNotification.isRead ? "Yes" : "No"}
                        </div>
                        <div>
                          <strong>Created:</strong>{" "}
                          {formatDate(selectedNotification.createdAt)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mark as Read Tab */}
              {activeTab === "read" && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Mark Notification as Read
                    </h3>
                    <button
                      onClick={handleMarkAsRead}
                      disabled={apiLoading || !readNotificationId.trim()}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                    >
                      {apiLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Mark as Read
                    </button>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notification ID *
                    </label>
                    <input
                      type="text"
                      value={readNotificationId}
                      onChange={(e) => setReadNotificationId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="3fa85f64-5717-4562-b3fc-2c963f66afa6"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* API Response/Error Display */}
        <ResponseDisplay
          apiResponse={apiResponse}
          apiError={apiError}
          onCopy={copyToClipboard}
          onClear={() => {
            setApiResponse(null);
            setApiError(null);
          }}
        />
      </div>
    </div>
  );
};

export default NotificationTestingTool;
