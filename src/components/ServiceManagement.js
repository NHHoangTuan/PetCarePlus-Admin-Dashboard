// src/components/ServiceManagement.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Package,
  AlertCircle,
  Upload,
  Loader,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Filter,
} from "lucide-react";
import { serviceAPI } from "../services/api";
import { parseValidationErrors } from "../utils/errorHandler";
import {
  compressAndUpload,
  uploadToCloudinary,
  validateImageFile,
} from "../utils/cloudinaryUpload";
import { formatDate2 } from "../utils/dateUtils";
import { useDebounce } from "../hooks/useDebounce";
import { formatCurrency } from "../utils/formatUtils";
import { useToast } from "../context/ToastContext";
import { formatPrice, formatNumber } from "../utils/formatUtils";

// Service Detail/Edit Modal Component
const ServiceModal = ({ service, isOpen, onClose, onSave, mode = "view" }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    iconUrl: "",
    basePrice: 0,
  });
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [previewImage, setPreviewImage] = useState("");
  const [compressionEnabled, setCompressionEnabled] = useState(true);
  const [compressionQuality, setCompressionQuality] = useState("icon"); // low, medium, high, icon
  const fileInputRef = useRef(null);
  // Add toast hook
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || "",
        description: service.description || "",
        iconUrl: service.iconUrl || "",
        basePrice: service.basePrice || 0,
      });
      setPreviewImage(service.iconUrl || "");
    } else {
      setFormData({
        name: "",
        description: "",
        iconUrl: "",
        basePrice: 0,
      });
      setPreviewImage("");
    }
    setError("");
    setFieldErrors({});
  }, [service, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    try {
      if (service) {
        await serviceAPI.updateService(service.id, formData);
      } else {
        await serviceAPI.createService(formData);
      }
      onSave();
      onClose();
    } catch (err) {
      const parsedError = parseValidationErrors(err);

      if (parsedError.type === "validation") {
        setFieldErrors(parsedError.fieldErrors);
        setError(parsedError.message);
      } else {
        setError(parsedError.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "basePrice" ? parseFloat(value) || 0 : value,
    }));

    // Update preview image when URL changes
    if (name === "iconUrl") {
      setPreviewImage(value);
    }

    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // const formatDate = (dateString) => {
  //   return new Date(dateString).toLocaleDateString("en-US", {
  //     year: "numeric",
  //     month: "long",
  //     day: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   });
  // };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      setFieldErrors((prev) => ({
        ...prev,
        iconUrl: validation.error,
      }));
      return;
    }

    // Clear any previous errors
    setFieldErrors((prev) => ({
      ...prev,
      iconUrl: "",
    }));

    setUploadingImage(true);

    try {
      let result;

      if (compressionEnabled) {
        // Upload with compression
        result = await compressAndUpload(file, {
          forServiceIcon: compressionQuality === "icon",
          maxWidth: compressionQuality === "icon" ? 200 : 800,
          maxHeight: compressionQuality === "icon" ? 200 : 600,
          quality:
            compressionQuality === "low"
              ? 0.6
              : compressionQuality === "medium"
              ? 0.8
              : 0.9,
        });
      } else {
        // Upload original file
        result = await uploadToCloudinary(file);
      }

      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          iconUrl: result.url,
        }));
        setPreviewImage(result.url);
      } else {
        setFieldErrors((prev) => ({
          ...prev,
          iconUrl: result.error || "Upload failed",
        }));
      }
    } catch (error) {
      setFieldErrors((prev) => ({
        ...prev,
        iconUrl: "Failed to upload image",
      }));
    } finally {
      setUploadingImage(false);
    }

    // Clear the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({
      ...prev,
      iconUrl: "",
    }));
    setPreviewImage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const getFieldError = (fieldName) => fieldErrors[fieldName];
  const hasFieldError = (fieldName) => !!fieldErrors[fieldName];

  if (!isOpen) return null;

  const isEditMode = mode === "edit" || mode === "create";
  const title =
    mode === "create"
      ? "Create New Service"
      : mode === "edit"
      ? "Edit Service"
      : "Service Details";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header with Gradient */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-10"></div>
          <div className="relative p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 shadow-lg">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">
                    {title}
                  </h2>
                  <p className="text-slate-600 text-sm">
                    {mode === "create"
                      ? "Add a new service to the system"
                      : mode === "edit"
                      ? "Modify service information"
                      : "View service details"}
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

        {isEditMode ? (
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Service Name */}
                  <div className="group">
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Service Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-2xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                        hasFieldError("name")
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                          : "border-slate-300 bg-white hover:border-slate-400"
                      }`}
                      placeholder="Enter service name"
                    />
                    {hasFieldError("name") && (
                      <div className="mt-2 flex items-center text-sm text-red-600 bg-red-50 rounded-xl p-2">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        {getFieldError("name")}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="group">
                    <label
                      htmlFor="description"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      value={formData.description}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-2xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none ${
                        hasFieldError("description")
                          ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                          : "border-slate-300 bg-white hover:border-slate-400"
                      }`}
                      placeholder="Enter service description"
                    />
                    {hasFieldError("description") && (
                      <div className="mt-2 flex items-center text-sm text-red-600 bg-red-50 rounded-xl p-2">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        {getFieldError("description")}
                      </div>
                    )}
                  </div>

                  {/* Base Price */}
                  <div className="group">
                    <label
                      htmlFor="basePrice"
                      className="block text-sm font-semibold text-slate-700 mb-2"
                    >
                      Base Price (VND)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="basePrice"
                        name="basePrice"
                        min="0"
                        step="0.01"
                        required
                        value={formData.basePrice}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 pl-12 border rounded-2xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                          hasFieldError("basePrice")
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                            : "border-slate-300 bg-white hover:border-slate-400"
                        }`}
                        placeholder="0.00"
                      />
                      <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500">
                        ₫
                      </div>
                    </div>
                    {hasFieldError("basePrice") && (
                      <div className="mt-2 flex items-center text-sm text-red-600 bg-red-50 rounded-xl p-2">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        {getFieldError("basePrice")}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Service Icon */}
                  <div className="group">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Service Icon
                    </label>

                    {/* Compression Settings */}
                    <div className="mb-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-slate-200">
                      <div className="flex items-center justify-between mb-3">
                        <label className="flex items-center text-sm font-medium text-slate-700">
                          <input
                            type="checkbox"
                            checked={compressionEnabled}
                            onChange={(e) =>
                              setCompressionEnabled(e.target.checked)
                            }
                            className="mr-3 w-4 h-4 text-blue-600 bg-white border-slate-300 rounded focus:ring-blue-500"
                          />
                          <Sliders className="w-4 h-4 mr-2 text-blue-600" />
                          Enable compression before upload
                        </label>
                      </div>

                      {compressionEnabled && (
                        <div className="mt-3">
                          <label className="block text-xs font-medium text-slate-600 mb-2">
                            Quality Settings:
                          </label>
                          <select
                            value={compressionQuality}
                            onChange={(e) =>
                              setCompressionQuality(e.target.value)
                            }
                            className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="icon">
                              Icon (200x200, high quality)
                            </option>
                            <option value="low">
                              Low (400x300, 60% quality)
                            </option>
                            <option value="medium">
                              Medium (800x600, 80% quality)
                            </option>
                            <option value="high">
                              High (1200x900, 90% quality)
                            </option>
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Image Preview */}
                    {previewImage && (
                      <div className="mb-4 relative inline-block">
                        <div className="relative">
                          <img
                            src={previewImage}
                            alt="Service icon preview"
                            className="w-24 h-24 object-cover rounded-2xl border-4 border-white shadow-lg"
                            onError={(e) => {
                              e.target.style.display = "none";
                              setPreviewImage("");
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Upload Button */}
                    <div className="flex gap-3 mb-4">
                      <button
                        type="button"
                        onClick={handleUploadClick}
                        disabled={uploadingImage}
                        className={`group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                          uploadingImage ? "animate-pulse" : ""
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        {uploadingImage ? (
                          <Loader className="w-5 h-5 animate-spin relative z-10" />
                        ) : (
                          <Upload className="w-5 h-5 relative z-10" />
                        )}
                        <span className="relative z-10 font-medium">
                          {uploadingImage
                            ? "Uploading..."
                            : compressionEnabled
                            ? "Compress & Upload"
                            : "Upload Image"}
                        </span>
                      </button>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </div>

                    {/* Manual URL Input */}
                    <div className="space-y-2">
                      <div className="text-sm font-medium text-slate-600">
                        Or enter URL manually:
                      </div>
                      <input
                        type="url"
                        id="iconUrl"
                        name="iconUrl"
                        value={formData.iconUrl}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 border rounded-2xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
                          hasFieldError("iconUrl")
                            ? "border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50"
                            : "border-slate-300 bg-white hover:border-slate-400"
                        }`}
                        placeholder="https://example.com/icon.png"
                      />

                      {hasFieldError("iconUrl") && (
                        <div className="mt-2 flex items-center text-sm text-red-600 bg-red-50 rounded-xl p-2">
                          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                          {getFieldError("iconUrl")}
                        </div>
                      )}

                      <div className="text-xs text-slate-500 bg-slate-50 rounded-xl p-2">
                        Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center">
                    <div className="p-2 bg-red-500 rounded-xl mr-3">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-red-800 font-medium">Error</h4>
                      <div className="text-red-700 text-sm">{error}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-6 border-t border-slate-200">
                <div className="text-sm text-slate-500">
                  {mode === "create"
                    ? "Create a new service"
                    : "Update service information"}
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 text-slate-700 bg-white border border-slate-300 rounded-2xl hover:bg-slate-50 transition-all duration-200 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`group relative overflow-hidden px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium ${
                      loading ? "animate-pulse" : ""
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {loading ? (
                      <Loader className="w-5 h-5 animate-spin relative z-10" />
                    ) : (
                      <Package className="w-5 h-5 relative z-10" />
                    )}
                    <span className="relative z-10">
                      {loading
                        ? "Saving..."
                        : mode === "create"
                        ? "Create Service"
                        : "Update Service"}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        ) : (
          // View Mode
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Basic Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Service ID */}
                <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-4 border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500 rounded-xl">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Service ID
                      </label>
                      <p className="text-lg font-mono text-slate-900">
                        {service.id}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Service Name
                    </label>
                    <p className="text-lg font-medium text-slate-900">
                      {service?.name}
                    </p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Base Price
                    </label>
                    <p className="text-lg font-bold text-green-600">
                      {formatCurrency(service?.basePrice, "VND")}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Description
                  </label>
                  <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl p-3 border border-slate-200">
                    <p className="text-slate-700 leading-relaxed">
                      {service?.description}
                    </p>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-500 rounded-xl">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Created At
                        </label>
                        <p className="text-sm text-slate-900 font-medium">
                          {formatDate2(service?.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500 rounded-xl">
                        <Package className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-slate-600">
                          Updated At
                        </label>
                        <p className="text-sm text-slate-900 font-medium">
                          {formatDate2(service?.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delete Status */}
                <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-xl ${
                        service?.deletedAt ? "bg-red-500" : "bg-green-500"
                      }`}
                    >
                      <Package className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-600">
                        Status
                      </label>
                      <p
                        className={`text-sm font-medium ${
                          service?.deletedAt ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {service?.deletedAt === null
                          ? "Active"
                          : `Deleted: ${formatDate2(service?.deletedAt)}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Icon */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <label className="text-sm font-semibold text-slate-700 mb-4 block">
                    Service Icon
                  </label>
                  {service?.iconUrl ? (
                    <div className="text-center">
                      <div className="relative inline-block">
                        <img
                          src={service.iconUrl}
                          alt="Service icon"
                          className="w-32 h-32 object-cover rounded-2xl border-4 border-white shadow-lg mx-auto"
                        />
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 to-transparent"></div>
                      </div>
                      <p className="mt-3 text-sm text-slate-500">
                        Service Icon
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-32 h-32 mx-auto bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl flex items-center justify-center">
                        <Package className="w-16 h-16 text-slate-400" />
                      </div>
                      <p className="mt-3 text-sm text-slate-500">
                        No icon available
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-6">
              <div className="text-sm text-slate-500">
                Service details and information
              </div>
              <button
                onClick={onClose}
                className="px-6 py-3 text-slate-700 bg-white border border-slate-300 rounded-2xl hover:bg-slate-50 transition-all duration-200 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ServiceManagement = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState(null);
  const [modalMode, setModalMode] = useState("view"); // view, edit, create
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });
  const [filters, setFilters] = useState({
    query: "",
  });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("asc");

  const { showSuccess, showError, showInfo, showWarning } = useToast();

  const debouncedQuery = useDebounce(filters.query, 500);

  const searchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        size: pagination.size,
        sortBy: sortBy,
        sort: sortOrder,
        filters: {
          query: debouncedQuery, // Use debounced query
        },
      };
      const response = await serviceAPI.searchServices(params);
      setServices(response.data.data);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.paging.totalPage,
        totalElements: response.data.paging.totalItem,
        page: response.data.paging.pageNumber,
        size: response.data.paging.pageSize,
      }));
    } catch (error) {
      console.error("Error searching services:", error);
      showError(
        `Failed to load services: ${
          error.response?.data?.message || error.message
        }`,
        5000
      );
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, debouncedQuery, sortBy, sortOrder]);

  useEffect(() => {
    //loadServices();
    searchServices();
  }, [
    pagination.page,
    pagination.size,
    debouncedQuery,
    sortBy,
    sortOrder,
    searchServices,
  ]);

  // const loadServices = async () => {
  //   setLoading(true);
  //   try {
  //     const params = {
  //       page: pagination.page,
  //       size: pagination.size,
  //       sortBy: sortBy,
  //       sort: sortOrder,
  //       filters: {
  //         name: filters.search,
  //       },
  //     };

  //     const response = await serviceAPI.getServices(params);

  //     setServices(response.data.content);
  //     setPagination((prev) => ({
  //       ...prev,
  //       totalPages: response.data.totalPages,
  //       totalElements: response.data.totalElements,
  //     }));
  //   } catch (error) {
  //     console.error("Error loading services:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSearch = (e) => {
    setFilters((prev) => ({ ...prev, query: e.target.value }));
    setPagination((prev) => ({ ...prev, page: 0 }));
  };

  const isSearching =
    filters.query !== debouncedQuery && filters.query.length > 0;

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const handleViewService = async (serviceId) => {
    try {
      const response = await serviceAPI.getServiceById(serviceId);
      setSelectedService(response.data);
      setModalMode("view");
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error loading service details:", error);
      showError(
        `Failed to load service details: ${
          error.response?.data?.message || error.message
        }`,
        3000
      );
    }
  };

  const handleEditService = async (serviceId) => {
    try {
      const response = await serviceAPI.getServiceById(serviceId);
      setSelectedService(response.data);
      setModalMode("edit");
      setIsModalOpen(true);
    } catch (error) {
      console.error("Error loading service details:", error);
      showError(
        `Failed to load service details: ${
          error.response?.data?.message || error.message
        }`,
        3000
      );
    }
  };

  const handleCreateService = () => {
    setSelectedService(null);
    setModalMode("create");
    setIsModalOpen(true);
  };

  const handleDeleteService = async (serviceId, serviceName) => {
    if (
      window.confirm(
        `Are you sure you want to delete the service "${serviceName}"?`
      )
    ) {
      try {
        await serviceAPI.deleteService(serviceId);
        //loadServices();
        searchServices();
      } catch (error) {
        console.error("Error deleting service:", error);
        showError(
          `Failed to delete service: ${
            error.response?.data?.message || error.message
          }`,
          3000
        );
      }
    }
  };

  const handleModalSave = () => {
    //loadServices();
    searchServices();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
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
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl leading-normal font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                    Service Management
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Manage and monitor all system services
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <Package className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(pagination.totalElements)}
                      </p>
                      <p className="text-sm text-gray-600">Total Services</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={searchServices}
                className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <RefreshCw className="w-5 h-5 relative z-10" />
                <span className="relative z-10 font-medium">Refresh</span>
              </button>

              <button
                onClick={handleCreateService}
                className="group relative px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Plus className="w-5 h-5 relative z-10" />
                <span className="relative z-10 font-medium">
                  Create Service
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Search Notifications
              </label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-800 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search"
                  value={filters.query}
                  onChange={handleSearch}
                  className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Services Content */}
      <div className="px-8 mt-8 pb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <Package className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Service Directory
                </h3>
              </div>
              <div className="text-sm text-gray-600">
                {formatNumber(pagination.totalElements)} services total
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Base Price
                  </th>
                  <th
                    onClick={() => handleSort("createdAt")}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      Created At
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
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center">
                      No services found
                    </td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr key={service.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="flex items-center">
                          {service.iconUrl ? (
                            <img
                              src={service.iconUrl}
                              alt="Service icon"
                              className="w-12 h-12 object-cover rounded-lg mr-3"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <Package className="w-12 h-12 text-gray-400 mr-3" />
                          )}
                          <div className="text-md font-medium text-gray-900">
                            {service.name}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {service.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="text-md font-semibold text-gray-900">
                          {formatCurrency(service?.basePrice, "VND")}
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-left">
                        <div className="text-sm text-gray-600 font-medium">
                          {formatDate2(service.createdAt)}
                        </div>
                      </td>

                      <td className="px-6 py-6 whitespace-nowrap relative text-left">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewService(service.id)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-all duration-200 hover:scale-110"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleEditService(service.id)}
                            className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-xl transition-all duration-200 hover:scale-110"
                            title="Edit Service"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteService(service.id, service.name)
                            }
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-all duration-200 hover:scale-110"
                            title="Delete Service"
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

      {/* Service Modal */}
      <ServiceModal
        service={selectedService}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleModalSave}
        mode={modalMode}
      />
    </div>
  );
};

export default ServiceManagement;
