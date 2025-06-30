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
} from "lucide-react";
import { bookingAPI } from "../services/api";
import { formatDate2 } from "../utils/dateUtils";
import { useDebounce } from "../hooks/useDebounce";
import {
  formatCurrency,
  formatPrice,
  formatNumber,
  formatCompactNumber,
} from "../utils/formatUtils";

// Booking Detail Modal Component
const BookingDetailModal = ({ booking, isOpen, onClose, onStatusUpdate }) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [showCancelForm, setShowCancelForm] = useState(false);

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
      alert("Failed to update booking status");
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
  const [allBookings, setAllBookings] = useState([]);
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
  });

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const debouncedQuery = useDebounce(filters.query, 500);

  const uniqueUsers = React.useMemo(() => {
    const userMap = new Map();
    allBookings.forEach((booking) => {
      if (booking.user && !userMap.has(booking.user.id)) {
        userMap.set(booking.user.id, booking.user);
      }
    });
    return Array.from(userMap.values()).sort((a, b) =>
      `${a.name} ${a.lastName}`.localeCompare(`${b.name} ${b.lastName}`)
    );
  }, [allBookings]);

  const uniqueProviders = React.useMemo(() => {
    const providerMap = new Map();
    allBookings.forEach((booking) => {
      if (
        booking.providerService &&
        !providerMap.has(booking.providerService.providerId)
      ) {
        providerMap.set(booking.providerService.providerId, {
          id: booking.providerService.providerId,
          name: booking.providerService.providerName,
        });
      }
    });
    return Array.from(providerMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [allBookings]);

  useEffect(() => {
    loadAllBookingsForFilters();
  }, []);

  const loadAllBookingsForFilters = async () => {
    try {
      // Load all bookings to get unique users/providers
      const response = await bookingAPI.getBookings({
        page: 1,
        size: 1000, // Get more records for filtering
        sortBy: "createdAt",
        sort: "desc",
      });

      setAllBookings(response.data.content);
    } catch (error) {
      console.error("Error loading bookings for filters:", error);
    }
  };

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
        },
      };

      const response = await bookingAPI.getBookings(params);
      //console.log("Bookings response:", response.data);

      setBookings(response.data.content);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.totalPages,
        totalElements: response.data.totalElements,
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
    allBookings,
    pagination.page,
    pagination.size,
    debouncedQuery, // Use debounced query
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
      alert("Failed to load booking details");
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
        alert("Failed to delete booking");
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={filters.query}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="ONGOING">Ongoing</option>
            <option value="SERVICE_DONE">Service Done</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={filters.paymentStatus}
            onChange={(e) =>
              handleFilterChange("paymentStatus", e.target.value)
            }
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Payments</option>
            <option value="PENDING">Payment Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="FAILED">Failed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="REFUNDED">Refunded</option>
          </select>

          {/* User Filter - Dropdown */}
          <select
            value={filters.userId}
            onChange={(e) => handleFilterChange("userId", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Users</option>
            {uniqueUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} {user.lastName} ({user.email})
              </option>
            ))}
          </select>

          {/* Provider Filter - Input or Dropdown */}
          <select
            value={filters.providerId}
            onChange={(e) => handleFilterChange("providerId", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Providers</option>
            {uniqueProviders.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center">
                    Booking Date
                    {sortBy === "createdAt" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("totalPrice")}
                >
                  <div className="flex items-center">
                    Total Price
                    {sortBy === "totalPrice" && (
                      <span className="ml-1">
                        {sortOrder === "asc" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-4 text-center">
                    No bookings found
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate2(booking.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
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
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {booking.providerService.iconUrl && (
                          <img
                            src={booking.providerService.iconUrl}
                            alt="Service"
                            className="w-8 h-8 object-cover rounded mr-2"
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate2(booking.scheduledStartTime)}
                      </div>
                      <div className="text-sm text-gray-500">
                        to {formatDate2(booking.scheduledEndTime)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatCurrency(booking.totalPrice)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                          booking.paymentStatus
                        )}`}
                      >
                        {booking.paymentStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewBooking(booking.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteBooking(
                              booking.id,
                              `${booking.user.name} ${booking.user.lastName}`
                            )
                          }
                          className="text-red-600 hover:text-red-900"
                          title="Delete Booking"
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
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
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
                    {(pagination.page - 1) * pagination.size + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.page * pagination.size,
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
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  {[...Array(Math.min(pagination.totalPages, 5))].map(
                    (_, index) => {
                      const page = index + 1;
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
                          {page}
                        </button>
                      );
                    }
                  )}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
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
