// src/components/Dashboard.js
import React, { useState, useEffect } from "react";
import { Users, UserCheck, UserX, TrendingUp } from "lucide-react";
import { userAPI } from "../services/api";
import { Link } from "react-router-dom";

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
      const users = response.data.items;

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
      color: "bg-blue-500",
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: UserCheck,
      color: "bg-green-500",
    },
    {
      title: "Blocked Users",
      value: stats.blockedUsers,
      icon: UserX,
      color: "bg-red-500",
    },
    {
      title: "New This Month",
      value: stats.newUsersThisMonth,
      icon: TrendingUp,
      color: "bg-purple-500",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="space-y-3">
          <Link
            to="/users"
            className="block p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center">
              <Users className="w-5 h-5 text-gray-400 mr-3" />
              <span className="text-sm font-medium text-gray-900">
                Manage Users
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
