
import { Menu, Bell, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminHeader({ onMenuClick }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur sm:px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
        >
          <Menu size={22} />
        </button>

        <div>
          <p className="text-sm font-semibold text-gray-900">
            Organization Dashboard
          </p>
          <p className="hidden text-xs text-gray-500 sm:block">
            Manage your workspace in one place
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          aria-label="Notifications"
          title="Notifications are not connected yet"
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
        >
          <Bell size={20} />
        </button>

        <div className="hidden h-8 w-px bg-gray-200 sm:block" />

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
            A
          </span>
          <span className="hidden sm:inline">Admin</span>
          <ChevronDown size={16} className="hidden sm:block" />
        </button>
      </div>
    </header>
  );
}