// src/components/Dashboard.js
import React, { useState, useEffect } from "react";
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  Settings,
  Bell,
  Calendar,
  Shield,
  Heart,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Star,
  Award,
  Package,
  ReceiptText,
} from "lucide-react";
import { userAPI, statisticsAPI } from "../services/api";
import { Link } from "react-router-dom";
import { formatNumber, formatPrice } from "../utils/formatUtils";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    newUsersThisMonth: 0,
  });
  const [topProviderServices, setTopProviderServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingTopServices, setLoadingTopServices] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    setLoadingTopServices(true);

    try {
      // Load user stats and top provider services in parallel
      const [statsResponse, topServicesResponse] = await Promise.allSettled([
        loadStats(),
        loadTopProviderServices(),
      ]);

      if (statsResponse.status === "fulfilled") {
        // Stats loaded successfully
      } else {
        console.error("Error loading stats:", statsResponse.reason);
      }

      if (topServicesResponse.status === "fulfilled") {
        // Top services loaded successfully
      } else {
        console.error(
          "Error loading top services:",
          topServicesResponse.reason
        );
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
      setLoadingTopServices(false);
    }
  };

  const loadStats = async () => {
    try {
      // Get users data to calculate stats
      const response = await userAPI.getUsers({ size: 1000 }); // Get more to calculate stats
      const users = response.data.data;

      const totalUsers = users?.length || 0;
      const activeUsers = users.filter((user) => !user.blockedAt)?.length || 0;
      const blockedUsers = users.filter((user) => user.blockedAt)?.length || 0;

      // Calculate new users this month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const newUsersThisMonth =
        users.filter((user) => {
          const createdDate = new Date(user.createdAt);
          return (
            createdDate.getMonth() === currentMonth &&
            createdDate.getFullYear() === currentYear
          );
        })?.length || 0;

      setStats({
        totalUsers,
        activeUsers,
        blockedUsers,
        newUsersThisMonth,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
      // Set default values on error
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        blockedUsers: 0,
        newUsersThisMonth: 0,
      });
    }
  };

  const loadTopProviderServices = async () => {
    try {
      const response = await statisticsAPI.getTopProviderServices();
      setTopProviderServices(response.data || []);
    } catch (error) {
      console.error("Error loading top provider services:", error);
      setTopProviderServices([]);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      iconColor: "bg-blue-600",
      bgColor: "bg-blue-50",
      description: "All registered users",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: UserCheck,
      iconColor: "bg-emerald-600",
      bgColor: "bg-emerald-50",
      description: "Currently active users",
    },
    {
      title: "Blocked Users",
      value: stats.blockedUsers,
      icon: UserX,
      iconColor: "bg-red-600",
      bgColor: "bg-red-50",
      description: "Blocked accounts",
    },
    {
      title: "New This Month",
      value: stats.newUsersThisMonth,
      icon: TrendingUp,
      iconColor: "bg-purple-600",
      bgColor: "bg-purple-50",
      description: "New registrations",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin">
              <RefreshCw className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-lg font-medium text-gray-700">
              Loading Dashboard...
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Section */}
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
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl leading-normal font-bold text-gray-900">
                    Dashboard
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Welcome back! Here's what's happening with PetCare+
                  </p>
                </div>
              </div>

              {/* Quick Info */}
              <div className="flex items-center gap-4">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-sm border border-white/20">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-700">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 shadow-sm border border-white/20">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">
                      System Online
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={loadDashboardData}
                className="group relative px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span className="font-medium">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="px-8 -mt-6 relative z-10 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="group bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative">
                  {/* Background */}
                  <div
                    className={`absolute inset-0 ${stat.bgColor} rounded-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300`}
                  ></div>

                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-3 ${stat.iconColor} rounded-2xl shadow-lg`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Value */}
                    <div className="mb-2">
                      <p className="text-3xl font-bold text-gray-900 mb-1">
                        {formatNumber(stat.value)}
                      </p>
                      <p className="text-sm font-medium text-gray-600">
                        {stat.title}
                      </p>
                    </div>

                    {/* Description */}
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Provider Services */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              {/* Header */}
              <div className="bg-slate-50 px-8 py-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-600 rounded-xl">
                    <Award className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Top Provider Services
                  </h2>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                {loadingTopServices ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl animate-pulse"
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                        <div className="h-6 w-16 bg-gray-200 rounded"></div>
                      </div>
                    ))}
                  </div>
                ) : topProviderServices.length > 0 ? (
                  <div className="space-y-4">
                    {topProviderServices.map((service, index) => (
                      <div
                        key={service.id}
                        className="group relative p-4 bg-white rounded-2xl border border-gray-100 hover:border-orange-200 transition-all duration-300 hover:shadow-lg"
                      >
                        <div className="flex items-center gap-4">
                          {/* Rank */}
                          <div
                            className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                              index === 0
                                ? "bg-yellow-500 text-white"
                                : index === 1
                                ? "bg-gray-400 text-white"
                                : index === 2
                                ? "bg-orange-500 text-white"
                                : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {index + 1}
                          </div>

                          {/* Service Icon */}
                          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                            {service.serviceIconUrl ? (
                              <img
                                src={service.serviceIconUrl}
                                alt={service.serviceName}
                                className="w-8 h-8 object-cover rounded-lg"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-orange-600" />
                            )}
                          </div>

                          {/* Service Info */}
                          <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-1">
                              {service.serviceName}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span>by {service.providerName}</span>
                              {service.providerAvatarUrl && (
                                <img
                                  src={service.providerAvatarUrl}
                                  alt={service.providerName}
                                  className="w-4 h-4 rounded-full object-cover"
                                />
                              )}
                            </div>
                            {service.customDescription && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                {service.customDescription}
                              </p>
                            )}
                          </div>

                          {/* Stats */}
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-sm font-bold text-orange-600 mb-1">
                              <ReceiptText className="w-4 h-4" />
                              {formatNumber(service.totalBookings)}
                            </div>
                            <div className="text-xs text-gray-500">
                              bookings
                            </div>
                            {service.customPrice && (
                              <div className="text-xs font-medium text-gray-700 mt-1">
                                {formatPrice(service.customPrice)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Provider Services Found
                    </h3>
                    <p className="text-gray-500">
                      Top provider services will appear here once bookings are
                      made.
                    </p>
                  </div>
                )}

                {/* Quick Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-blue-600" />
                    Quick Actions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Link
                      to="/users"
                      className="group relative p-4 bg-blue-50 rounded-2xl border border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg hover:scale-105"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">
                            Manage Users
                          </h4>
                          <p className="text-xs text-gray-600">
                            {formatNumber(stats.totalUsers)} total users
                          </p>
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/services"
                      className="group relative p-4 bg-emerald-50 rounded-2xl border border-emerald-100 hover:border-emerald-200 transition-all duration-300 hover:shadow-lg hover:scale-105"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                          <Heart className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">
                            Manage Services
                          </h4>
                          <p className="text-xs text-gray-600">
                            Pet care & veterinary
                          </p>
                        </div>
                      </div>
                    </Link>

                    <Link
                      to="/bookings"
                      className="group relative p-4 bg-purple-50 rounded-2xl border border-purple-100 hover:border-purple-200 transition-all duration-300 hover:shadow-lg hover:scale-105"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">
                            View Bookings
                          </h4>
                          <p className="text-xs text-gray-600">
                            Scheduling & management
                          </p>
                        </div>
                      </div>
                    </Link>

                    {/* <Link
                      to="/notifications"
                      className="group relative p-4 bg-orange-50 rounded-2xl border border-orange-100 hover:border-orange-200 transition-all duration-300 hover:shadow-lg hover:scale-105"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                          <Bell className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">
                            Notifications
                          </h4>
                          <p className="text-xs text-gray-600">
                            Communication center
                          </p>
                        </div>
                      </div>
                    </Link> */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              {/* Header */}
              <div className="bg-slate-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-600 rounded-xl">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    System Status
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-900">
                      Server Status
                    </span>
                  </div>
                  <span className="text-sm font-bold text-green-600">
                    Online
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-900">
                      Database
                    </span>
                  </div>
                  <span className="text-sm font-bold text-blue-600">
                    Connected
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-2xl border border-purple-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-900">
                      API Services
                    </span>
                  </div>
                  <span className="text-sm font-bold text-purple-600">
                    Active
                  </span>
                </div>

                {/* User Statistics */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">
                    User Overview
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Users</span>
                      <span className="font-medium text-gray-900">
                        {formatNumber(stats.totalUsers)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Active Users</span>
                      <span className="font-medium text-gray-900">
                        {formatNumber(stats.activeUsers)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">New This Month</span>
                      <span className="font-medium text-gray-900">
                        {formatNumber(stats.newUsersThisMonth)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
