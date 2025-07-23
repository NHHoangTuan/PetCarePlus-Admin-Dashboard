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
import ConfirmationModal from "./common/ConfirmationModal";

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header with modern clean design */}
        <div className="relative">
          <div className="absolute inset-0 bg-slate-50/80"></div>
          <div className="relative p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue-600 shadow-sm">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">
                    Booking Details
                  </h2>
                  <p className="text-slate-600 text-sm">
                    Comprehensive booking information and management
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

        <div className="flex-1 overflow-y-auto p-6">
          {/* Booking ID */}
          <div className="mb-6 bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-xl">
                <ReceiptText className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <label className="text-sm font-medium text-slate-600">
                  Booking ID
                </label>
                <p className="text-lg font-mono text-slate-900">{booking.id}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* Left Column - Main Information */}
            <div className="space-y-6">
              {/* Booking Status */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-600 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Booking Status
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-slate-600 mb-2 block">
                      Status
                    </label>
                    <span
                      className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium shadow-sm ${getStatusBadgeColor(
                        booking.status
                      )}`}
                    >
                      {booking.status}
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <label className="text-sm font-medium text-slate-600 mb-2 block">
                      Payment Status
                    </label>
                    <span
                      className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium shadow-sm ${getPaymentStatusColor(
                        booking.paymentStatus
                      )}`}
                    >
                      {booking.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Cancel Form */}
                {showCancelForm && (
                  <div className="mt-6 p-4 bg-red-50 rounded-2xl border border-red-200">
                    <h4 className="text-lg font-semibold text-red-900 mb-3">
                      Cancel Booking
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-red-700 mb-2">
                          Cancellation Reason
                        </label>
                        <textarea
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          rows={3}
                          className="w-full px-4 py-3 border border-red-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                          placeholder="Enter reason for cancellation..."
                        />
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleStatusUpdate("CANCELLED")}
                          disabled={updatingStatus || !cancelReason.trim()}
                          className={`px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 transition-all duration-200 ${
                            updatingStatus ? "animate-pulse" : ""
                          }`}
                        >
                          <X className="w-4 h-4" />
                          Confirm Cancel
                        </button>
                        <button
                          onClick={() => setShowCancelForm(false)}
                          className="px-4 py-2 bg-white text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50 transition-all duration-200"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Information */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-600 rounded-xl">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Customer Information
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {booking.user.name?.charAt(0)}
                      {booking.user.lastName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-lg font-medium text-slate-900">
                        {booking.user.name} {booking.user.lastName}
                      </p>
                      <p className="text-sm text-slate-600">
                        {booking.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <p className="text-sm text-slate-600">
                      Customer since: {formatDate2(booking.user.createdAt)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Service Provider Information */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-600 rounded-xl">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Service Provider
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    {booking.providerService.iconUrl && (
                      <img
                        src={booking.providerService.iconUrl}
                        alt="Service icon"
                        className="w-16 h-16 object-cover rounded-2xl border-4 border-white shadow-lg"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-lg font-medium text-slate-900">
                        {booking.providerService.serviceName}
                      </p>
                      <p className="text-sm text-slate-600 mb-2">
                        Provider: {booking.providerService.providerName}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                          <p className="text-xs text-slate-600">Base Price</p>
                          <p className="text-sm font-medium text-slate-900">
                            {formatCurrency(
                              booking.providerService.basePrice,
                              "VND"
                            )}
                          </p>
                        </div>
                        {booking.providerService.customPrice && (
                          <div className="bg-green-50 rounded-xl p-3 border border-green-200">
                            <p className="text-xs text-slate-600">
                              Custom Price
                            </p>
                            <p className="text-sm font-medium text-green-600">
                              {formatCurrency(
                                booking.providerService.customPrice,
                                "VND"
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {booking.providerService.customDescription && (
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                      <p className="text-sm text-slate-700">
                        {booking.providerService.customDescription}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Schedule Information */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-cyan-600 rounded-xl">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Schedule
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-slate-600">Booked</p>
                      <p className="text-sm font-medium text-slate-900">
                        {formatDate2(booking.bookingTime)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <Clock className="w-5 h-5 text-purple-600" />
                    <div>
                      <p className="text-sm text-slate-600">Scheduled</p>
                      <p className="text-sm font-medium text-slate-900">
                        {formatDate2(booking.scheduledStartTime)} -{" "}
                        {formatDate2(booking.scheduledEndTime)}
                      </p>
                    </div>
                  </div>
                  {booking.actualEndTime && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="text-sm text-slate-600">Completed</p>
                        <p className="text-sm font-medium text-slate-900">
                          {formatDate2(booking.actualEndTime)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Pets & Pricing */}
            <div className="space-y-6">
              {/* Pet Services */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-600 rounded-xl">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Pet Services
                  </h3>
                </div>
                <div className="space-y-4">
                  {booking.petList?.map((petService, index) => (
                    <div
                      key={index}
                      className="bg-slate-50 rounded-2xl p-4 border border-slate-200"
                    >
                      <div className="flex items-start gap-4">
                        {petService.petImageUrl && (
                          <img
                            src={petService.petImageUrl}
                            alt={petService.petName}
                            className="w-16 h-16 object-cover rounded-full border-4 border-white shadow-lg"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-lg font-medium text-slate-900">
                            {petService.petName}
                          </p>
                          <p className="text-sm text-slate-600 mb-2">
                            {petService.serviceName}
                          </p>
                          <div className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                            {formatCurrency(petService.price, "VND")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-emerald-600 rounded-xl">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Payment Summary
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium text-slate-900">
                        Total Amount:
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(booking.totalPrice, "VND")}
                      </span>
                    </div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">
                        Payment Status:
                      </span>
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium shadow-sm ${getPaymentStatusColor(
                          booking.paymentStatus
                        )}`}
                      >
                        {booking.paymentStatus}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {(booking.note || booking.cancellationReason) && (
                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-600 rounded-xl">
                      <ReceiptText className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">
                      Notes
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {booking.note && (
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                          Customer Note:
                        </label>
                        <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                          <p className="text-sm text-slate-700">
                            {booking.note}
                          </p>
                        </div>
                      </div>
                    )}
                    {booking.cancellationReason && (
                      <div>
                        <label className="text-sm font-medium text-slate-700 mb-2 block">
                          Cancellation Reason:
                        </label>
                        <div className="bg-red-50 rounded-xl p-3 border border-red-200">
                          <p className="text-sm text-slate-700">
                            {booking.cancellationReason}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-slate-600 rounded-xl">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Timestamps
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-sm text-slate-600">Created</p>
                      <p className="text-sm font-medium text-slate-900">
                        {formatDate2(booking.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <Clock className="w-4 h-4 text-purple-600" />
                    <div>
                      <p className="text-sm text-slate-600">Updated</p>
                      <p className="text-sm font-medium text-slate-900">
                        {formatDate2(booking.updatedAt)}
                      </p>
                    </div>
                  </div>
                  {booking.deletedAt && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 rounded-xl border border-red-200">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <div>
                        <p className="text-sm text-slate-600">Deleted</p>
                        <p className="text-sm font-medium text-red-600">
                          {formatDate2(booking.deletedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
          <div className="text-sm text-slate-500">
            Booking information and details
          </div>
          <button
            onClick={onClose}
            className="px-6 py-3 text-slate-700 bg-white border border-slate-300 rounded-2xl hover:bg-slate-50 transition-all duration-200 font-medium"
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
  const [confirmationModal, setConfirmationModal] = useState({});

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

  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
    });
  };

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
    setConfirmationModal({
      isOpen: true,
      type: "danger",
      title: `Delete Booking`,
      message: `Are you sure you want to delete booking of "${customerName}"?`,
      confirmText: "Delete",
      cancelText: "Cancel",
      icon: Trash2,
      onConfirm: async () => {
        setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
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
      },
    });
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

  const getPaginationRange = () => {
    const total = pagination.totalPages;
    const current = pagination.page;
    const delta = 2; // Hiển thị 5 trang: current +- 2

    let start = Math.max(1, current - delta);
    let end = Math.min(total, current + delta);

    if (end - start < 4) {
      if (start === 1) {
        end = Math.min(start + 4, total);
      } else if (end === total) {
        start = Math.max(end - 4, 1);
      }
    }

    const range = Array.from({ length: end - start + 1 }, (_, i) => start + i);
    return { start, end, range };
  };

  const { start, end, range } = getPaginationRange();
  const total = pagination.totalPages;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section with clean modern design */}
      <div className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-green-600 opacity-10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjAyIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPgo8L2c+Cjwvc3ZnPg==')]"></div>

        <div className="relative px-8 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
                  <ReceiptText className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl leading-normal font-bold text-slate-900">
                    Booking Management
                  </h1>
                  <p className="text-slate-600 mt-1">
                    Manage and monitor all system bookings
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <ReceiptText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {formatNumber(pagination.totalElements)}
                      </p>
                      <p className="text-sm text-slate-600">Total Bookings</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {formatNumber(stats.pendingBookings)}
                      </p>
                      <p className="text-sm text-slate-600">Pending</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-xl">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {formatNumber(stats.completedBookings)}
                      </p>
                      <p className="text-sm text-slate-600">Completed</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={loadBookings}
                className="group relative px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 hover:bg-blue-700"
              >
                <RefreshCw className="w-5 h-5" />
                <span className="font-medium">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="px-8 -mt-6 relative z-10">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Filters & Search
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Search Bookings
              </label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-800 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by user name..."
                  value={filters.query}
                  onChange={handleSearch}
                  className="pl-12 pr-4 py-3 w-full border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
                />
                {isSearching && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
                className="px-4 py-3 w-full border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
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
              <label className="text-sm font-medium text-slate-700">
                Payment Status
              </label>
              <select
                value={filters.paymentStatus}
                onChange={(e) =>
                  handleFilterChange("paymentStatus", e.target.value)
                }
                className="px-4 py-3 w-full border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
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
              <label className="text-sm font-medium text-slate-700">Mail</label>
              <div className="relative group">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-800 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Mail"
                  value={filters.mail}
                  onChange={(e) => handleFilterChange("mail", e.target.value)}
                  className="pl-12 pr-4 py-3 w-full border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
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
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-slate-50 px-8 py-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <ReceiptText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  Booking Directory
                </h3>
              </div>
              <div className="text-sm text-slate-600">
                {formatNumber(pagination.totalElements)} bookings total
              </div>
            </div>
          </div>
          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200/50">
              <thead className="bg-slate-50/80 backdrop-blur-sm">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100/50 transition-colors"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-500 group-hover:text-slate-700" />
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-500" />
                      User
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Service
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-200/50 transition-all duration-200 group"
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
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        <p className="text-slate-500 font-medium">
                          Loading bookings...
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center">
                          <Calendar className="w-8 h-8 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-slate-500 font-medium">
                            No bookings found
                          </p>
                          <p className="text-slate-400 text-sm">
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
                        <div className="text-sm font-medium text-slate-900">
                          {formatDate2(booking.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="text-sm font-medium text-slate-900">
                              {booking.user.name} {booking.user.lastName}
                            </div>
                            <div className="text-sm text-slate-500">
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
                            <div className="text-sm font-medium text-slate-900">
                              {booking.providerService.serviceName}
                            </div>
                            <div className="text-sm text-slate-500">
                              {booking.providerService.providerName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="text-sm font-bold text-slate-900">
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
          <div className="bg-slate-50 px-8 py-6 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="text-sm text-slate-700">
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
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {start > 1 && (
                      <>
                        <button
                          onClick={() => handlePageChange(1)}
                          className="w-10 h-10 rounded-xl text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          1
                        </button>
                        <span className="px-2 text-gray-500">...</span>
                      </>
                    )}

                    {range.map((page) => (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200 ${
                          pagination.page === page
                            ? "bg-blue-600 text-white shadow-lg"
                            : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    {end < total && (
                      <>
                        <span className="px-2 text-gray-500">...</span>
                        <button
                          onClick={() => handlePageChange(total)}
                          className="w-10 h-10 rounded-xl text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                        >
                          {total}
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
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

export default BookingManagement;
