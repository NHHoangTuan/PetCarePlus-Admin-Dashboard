// src/App.js
import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "./App.css";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import UserManagement from "./components/UserManagement";
import ServiceManagement from "./components/ServiceManagement";
import CreateAdmin from "./components/CreateAdmin.js";
import BookingManagement from "./components/BookingManagement";
import NotificationTestingTool from "./components/NotificationTestingTool.js";
import WithdrawalManagement from "./components/WithdrawalManagement.js";
import Layout from "./components/Layout";
import TermsManagement from "./components/TermsManagement.js";
import { ToastProvider } from "./context/ToastContext.js";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication status on app load
    const token = localStorage.getItem("adminToken");
    setIsAuthenticated(!!token);
  }, []);

  // Function to update authentication status
  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminRefreshToken");
    setIsAuthenticated(false);
  };

  return (
    <ToastProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route
              path="/login"
              element={
                !isAuthenticated ? (
                  <Login onLogin={handleLogin} />
                ) : (
                  <Navigate to="/dashboard" />
                )
              }
            />
            <Route path="/create-admin" element={<CreateAdmin />} />
            <Route
              path="/"
              element={
                isAuthenticated ? (
                  <Layout onLogout={handleLogout} />
                ) : (
                  <Navigate to="/login" />
                )
              }
            >
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="users" element={<UserManagement />} />
              <Route path="services" element={<ServiceManagement />} />
              <Route path="bookings" element={<BookingManagement />} />
              <Route
                path="notification-testing"
                element={<NotificationTestingTool />}
              />
              <Route path="withdrawals" element={<WithdrawalManagement />} />
              <Route path="terms" element={<TermsManagement />} />
              <Route index element={<Navigate to="/dashboard" />} />
            </Route>
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
