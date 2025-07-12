// src/components/UserManagement.js
import React, { useState, useEffect, useCallback } from "react";
import { Search, Ban, CheckCircle, Eye, X, UserCheck } from "lucide-react";
import { userAPI } from "../services/api";
import { formatDate2 } from "../utils/dateUtils";
import { useDebounce } from "../hooks/useDebounce";
import { useToast } from "../context/ToastContext";
import ConfirmationModal from "./common/ConfirmationModal";
import { set } from "@cloudinary/url-gen/actions/variable";

// User Detail Modal Component
const UserDetailModal = ({ user, isOpen, onClose, onRoleUpdate }) => {
  const [selectedRole, setSelectedRole] = useState(user?.role || "");
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
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
    }
  }, [user]);

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
        return "bg-red-100 text-red-800";
      case "SERVICE_PROVIDER":
        return "bg-blue-100 text-blue-800";
      case "USER":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">User Details</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* User Info */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID
              </label>
              <p className="text-sm text-gray-900">{user.id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <p className="text-sm text-gray-900">
                {user.name} {user.lastName}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <p className="text-sm text-gray-900">{user.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <p className="text-sm text-gray-900">{user.phone || "N/A"}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
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
            </div>
          </div>

          {/* Role Section */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Role
            </label>
            <div className="flex items-center gap-4 mb-4">
              <span
                className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getRoleBadgeColor(
                  user.role
                )}`}
              >
                {user.role}
              </span>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Change Role
            </label>
            <div className="flex items-center gap-4">
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="USER">User</option>
                <option value="SERVICE_PROVIDER">Service Provider</option>
                <option value="ADMIN">Admin</option>
              </select>
              <button
                onClick={handleRoleUpdate}
                disabled={isUpdatingRole || selectedRole === user.role}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <UserCheck className="w-4 h-4" />
                {isUpdatingRole ? "Updating..." : "Update Role"}
              </button>
            </div>
          </div>

          {/* Timestamps */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Created At
                </label>
                <p className="text-sm text-gray-900">
                  {formatDate2(user.createdAt)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Updated
                </label>
                <p className="text-sm text-gray-900">
                  {formatDate2(user.updatedAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          {user.address && (
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <p className="text-sm text-gray-900">{user.address}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Close
          </button>
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

      // Filter users based on status on frontend
      let filteredUsers = response.data.items;
      if (filters.status) {
        filteredUsers = response.data.items.filter((user) => {
          const userStatus = getUserStatus(user);
          return userStatus === filters.status;
        });
      }

      setUsers(filteredUsers);
      setPagination((prev) => ({
        ...prev,
        totalPages: response.data.pages,
        totalElements: response.data.total,
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

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search users..."
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

          {/* Role Filter */}
          <select
            value={filters.roles}
            onChange={(e) => handleFilterChange("roles", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="SERVICE_PROVIDER">Service Provider</option>
            <option value="USER">User</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="blocked">Blocked</option>
            <option value="waiting">Waiting</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("fullName")}
                >
                  Name
                  {sortBy === "fullName" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("email")}
                >
                  Email
                  {sortBy === "email" && (
                    <span className="ml-1">
                      {sortOrder === "asc" ? "↑" : "↓"}
                    </span>
                  )}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("createdAt")}
                >
                  Created At
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
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name} {user.lastName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      {user.emailVerifiedAt && (
                        <div className="text-xs text-green-600">✓ Verified</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleBadgeColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
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

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate2(user.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewUser(user.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
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
                              ? "text-green-600 hover:text-green-900"
                              : "text-red-600 hover:text-red-900"
                          }`}
                          title={user.blockedAt ? "Unblock User" : "Block User"}
                        >
                          {user.blockedAt ? (
                            <CheckCircle className="w-4 h-4" />
                          ) : (
                            <Ban className="w-4 h-4" />
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
                  {[...Array(pagination.totalPages)].map((_, index) => {
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
                  })}
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
