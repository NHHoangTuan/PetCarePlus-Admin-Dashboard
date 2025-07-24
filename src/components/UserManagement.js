// src/components/UserManagement.js
import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Ban,
  CheckCircle,
  Eye,
  X,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Plus,
  User,
  RefreshCw,
  AlertCircle,
  Filter,
  Calendar,
  MapPin,
  Users,
  Heart,
  Briefcase,
} from "lucide-react";
import { userAPI } from "../services/api";
import { formatDate2 } from "../utils/dateUtils";
import { useDebounce } from "../hooks/useDebounce";
import { useToast } from "../context/ToastContext";
import ConfirmationModal from "./common/ConfirmationModal";
import { formatPrice, formatNumber } from "../utils/formatUtils";
import { set } from "@cloudinary/url-gen/actions/variable";

// User Detail Modal Component
const UserDetailModal = ({ user, isOpen, onClose, onRoleUpdate }) => {
  const [selectedRole, setSelectedRole] = useState(user?.role || "");
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const { showSuccess, showError, showInfo, showWarning } = useToast();
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: "warning",
    title: "",
    message: "",
    onConfirm: null,
  });

  useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    if (!user?.id) return;

    setLoadingProfile(true);
    try {
      const response = await userAPI.getUserProfileById(user.id);
      setUserProfile(response.data);
    } catch (error) {
      console.error("Error loading user profile:", error);
      // Profile might not exist for this user, which is normal
      setUserProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleRoleUpdate = async () => {
    if (!user || selectedRole === user.role) return;

    setConfirmationModal({
      isOpen: true,
      type: "warning",
      title: "Confirm Role Update",
      message: `Are you sure you want to change the role of "${user.name} ${user.lastName}" to "${selectedRole}"?`,
      onConfirm: async () => {
        setIsUpdatingRole(true);
        setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
        try {
          await userAPI.updateUserRole(user.id, selectedRole);
          onRoleUpdate();
          onClose();
          showSuccess(
            `User role updated to "${selectedRole}" successfully`,
            3000
          );
        } catch (error) {
          console.error("Error updating user role:", error);
          showError(
            `Failed to updating user role: ${
              error.response?.data?.message || error.message
            }`,
            3000
          );
        } finally {
          setIsUpdatingRole(false);
        }
      },
    });
  };

  if (!isOpen || !user) return null;

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-600 text-white shadow-lg";
      case "SERVICE_PROVIDER":
        return "bg-blue-600 text-white shadow-lg";
      case "USER":
        return "bg-green-600 text-white shadow-lg";
      default:
        return "bg-slate-600 text-white shadow-lg";
    }
  };

  const getStatusBadgeColor = (user) => {
    if (user.blockedAt) {
      return "bg-red-600 text-white shadow-lg";
    } else if (user.emailVerifiedAt) {
      return "bg-green-600 text-white shadow-lg";
    } else {
      return "bg-yellow-600 text-white shadow-lg";
    }
  };

  const getStatusText = (user) => {
    if (user.blockedAt) return "Blocked";
    if (user.emailVerifiedAt) return "Active";
    return "Waiting";
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 flex flex-col backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header with clean design */}
        <div className="relative px-8 py-6">
          <div className="absolute inset-0 bg-slate-50/80"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-blue-600 shadow-lg">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-1">
                  User Details
                </h2>
                <p className="text-slate-600 text-sm">
                  Manage user information and permissions
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

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - User Avatar & Status */}
            <div className="lg:col-span-1">
              <div className="bg-slate-50 rounded-2xl p-6 text-center border border-slate-200">
                {/* Profile Avatar */}
                <div className="w-24 h-24 mx-auto mb-4 shadow-lg rounded-full overflow-hidden">
                  {loadingProfile ? (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center animate-pulse">
                      <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
                    </div>
                  ) : userProfile?.avatarUrl ? (
                    <img
                      src={userProfile.avatarUrl}
                      alt={`${user.name} ${user.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-600 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-2">
                  {user.name} {user.lastName}
                </h3>
                <p className="text-slate-600 mb-4">{user.email}</p>

                {/* Service Provider Badge */}
                {loadingProfile ? (
                  <div className="flex justify-center mb-3">
                    <div className="h-6 w-32 bg-gray-200 rounded-full animate-pulse"></div>
                  </div>
                ) : (
                  userProfile?.serviceProvider && (
                    <div className="flex justify-center mb-3">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-orange-600 text-white shadow-lg">
                        <Briefcase className="w-3 h-3" />
                        Service Provider
                      </span>
                    </div>
                  )
                )}

                {/* Status Badge */}
                <div className="flex justify-center mb-4">
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadgeColor(
                      user
                    )}`}
                  >
                    {getStatusText(user)}
                  </span>
                </div>

                {/* Role Badge */}
                <div className="flex justify-center">
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-600 rounded-xl">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">
                    Basic Information
                  </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      User ID
                    </label>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-sm font-mono text-slate-900">
                        {user.id}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      Full Name
                    </label>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-sm text-slate-900">
                        {user.name} {user.lastName}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      Email Address
                    </label>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-sm text-slate-900">{user.email}</p>
                      {user.emailVerifiedAt && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ Verified
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      Phone Number
                    </label>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-sm text-slate-900">
                        {user.phone || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role Management Card */}
              {/* <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-green-600 rounded-xl">
                    <UserCheck className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">
                    Role Management
                  </h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-2 block text-left">
                      Current Role
                    </label>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex gap-2 px-4 py-2 rounded-xl text-sm font-semibold ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 mb-2 block text-left">
                      Change Role
                    </label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
                      >
                        <option value="USER">User</option>
                        <option value="SERVICE_PROVIDER">
                          Service Provider
                        </option>
                        <option value="ADMIN">Admin</option>
                      </select>
                      <button
                        onClick={handleRoleUpdate}
                        disabled={isUpdatingRole || selectedRole === user.role}
                        className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-lg transition-all duration-300 hover:shadow-xl"
                      >
                        <UserCheck className="w-5 h-5" />
                        {isUpdatingRole ? "Updating..." : "Update Role"}
                      </button>
                    </div>
                  </div>
                </div>
              </div> */}

              {/* Timestamps Card */}
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-600 rounded-xl">
                    <AlertCircle className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">Timeline</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      Created At
                    </label>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-sm text-slate-900">
                        {formatDate2(user.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      Last Updated
                    </label>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-sm text-slate-900">
                        {formatDate2(user.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Information Card */}
              {loadingProfile ? (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-600 rounded-xl">
                      <Heart className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">
                      Profile Information
                    </h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="space-y-2">
                        <div className="h-4 w-full bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                userProfile && (
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-orange-600 rounded-xl">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                      <h4 className="text-lg font-bold text-slate-900">
                        Profile Information
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userProfile.dob && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Date of Birth
                          </label>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-sm text-slate-900">
                              {new Date(userProfile.dob).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                }
                              )}
                            </p>
                          </div>
                        </div>
                      )}
                      {userProfile.gender && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Gender
                          </label>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-sm text-slate-900 capitalize">
                              {userProfile.gender.toLowerCase()}
                            </p>
                          </div>
                        </div>
                      )}
                      {userProfile.location && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            Location
                          </label>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-sm text-slate-900">
                              {userProfile.location}
                            </p>
                          </div>
                        </div>
                      )}
                      {userProfile.phoneNumber && (
                        <div className="space-y-2">
                          <label className="text-sm font-medium text-slate-600">
                            Profile Phone
                          </label>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-sm text-slate-900">
                              {userProfile.phoneNumber}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                    {userProfile.about && (
                      <div className="mt-4 space-y-2">
                        <label className="text-sm font-medium text-slate-600">
                          About
                        </label>
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                          <p className="text-sm text-slate-900 leading-relaxed">
                            {userProfile.about}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )
              )}

              {/* Additional Information Card (User table data) */}
              {user.address && (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-600 rounded-xl">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">
                      Additional Information
                    </h4>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600">
                      Address
                    </label>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <p className="text-sm text-slate-900">{user.address}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-8 py-6 border-t border-slate-200">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-medium transition-all duration-200 shadow-sm"
            >
              Close
            </button>
          </div>
        </div>

        {/* Add confirmation modal */}
        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() =>
            setConfirmationModal((prev) => ({ ...prev, isOpen: false }))
          }
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
          confirmText="Update Role"
          cancelText="Cancel"
          type={confirmationModal.type}
          icon={UserCheck}
        />
      </div>
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 10,
    totalPages: 0,
    totalElements: 0,
  });
  const [filters, setFilters] = useState({
    query: "",
    roles: "",
    status: "",
  });
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("asc");
  const { showSuccess, showError, showInfo, showWarning } = useToast();

  const debouncedQuery = useDebounce(filters.query, 500);

  // Add confirmation modal state
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    type: "warning",
    title: "",
    message: "",
    confirmText: "Confirm",
    cancelText: "Cancel",
    onConfirm: null,
    icon: null,
    isLoading: false,
    userData: null,
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const backendFilters = getBackendFilters(filters.status);
      const params = {
        page: pagination.page,
        size: pagination.size,
        sortBy,
        sort: sortOrder,
        filters: {
          roles: filters.roles,
          query: debouncedQuery,
          ...backendFilters,
        },
      };

      const response = await userAPI.getUsers(params);
      const response2 = await userAPI.getUsers({ size: 10000 }); // Get all users for filtering

      setAllUsers(response2.data.data);

      // Filter users based on status on frontend
      let filteredUsers = response.data.data;
      if (filters.status) {
        filteredUsers = response.data.data.filter((user) => {
          const userStatus = getUserStatus(user);
          return userStatus === filters.status;
        });
      }

      setUsers(filteredUsers);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.paging.totalPage,
        totalElements: response.data.paging.totalItem,
        page: response.data.paging.pageNumber,
        size: response.data.paging.pageSize,
      }));
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.size,
    filters.roles,
    filters.status,
    debouncedQuery,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

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

  const handleBlockUser = async (userId, shouldBlock, userName) => {
    const userAction = shouldBlock ? "block" : "unblock";

    setConfirmationModal({
      isOpen: true,
      type: shouldBlock ? "danger" : "success",
      title: `${shouldBlock ? "Block" : "Unblock"} User`,
      message: `Are you sure you want to ${userAction} "${userName}"?`,
      confirmText: shouldBlock ? "Block User" : "Unblock User",
      cancelText: "Cancel",
      icon: shouldBlock ? Ban : CheckCircle,
      userData: { userId, shouldBlock, userName },
      onConfirm: async () => {
        setConfirmationModal((prev) => ({ ...prev, isLoading: true }));

        try {
          if (shouldBlock) {
            await userAPI.blockUser(userId);
            showSuccess(
              `User "${userName}" has been blocked successfully`,
              3000
            );
          } else {
            await userAPI.unblockUser(userId);
            showSuccess(
              `User "${userName}" has been unblocked successfully`,
              3000
            );
          }
          loadUsers(); // Reload data
          closeConfirmationModal();
        } catch (error) {
          console.error("Error block user:", error);
          showError(
            `Failed to block user: ${
              error.response?.data?.message || error.message
            }`,
            3000
          );
          setConfirmationModal((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  const closeConfirmationModal = () => {
    setConfirmationModal({
      isOpen: false,
      type: "warning",
      title: "",
      message: "",
      confirmText: "Confirm",
      cancelText: "Cancel",
      onConfirm: null,
      icon: null,
      isLoading: false,
      userData: null,
    });
  };

  const getBackendFilters = (status) => {
    const backendFilters = {};

    switch (status) {
      case "blocked":
        backendFilters.isBlocked = true;
        break;
      case "waiting":
        backendFilters.isBlocked = false;
        backendFilters.isEmailActivated = false;
        break;
      case "active":
        backendFilters.isBlocked = false;
        backendFilters.isEmailActivated = true;
        break;
      default:
        // No status filter - don't add isBlocked or isEmailActivated
        break;
    }

    return backendFilters;
  };

  const handleViewUser = async (userId) => {
    try {
      const response = await userAPI.getUserById(userId);
      setSelectedUser(response.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      console.error("Error loading user details:", error);
      showError(
        `Failed to load user details: ${
          error.response?.data?.message || error.message
        }`,
        3000
      );
    }
  };

  const getUserStatus = (user) => {
    if (user.blockedAt) {
      return "blocked";
    } else if (user.emailVerifiedAt) {
      return "active";
    } else {
      return "waiting";
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

  const handleRoleUpdate = () => {
    loadUsers(); // Reload users after role update
  };

  // const formatDate = (dateString) => {
  //   return new Date(dateString).toLocaleDateString("en-US", {
  //     year: "numeric",
  //     month: "short",
  //     day: "numeric",
  //   });
  // };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800";
      case "SERVICE_PROVIDER":
        return "bg-blue-100 text-blue-800";
      case "USER":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Statistics
  const stats = {
    total: pagination.length,
    blocked: allUsers.filter((u) => u.blockedAt).length,
    active: allUsers.filter((u) => u.emailVerifiedAt && !u.blockedAt).length,
    waiting: allUsers.filter((u) => !u.emailVerifiedAt && !u.blockedAt).length,
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section with clean design */}
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
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl leading-normal font-bold text-slate-900">
                    User Management
                  </h1>
                  <p className="text-slate-600 mt-1">
                    Manage and monitor all system users
                  </p>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="flex flex-wrap gap-4">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-xl">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {formatNumber(pagination.totalElements)}
                      </p>
                      <p className="text-sm text-slate-600">Total Users</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-red-100 rounded-xl">
                      <Ban className="w-4 h-4 text-red-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {formatNumber(stats.blocked)}
                      </p>
                      <p className="text-sm text-slate-600">Blocked</p>
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
                        {formatNumber(stats.active)}
                      </p>
                      <p className="text-sm text-slate-600">Active</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-yellow-100 rounded-xl">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">
                        {formatNumber(stats.waiting)}
                      </p>
                      <p className="text-sm text-slate-600">Waiting</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={loadUsers}
                className="px-6 py-3 bg-blue-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2 hover:bg-blue-700"
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Search */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Search Users
              </label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-800 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search name, email..."
                  value={filters.query}
                  onChange={handleSearch}
                  className="pl-12 pr-4 py-3 w-full border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Role</label>
              <select
                value={filters.roles}
                onChange={(e) => handleFilterChange("roles", e.target.value)}
                className="px-4 py-3 w-full border border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/50 backdrop-blur-sm transition-all duration-300 hover:bg-white/70"
              >
                <option value="">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="SERVICE_PROVIDER">Service Provider</option>
                <option value="USER">User</option>
              </select>
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
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
                <option value="waiting">Waiting</option>
              </select>
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
                  <User className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">
                  User Directory
                </h3>
              </div>
              <div className="text-sm text-slate-600">
                {formatNumber(pagination.totalElements)} users total
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50/50">
                <tr>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100/50 transition-colors"
                    onClick={() => handleSort("fullName")}
                  >
                    <div className="flex items-center gap-2">
                      <span>Name</span>
                      {sortBy === "fullName" && (
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
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100/50 transition-colors"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center gap-2">
                      <span>Email</span>
                      {sortBy === "email" && (
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
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Status
                  </th>
                  <th
                    className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider cursor-pointer hover:bg-slate-100/50 transition-colors"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center gap-2">
                      <span>Created At</span>
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
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-slate-300 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-slate-700">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-md font-medium text-slate-900">
                              {user.name} {user.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="text-md text-slate-900 truncate">
                          {user.email}
                        </div>
                        {user.emailVerifiedAt && (
                          <div className="text-sm text-green-600">
                            ✓ Verified
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        {user.blockedAt ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            Blocked
                          </span>
                        ) : user.emailVerifiedAt ? (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Waiting
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-6 whitespace-nowrap text-left">
                        <div className="text-sm text-slate-600 font-medium">
                          {formatDate2(user.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-6 whitespace-nowrap relative text-left">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewUser(user.id)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-xl transition-all duration-200 hover:scale-110"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() =>
                              handleBlockUser(
                                user.id,
                                !user.blockedAt,
                                `${user.name} ${user.lastName}`
                              )
                            }
                            className={`${
                              user.blockedAt
                                ? "p-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-xl transition-all duration-200 hover:scale-110"
                                : "p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-xl transition-all duration-200 hover:scale-110"
                            }`}
                            title={
                              user.blockedAt ? "Unblock User" : "Block User"
                            }
                          >
                            {user.blockedAt ? (
                              <CheckCircle className="w-5 h-5" />
                            ) : (
                              <Ban className="w-5 h-5" />
                            )}
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

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedUser(null);
        }}
        onRoleUpdate={handleRoleUpdate}
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
      >
        {/* Custom content for user info */}
        {confirmationModal.userData && (
          <div className="bg-gray-50 rounded-lg p-3 text-left">
            <div className="text-sm">
              <div className="font-medium text-gray-900">
                {confirmationModal.userData.userName}
              </div>
              <div className="text-gray-600 text-xs mt-1">
                ID: {confirmationModal.userData.userId?.substring(0, 8)}...
              </div>
            </div>
          </div>
        )}
      </ConfirmationModal>
    </div>
  );
};

export default UserManagement;
