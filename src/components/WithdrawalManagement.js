// src/components/WithdrawalManagement.js
import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Eye,
  Check,
  X,
  Clock,
  DollarSign,
  CreditCard,
  Building,
  User,
  Calendar,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import { withdrawalAPI } from "../services/api";
import { formatPrice, formatNumber } from "../utils/formatUtils";
import { formatDate } from "../utils/dateUtils";
import { parseValidationErrors } from "../utils/errorHandler";
import { useToast } from "../context/ToastContext";

// Withdrawal Detail Modal Component
const WithdrawalDetailModal = ({
  withdrawal,
  isOpen,
  onClose,
  onStatusUpdate,
}) => {
  const [updating, setUpdating] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [transactionNote, setTransactionNote] = useState("");
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showCompleteForm, setShowCompleteForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const { showSuccess, showError } = useToast();

  useEffect(() => {
    if (withdrawal) {
      setAdminNote(withdrawal.adminNote || "");
      setRejectionReason("");
      setTransactionNote("");
      setShowApproveForm(false);
      setShowCompleteForm(false);
      setShowRejectForm(false);
    }
  }, [withdrawal]);

  const handleApprove = async () => {
    setUpdating(true);
    try {
      const response = await withdrawalAPI.approveWithdrawal(
        withdrawal.id,
        adminNote || "Approved by admin"
      );
      showSuccess("Withdrawal approved successfully!");
      onStatusUpdate(response.data);
      setShowApproveForm(false);
    } catch (error) {
      const parsedError = parseValidationErrors(error);
      showError(parsedError.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleComplete = async () => {
    setUpdating(true);
    try {
      const response = await withdrawalAPI.completeWithdrawal(
        withdrawal.id,
        transactionNote || "Bank transfer completed"
      );
      showSuccess("Withdrawal completed successfully!");
      onStatusUpdate(response.data);
      setShowCompleteForm(false);
    } catch (error) {
      const parsedError = parseValidationErrors(error);
      showError(parsedError.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      showError("Rejection reason is required");
      return;
    }

    setUpdating(true);
    try {
      const response = await withdrawalAPI.rejectWithdrawal(
        withdrawal.id,
        rejectionReason
      );
      showSuccess("Withdrawal rejected successfully!");
      onStatusUpdate(response.data);
      setShowRejectForm(false);
    } catch (error) {
      const parsedError = parseValidationErrors(error);
      showError(parsedError.message);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "APPROVED":
        return <CheckCircle className="w-4 h-4" />;
      case "COMPLETED":
        return <Check className="w-4 h-4" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  if (!isOpen || !withdrawal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Withdrawal Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Withdrawal Information */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">
                Withdrawal Information
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID:</span>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {withdrawal.id}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-lg">
                    ${formatPrice(withdrawal.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee:</span>
                  <span className="text-red-600">
                    -${formatPrice(withdrawal.fee)}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600 font-medium">Net Amount:</span>
                  <span className="font-bold text-green-600 text-lg">
                    ${formatPrice(withdrawal.netAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium flex items-center gap-1 ${getStatusBadgeColor(
                      withdrawal.status
                    )}`}
                  >
                    {getStatusIcon(withdrawal.status)}
                    {withdrawal.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Bank Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">
                Bank Information
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Bank:</span>
                  <span className="font-medium">{withdrawal.bankName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Account:</span>
                  <span className="font-mono">{withdrawal.accountNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Holder:</span>
                  <span className="font-medium">
                    {withdrawal.accountHolderName}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps and Notes */}
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Created:</span>
                  <span>{formatDate(withdrawal.createdAt)}</span>
                </div>
                {withdrawal.processedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Processed:</span>
                    <span>{formatDate(withdrawal.processedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-3">Notes</h3>
              <div className="space-y-2">
                {withdrawal.adminNote && (
                  <div>
                    <span className="text-gray-600 text-sm">Admin Note:</span>
                    <p className="text-gray-800 bg-white p-2 rounded border mt-1">
                      {withdrawal.adminNote}
                    </p>
                  </div>
                )}
                {withdrawal.rejectionReason && (
                  <div>
                    <span className="text-red-600 text-sm">
                      Rejection Reason:
                    </span>
                    <p className="text-red-800 bg-red-50 p-2 rounded border border-red-200 mt-1">
                      {withdrawal.rejectionReason}
                    </p>
                  </div>
                )}
                {withdrawal.transactionRef && (
                  <div>
                    <span className="text-gray-600 text-sm">
                      Transaction Reference:
                    </span>
                    <p className="text-gray-800 bg-white p-2 rounded border mt-1 font-mono">
                      {withdrawal.transactionRef}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-between border-t pt-4">
          <div className="flex gap-2">
            {withdrawal.status === "PENDING" && (
              <>
                <button
                  onClick={() => setShowApproveForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}
            {withdrawal.status === "APPROVED" && (
              <button
                onClick={() => setShowCompleteForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Complete
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>

        {/* Approve Form */}
        {showApproveForm && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              Approve Withdrawal
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admin Note (Optional)
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Approved by admin"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleApprove}
                  disabled={updating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {updating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Confirm Approve
                </button>
                <button
                  onClick={() => setShowApproveForm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Complete Form */}
        {showCompleteForm && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-900 mb-2">
              Complete Withdrawal
            </h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Note (Optional)
                </label>
                <textarea
                  value={transactionNote}
                  onChange={(e) => setTransactionNote(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  rows={3}
                  placeholder="Bank transfer completed"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleComplete}
                  disabled={updating}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {updating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  Confirm Complete
                </button>
                <button
                  onClick={() => setShowCompleteForm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Form */}
        {showRejectForm && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-medium text-red-900 mb-2">Reject Withdrawal</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  rows={3}
                  placeholder="Enter reason for rejection..."
                  required
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleReject}
                  disabled={updating || !rejectionReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {updating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Confirm Reject
                </button>
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const WithdrawalManagement = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    pages: 0,
    total: 0,
  });

  const [filters, setFilters] = useState({
    query: "",
    status: "",
    bankName: "",
    amountFrom: "",
    amountTo: "",
  });

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const { showSuccess, showError } = useToast();

  useEffect(() => {
    loadWithdrawals();
  }, [pagination.page, pagination.size, filters, sortBy, sortOrder]);

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        size: pagination.size,
        sortBy,
        sort: sortOrder,
        filters: {
          query: filters.query,
          status: filters.status,
          bankName: filters.bankName,
          amountFrom: filters.amountFrom,
          amountTo: filters.amountTo,
        },
      };

      const response = await withdrawalAPI.getWithdrawals(params);

      setWithdrawals(response.data.items);
      setPagination((prev) => ({
        ...prev,
        pages: response.data.pages,
        total: response.data.total,
      }));
    } catch (error) {
      const parsedError = parseValidationErrors(error);
      showError(parsedError.message);
    } finally {
      setLoading(false);
    }
  };

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

  const handleStatusUpdate = (updatedWithdrawal) => {
    setWithdrawals((prev) =>
      prev.map((w) => (w.id === updatedWithdrawal.id ? updatedWithdrawal : w))
    );
    setSelectedWithdrawal(updatedWithdrawal);
  };

  const handleViewDetails = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setIsDetailModalOpen(true);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-blue-100 text-blue-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <Clock className="w-4 h-4" />;
      case "APPROVED":
        return <CheckCircle className="w-4 h-4" />;
      case "COMPLETED":
        return <Check className="w-4 h-4" />;
      case "REJECTED":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Withdrawal Management
        </h1>
        <div className="flex gap-2">
          <button
            onClick={loadWithdrawals}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
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
              placeholder="Search withdrawals..."
              value={filters.query}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="COMPLETED">Completed</option>
            <option value="REJECTED">Rejected</option>
          </select>

          {/* Bank Filter */}
          <input
            type="text"
            placeholder="Bank Name"
            value={filters.bankName}
            onChange={(e) => handleFilterChange("bankName", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          {/* Amount From */}
          <input
            type="number"
            placeholder="Amount From"
            value={filters.amountFrom}
            onChange={(e) => handleFilterChange("amountFrom", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />

          {/* Amount To */}
          <input
            type="number"
            placeholder="Amount To"
            value={filters.amountTo}
            onChange={(e) => handleFilterChange("amountTo", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  onClick={() => handleSort("id")}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  ID
                  {sortBy === "id" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  onClick={() => handleSort("amount")}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Amount
                  {sortBy === "amount" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bank Details
                </th>
                <th
                  onClick={() => handleSort("status")}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Status
                  {sortBy === "status" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  onClick={() => handleSort("createdAt")}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                >
                  Created
                  {sortBy === "createdAt" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center">
                      <RefreshCw className="w-5 h-5 animate-spin text-gray-400 mr-2" />
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No withdrawals found
                  </td>
                </tr>
              ) : (
                withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">
                        {withdrawal.id.slice(0, 8)}...
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-semibold">
                          ${formatPrice(withdrawal.amount)}
                        </div>
                        <div className="text-xs text-gray-500">
                          Fee: ${formatPrice(withdrawal.fee)}
                        </div>
                        <div className="text-xs text-green-600 font-medium">
                          Net: ${formatPrice(withdrawal.netAmount)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="font-medium">{withdrawal.bankName}</div>
                        <div className="text-xs text-gray-500">
                          {withdrawal.accountNumber}
                        </div>
                        <div className="text-xs text-gray-500">
                          {withdrawal.accountHolderName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 ${getStatusBadgeColor(
                          withdrawal.status
                        )}`}
                      >
                        {getStatusIcon(withdrawal.status)}
                        {withdrawal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(withdrawal.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleViewDetails(withdrawal)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
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
                  {formatNumber((pagination.page - 1) * pagination.size + 1)}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {formatNumber(
                    Math.min(
                      pagination.page * pagination.size,
                      pagination.total
                    )
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">
                  {formatNumber(pagination.total)}
                </span>{" "}
                results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {[...Array(Math.min(5, pagination.pages))].map((_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        pagination.page === page
                          ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                          : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.pages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Detail Modal */}
      <WithdrawalDetailModal
        withdrawal={selectedWithdrawal}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onStatusUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default WithdrawalManagement;
