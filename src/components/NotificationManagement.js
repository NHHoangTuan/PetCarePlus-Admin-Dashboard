// src/components/NotificationManagement.js
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Bell,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Send,
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  MoreVertical,
  X,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Image as ImageIcon,
  ExternalLink,
  Target,
  Users,
  TrendingUp,
  Activity,
  Star,
  Heart,
  Zap,
  Shield,
  Settings,
  Download,
  Upload,
  Copy,
  Archive,
  Sparkles,
  XCircle,
  Mail,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react";
import { notificationAPI } from "../services/api";
import { formatDate, formatDate2 } from "../utils/dateUtils";
import { parseValidationErrors } from "../utils/errorHandler";
import { useToast } from "../context/ToastContext";
import { useDebounce } from "../hooks/useDebounce";
import { formatNumber } from "../utils/formatUtils";

// Notification Detail Modal
const NotificationDetailModal = ({
  notification,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !notification) return null;

  const getTypeColor = (type) => {
    const colors = {
      BOOKING: "from-blue-500 to-cyan-500",
      PAYMENT: "from-emerald-500 to-teal-500",
      REVIEW: "from-amber-500 to-orange-500",
      CHAT: "from-purple-500 to-pink-500",
      SYSTEM: "from-slate-500 to-slate-600",
    };
    return colors[type] || colors.SYSTEM;
  };

  const getTypeBadge = (type) => {
    const styles = {
      BOOKING: "bg-blue-100 text-blue-800 border-blue-200",
      PAYMENT: "bg-emerald-100 text-emerald-800 border-emerald-200",
      REVIEW: "bg-amber-100 text-amber-800 border-amber-200",
      CHAT: "bg-purple-100 text-purple-800 border-purple-200",
      SYSTEM: "bg-slate-100 text-slate-800 border-slate-200",
    };
    return styles[type] || styles.SYSTEM;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div
            className={`absolute inset-0 bg-gradient-to-r ${getTypeColor(
              notification.type
            )} opacity-10`}
          ></div>
          <div className="relative p-6 border-b border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`p-3 rounded-2xl bg-gradient-to-r ${getTypeColor(
                    notification.type
                  )} shadow-lg`}
                >
                  <Bell className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">
                    {notification.title}
                  </h2>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getTypeBadge(
                        notification.type
                      )}`}
                    >
                      {notification.type}
                    </span>
                    <div
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                        notification.isRead
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                          : "bg-amber-100 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {notification.isRead ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Read
                        </>
                      ) : (
                        <>
                          <AlertCircle className="w-4 h-4" />
                          Unread
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Notification Image */}
          {notification.imageUrl && (
            <div className="mb-6 text-center">
              <img
                src={notification.imageUrl}
                alt="Notification"
                className="w-32 h-32 object-cover rounded-2xl mx-auto shadow-lg border-4 border-white"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Message */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              Message
            </h3>
            <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-4 border border-slate-200">
              <p className="text-slate-700 leading-relaxed">
                {notification.message}
              </p>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Info */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                Basic Information
              </h4>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Target className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Notification ID
                    </p>
                    <p className="text-sm text-slate-900 font-mono">
                      {notification.id}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Recipient
                    </p>
                    <p className="text-sm text-slate-900 font-mono">
                      {notification.userIdReceive}
                    </p>
                  </div>
                </div>

                {notification.relatedId && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                      <ExternalLink className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Related ID
                      </p>
                      <p className="text-sm text-slate-900 font-mono">
                        {notification.relatedId}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Timestamps */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
                Timestamps
              </h4>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Created At
                    </p>
                    <p className="text-sm text-slate-900">
                      {formatDate2(notification.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-slate-500 to-slate-600 rounded-xl flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Last Updated
                    </p>
                    <p className="text-sm text-slate-900">
                      {formatDate2(notification.updatedAt)}
                    </p>
                  </div>
                </div>

                {notification.readAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Read At
                      </p>
                      <p className="text-sm text-slate-900">
                        {formatDate2(notification.readAt)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="text-sm text-slate-500">
            Last updated: {formatDate2(notification.updatedAt)}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onEdit(notification)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => onDelete(notification)}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Notification Editor Modal
const NotificationEditorModal = ({
  notification,
  isOpen,
  onClose,
  onSave,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState({
    userIdReceive: "",
    type: "BOOKING",
    title: "",
    message: "",
    imageUrl: "",
    relatedId: "",
  });
  const [loading, setLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const { showSuccess, showError } = useToast();

  const notificationTypes = [
    {
      value: "BOOKING",
      label: "Booking",
      icon: Calendar,
      color: "from-blue-500 to-cyan-500",
    },
    {
      value: "PAYMENT",
      label: "Payment",
      icon: Target,
      color: "from-emerald-500 to-teal-500",
    },
    {
      value: "REVIEW",
      label: "Review",
      icon: Star,
      color: "from-amber-500 to-orange-500",
    },
    {
      value: "CHAT",
      label: "Chat",
      icon: MessageSquare,
      color: "from-purple-500 to-pink-500",
    },
    {
      value: "SYSTEM",
      label: "System",
      icon: Settings,
      color: "from-slate-500 to-slate-600",
    },
  ];

  useEffect(() => {
    if (notification && isEditing) {
      setFormData({
        userIdReceive: notification.userIdReceive || "",
        type: notification.type || "BOOKING",
        title: notification.title || "",
        message: notification.message || "",
        imageUrl: notification.imageUrl || "",
        relatedId: notification.relatedId || "",
      });
    } else {
      setFormData({
        userIdReceive: "",
        type: "BOOKING",
        title: "",
        message: "",
        imageUrl: "",
        relatedId: "",
      });
    }
    setValidationErrors({});
  }, [notification, isEditing, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setValidationErrors({});

    try {
      let response;
      if (isEditing) {
        response = await notificationAPI.updateNotification(
          notification.id,
          formData
        );
      } else {
        response = await notificationAPI.createNotification(formData);
      }

      showSuccess(
        `Notification ${isEditing ? "updated" : "created"} successfully!`
      );
      onSave(response.data);
      onClose();
    } catch (error) {
      const parsedError = parseValidationErrors(error);
      if (parsedError.type === "validation") {
        setValidationErrors(parsedError.fieldErrors);
        showError("Please fix the validation errors");
      } else {
        showError(parsedError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const generateSampleData = () => {
    setFormData({
      userIdReceive: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      type: "BOOKING",
      title: "Booking Confirmation",
      message:
        "Your pet grooming appointment has been confirmed for tomorrow at 2:00 PM. Please arrive 10 minutes early.",
      imageUrl: "https://via.placeholder.com/300x200",
      relatedId: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-10"></div>
          <div className="relative p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
                  {isEditing ? (
                    <Edit className="w-6 h-6 text-white" />
                  ) : (
                    <Plus className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">
                    {isEditing
                      ? "Edit Notification"
                      : "Create New Notification"}
                  </h2>
                  <p className="text-slate-600 mt-1">
                    {isEditing
                      ? "Update notification details"
                      : "Send a new notification to users"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quick Actions */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={generateSampleData}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-xl hover:from-purple-200 hover:to-pink-200 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Generate Sample Data
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* User ID */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" />
                  User ID Receive *
                </label>
                <input
                  type="text"
                  value={formData.userIdReceive}
                  onChange={(e) =>
                    handleInputChange("userIdReceive", e.target.value)
                  }
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                    validationErrors.userIdReceive
                      ? "border-red-500"
                      : "border-slate-300"
                  }`}
                  placeholder="3fa85f64-5717-4562-b3fc-2c963f66afa6"
                  required
                />
                {validationErrors.userIdReceive && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.userIdReceive}
                  </p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-500" />
                  Notification Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {notificationTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => handleInputChange("type", type.value)}
                        className={`p-3 rounded-xl border-2 transition-all flex items-center gap-2 ${
                          formData.type === type.value
                            ? `bg-gradient-to-r ${type.color} text-white border-transparent shadow-lg`
                            : "border-slate-300 hover:border-slate-400 bg-white"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {type.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {validationErrors.type && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.type}
                  </p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-500" />
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all ${
                    validationErrors.title
                      ? "border-red-500"
                      : "border-slate-300"
                  }`}
                  placeholder="Notification title"
                  required
                />
                {validationErrors.title && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.title}
                  </p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Image URL */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-pink-500" />
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    handleInputChange("imageUrl", e.target.value)
                  }
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-all ${
                    validationErrors.imageUrl
                      ? "border-red-500"
                      : "border-slate-300"
                  }`}
                  placeholder="https://example.com/image.jpg"
                />
                {validationErrors.imageUrl && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.imageUrl}
                  </p>
                )}
                {formData.imageUrl && (
                  <div className="mt-3">
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-xl border-2 border-white shadow-lg"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              {/* Related ID */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <ExternalLink className="w-4 h-4 text-amber-500" />
                  Related ID
                </label>
                <input
                  type="text"
                  value={formData.relatedId}
                  onChange={(e) =>
                    handleInputChange("relatedId", e.target.value)
                  }
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${
                    validationErrors.relatedId
                      ? "border-red-500"
                      : "border-slate-300"
                  }`}
                  placeholder="3fa85f64-5717-4562-b3fc-2c963f66afa6"
                />
                {validationErrors.relatedId && (
                  <p className="mt-1 text-sm text-red-600">
                    {validationErrors.relatedId}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              Message *
            </label>
            <textarea
              value={formData.message}
              onChange={(e) => handleInputChange("message", e.target.value)}
              rows={4}
              className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none ${
                validationErrors.message ? "border-red-500" : "border-slate-300"
              }`}
              placeholder="Enter your notification message here..."
              required
            />
            {validationErrors.message && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-slate-700 bg-white border-2 border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : isEditing ? (
                <Edit className="w-5 h-5" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {loading
                ? "Processing..."
                : isEditing
                ? "Update Notification"
                : "Send Notification"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Actions Dropdown Component
const ActionsDropdown = ({
  notification,
  onView,
  onEdit,
  onDelete,
  onClose,
  isOpen,
}) => {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-8 top-full mt-2 w-48 bg-white rounded-xl shadow-xl ring-1 ring-slate-200 z-20 overflow-hidden"
    >
      <div className="py-1">
        <button
          onClick={() => {
            onView(notification.id);
            onClose();
          }}
          className="w-full text-left flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <Eye className="w-4 h-4 mr-3" />
          View Details
        </button>
        <button
          onClick={() => {
            onEdit(notification.id);
            onClose();
          }}
          className="w-full text-left flex items-center px-4 py-3 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
        >
          <Edit className="w-4 h-4 mr-3" />
          Edit Notification
        </button>
        <div className="border-t border-slate-100 my-1"></div>
        <button
          onClick={() => {
            onDelete(notification.id, notification.title);
            onClose();
          }}
          className="w-full text-left flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-3" />
          Delete Notification
        </button>
      </div>
    </div>
  );
};

// Main Notification Management Component
const NotificationManagement = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

  const [filters, setFilters] = useState({
    query: "",
    type: "",
    isRead: "",
  });

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const { showSuccess, showError } = useToast();
  const debouncedQuery = useDebounce(filters.query, 500);

  const notificationTypes = [
    { value: "BOOKING", label: "Booking", color: "text-blue-500" },
    { value: "PAYMENT", label: "Payment", color: "text-emerald-500" },
    { value: "REVIEW", label: "Review", color: "text-amber-500" },
    { value: "CHAT", label: "Chat", color: "text-purple-500" },
    { value: "SYSTEM", label: "System", color: "text-slate-500" },
  ];

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        size: pagination.size,
        sortBy,
        sort: sortOrder,
        ...(debouncedQuery && { query: debouncedQuery }),
        ...(filters.type && { type: filters.type }),
        ...(filters.isRead !== "" && { isRead: filters.isRead === "true" }),
      };

      const response = await notificationAPI.getAllNotifications(params);
      setNotifications(response.data.data || []);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.paging.totalPage,
        totalElements: response.data.paging.totalItem,
        page: response.data.paging.pageNumber,
        size: response.data.paging.pageSize,
      }));
    } catch (error) {
      const parsedError = parseValidationErrors(error);
      showError(parsedError.message);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.size,
    debouncedQuery,
    filters.type,
    filters.isRead,
    sortBy,
    sortOrder,
    showError,
  ]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleSearch = (e) => {
    setFilters((prev) => ({ ...prev, query: e.target.value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleViewNotification = async (notificationId) => {
    try {
      const response = await notificationAPI.getNotification(notificationId);
      setSelectedNotification(response.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      const parsedError = parseValidationErrors(error);
      showError(parsedError.message);
    }
  };

  const handleEditNotification = async (notificationId) => {
    try {
      const response = await notificationAPI.getNotification(notificationId);
      setSelectedNotification(response.data);
      setIsEditing(true);
      setIsEditorModalOpen(true);
    } catch (error) {
      const parsedError = parseValidationErrors(error);
      showError(parsedError.message);
    }
  };

  const handleDeleteNotification = async (
    notificationId,
    notificationTitle
  ) => {
    if (
      !window.confirm(`Are you sure you want to delete "${notificationTitle}"?`)
    ) {
      return;
    }

    try {
      await notificationAPI.deleteNotification(notificationId);
      showSuccess("Notification deleted successfully!");
      loadNotifications();
    } catch (error) {
      const parsedError = parseValidationErrors(error);
      showError(parsedError.message);
    }
  };

  const handleCreateNew = () => {
    setSelectedNotification(null);
    setIsEditing(false);
    setIsEditorModalOpen(true);
  };

  const handleSave = () => {
    loadNotifications();
  };

  const resetFilters = () => {
    setFilters({ query: "", type: "", isRead: "" });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const hasActiveFilters = filters.query || filters.type || filters.isRead;

  const getTypeIcon = (type) => {
    const icons = {
      BOOKING: Calendar,
      PAYMENT: Target,
      REVIEW: Star,
      CHAT: MessageSquare,
      SYSTEM: Settings,
    };
    return icons[type] || Settings;
  };

  const getTypeBadge = (type) => {
    const styles = {
      BOOKING: "bg-blue-100 text-blue-800",
      PAYMENT: "bg-emerald-100 text-emerald-800",
      REVIEW: "bg-amber-100 text-amber-800",
      CHAT: "bg-purple-100 text-purple-800",
      SYSTEM: "bg-slate-100 text-slate-800",
    };
    return styles[type] || styles.SYSTEM;
  };

  // Statistics
  const stats = {
    total: notifications.length,
    unread: notifications.filter((n) => !n.isRead).length,
    read: notifications.filter((n) => n.isRead).length,
    byType: notificationTypes.map((type) => ({
      ...type,
      count: notifications.filter((n) => n.type === type.value).length,
    })),
  };

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-full p-4 md:p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-4 mb-4">
          <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl shadow-lg">
            <Bell className="w-10 h-10 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
              Notification Management
            </h1>
            <p className="text-slate-600 mt-1">
              Manage and monitor all system notifications
            </p>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">
                Total Notifications
              </p>
              <p className="text-3xl font-bold text-slate-900">
                {formatNumber(stats.total)}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl">
              <Bell className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Unread</p>
              <p className="text-3xl font-bold text-amber-600">
                {formatNumber(stats.unread)}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Read</p>
              <p className="text-3xl font-bold text-emerald-600">
                {formatNumber(stats.read)}
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Success Rate</p>
              <p className="text-3xl font-bold text-purple-600">
                {stats.total > 0
                  ? Math.round((stats.read / stats.total) * 100)
                  : 0}
                %
              </p>
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={loadNotifications}
            className="p-3 text-slate-500 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 hover:text-slate-600 transition-colors shadow-sm"
            title="Refresh"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Activity className="w-4 h-4 text-emerald-500" />
            <span>Real-time updates</span>
          </div>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-5 h-5" />
          Create Notification
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm p-6 mb-6 border border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={filters.query}
              onChange={handleSearch}
              className="pl-10 pr-4 py-3 w-full border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>

          <select
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="px-4 py-3 w-full border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">All Types</option>
            {notificationTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>

          <select
            value={filters.isRead}
            onChange={(e) => handleFilterChange("isRead", e.target.value)}
            className="px-4 py-3 w-full border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          >
            <option value="">All Status</option>
            <option value="true">Read</option>
            <option value="false">Unread</option>
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
            >
              <XCircle className="w-4 h-4" />
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* Notifications Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-gradient-to-r from-slate-50 to-blue-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Notification
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th
                  className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center">
                    Created
                    {sortBy === "createdAt" && (
                      <span className="ml-1.5">
                        {sortOrder === "asc" ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
                <th className="relative px-6 py-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-16">
                    <div className="flex justify-center items-center text-slate-500">
                      <RefreshCw className="w-8 h-8 animate-spin mr-3" />
                      <span className="text-lg">Loading notifications...</span>
                    </div>
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-16">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-8 h-8 text-slate-400" />
                      </div>
                      <h3 className="text-lg font-medium text-slate-800">
                        No notifications found
                      </h3>
                      <p className="text-slate-500 mt-2">
                        Try adjusting your filters or create a new notification
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                notifications.map((notification) => (
                  <tr
                    key={notification.id}
                    className={`hover:bg-slate-50 transition-colors ${
                      !notification.isRead
                        ? "bg-gradient-to-r from-blue-50/30 to-indigo-50/30"
                        : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {notification.imageUrl ? (
                            <img
                              className="h-12 w-12 rounded-xl object-cover shadow-sm"
                              src={notification.imageUrl}
                              alt=""
                            />
                          ) : (
                            <div className="h-12 w-12 bg-gradient-to-r from-slate-200 to-slate-300 rounded-xl flex items-center justify-center">
                              <Bell className="w-6 h-6 text-slate-400" />
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900 line-clamp-1">
                            {notification.title}
                          </div>
                          <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                            {notification.message}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(
                            notification.type
                          )}`}
                        >
                          {notification.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-900 font-mono">
                        {notification.userIdReceive.substring(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {notification.isRead ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Read
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Unread
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate2(notification.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium relative">
                      <button
                        onClick={() =>
                          setActiveDropdown(
                            activeDropdown === notification.id
                              ? null
                              : notification.id
                          )
                        }
                        className="p-2 text-slate-500 rounded-full hover:bg-slate-100 hover:text-slate-700 transition-colors"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      <ActionsDropdown
                        notification={notification}
                        isOpen={activeDropdown === notification.id}
                        onClose={() => setActiveDropdown(null)}
                        onView={handleViewNotification}
                        onEdit={handleEditNotification}
                        onDelete={handleDeleteNotification}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-6 py-4 flex items-center justify-between border-t border-slate-200">
            <div className="flex items-center text-sm text-slate-700">
              <span>
                Showing {(pagination.page - 1) * pagination.size + 1} to{" "}
                {Math.min(
                  pagination.page * pagination.size,
                  pagination.totalElements
                )}{" "}
                of {formatNumber(pagination.totalElements)} results
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 text-sm font-medium text-slate-700">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <NotificationDetailModal
        notification={selectedNotification}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={(notification) => {
          setSelectedNotification(notification);
          setIsDetailModalOpen(false);
          setIsEditing(true);
          setIsEditorModalOpen(true);
        }}
        onDelete={(notification) => {
          setIsDetailModalOpen(false);
          handleDeleteNotification(notification.id, notification.title);
        }}
      />

      <NotificationEditorModal
        notification={selectedNotification}
        isOpen={isEditorModalOpen}
        onClose={() => setIsEditorModalOpen(false)}
        onSave={handleSave}
        isEditing={isEditing}
      />
    </div>
  );
};

export default NotificationManagement;
