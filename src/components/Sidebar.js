// Add this menu item
<Link
  to="/notification-testing"
  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
    location.pathname === "/notification-testing"
      ? "bg-blue-600 text-white"
      : "text-gray-700 hover:bg-gray-100"
  }`}
>
  <Bell className="w-5 h-5" />
  API Testing Tool
</Link>;
