// src/components/Layout.js
import React from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  LayoutDashboard,
  LogOut,
  Package,
  ReceiptText,
  Lock,
  DollarSign,
  FileText,
  PawPrint,
  Bell,
  Settings,
  ChevronRight,
  Heart,
  Sparkles,
  ShoppingBag,
} from "lucide-react";

const Layout = ({ onLogout }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate("/login");
  };

  const menuItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      path: "/users",
      label: "User Management",
      icon: Users,
    },
    {
      path: "/services",
      label: "Service Management",
      icon: Package,
    },
    {
      path: "/provider-services",
      label: "Provider Services",
      icon: ShoppingBag,
    },
    {
      path: "/bookings",
      label: "Booking Management",
      icon: ReceiptText,
    },
    {
      path: "/withdrawals",
      label: "Withdrawal Management",
      icon: DollarSign,
    },
    {
      path: "/terms",
      label: "Terms & Conditions",
      icon: FileText,
    },
    {
      path: "/pets",
      label: "Pet Management",
      icon: PawPrint,
    },
    {
      path: "/notifications",
      label: "Notifications",
      icon: Bell,
    },
  ];
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64">
        <div className="flex flex-col h-full bg-white shadow-lg border-r border-gray-200">
          {/* Logo Section */}
          <div className="flex items-center h-16 px-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Heart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  PetCare+
                </h1>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                      : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 mr-3 ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="p-4 border-t border-gray-200">
            <Link
              to="/notification-testing"
              className="group flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 mb-2"
            >
              <Sparkles className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-600" />
              <span>Notification Tool</span>
            </Link>

            {/* Settings Link */}
            {/* <Link
              to="/settings"
              className="group flex items-center px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors duration-200 mb-2"
            >
              <Settings className="w-5 h-5 mr-3 text-gray-400 group-hover:text-gray-600" />
              <span>Settings</span>
            </Link> */}

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="group flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors duration-200"
            >
              <LogOut className="w-5 h-5 mr-3 text-gray-400 group-hover:text-red-500" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64">
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
