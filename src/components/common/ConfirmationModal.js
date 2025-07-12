// src/components/common/ConfirmationModal.js
import React from "react";
import {
  AlertTriangle,
  CheckCircle,
  X,
  Ban,
  Trash2,
  UserX,
} from "lucide-react";

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "warning", // "warning", "danger", "success", "info"
  icon: CustomIcon,
  isLoading = false,
  children,
}) => {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case "danger":
        return {
          iconColor: "text-red-600",
          iconBg: "bg-red-100",
          confirmButton: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
          defaultIcon: AlertTriangle,
        };
      case "success":
        return {
          iconColor: "text-green-600",
          iconBg: "bg-green-100",
          confirmButton: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
          defaultIcon: CheckCircle,
        };
      case "warning":
        return {
          iconColor: "text-yellow-600",
          iconBg: "bg-yellow-100",
          confirmButton:
            "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
          defaultIcon: AlertTriangle,
        };
      case "info":
        return {
          iconColor: "text-blue-600",
          iconBg: "bg-blue-100",
          confirmButton: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
          defaultIcon: AlertTriangle,
        };
      default:
        return {
          iconColor: "text-gray-600",
          iconBg: "bg-gray-100",
          confirmButton: "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500",
          defaultIcon: AlertTriangle,
        };
    }
  };

  const styles = getTypeStyles();
  const IconComponent = CustomIcon || styles.defaultIcon;

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          disabled={isLoading}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div
            className={`mx-auto flex items-center justify-center w-12 h-12 rounded-full ${styles.iconBg} mb-4`}
          >
            <IconComponent className={`w-6 h-6 ${styles.iconColor}`} />
          </div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

          {/* Message */}
          <p className="text-sm text-gray-600 mb-6">{message}</p>

          {/* Custom Children */}
          {children && <div className="mb-6">{children}</div>}

          {/* Buttons */}
          <div className="flex gap-3 justify-center">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {cancelText}
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className={`px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${styles.confirmButton}`}
            >
              {isLoading && (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              )}
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
