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
} from "lucide-react";
import { userAPI } from "../services/api";
import { Link } from "react-router-dom";
import { formatNumber } from "../utils/formatUtils";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    blockedUsers: 0,
    newUsersThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get users data to calculate stats
      const response = await userAPI.getUsers({ size: 1000 }); // Get more to calculate stats
      const users = response.data.data;

      const totalUsers = users?.length;
      const activeUsers = users.filter((user) => !user.blockedAt)?.length;
      const blockedUsers = users.filter((user) => user.blockedAt)?.length;

      // Calculate new users this month
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const newUsersThisMonth = users.filter((user) => {
        const createdDate = new Date(user.createdAt);
        return (
          createdDate.getMonth() === currentMonth &&
          createdDate.getFullYear() === currentYear
        );
      })?.length;

      setStats({
        totalUsers,
        activeUsers,
        blockedUsers,
        newUsersThisMonth,
      });
    } catch (error) {
      console.error("Error loading stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      gradient: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
      change: "+12%",
      trend: "up",
      description: "All registered users",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: UserCheck,
      gradient: "from-green-500 to-emerald-500",
      bgColor: "from-green-50 to-emerald-50",
      change: "+8%",
      trend: "up",
      description: "Currently active users",
    },
    {
      title: "Blocked Users",
      value: stats.blockedUsers,
      icon: UserX,
      gradient: "from-red-500 to-pink-500",
      bgColor: "from-red-50 to-pink-50",
      change: "-3%",
      trend: "down",
      description: "Blocked accounts",
    },
    {
      title: "New This Month",
      value: stats.newUsersThisMonth,
      icon: TrendingUp,
      gradient: "from-purple-500 to-indigo-500",
      bgColor: "from-purple-50 to-indigo-50",
      change: "+25%",
      trend: "up",
      description: "New registrations",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
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
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl leading-normal font-bold bg-gradient-to-r from-gray-900 via-blue-900 to-purple-900 bg-clip-text text-transparent">
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
                onClick={loadStats}
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

      {/* Stats Grid */}
      <div className="px-8 -mt-6 relative z-10 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            const TrendIcon =
              stat.trend === "up" ? ArrowUpRight : ArrowDownRight;

            return (
              <div
                key={stat.title}
                className="group bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative">
                  {/* Background Gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${stat.bgColor} rounded-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-300`}
                  ></div>

                  <div className="relative">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div
                        className={`p-3 bg-gradient-to-r ${stat.gradient} rounded-2xl shadow-lg`}
                      >
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div
                        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                          stat.trend === "up"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        <TrendIcon className="w-3 h-3" />
                        {stat.change}
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
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Quick Actions
                  </h2>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    to="/users"
                    className="group relative p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">
                          Manage Users
                        </h3>
                        <p className="text-sm text-gray-600">
                          View and manage user accounts
                        </p>
                        <p className="text-xs text-blue-600 font-medium mt-1">
                          {formatNumber(stats.totalUsers)} total users
                        </p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/services"
                    className="group relative p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:border-green-200 transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">
                          Manage Services
                        </h3>
                        <p className="text-sm text-gray-600">
                          Configure pet care services
                        </p>
                        <p className="text-xs text-green-600 font-medium mt-1">
                          Pet care & veterinary
                        </p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/bookings"
                    className="group relative p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl border border-purple-100 hover:border-purple-200 transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <Calendar className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">
                          View Bookings
                        </h3>
                        <p className="text-sm text-gray-600">
                          Track appointments & bookings
                        </p>
                        <p className="text-xs text-purple-600 font-medium mt-1">
                          Scheduling & management
                        </p>
                      </div>
                    </div>
                  </Link>

                  <Link
                    to="/notifications"
                    className="group relative p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-100 hover:border-orange-200 transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                        <Bell className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1">
                          Notifications
                        </h3>
                        <p className="text-sm text-gray-600">
                          Send system notifications
                        </p>
                        <p className="text-xs text-orange-600 font-medium mt-1">
                          Communication center
                        </p>
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
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

                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-2xl border border-orange-100">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-gray-900">
                      Notifications
                    </span>
                  </div>
                  <span className="text-sm font-bold text-orange-600">
                    Running
                  </span>
                </div>

                {/* Quick Stats */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">
                    Quick Overview
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Uptime</span>
                      <span className="font-medium text-gray-900">99.9%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Response Time</span>
                      <span className="font-medium text-gray-900">
                        &lt; 200ms
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Active Sessions</span>
                      <span className="font-medium text-gray-900">
                        {formatNumber(stats.activeUsers)}
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
