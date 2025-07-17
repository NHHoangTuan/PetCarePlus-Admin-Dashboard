// src/components/BookingManagement.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Eye,
  Trash2,
  X,
  Calendar,
  User,
  Clock,
  CheckCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  ReceiptText,
  RefreshCw,
  AlertCircle,
  Filter,
  Mail,
} from "lucide-react";
import { bookingAPI } from "../services/api";
import { userAPI } from "../services/api";
import { formatDate2 } from "../utils/dateUtils";
import { useDebounce } from "../hooks/useDebounce";
import {
  formatCurrency,
  formatPrice,
  formatNumber,
  formatCompactNumber,
} from "../utils/formatUtils";

import { useToast } from "../context/ToastContext";
import { set } from "@cloudinary/url-gen/actions/variable";

// Booking Detail Modal Component
const BookingDetailModal = ({ booking, isOpen, onClose, onStatusUpdate }) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  useEffect(() => {
    if (booking) {
      setCancelReason("");
      setShowCancelForm(false);
    }
  }, [booking]);

  const handleStatusUpdate = async (newStatus) => {
    if (newStatus === "CANCELLED" && !cancelReason.trim()) {
      setShowCancelForm(true);
      return;
    }

    setUpdatingStatus(true);
    try {
      if (newStatus === "CANCELLED") {
        await bookingAPI.cancelBooking(booking.id, cancelReason);
      } else {
        await bookingAPI.updateBookingStatus(booking.id, newStatus);
      }
      onStatusUpdate();
      onClose();
    } catch (error) {
      console.error("Error updating booking status:", error);
      showError(
        `Failed to update booking status: ${
          error.response?.data?.message || error.message
        }`,
        3000
      );
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      ACCEPTED: "bg-blue-100 text-blue-800",
      ONGOING: "bg-purple-100 text-purple-800",
      SERVICE_DONE: "bg-pink-100 text-green-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      NO_SHOW: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      CANCELLED: "bg-gray-100 text-gray-800",
      REFUNDED: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (!isOpen || !booking) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Booking Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            ID
          </label>
          <p className="text-sm text-gray-900">{booking.id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Booking Info */}
          <div className="space-y-6">
            {/* Booking Status */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">
                Booking Status
              </h3>
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(
                    booking.status
                  )}`}
                >
                  {booking.status}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(
                    booking.paymentStatus
                  )}`}
                >
                  Payment: {booking.paymentStatus}
                </span>
              </div>

              {/* Status Update Buttons */}
              {/* {!showCancelForm &&
                booking.status !== "COMPLETED" &&
                booking.status !== "CANCELLED" && (
                  <div className="flex gap-2 flex-wrap">
                    {booking.status === "PENDING" && (
                      <button
                        onClick={() => handleStatusUpdate("CONFIRMED")}
                        disabled={updatingStatus}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        Confirm
                      </button>
                    )}
                    {(booking.status === "CONFIRMED" ||
                      booking.status === "PENDING") && (
                      <button
                        onClick={() => handleStatusUpdate("IN_PROGRESS")}
                        disabled={updatingStatus}
                        className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                      >
                        Start Service
                      </button>
                    )}
                    {booking.status === "IN_PROGRESS" && (
                      <button
                        onClick={() => handleStatusUpdate("COMPLETED")}
                        disabled={updatingStatus}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 disabled:opacity-50"
                      >
                        Complete
                      </button>
                    )}
                    <button
                      onClick={() => setShowCancelForm(true)}
                      disabled={updatingStatus}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>
                )} */}

              {/* Cancel Form */}
              {showCancelForm && (
                <div className="mt-3 p-3 bg-red-50 rounded border">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cancellation Reason
                  </label>
                  <textarea
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="Enter reason for cancellation..."
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => handleStatusUpdate("CANCELLED")}
                      disabled={updatingStatus || !cancelReason.trim()}
                      className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
                    >
                      Confirm Cancel
                    </button>
                    <button
                      onClick={() => setShowCancelForm(false)}
                      className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Customer Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Customer Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <User className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm">
                    {booking.user.name} {booking.user.lastName}
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-600">
                    {booking.user.email}
                  </span>
                </div>
                <div className="text-xs text-gray-500">
                  Customer since: {formatDate2(booking.user.createdAt)}
                </div>
              </div>
            </div>

            {/* Service Provider Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Service Provider
              </h3>
              <div className="flex items-start space-x-3">
                {booking.providerService.iconUrl && (
                  <img
                    src={booking.providerService.iconUrl}
                    alt="Service icon"
                    className="w-12 h-12 object-cover rounded"
                  />
                )}
                <div>
                  <div className="font-medium">
                    {booking.providerService.serviceName}
                  </div>
                  <div className="text-sm text-gray-600">
                    Provider: {booking.providerService.providerName}
                  </div>
                  <div className="text-sm text-gray-500">
                    Base Price:{" "}
                    {formatCurrency(booking.providerService.basePrice, "VND")}
                  </div>
                  {booking.providerService.customPrice && (
                    <div className="text-sm text-green-600 font-medium">
                      Custom Price:{" "}
                      {formatCurrency(
                        booking.providerService.customPrice,
                        "VND"
                      )}
                    </div>
                  )}
                </div>
              </div>
              {booking.providerService.customDescription && (
                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {booking.providerService.customDescription}
                </div>
              )}
            </div>

            {/* Timing Info */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Schedule</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm">
                    Booked: {formatDate2(booking.bookingTime)}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm">
                    Scheduled: {formatDate2(booking.scheduledStartTime)} -{" "}
                    {formatDate2(booking.scheduledEndTime)}
                  </span>
                </div>
                {booking.actualEndTime && (
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                    <span className="text-sm">
                      Completed: {formatDate2(booking.actualEndTime)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Pets & Pricing */}
          <div className="space-y-6">
            {/* Pet Services */}
            <div class="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Pet Services</h3>
              <div className="space-y-3">
                {booking.petList?.map((petService, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-start space-x-3">
                      {petService.petImageUrl && (
                        <img
                          src={petService.petImageUrl}
                          alt={petService.petName}
                          className="w-16 h-16 object-cover rounded-full"
                        />
                      )}
                      <div className="flex-1">
                        <div className="font-medium">{petService.petName}</div>
                        <div className="text-sm text-gray-600">
                          {petService.serviceName}
                        </div>
                        <div className="text-sm font-medium text-green-600">
                          {formatCurrency(petService.price, "VND")}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing Summary */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">
                Payment Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount:</span>
                  <span className="text-green-600">
                    {formatCurrency(booking.totalPrice, "VND")}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Payment Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(
                      booking.paymentStatus
                    )}`}
                  >
                    {booking.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {(booking.note || booking.cancellationReason) && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
                {booking.note && (
                  <div className="mb-2">
                    <div className="text-sm font-medium text-gray-700">
                      Customer Note:
                    </div>
                    <div className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                      {booking.note}
                    </div>
                  </div>
                )}
                {booking.cancellationReason && (
                  <div>
                    <div className="text-sm font-medium text-gray-700">
                      Cancellation Reason:
                    </div>
                    <div className="text-sm text-gray-600 bg-red-50 p-2 rounded">
                      {booking.cancellationReason}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Timestamps */}
            <div className="text-xs text-gray-500 space-y-1">
              <div>Created: {formatDate2(booking.createdAt)}</div>
              <div>Updated: {formatDate2(booking.updatedAt)}</div>
              {booking.deletedAt && (
                <div className="text-red-500">
                  Deleted: {formatDate2(booking.deletedAt)}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  //const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });

  const [filters, setFilters] = useState({
    query: "",
    status: "",
    paymentStatus: "",
    userId: "",
    providerId: "",
    mail: "",
  });

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const { showSuccess, showError, showInfo, showWarning } = useToast();

  const debouncedQuery = useDebounce(filters.query, 700);
  const debouncedMail = useDebounce(filters.mail, 700);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        size: pagination.size,
        sortBy,
        sort: sortOrder,
        filters: {
          query: debouncedQuery, // Use debounced query
          status: filters.status,
          paymentStatus: filters.paymentStatus,
          userId: filters.userId,
          providerId: filters.providerId,
          mail: debouncedMail, // Use debounced mail
        },
      };

      const response = await bookingAPI.getBookings(params);
      //console.log("Bookings response:", response.data);

      setBookings(response.data.data);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.paging.totalPage,
        totalElements: response.data.paging.totalItem,
        page: response.data.paging.pageNumber,
        size: response.data.paging.pageSize,
      }));
    } catch (error) {
      console.error("Error loading bookings:", error);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.size,
    debouncedQuery, // Use debounced query
    debouncedMail, // Use debounced mail
    filters.status,
    filters.paymentStatus,
    filters.userId,
    filters.providerId,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    loadBookings();
  }, [
    pagination.page,
    pagination.size,
    debouncedQuery, // Use debounced query
    debouncedMail, // Use debounced mail
    filters.status,
    filters.paymentStatus,
    filters.userId,
    filters.providerId,
    sortBy,
    sortOrder,
    loadBookings,
  ]);

  const handleSearch = (e) => {
    setFilters((prev) => ({ ...prev, query: e.target.value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const isSearching =
    filters.query !== debouncedQuery && filters.query.length > 0;

  const isMailType = filters.mail !== debouncedMail && filters.mail.length > 0;

  //   const isUserIdType =
  //   filters.userId !== debouncedUserId && filters.userId.length > 0;

  // const isProviderIdType =
  //   filters.providerId !== debouncedProviderId && filters.providerId.length > 0;

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

  const handleViewBooking = async (bookingId) => {
    try {
      const response = await bookingAPI.getBookingById(bookingId);
      setSelectedBooking(response.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error("Error loading booking details:", error);
      showError(
        `Failed to load booking details: ${
          error.response?.data?.message || error.message
        }`,
        3000
      );
    }
  };

  const handleDeleteBooking = async (bookingId, customerName) => {
    if (
      window.confirm(
        `Are you sure you want to delete the booking for "${customerName}"?`
      )
    ) {
      try {
        await bookingAPI.deleteBooking(bookingId);
        loadBookings();
      } catch (error) {
        console.error("Error deleting booking:", error);
        showError(
          `Failed to delete booking: ${
            error.response?.data?.message || error.message
          }`,
          3000
        );
      }
    }
  };

  const handleStatusUpdate = () => {
    loadBookings();
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedBooking(null);
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      ACCEPTED: "bg-blue-100 text-blue-800",
      ONGOING: "bg-purple-100 text-purple-800",
      SERVICE_DONE: "bg-pink-100 text-green-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      NO_SHOW: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      PENDING: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-green-100 text-green-800",
      FAILED: "bg-red-100 text-red-800",
      CANCELLED: "bg-gray-100 text-gray-800",
      REFUNDED: "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  // Get stats for header cards
  const stats = React.useMemo(() => {
    const totalBookings = pagination.totalElements;
    const completedBookings = bookings.filter(
      (b) => b.status === "COMPLETED"
    ).length;
    const pendingBookings = bookings.filter(
      (b) => b.status === "PENDING"
    ).length;
    const totalRevenue = bookings.reduce(
      (sum, b) => sum + (b.totalPrice || 0),
      0
    );

    return {
      totalBookings,
      completedBookings,
      pendingBookings,
      totalRevenue,
    };
  }, [bookings, pagination.totalElements]);

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
                  <ReceiptText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl leading-normal font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
                    Booking Management
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Manage and monitor all system bookings
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <ReceiptText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(pagination.totalElements)}
                      </p>
                      <p className="text-sm text-gray-600">Total Bookings</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(stats.pendingBookings)}
                      </p>
                      <p className="text-sm text-gray-600">Pending</p>
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
                        {formatNumber(stats.completedBookings)}
                      </p>
                      <p className="text-sm text-gray-600">Completed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={loadBookings}
                className="group relative px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <RefreshCw className="w-5 h-5 relative z-10" />
                <span className="relative z-10 font-medium">Refresh</span>
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
                Search Bookings
              </label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by user name, provider name"
                  value={filters.query}
                  onChange={handleSearch}
                  className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="px-4 py-3 w-full border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
              >
                <option value="">All Status</option>
                <option value="PENDING">Pending</option>
                <option value="ACCEPTED">Accepted</option>
                <option value="ONGOING">Ongoing</option>
                <option value="SERVICE_DONE">Service Done</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>

            {/* Payment Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Payment Status
              </label>
              <select
                value={filters.paymentStatus}
                onChange={(e) =>
                  handleFilterChange("paymentStatus", e.target.value)
                }
                className="px-4 py-3 w-full border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
              >
                <option value="">All Payments</option>
                <option value="PENDING">Payment Pending</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>

            {/* Mail Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Mail</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-700 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Mail"
                  value={filters.mail}
                  onChange={(e) => handleFilterChange("mail", e.target.value)}
                  className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
                />
                {isMailType && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
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
                  <ReceiptText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Booking Directory
                </h3>
              </div>
              <div className="text-sm text-gray-600">
                {formatNumber(pagination.totalElements)} bookings total
              </div>
            </div>
          </div>
          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200/50">
              <thead className="bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100/50 transition-colors"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500 group-hover:text-gray-700" />
                      Booking Date
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
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-500" />
                      User
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Service
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-200/50 transition-all duration-200 group"
                    onClick={() => handleSort("totalPrice")}
                  >
                    <div className="flex items-center gap-2">
                      Total Price
                      {sortBy === "totalPrice" && (
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
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200/50">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="text-gray-500 font-medium">
                          Loading bookings...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-8 h-8 text-gray-400" />
                        </div>
                        <div>
                          <p className="text-gray-500 font-medium">
                            No bookings found
                          </p>
                          <p className="text-gray-400 text-sm">
                            Try adjusting your filters
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="hover:bg-white/50 transition-all duration-200 group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate2(booking.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {booking.user.name} {booking.user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="flex items-center gap-3">
                          {booking.providerService.iconUrl && (
                            <img
                              src={booking.providerService.iconUrl}
                              alt="Service"
                              className="w-10 h-10 object-cover rounded-lg shadow-sm"
                            />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {booking.providerService.serviceName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.providerService.providerName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(booking.totalPrice)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getStatusBadgeColor(
                            booking.status
                          )}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getPaymentStatusColor(
                            booking.paymentStatus
                          )}`}
                        >
                          {booking.paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-left">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewBooking(booking.id)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-all duration-200 hover:scale-110"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteBooking(
                                booking.id,
                                `${booking.user.name} ${booking.user.lastName}`
                              )
                            }
                            className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-all duration-200 hover:scale-110"
                            title="Delete Booking"
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

      {/* Booking Detail Modal */}
      <BookingDetailModal
        booking={selectedBooking}
        isOpen={isDetailModalOpen}
        onClose={closeDetailModal}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default BookingManagement;
