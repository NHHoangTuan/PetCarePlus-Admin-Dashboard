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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {isEditMode ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1"
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
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  hasFieldError("name")
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter service name"
              />
              {hasFieldError("name") && (
                <div className="mt-1 flex items-center text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError("name")}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  hasFieldError("description")
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="Enter service description"
              />
              {hasFieldError("description") && (
                <div className="mt-1 flex items-center text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError("description")}
                </div>
              )}
            </div>

            {/* Icon URL with Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Icon
              </label>

              {/* Compression Settings */}
              <div className="mb-3 p-3 bg-gray-50 rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={compressionEnabled}
                      onChange={(e) => setCompressionEnabled(e.target.checked)}
                      className="mr-2"
                    />
                    <Sliders className="w-4 h-4 mr-1" />
                    Enable compression before upload
                  </label>
                </div>

                {compressionEnabled && (
                  <div className="mt-2">
                    <label className="block text-xs text-gray-600 mb-1">
                      Quality:
                    </label>
                    <select
                      value={compressionQuality}
                      onChange={(e) => setCompressionQuality(e.target.value)}
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                    >
                      <option value="icon">Icon (200x200, high quality)</option>
                      <option value="low">Low (400x300, 60% quality)</option>
                      <option value="medium">
                        Medium (800x600, 80% quality)
                      </option>
                      <option value="high">High (1200x900, 90% quality)</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Image Preview */}
              {previewImage && (
                <div className="mb-3 relative inline-block">
                  <img
                    src={previewImage}
                    alt="Service icon preview"
                    className="w-20 h-20 object-cover rounded border"
                    onError={(e) => {
                      e.target.style.display = "none";
                      setPreviewImage("");
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}

              {/* Upload Button */}
              <div className="flex gap-2 mb-2">
                <button
                  type="button"
                  onClick={handleUploadClick}
                  disabled={uploadingImage}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                >
                  {uploadingImage ? (
                    <Loader className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  {uploadingImage
                    ? "Uploading..."
                    : compressionEnabled
                    ? "Compress & Upload"
                    : "Upload Image"}
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
              <div className="text-sm text-gray-500 mb-2">
                Or enter URL manually:
              </div>
              <input
                type="url"
                id="iconUrl"
                name="iconUrl"
                value={formData.iconUrl}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  hasFieldError("iconUrl")
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="https://example.com/icon.png"
              />

              {hasFieldError("iconUrl") && (
                <div className="mt-1 flex items-center text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError("iconUrl")}
                </div>
              )}

              <div className="mt-1 text-xs text-gray-500">
                Supported formats: JPEG, PNG, GIF, WebP (max 5MB)
              </div>
            </div>

            {/* Icon URL
            <div>
              <label
                htmlFor="iconUrl"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Icon URL
              </label>
              <input
                type="url"
                id="iconUrl"
                name="iconUrl"
                value={formData.iconUrl}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  hasFieldError("iconUrl")
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="https://example.com/icon.png"
              />
              {hasFieldError("iconUrl") && (
                <div className="mt-1 flex items-center text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError("iconUrl")}
                </div>
              )}
              {formData.iconUrl && (
                <div className="mt-2">
                  <img
                    src={formData.iconUrl}
                    alt="Service icon preview"
                    className="w-12 h-12 object-cover rounded border"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
              )}
            </div> */}

            {/* Base Price */}
            <div>
              <label
                htmlFor="basePrice"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Base Price (VND)
              </label>
              <input
                type="number"
                id="basePrice"
                name="basePrice"
                min="0"
                step="0.01"
                required
                value={formData.basePrice}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                  hasFieldError("basePrice")
                    ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                }`}
                placeholder="0.00"
              />
              {hasFieldError("basePrice") && (
                <div className="mt-1 flex items-center text-sm text-red-600">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {getFieldError("basePrice")}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
                  <div className="text-red-600 text-sm">{error}</div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Package className="w-4 h-4" />
                {loading
                  ? "Saving..."
                  : mode === "create"
                  ? "Create Service"
                  : "Update Service"}
              </button>
            </div>
          </form>
        ) : (
          // View Mode
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID
              </label>
              <p className="text-sm text-gray-900">{service.id}</p>
            </div>
            {/* Service Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Service Name
                </label>
                <p className="text-sm text-gray-900">{service?.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base Price
                </label>
                <p className="text-sm text-gray-900 font-semibold">
                  {formatCurrency(service?.basePrice, "VND")}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <p className="text-sm text-gray-900">{service?.description}</p>
            </div>

            {service?.iconUrl && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon
                </label>
                <img
                  src={service.iconUrl}
                  alt="Service icon"
                  className="w-32 h-32 object-cover rounded border "
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Created At
              </label>
              <p className="text-sm text-gray-900">
                {formatDate2(service?.createdAt)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Updated At
              </label>
              <p className="text-sm text-gray-900">
                {formatDate2(service?.updatedAt)}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deleted At
              </label>
              <p className="text-sm text-gray-900">
                {service?.deletedAt === null
                  ? "Not Delete"
                  : formatDate2(service?.deletedAt)}
              </p>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
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
      setServices(response.data.content);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
      }));
    } catch (error) {
      console.error("Error searching services:", error);
      alert("Failed to search services");
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
      alert("Failed to load service details");
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
      alert("Failed to load service details");
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
        alert("Failed to delete service");
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

  // const formatDate = (dateString) => {
  //   return new Date(dateString).toLocaleDateString("en-US", {
  //     year: "numeric",
  //     month: "long",
  //     day: "numeric",
  //     hour: "2-digit",
  //     minute: "2-digit",
  //   });
  // };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Service Management</h1>
        <button
          onClick={handleCreateService}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Service
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search services..."
              value={filters.search}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Base Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <div
                    className="flex items-center cursor-pointer hover:bg-gray-100 rounded px-2 py-1"
                    onClick={() => handleSort("createdAt")}
                  >
                    Created At
                    {sortBy === "createdAt" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {service.iconUrl ? (
                          <img
                            src={service.iconUrl}
                            alt="Service icon"
                            className="w-8 h-8 object-cover rounded mr-3"
                            onError={(e) => {
                              e.target.style.display = "none";
                            }}
                          />
                        ) : (
                          <Package className="w-8 h-8 text-gray-400 mr-3" />
                        )}
                        <div className="text-sm font-medium text-gray-900">
                          {service.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs truncate">
                        {service.description}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(service?.basePrice, "VND")}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate2(service.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewService(service.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEditService(service.id)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Edit Service"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteService(service.id, service.name)
                          }
                          className="text-red-600 hover:text-red-900"
                          title="Delete Service"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 0}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages - 1}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {pagination.page * pagination.size + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      (pagination.page + 1) * pagination.size,
                      pagination.totalElements
                    )}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium">
                    {pagination.totalElements}
                  </span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 0}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {[...Array(Math.min(pagination.totalPages, 5))].map(
                    (_, index) => {
                      const page = index;
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            page === pagination.page
                              ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                              : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                          }`}
                        >
                          {page + 1}
                        </button>
                      );
                    }
                  )}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages - 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
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
