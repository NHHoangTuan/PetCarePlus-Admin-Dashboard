import React, { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  X,
  AlertCircle,
  User,
  Package,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  Settings,
  Loader2,
  RefreshCw,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useToast } from "../context/ToastContext";
import { providerServiceAPI, serviceAPI } from "../services/api";
import { useDebounce } from "../hooks/useDebounce";
import ConfirmationModal from "./common/ConfirmationModal";
import {
  formatPrice,
  formatNumber,
  formatCurrency,
} from "../utils/formatUtils";
import { formatDate2 } from "../utils/dateUtils";

// Provider Service Detail Modal
const ProviderServiceDetailModal = ({
  providerService,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!isOpen || !providerService) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header with Gradient */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-10"></div>
          <div className="relative p-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 shadow-lg">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  Provider Service Details
                </h2>
                <p className="text-slate-600 text-sm">
                  View and manage provider service information
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-8 pb-16">
            {/* Service ID Card */}
            <div className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <Package className="w-6 h-6 text-white" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Service ID
                  </label>
                  <p className="text-lg font-mono text-gray-900">
                    {providerService.id}
                  </p>
                </div>
              </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Service Information */}
              <div className="space-y-6">
                {/* Service Details */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Service Information
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="text-sm font-medium text-gray-600">
                        Service Name
                      </label>
                      <p className="text-lg font-bold text-gray-900">
                        {providerService.serviceName}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="text-sm font-medium text-gray-600">
                        Service ID
                      </label>
                      <p className="text-sm font-mono text-gray-700">
                        {providerService.serviceId}
                      </p>
                    </div>

                    {providerService.iconUrl && (
                      <div className="bg-gray-50 rounded-xl p-4">
                        <label className="text-sm font-medium text-gray-600 mb-2 block">
                          Service Icon
                        </label>
                        <img
                          src={providerService.iconUrl}
                          alt={providerService.serviceName}
                          className="w-16 h-16 rounded-xl object-cover border border-gray-200"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Provider Information */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Provider Information
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="text-sm font-medium text-gray-600">
                        Provider Name
                      </label>
                      <p className="text-lg font-bold text-gray-900">
                        {providerService.providerName}
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <label className="text-sm font-medium text-gray-600">
                        Provider ID
                      </label>
                      <p className="text-sm font-mono text-gray-700">
                        {providerService.providerId}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Pricing & Details */}
              <div className="space-y-6">
                {/* Pricing Information */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Pricing Details
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                      <label className="text-sm font-medium text-blue-600">
                        Base Price
                      </label>
                      <p className="text-2xl font-bold text-blue-700">
                        {formatCurrency(providerService.basePrice, "VND")}
                      </p>
                    </div>

                    {providerService.customPrice > 0 && (
                      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                        <label className="text-sm font-medium text-green-600">
                          Custom Price
                        </label>
                        <p className="text-2xl font-bold text-green-700">
                          {formatCurrency(providerService.customPrice, "VND")}
                        </p>
                      </div>
                    )}

                    {!providerService.customPrice && (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                        <label className="text-sm font-medium text-gray-600">
                          Custom Price
                        </label>
                        <p className="text-sm text-gray-500">
                          Using base price
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Description */}
                {providerService.customDescription && (
                  <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
                        <Settings className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Custom Description
                      </h3>
                    </div>
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4">
                      <p className="text-gray-700 leading-relaxed">
                        {providerService.customDescription}
                      </p>
                    </div>
                  </div>
                )}

                {/* Timeline */}
                <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      Timeline
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-green-800">
                          Service Created
                        </p>
                        <p className="text-sm text-green-600">
                          {formatDate2(providerService.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-t border-gray-200 flex-shrink-0 rounded-b-3xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div className="text-sm text-gray-600">
                Created: {formatDate2(providerService.createdAt)}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-6 py-3 text-gray-700 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-all duration-200 hover:scale-105"
              >
                Close
              </button>

              <button
                onClick={() => onEdit(providerService)}
                className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Edit className="w-5 h-5 relative z-10" />
                <span className="relative z-10 font-medium">Edit Service</span>
              </button>

              <button
                onClick={() => onDelete(providerService)}
                className="group relative px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 flex items-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Trash2 className="w-5 h-5 relative z-10" />
                <span className="relative z-10 font-medium">
                  Delete Service
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Provider Service Editor Modal
const ProviderServiceEditorModal = ({
  providerService,
  isOpen,
  onClose,
  onSave,
  isEditing = false,
}) => {
  const [formData, setFormData] = useState({
    serviceId: "",
    customPrice: 0,
    customDescription: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadServices();
      if (providerService && isEditing) {
        setFormData({
          serviceId: providerService.serviceId || "",
          customPrice: providerService.customPrice || 0,
          customDescription: providerService.customDescription || "",
        });
      } else {
        setFormData({
          serviceId: "",
          customPrice: 0,
          customDescription: "",
        });
      }
      setError("");
      setFieldErrors({});
    }
  }, [providerService, isOpen, isEditing]);

  const loadServices = async () => {
    setLoadingServices(true);
    try {
      const response = await serviceAPI.getServices({ size: 1000 }); // Get all services
      setServices(response.data.data || []);
    } catch (error) {
      console.error("Error loading services:", error);
      showError("Failed to load services");
    } finally {
      setLoadingServices(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFieldErrors({});

    try {
      if (isEditing) {
        await providerServiceAPI.updateProviderService(providerService.id, {
          customPrice: parseFloat(formData.customPrice) || 0,
          customDescription: formData.customDescription,
        });
        showSuccess("Provider service updated successfully");
      } else {
        await providerServiceAPI.createProviderService({
          serviceId: formData.serviceId,
          customPrice: parseFloat(formData.customPrice) || 0,
          customDescription: formData.customDescription,
        });
        showSuccess("Provider service created successfully");
      }

      onSave();
      onClose();
    } catch (err) {
      console.error("Error saving provider service:", err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Failed to save provider service");
      }
      showError("Failed to save provider service");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header with Gradient */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 opacity-10"></div>
          <div className="relative p-6 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  {isEditing
                    ? "Edit Provider Service"
                    : "Create Provider Service"}
                </h2>
                <p className="text-slate-600 text-sm">
                  {isEditing
                    ? "Update provider service details"
                    : "Add a new provider service"}
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

        {/* Form Content */}
        <div className="p-8">
          {error && (
            <div className="mb-6 bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Service Selection - Only for create mode */}
            {!isEditing && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service *
                </label>
                <select
                  name="serviceId"
                  value={formData.serviceId}
                  onChange={handleChange}
                  required
                  disabled={loadingServices}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                >
                  <option value="">
                    {loadingServices
                      ? "Loading services..."
                      : "Select a service"}
                  </option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} -{" "}
                      {formatCurrency(service.basePrice, "VND")}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Custom Price (VND)
              </label>
              <div className="relative">
                <input
                  type="number"
                  name="customPrice"
                  value={formData.customPrice}
                  onChange={handleChange}
                  min="0"
                  step="1000"
                  placeholder="Enter custom price (leave 0 to use base price)"
                  className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                />
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
                  ₫
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Set to 0 to use the base service price
              </p>
            </div>

            {/* Custom Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Custom Description
              </label>
              <textarea
                name="customDescription"
                value={formData.customDescription}
                onChange={handleChange}
                rows="4"
                placeholder="Enter custom description for this provider service..."
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 resize-none"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-gray-700 border border-gray-300 rounded-2xl hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || (!isEditing && !formData.serviceId)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {isEditing ? "Update Service" : "Create Service"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main Provider Service Management Component
const ProviderServiceManagement = () => {
  const [providerServices, setProviderServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    query: "",
    providerId: "",
    serviceId: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    totalElements: 0,
    totalPages: 0,
  });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [selectedProviderService, setSelectedProviderService] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditorModalOpen, setIsEditorModalOpen] = useState(false);
  const [editorMode, setEditorMode] = useState("create");
  const [confirmationModal, setConfirmationModal] = useState({ isOpen: false });
  const { showSuccess, showError } = useToast();

  const debouncedQuery = useDebounce(filters.query, 500);

  const searchProviderServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        size: pagination.size,
        sortBy: sortBy,
        sort: sortOrder,
        filters: {
          search: debouncedQuery,
          ...(filters.providerId && { providerId: filters.providerId }),
          ...(filters.serviceId && { serviceId: filters.serviceId }),
        },
      };

      const response = await providerServiceAPI.getProviderServices(params);

      setProviderServices(response.data.data || []);
      setPagination((prev) => ({
        ...prev,
        totalElements: response.data.paging?.totalItem || 0,
        totalPages: response.data.paging?.totalPage || 0,
      }));
    } catch (error) {
      console.error("Error loading provider services:", error);
      showError("Failed to load provider services");
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.size,
    debouncedQuery,
    sortBy,
    sortOrder,
    filters.providerId,
    filters.serviceId,
    showError,
  ]);

  useEffect(() => {
    searchProviderServices();
  }, [searchProviderServices]);

  const handleSearch = (e) => {
    setFilters((prev) => ({ ...prev, query: e.target.value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleViewProviderService = async (id) => {
    try {
      const response = await providerServiceAPI.getProviderServiceById(id);
      setSelectedProviderService(response.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error("Error loading provider service details:", error);
      showError("Failed to load provider service details");
    }
  };

  const handleEditProviderService = async (providerService) => {
    setSelectedProviderService(providerService);
    setEditorMode("edit");
    setIsEditorModalOpen(true);
  };

  const handleCreateProviderService = () => {
    setSelectedProviderService(null);
    setEditorMode("create");
    setIsEditorModalOpen(true);
  };

  const handleDeleteProviderService = (providerService) => {
    setConfirmationModal({
      isOpen: true,
      type: "danger",
      title: "Delete Provider Service",
      message: `Are you sure you want to delete the provider service for "${providerService.serviceName}" by "${providerService.providerName}"?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      icon: Trash2,
      onConfirm: async () => {
        try {
          await providerServiceAPI.deleteProviderService(providerService.id);
          showSuccess("Provider service deleted successfully");
          searchProviderServices();
        } catch (error) {
          console.error("Error deleting provider service:", error);
          showError("Failed to delete provider service");
        }
        setConfirmationModal({ isOpen: false });
      },
    });
  };

  const isSearching =
    filters.query !== debouncedQuery && filters.query.length > 0;

  // Stats calculation
  const stats = {
    total: pagination.totalElements,
    active: providerServices.filter((ps) => ps.customPrice > 0).length,
    usingBasePrice: providerServices.filter(
      (ps) => !ps.customPrice || ps.customPrice === 0
    ).length,
    withCustomDescription: providerServices.filter((ps) => ps.customDescription)
      .length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header Section */}

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
                  <ShoppingBag className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl leading-normal font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                    Provider Service Management
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Manage services offered by providers
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <ShoppingBag className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(pagination.totalElements)}
                      </p>
                      <p className="text-sm text-gray-600">
                        Total Provider Service
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={searchProviderServices}
                className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <RefreshCw className="w-5 h-5 relative z-10" />
                <span className="relative z-10 font-medium">Refresh</span>
              </button>

              <button
                onClick={handleCreateProviderService}
                className="group relative px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <Plus className="w-5 h-5 relative z-10" />
                <span className="relative z-10 font-medium">
                  Create Provider Service
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
                Search Services
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
                {isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Provider
                </label>
                <input
                  type="text"
                  placeholder="Filter by provider ID..."
                  value={filters.providerId}
                  onChange={(e) =>
                    handleFilterChange("providerId", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                />
              </div>
            </div>

            {/* Service Filter */}
            <div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Service
                </label>
                <input
                  type="text"
                  placeholder="Filter by service ID..."
                  value={filters.serviceId}
                  onChange={(e) =>
                    handleFilterChange("serviceId", e.target.value)
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Services Table */}
      <div className="px-8 mt-8 pb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Provider Services Directory
                </h3>
              </div>
              <div className="text-sm text-gray-600">
                {formatNumber(pagination.totalElements)} provider services total
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("serviceName")}
                  >
                    <div className="flex items-center gap-2">
                      Service
                      {sortBy === "serviceName" && (
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
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("providerName")}
                  >
                    <div className="flex items-center gap-2">
                      Provider
                      {sortBy === "providerName" && (
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
                    Pricing
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Custom Description
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors"
                    onClick={() => handleSort("createdAt")}
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
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                        <p className="text-gray-500">
                          Loading provider services...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : providerServices.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <ShoppingBag className="w-12 h-12 text-gray-300" />
                        <div>
                          <p className="text-lg font-medium text-gray-500">
                            No provider services found
                          </p>
                          <p className="text-gray-400">
                            Try adjusting your search criteria
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  providerServices.map((providerService) => (
                    <tr
                      key={providerService.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-4">
                          {providerService.iconUrl ? (
                            <img
                              src={providerService.iconUrl}
                              alt={providerService.serviceName}
                              className="w-12 h-12 rounded-xl object-cover border border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl flex items-center justify-center">
                              <Package className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="text-md font-semibold text-gray-900">
                              {providerService.serviceName}
                            </div>
                            <div className="text-sm text-gray-500 font-mono">
                              ID: {providerService.serviceId?.substring(0, 8)}
                              ...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                            {providerService.providerName
                              ?.charAt(0)
                              ?.toUpperCase() || "P"}
                          </div>
                          <div>
                            <div className="text-md font-medium text-gray-900">
                              {providerService.providerName}
                            </div>
                            <div className="text-sm text-gray-500 font-mono">
                              ID: {providerService.providerId?.substring(0, 8)}
                              ...
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-600">
                            Base:{" "}
                            <span className="font-medium">
                              {formatCurrency(providerService.basePrice, "VND")}
                            </span>
                          </div>
                          {providerService.customPrice > 0 ? (
                            <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                              Custom:{" "}
                              {formatCurrency(
                                providerService.customPrice,
                                "VND"
                              )}
                            </div>
                          ) : (
                            <div className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-sm">
                              Using base price
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6 text-left">
                        <div className="max-w-xs">
                          {providerService.customDescription ? (
                            <div className="text-sm text-gray-700 line-clamp-2">
                              {providerService.customDescription}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400 italic">
                              No custom description
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="text-sm text-gray-600 font-medium">
                          {formatDate2(providerService.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              handleViewProviderService(providerService.id)
                            }
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-all duration-200 hover:scale-110"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleEditProviderService(providerService)
                            }
                            className="p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-xl transition-all duration-200 hover:scale-110"
                            title="Edit Service"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteProviderService(providerService)
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-sm text-gray-600">
                  Showing {(pagination.page - 1) * pagination.size + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.size,
                    pagination.totalElements
                  )}{" "}
                  of {pagination.totalElements} results
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Previous
                  </button>

                  {[...Array(Math.min(5, pagination.totalPages))].map(
                    (_, index) => {
                      const pageNumber = pagination.page - 2 + index;
                      if (pageNumber < 1 || pageNumber > pagination.totalPages)
                        return null;

                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                            pageNumber === pagination.page
                              ? "bg-blue-500 text-white shadow-lg"
                              : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    }
                  )}

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ProviderServiceDetailModal
        providerService={selectedProviderService}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onEdit={handleEditProviderService}
        onDelete={handleDeleteProviderService}
      />

      <ProviderServiceEditorModal
        providerService={selectedProviderService}
        isOpen={isEditorModalOpen}
        onClose={() => setIsEditorModalOpen(false)}
        onSave={searchProviderServices}
        isEditing={editorMode === "edit"}
      />

      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ isOpen: false })}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        type={confirmationModal.type}
        confirmText={confirmationModal.confirmText}
        cancelText={confirmationModal.cancelText}
      />
    </div>
  );
};

export default ProviderServiceManagement;
