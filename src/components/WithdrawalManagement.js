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
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react";
import { withdrawalAPI } from "../services/api";
import {
  formatPrice,
  formatNumber,
  formatCurrency,
} from "../utils/formatUtils";
import { formatDate } from "../utils/dateUtils";
import { parseValidationErrors } from "../utils/errorHandler";
import { useToast } from "../context/ToastContext";
import { useDebounce } from "../hooks/useDebounce";
import { formatDate2 } from "../utils/dateUtils";

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

  const generateVietQRLink = () => {
    const bankCode = withdrawal.bankCode;
    const accountNumber = withdrawal.accountNumber;
    const template = "TtxRU02";
    const amount = Math.round(withdrawal.netAmount); // làm tròn nếu cần
    const addInfo = encodeURIComponent(`Thanh toan rut tien tu PetCare App`);
    const accountName = encodeURIComponent(withdrawal.accountHolderName);

    return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-${template}.png?amount=${amount}&addInfo=${addInfo}&accountName=${accountName}`;
  };

  if (!isOpen || !withdrawal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
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

        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
          {/* Withdrawal Information */}
          <div className="space-y-4">
            <div className="bg-gray-100 p-4 rounded-xl">
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
                    {formatCurrency(withdrawal.amount, "VND")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fee:</span>
                  <span className="text-red-600">
                    -{formatCurrency(withdrawal.fee, "VND")}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600 font-medium">Net Amount:</span>
                  <span className="font-bold text-green-600 text-lg">
                    {formatCurrency(withdrawal.netAmount, "VND")}
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
            <div className="bg-gray-100 p-4 rounded-xl">
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
          <div className="space-y-4 mr-4">
            <div className="bg-gray-100 p-4 rounded-xl">
              <h3 className="font-semibold text-gray-900 mb-3">Timeline</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Created:</span>
                  <span>{formatDate2(withdrawal.createdAt)}</span>
                </div>
                {withdrawal.processedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-600">Processed:</span>
                    <span>{formatDate2(withdrawal.processedAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="bg-gray-100 p-4 rounded-xl">
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
          {["PENDING", "APPROVED"].includes(withdrawal.status) && (
            <div className="col-span-2 bg-gray-100 p-4 rounded-xl mr-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">
                VietQR Code
              </h4>
              <div className="border rounded-lg p-3 bg-white flex flex-col items-center">
                <img
                  src={generateVietQRLink()}
                  alt="VietQR Code"
                  className="w-96 h-96 object-contain"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-between border-t pt-4">
          <div className="flex gap-2">
            {withdrawal.status === "PENDING" && (
              <>
                <button
                  onClick={() => setShowApproveForm(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => setShowRejectForm(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
              </>
            )}
            {withdrawal.status === "APPROVED" && (
              <button
                onClick={() => setShowCompleteForm(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Complete
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
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
    totalPages: 0,
    totalElements: 0,
  });

  const [filters, setFilters] = useState({
    status: "",
    bankName: "",
    amountFrom: "",
    amountTo: "",
  });

  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const { showSuccess, showError } = useToast();

  const debouncedBankName = useDebounce(filters.bankName, 700);
  const debouncedAmountFrom = useDebounce(filters.amountFrom, 700);
  const debouncedAmountTo = useDebounce(filters.amountTo, 700);

  useEffect(() => {
    loadWithdrawals();
  }, [
    pagination.page,
    pagination.size,
    debouncedBankName,
    debouncedAmountFrom,
    debouncedAmountTo,
    sortBy,
    sortOrder,
    filters.status,
  ]);

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        size: pagination.size,
        sortBy,
        sort: sortOrder,
        filters: {
          status: filters.status,
          bankName: debouncedBankName,
          amountFrom: debouncedAmountFrom,
          amountTo: debouncedAmountTo,
        },
      };

      const response = await withdrawalAPI.getWithdrawals(params);

      setWithdrawals(response.data.data);
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

  const isBankNameType =
    filters.bankName !== debouncedBankName && filters.bankName.length > 0;

  const isAmountFromType =
    filters.amountFrom !== debouncedAmountFrom && filters.amountFrom.length > 0;

  const isAmountToType =
    filters.amountTo !== debouncedAmountTo && filters.amountTo.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
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
                  <DollarSign className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl leading-normal font-bold text-slate-900">
                    Withdrawal Management
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Manage withdrawal requests and transactions
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-white/20">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">
                        {formatNumber(withdrawals.length)}
                      </p>
                      <p className="text-sm text-gray-600">Total Withdrawals</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={loadWithdrawals}
                className="group relative px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <div className="absolute inset-0 bg-blue-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
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
            <div className="p-2 bg-blue-600 rounded-xl">
              <Filter className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              Filters & Search
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                <option value="APPROVED">Approved</option>
                <option value="COMPLETED">Completed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            {/* Bank Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Bank Name
              </label>
              <div className="relative group">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Bank Name"
                  value={filters.bankName}
                  onChange={(e) =>
                    handleFilterChange("bankName", e.target.value)
                  }
                  className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
                />
                {isBankNameType && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Amount From */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Amount From
              </label>
              <div className="relative group">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800 w-4 h-4" />
                <input
                  type="number"
                  placeholder="Amount From"
                  value={filters.amountFrom}
                  onChange={(e) =>
                    handleFilterChange("amountFrom", e.target.value)
                  }
                  className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
                />
                {isAmountFromType && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            </div>

            {/* Amount To */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Amount To
              </label>
              <div className="relative group">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-800 w-4 h-4" />
                <input
                  type="number"
                  placeholder="Amount To"
                  value={filters.amountTo}
                  onChange={(e) =>
                    handleFilterChange("amountTo", e.target.value)
                  }
                  className="pl-12 pr-4 py-3 w-full border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
                />
                {isAmountToType && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Directory Section */}
      <div className="px-8 mt-8 pb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
          {/* Table Header */}
          <div className="bg-slate-50 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-xl">
                  <DollarSign className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Withdrawal Directory
                </h3>
              </div>
              <div className="text-sm text-gray-600">
                {formatNumber(withdrawals.length)} withdrawals total
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    ID
                  </th>
                  <th
                    onClick={() => handleSort("amount")}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <span>Amount</span>
                      {sortBy === "amount" && (
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
                    Bank Details
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th
                    onClick={() => handleSort("createdAt")}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-200 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <span>Created</span>
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
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm font-mono">
                          {withdrawal.id
                            ? withdrawal.id.substring(0, 12) + "..."
                            : "Unknown"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="text-sm text-gray-900">
                          <div className="font-semibold">
                            {formatCurrency(withdrawal.amount, "VND")}
                          </div>
                          <div className="text-xs text-gray-500">
                            Fee: {formatCurrency(withdrawal.fee, "VND")}
                          </div>
                          <div className="text-xs text-green-600 font-medium">
                            Net: {formatCurrency(withdrawal.netAmount, "VND")}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="text-sm text-gray-900">
                          <div className="font-medium">
                            {withdrawal.bankName}
                          </div>
                          <div className="text-xs text-gray-500">
                            {withdrawal.accountNumber}
                          </div>
                          <div className="text-xs text-gray-500">
                            {withdrawal.accountHolderName}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full items-center gap-1 ${getStatusBadgeColor(
                            withdrawal.status
                          )}`}
                        >
                          {getStatusIcon(withdrawal.status)}
                          {withdrawal.status}
                        </span>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap text-left">
                        <div className="text-sm text-gray-600 font-medium">
                          {formatDate2(withdrawal.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewDetails(withdrawal)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-all duration-200 hover:scale-110"
                            title="Preview"
                          >
                            <Eye className="w-5 h-5" />
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
          <div className="bg-slate-50 px-8 py-6 border-t border-gray-200">
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
