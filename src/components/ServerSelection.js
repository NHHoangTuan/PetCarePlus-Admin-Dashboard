// src/components/ServerSelection.js
import React, { useState, useEffect } from "react";
import {
  Server,
  Wifi,
  WifiOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings,
  Globe,
  Monitor,
} from "lucide-react";
import axios from "axios";

const ServerSelection = ({ onServerSelect, currentServer }) => {
  const [servers] = useState([
    {
      id: "local",
      name: "Local Development",
      url: "http://localhost:8080",
      description: "Local development server",
      icon: Monitor,
      color: "blue",
    },
    {
      id: "railway",
      name: "Railway (Dev)",
      url: "https://petcareplus-backend-dev.up.railway.app",
      description: "Railway dev server",
      icon: Globe,
      color: "green",
    },
    {
      id: "render",
      name: "Render (Dev Backup)",
      url: "https://petcareplus-sqp6.onrender.com",
      description: "Render backup dev server",
      icon: Server,
      color: "purple",
    },
  ]);

  const [serverStatus, setServerStatus] = useState({});
  const [checking, setChecking] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check all servers on component mount
    checkAllServers();
  }, []);

  const checkServerHealth = async (server) => {
    try {
      const response = await axios.get(`${server.url}/health`, {
        timeout: 5000, // 5 second timeout
        headers: {
          "Content-Type": "application/json",
        },
      });

      return {
        status: "online",
        responseTime: Date.now(),
        data: response.data,
      };
    } catch (error) {
      return {
        status: "offline",
        error: error.message,
        responseTime: null,
      };
    }
  };

  const checkAllServers = async () => {
    setChecking(true);
    const newStatus = {};

    // Check servers in parallel
    const checks = servers.map(async (server) => {
      const status = await checkServerHealth(server);
      newStatus[server.id] = status;
    });

    await Promise.all(checks);
    setServerStatus(newStatus);
    setChecking(false);
  };

  const handleServerSelect = (server) => {
    onServerSelect(server);
    setIsOpen(false);
  };

  const getStatusIcon = (serverId) => {
    const status = serverStatus[serverId];
    if (checking)
      return <Loader2 className="w-4 h-4 animate-spin text-gray-400" />;
    if (!status) return <AlertCircle className="w-4 h-4 text-gray-400" />;

    switch (status.status) {
      case "online":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "offline":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (serverId) => {
    const status = serverStatus[serverId];
    if (checking) return "Checking...";
    if (!status) return "Unknown";

    switch (status.status) {
      case "online":
        return "Online";
      case "offline":
        return "Offline";
      default:
        return "Unknown";
    }
  };

  const getColorClasses = (color, isSelected = false) => {
    const baseClasses = {
      blue: isSelected
        ? "bg-blue-50 border-blue-200 text-blue-900"
        : "bg-white border-gray-200 hover:border-blue-300",
      green: isSelected
        ? "bg-green-50 border-green-200 text-green-900"
        : "bg-white border-gray-200 hover:border-green-300",
      purple: isSelected
        ? "bg-purple-50 border-purple-200 text-purple-900"
        : "bg-white border-gray-200 hover:border-purple-300",
    };
    return baseClasses[color] || baseClasses.blue;
  };

  return (
    <div className="relative">
      {/* Server Selection Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        <Settings className="w-4 h-4 text-gray-500" />
        <span className="text-sm font-medium text-gray-700">
          {currentServer ? currentServer.name : "Select Server"}
        </span>
        {currentServer && getStatusIcon(currentServer.id)}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Select Server
              </h3>
              <button
                onClick={checkAllServers}
                disabled={checking}
                className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
              >
                <Loader2
                  className={`w-4 h-4 ${checking ? "animate-spin" : ""}`}
                />
              </button>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Choose which server to connect to
            </p>
          </div>

          {/* Server List */}
          <div className="p-2">
            {servers.map((server) => {
              const IconComponent = server.icon;
              const isSelected = currentServer?.id === server.id;
              const status = serverStatus[server.id];

              return (
                <button
                  key={server.id}
                  onClick={() => handleServerSelect(server)}
                  className={`w-full p-3 rounded-lg border-2 transition-all mb-2 text-left ${getColorClasses(
                    server.color,
                    isSelected
                  )}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{server.name}</h4>
                          {isSelected && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Current
                            </span>
                          )}
                        </div>
                        <p className="text-sm opacity-75 mt-1">
                          {server.description}
                        </p>
                        <p className="text-xs opacity-60 mt-1 font-mono">
                          {server.url}
                        </p>

                        {/* Status Details */}
                        {status &&
                          status.status === "online" &&
                          status.data && (
                            <div className="mt-2 text-xs opacity-75">
                              <div>Status: {status.data.status || "OK"}</div>
                              {status.data.timestamp && (
                                <div>
                                  Last Check:{" "}
                                  {new Date(
                                    status.data.timestamp
                                  ).toLocaleTimeString()}
                                </div>
                              )}
                            </div>
                          )}

                        {status && status.status === "offline" && (
                          <div className="mt-2 text-xs text-red-600">
                            Error: {status.error}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Indicator */}
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      {getStatusIcon(server.id)}
                      <span
                        className={`text-xs font-medium ${
                          status?.status === "online"
                            ? "text-green-600"
                            : status?.status === "offline"
                            ? "text-red-600"
                            : "text-gray-500"
                        }`}
                      >
                        {getStatusText(server.id)}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                Health checks run automatically
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServerSelection;
