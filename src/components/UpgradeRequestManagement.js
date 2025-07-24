// src/components/UpgradeRequestManagement.js
import React, { useState, useEffect, useRef } from "react";
import {
  CheckCircle,
  XCircle,
  Eye,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Clock,
  Camera,
  CreditCard,
  AlertTriangle,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  X,
  FileText,
  Image as ImageIcon,
  Badge,
  Star,
  Briefcase,
  Users,
  Shield,
} from "lucide-react";
import { userAPI } from "../services/api";
import { formatDate, formatDate2 } from "../utils/dateUtils";
import { parseValidationErrors } from "../utils/errorHandler";
import { useToast } from "../context/ToastContext";
import { formatNumber } from "../utils/formatUtils";
import ConfirmationModal from "./common/ConfirmationModal";

// Helper function to format available time
const formatAvailableTime = (availableTime) => {
  if (
    !availableTime ||
    typeof availableTime !== "object" ||
    Object.keys(availableTime).length === 0
  ) {
    return null;
  }

  const daysOfWeek = {
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
    sunday: "Sunday",
  };

  const formatTimeSlot = (slot) => {
    if (!slot || typeof slot !== "object") return "";
    return `${slot.start || ""} - ${slot.end || ""}`;
  };

  try {
    const formattedSchedule = Object.entries(availableTime)
      .filter(([day, slots]) => {
        return slots && Array.isArray(slots) && slots.length > 0;
      })
      .map(([day, slots]) => ({
        day:
          daysOfWeek[day.toLowerCase()] ||
          day.charAt(0).toUpperCase() + day.slice(1).toLowerCase(),
        slots:
          slots
            .filter(
              (slot) =>
                slot && typeof slot === "object" && slot.start && slot.end
            )
            .map(formatTimeSlot)
            .join(", ") || "No time slots",
      }))
      .filter((schedule) => schedule.slots !== "No time slots");

    return formattedSchedule.length > 0 ? formattedSchedule : null;
  } catch (error) {
    console.warn("Error formatting available time:", error);
    return null;
  }
};

// Request Detail Modal Component
const RequestDetailModal = ({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!isOpen || !request) return null;

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: "bg-amber-100 text-amber-800 border-amber-200",
      APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
      REJECTED: "bg-red-100 text-red-800 border-red-200",
    };
    return styles[status] || styles.PENDING;
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-6xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header - Fixed */}
        <div className="relative overflow-hidden flex-shrink-0">
          <div className="absolute inset-0 bg-blue-50 opacity-30"></div>
          <div className="relative p-6 border-b border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-blue-600 shadow-lg">
                  <Badge className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">
                    Service Provider Upgrade Request
                  </h2>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(
                        request.status
                      )}`}
                    >
                      {request.status}
                    </span>
                    <div className="text-sm text-slate-600">
                      Request ID: {request.id.substring(0, 8)}...
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

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Content - Scrollable */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* User Information */}
            <div className="lg:col-span-1">
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-2xl font-bold text-white">
                      {request.user.name.charAt(0).toUpperCase()}
                      {request.user.lastName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">
                    {request.user.fullName}
                  </h3>
                  <p className="text-slate-600 mb-4">{request.user.email}</p>
                  {/* <div className="flex justify-center">
                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                      <User className="w-3 h-3" />
                      {request.user.role.name}
                    </span>
                  </div> */}
                </div>

                {/* User Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        User ID
                      </p>
                      <p className="text-sm text-slate-900 font-mono">
                        {request.user.id}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                      <Phone className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Phone Number
                      </p>
                      <p className="text-sm text-slate-900">
                        {request.user.phoneNumber || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Member Since
                      </p>
                      <p className="text-sm text-slate-900">
                        {formatDate2(request.user.createdAt)}
                      </p>
                    </div>
                  </div>

                  {request.user.emailVerifiedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          Email Verified
                        </p>
                        <p className="text-sm text-slate-900">
                          {formatDate2(request.user.emailVerifiedAt)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Business Info */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-600 rounded-xl">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">
                    Business Information
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      Business Name
                    </label>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-sm text-slate-900 font-semibold">
                        {request.businessName}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      Contact Phone
                    </label>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-sm text-slate-900">
                        {request.contactPhone}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      Contact Email
                    </label>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-sm text-slate-900">
                        {request.contactEmail}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      Business Address
                    </label>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-sm text-slate-900">
                        {request.businessAddress}
                      </p>
                    </div>
                  </div>
                </div>
                {request.businessBio && (
                  <div className="mt-4 space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      Business Description
                    </label>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-sm text-slate-900 leading-relaxed">
                        {request.businessBio}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Available Time */}
              {request.availableTime &&
                Object.keys(request.availableTime).length > 0 && (
                  <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-emerald-600 rounded-xl">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-900">
                        Available Time Schedule
                      </h4>
                    </div>
                    <div className="space-y-3">
                      {formatAvailableTime(request.availableTime) &&
                      formatAvailableTime(request.availableTime).length > 0 ? (
                        formatAvailableTime(request.availableTime).map(
                          (schedule, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:bg-slate-100 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                                  <Clock className="w-4 h-4 text-white" />
                                </div>
                                <span className="font-medium text-slate-900">
                                  {schedule.day}
                                </span>
                              </div>
                              <span className="text-sm text-slate-600 font-mono bg-white px-3 py-1 rounded-lg border">
                                {schedule.slots}
                              </span>
                            </div>
                          )
                        )
                      ) : (
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
                          <div className="flex items-center justify-center gap-2 text-amber-800">
                            <AlertTriangle className="w-4 h-4" />
                            <p className="text-sm">
                              No available time slots configured
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Document Images */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-amber-600 rounded-xl">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">
                    Identity Documents
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {request.idCardFrontUrl && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">
                        ID Card Front
                      </label>
                      <div className="border-2 border-slate-200 rounded-xl overflow-hidden">
                        <img
                          src={request.idCardFrontUrl}
                          alt="ID Card Front"
                          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                          onClick={(e) => {
                            // Create a modal to view full-size image
                            const modal = document.createElement("div");
                            modal.className =
                              "fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4";
                            modal.innerHTML = `
                              <div class="relative max-w-4xl max-h-full">
                                <img src="${request.idCardFrontUrl}" alt="ID Card Front" class="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
                                <button class="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                  </svg>
                                </button>
                              </div>
                            `;
                            modal.onclick = (e) => {
                              if (
                                e.target === modal ||
                                e.target.closest("button")
                              ) {
                                document.body.removeChild(modal);
                              }
                            };
                            document.body.appendChild(modal);
                          }}
                          onError={(e) => {
                            e.target.parentElement.innerHTML = `
                              <div class="w-full h-48 bg-gray-200 flex items-center justify-center rounded-xl">
                                <div class="text-center">
                                  <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                  <span class="text-gray-500 text-sm">Image not available</span>
                                </div>
                              </div>
                            `;
                          }}
                        />
                      </div>
                    </div>
                  )}
                  {request.idCardBackUrl && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-600">
                        ID Card Back
                      </label>
                      <div className="border-2 border-slate-200 rounded-xl overflow-hidden">
                        <img
                          src={request.idCardBackUrl}
                          alt="ID Card Back"
                          className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                          onClick={(e) => {
                            // Create a modal to view full-size image
                            const modal = document.createElement("div");
                            modal.className =
                              "fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4";
                            modal.innerHTML = `
                              <div class="relative max-w-4xl max-h-full">
                                <img src="${request.idCardBackUrl}" alt="ID Card Back" class="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
                                <button class="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                  </svg>
                                </button>
                              </div>
                            `;
                            modal.onclick = (e) => {
                              if (
                                e.target === modal ||
                                e.target.closest("button")
                              ) {
                                document.body.removeChild(modal);
                              }
                            };
                            document.body.appendChild(modal);
                          }}
                          onError={(e) => {
                            e.target.parentElement.innerHTML = `
                              <div class="w-full h-48 bg-gray-200 flex items-center justify-center rounded-xl">
                                <div class="text-center">
                                  <svg class="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                  <span class="text-gray-500 text-sm">Image not available</span>
                                </div>
                              </div>
                            `;
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Business Images */}
              {request.imageUrls && request.imageUrls.length > 0 && (
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-600 rounded-xl">
                      <ImageIcon className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">
                      Business Images
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {request.imageUrls.map((imageUrl, index) => (
                      <div
                        key={index}
                        className="border-2 border-slate-200 rounded-xl overflow-hidden"
                      >
                        <img
                          src={imageUrl}
                          alt={`Business Image ${index + 1}`}
                          className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                          onClick={(e) => {
                            // Create a modal to view full-size image
                            const modal = document.createElement("div");
                            modal.className =
                              "fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4";
                            modal.innerHTML = `
                              <div class="relative max-w-4xl max-h-full">
                                <img src="${imageUrl}" alt="Business Image ${
                              index + 1
                            }" class="max-w-full max-h-full object-contain rounded-xl shadow-2xl" />
                                <button class="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                                  <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                  </svg>
                                </button>
                              </div>
                            `;
                            modal.onclick = (e) => {
                              if (
                                e.target === modal ||
                                e.target.closest("button")
                              ) {
                                document.body.removeChild(modal);
                              }
                            };
                            document.body.appendChild(modal);
                          }}
                          onError={(e) => {
                            e.target.parentElement.innerHTML = `
                              <div class="w-full h-32 bg-gray-200 flex items-center justify-center rounded-xl">
                                <div class="text-center">
                                  <svg class="w-8 h-8 text-gray-400 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                                  </svg>
                                  <span class="text-gray-500 text-xs">Image not available</span>
                                </div>
                              </div>
                            `;
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Request Timeline */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-slate-600 rounded-xl">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">
                    Request Timeline
                  </h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Calendar className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Created At
                      </p>
                      <p className="text-sm text-slate-900">
                        {formatDate2(request.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                      <RefreshCw className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500">
                        Last Updated
                      </p>
                      <p className="text-sm text-slate-900">
                        {formatDate2(request.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rejection Reason (if rejected) */}
              {request.status === "REJECTED" && request.rejectionReason && (
                <div className="bg-red-50 rounded-2xl p-6 border border-red-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-600 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-red-900">
                      Rejection Reason
                    </h4>
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-red-200">
                    <p className="text-sm text-red-900">
                      {request.rejectionReason}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="text-sm text-slate-500">
            Request submitted: {formatDate2(request.createdAt)}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-2xl hover:bg-slate-50 transition-colors"
            >
              Close
            </button>
            {request.status === "PENDING" && (
              <>
                <button
                  onClick={() => onReject(request)}
                  className="px-4 py-2 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  Reject
                </button>
                <button
                  onClick={() => onApprove(request)}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-colors flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const UpgradeRequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: "warning",
    title: "",
    message: "",
    onConfirm: null,
  });
  const [rejectionModal, setRejectionModal] = useState({
    isOpen: false,
    request: null,
    reason: "",
  });

  const { showSuccess, showError } = useToast();

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getPendingUpgradeRequests();
      setRequests(response.data || []);
    } catch (error) {
      const parsedError = parseValidationErrors(error);
      showError(parsedError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleViewRequest = async (requestId) => {
    try {
      const response = await userAPI.getUpgradeRequestById(requestId);
      setSelectedRequest(response.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      const parsedError = parseValidationErrors(error);
      showError(parsedError.message);
    }
  };

  const handleApproveRequest = (request) => {
    setConfirmationModal({
      isOpen: true,
      type: "success",
      title: "Approve Upgrade Request",
      message: `Are you sure you want to approve the upgrade request for ${request.user.fullName}? This will change their role to Service Provider.`,
      onConfirm: async () => {
        try {
          await userAPI.approveUpgradeRequest(request.id);
          showSuccess("Upgrade request approved successfully!");
          loadRequests();
          setIsDetailModalOpen(false);
        } catch (error) {
          const parsedError = parseValidationErrors(error);
          showError(parsedError.message);
        }
        setConfirmationModal({ isOpen: false });
      },
    });
  };

  const handleRejectRequest = (request) => {
    setRejectionModal({
      isOpen: true,
      request: request,
      reason: "",
    });
  };

  const submitRejection = async () => {
    if (!rejectionModal.reason.trim()) {
      showError("Please provide a rejection reason");
      return;
    }

    try {
      await userAPI.rejectUpgradeRequest(
        rejectionModal.request.id,
        rejectionModal.reason
      );
      showSuccess("Upgrade request rejected successfully!");
      loadRequests();
      setIsDetailModalOpen(false);
      setRejectionModal({ isOpen: false, request: null, reason: "" });
    } catch (error) {
      const parsedError = parseValidationErrors(error);
      showError(parsedError.message);
    }
  };

  const filteredRequests = requests.filter(
    (request) =>
      request.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status) => {
    const styles = {
      PENDING: "bg-amber-100 text-amber-800 border-amber-200",
      APPROVED: "bg-emerald-100 text-emerald-800 border-emerald-200",
      REJECTED: "bg-red-100 text-red-800 border-red-200",
    };
    return styles[status] || styles.PENDING;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-green-600 opacity-10"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjAyIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIvPgo8L2c+Cjwvc3ZnPg==')]"></div>

        <div className="relative px-8 py-12">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
                  <Badge className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl leading-normal font-bold text-gray-900">
                    Service Provider Upgrade Requests
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Review and manage user upgrade requests to become service
                    providers
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-amber-100 rounded-xl">
                      <Clock className="w-4 h-4 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(filteredRequests.length)}
                      </p>
                      <p className="text-sm text-gray-600">Pending Requests</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={loadRequests}
                className="px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:bg-blue-700 hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span className="font-medium">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="px-8 -mt-6 relative z-10">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-600 rounded-xl">
              <Search className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Search Requests</h2>
          </div>

          <div className="relative group max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by name, business, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-8 mt-8 pb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          <div className="bg-gray-100 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Upgrade Requests
                </h3>
              </div>
              <div className="text-sm text-gray-600">
                {formatNumber(filteredRequests.length)} requests found
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {loading ? (
              <div className="px-8 py-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <Badge className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
                  </div>
                  <div className="text-gray-600">
                    Loading upgrade requests...
                  </div>
                </div>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="px-8 py-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="p-6 bg-gray-100 rounded-full">
                    <Badge className="w-12 h-12 text-gray-400" />
                  </div>
                  <div className="text-gray-500 text-lg">
                    No upgrade requests found
                  </div>
                  <div className="text-gray-400 text-sm">
                    {searchQuery
                      ? "Try adjusting your search terms"
                      : "No pending requests at the moment"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Business Info
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Submitted
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/50 divide-y divide-gray-200">
                    {filteredRequests.map((request) => (
                      <tr
                        key={request.id}
                        className="hover:bg-blue-50/50 transition-all duration-300 group cursor-pointer hover:shadow-sm"
                      >
                        <td className="px-6 py-6 whitespace-nowrap text-left">
                          <div className="flex items-center gap-4">
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center shadow-lg ring-2 ring-blue-100 relative overflow-hidden">
                                {request.user.profileImageUrl ? (
                                  <img
                                    src={request.user.profileImageUrl}
                                    alt={request.user.fullName}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.style.display = "none";
                                      e.target.nextSibling.style.display =
                                        "flex";
                                    }}
                                  />
                                ) : null}
                                <span
                                  className="text-sm font-bold text-white"
                                  style={{
                                    display: request.user.profileImageUrl
                                      ? "none"
                                      : "flex",
                                  }}
                                >
                                  {request.user.name
                                    ?.charAt(0)
                                    ?.toUpperCase() || ""}
                                  {request.user.lastName
                                    ?.charAt(0)
                                    ?.toUpperCase() || ""}
                                </span>
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                {request.user.fullName}
                              </div>
                              <div className="text-sm text-gray-500 truncate">
                                {request.user.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-left">
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                              <Building className="w-4 h-4 text-blue-500" />
                              {request.businessName}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                              <MapPin className="w-4 h-4 text-gray-400" />
                              {request.businessAddress.length > 30
                                ? request.businessAddress.substring(0, 30) +
                                  "..."
                                : request.businessAddress}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-left">
                          <div className="space-y-1">
                            <div className="text-sm text-gray-900 flex items-center gap-2">
                              <Phone className="w-4 h-4 text-emerald-500" />
                              {request.contactPhone}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              {request.contactEmail}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-left">
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadge(
                              request.status
                            )}`}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-left">
                          <div className="text-sm text-gray-600 font-medium">
                            {formatDate2(request.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-left">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleViewRequest(request.id)}
                              className="p-2.5 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md group"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </button>
                            {request.status === "PENDING" && (
                              <>
                                <button
                                  onClick={() => handleApproveRequest(request)}
                                  className="p-2.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md group"
                                  title="Approve"
                                >
                                  <CheckCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </button>
                                <button
                                  onClick={() => handleRejectRequest(request)}
                                  className="p-2.5 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-all duration-200 hover:scale-110 hover:shadow-md group"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <RequestDetailModal
        request={selectedRequest}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onApprove={handleApproveRequest}
        onReject={handleRejectRequest}
      />

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmationModal.isOpen}
        onClose={() => setConfirmationModal({ isOpen: false })}
        onConfirm={confirmationModal.onConfirm}
        title={confirmationModal.title}
        message={confirmationModal.message}
        confirmText="Approve"
        cancelText="Cancel"
        type={confirmationModal.type}
        icon={CheckCircle}
      />

      {/* Rejection Modal */}
      {rejectionModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-600 rounded-xl">
                  <XCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Reject Request
                </h3>
              </div>
              <p className="text-slate-600 mb-4">
                Please provide a reason for rejecting{" "}
                {rejectionModal.request?.user.fullName}'s upgrade request:
              </p>
              <textarea
                value={rejectionModal.reason}
                onChange={(e) =>
                  setRejectionModal((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                placeholder="Enter rejection reason..."
              />
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() =>
                    setRejectionModal({
                      isOpen: false,
                      request: null,
                      reason: "",
                    })
                  }
                  className="flex-1 px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitRejection}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  Reject Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UpgradeRequestManagement;
