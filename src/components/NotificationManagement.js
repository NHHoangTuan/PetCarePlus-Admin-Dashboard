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
import ConfirmationModal from "./common/ConfirmationModal";

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

                {notification.updatedAt && (
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
                )}

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
          {notification.updatedAt && (
            <div className="text-sm text-slate-500">
              Last updated: {formatDate2(notification.updatedAt)}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-2xl hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => onEdit(notification)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-2xl hover:from-blue-600 hover:to-blue-700 transition-all flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => onDelete(notification)}
              className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl hover:from-red-600 hover:to-red-700 transition-all flex items-center gap-2"
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
              className="px-6 py-3 text-slate-700 bg-white border-2 border-slate-300 rounded-2xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 transition-all flex items-center gap-2"
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

  const [confirmationModal, setConfirmationModal] = useState({});

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
    setConfirmationModal({
      isOpen: true,
      type: "danger",
      title: `Delete Notification`,
      message: `Are you sure you want to delete ${notificationTitle}?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      icon: Trash2,
      onConfirm: async () => {
        setConfirmationModal((prev) => ({ ...prev, isOpen: false }));

        try {
          await notificationAPI.deleteNotification(notificationId);
          showSuccess("Notification deleted successfully!");
          loadNotifications();
        } catch (error) {
          const parsedError = parseValidationErrors(error);
          showError(parsedError.message);
        }
      },
    });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
    });
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header Section with Gradient */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 opacity-10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjAyIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPgo8L2c+Cjwvc3ZnPg==')]"></div>

        <div className="relative px-8 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl shadow-lg">
                  <Bell className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl leading-normal font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                    Notification Management
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Manage and monitor all system notifications
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <Bell className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(pagination.totalElements)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total Notifications
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(stats.unread)}
                      </p>
                      <p className="text-sm text-gray-600">Unread</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(stats.read)}
                      </p>
                      <p className="text-sm text-gray-600">Read</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={loadNotifications}
                className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <RefreshCw className="w-5 h-5 relative z-10" />
                <span className="relative z-10 font-medium">Refresh</span>
              </button>

              <button
                onClick={handleCreateNew}
                className="group relative px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Plus className="w-5 h-5 relative z-10" />
                <span className="relative z-10 font-medium">
                  Create Notification
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="px-8 -mt-6 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Filters & Search
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Search Notifications
              </label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-800 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search title, message..."
                  value={filters.query}
                  onChange={handleSearch}
                  className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
                />
              </div>
            </div>

            {/* Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Type</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange("type", e.target.value)}
                className="px-4 py-3 w-full border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
              >
                <option value="">All Types</option>
                {notificationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={filters.isRead}
                onChange={(e) => handleFilterChange("isRead", e.target.value)}
                className="px-4 py-3 w-full border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
              >
                <option value="">All Status</option>
                <option value="true">Read</option>
                <option value="false">Unread</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 mt-8 pb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <Bell className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Notification Directory
                </h3>
              </div>
              <div className="text-sm text-gray-600">
                {formatNumber(pagination.totalElements)} notifications total
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Notification
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Recipient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th
                    onClick={() => handleSort("createdAt")}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Created
                      {sortBy === "createdAt" && (
                        <div className="p-1 bg-blue-100 rounded">
                          {sortOrder === "asc" ? (
                            <ChevronUp className="w-3 h-3 text-blue-600" />
                          ) : (
                            <ChevronDown className="w-3 h-3 text-blue-600" />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="relative">
                          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                          <Bell className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <div className="text-gray-600">
                          Loading notifications...
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : notifications.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-8 py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="p-6 bg-gray-100 rounded-full">
                          <Bell className="w-12 h-12 text-gray-400" />
                        </div>
                        <div className="text-gray-500 text-lg">
                          No notifications found
                        </div>
                        <div className="text-gray-400 text-sm">
                          Try adjusting your search filters
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  notifications.map((notification) => (
                    <tr
                      key={notification.id}
                      className={`hover:bg-blue-50/50 transition-all duration-200 group ${
                        !notification.isRead ? "bg-blue-50/30" : ""
                      }`}
                    >
                      <td className="px-6 py-6 whitespace-nowrap text-left">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            {notification.imageUrl ? (
                              <img
                                src={notification.imageUrl}
                                alt={notification.title}
                                className="w-10 h-10 rounded-2xl object-cover border-2 border-white shadow-lg group-hover:shadow-xl transition-shadow duration-300"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center shadow-lg">
                                <Bell className="w-5 h-5 text-gray-500" />
                              </div>
                            )}
                            <div
                              className="w-10 h-10 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl items-center justify-center shadow-lg"
                              style={{ display: "none" }}
                            >
                              <Bell className="w-5 h-5 text-gray-500" />
                            </div>
                            {!notification.isRead && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          <div className="flex flex-col items-start">
                            <div className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {notification.title
                                ? notification.title.length > 24
                                  ? notification.title.substring(0, 24) + "..."
                                  : notification.title
                                : ""}
                            </div>
                            <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                              {notification.message
                                ? notification.message.length > 32
                                  ? notification.message.substring(0, 32) +
                                    "..."
                                  : notification.message
                                : ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-left">
                        <div className="flex items-center gap-3">
                          {/* <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl">
                            {React.createElement(
                              getTypeIcon(notification.type),
                              { className: "w-5 h-5 text-blue-600" }
                            )}
                          </div> */}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getTypeBadge(
                              notification.type
                            )}`}
                          >
                            {notification.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-mono">
                          <User className="w-4 h-4" />
                          {notification.userIdReceive.substring(0, 6)}...
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-left">
                        <div className="flex items-center gap-2">
                          {notification.isRead ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Read
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                              <AlertCircle className="w-3 h-3 mr-1" />
                              Unread
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-left">
                        <div className="text-sm text-gray-600 font-medium">
                          {formatDate2(notification.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap relative text-left">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleViewNotification(notification.id)
                            }
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-all duration-200 hover:scale-110"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleEditNotification(notification.id)
                            }
                            className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-xl transition-all duration-200 hover:scale-110"
                            title="Edit Notification"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteNotification(
                                notification.id,
                                notification.title
                              )
                            }
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-all duration-200 hover:scale-110"
                            title="Delete Notification"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Enhanced Pagination */}

          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-bold text-blue-600">
                    {formatNumber((pagination.page - 1) * pagination.size + 1)}
                  </span>{" "}
                  to{" "}
                  <span className="font-bold text-blue-600">
                    {formatNumber(
                      Math.min(
                        pagination.page * pagination.size,
                        pagination.totalElements
                      )
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-blue-600">
                    {formatNumber(pagination.totalElements)}
                  </span>{" "}
                  results
                </div>
              </div>
              {pagination.totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {[...Array(Math.min(5, pagination.totalPages))].map(
                      (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => handlePageChange(page)}
                            className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
                              pagination.page === page
                                ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                                : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        );
                      }
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
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

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={closeConfirmationModal}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText={confirmationModal.confirmText}
        cancelText={confirmationModal.cancelText}
        type={confirmationModal.type}
        icon={confirmationModal.icon}
        isLoading={confirmationModal.isLoading}
      />
    </div>
  );
};

export default NotificationManagement;
