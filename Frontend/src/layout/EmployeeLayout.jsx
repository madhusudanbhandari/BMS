import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  Users,
  Wallet,
  LogOut,
  CalendarCheck,
  CalendarDays,
  MessageCircle,
  ChevronDown,
  Mail,
} from "lucide-react";

const EmployeeLayout = () => {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);

  // Read the logged-in user from localStorage
  const [user] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  });

  // Your stored user contains firstName and lastName
  const fullName =
    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
    "Employee";

  const email = user?.email || "";
  const role = user?.role || "Employee";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // IMPORTANT: Dashboard uses /employee, not /employee/dashboard
  const navItems = [
    {
      name: "Dashboard",
      path: "/employee",
      icon: LayoutDashboard,
      end: true,
    },
    {
      name: "My Projects",
      path: "/employee/projects",
      icon: FolderKanban,
    },
    {
      name: "My Tasks",
      path: "/employee/tasks",
      icon: ListTodo,
    },
    {
      name: "My Teams",
      path: "/employee/teams",
      icon: Users,
    },
    {
      name: "My Salary",
      path: "/employee/salary",
      icon: Wallet,
    },
    {
      name: "My Attendance",
      path: "/employee/attendance",
      icon: CalendarCheck,
    },
    {
      name: "My Leaves",
      path: "/employee/leaves",
      icon: CalendarDays,
    },
    {
      name: "Chat",
      path: "/employee/chat",
      icon: MessageCircle,
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar — original white design */}
      <aside className="fixed inset-y-0 left-0 z-30 flex w-64 flex-col border-r border-gray-200 bg-white">
        {/* Logo */}
        <div className="border-b border-gray-100 px-6 py-5">
          <h1 className="text-2xl font-bold text-indigo-700">
            WorkSphere
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Employee Portal
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
          {navItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar user information */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
              {initials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-gray-800">
                {fullName}
              </p>

              <p className="truncate text-xs text-gray-500">
                {role}
              </p>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              aria-label="Sign out"
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-red-600"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="ml-64 flex min-h-screen min-w-0 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-gray-200 bg-white px-6 shadow-sm">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">
              Manage your tasks
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Here's your employee workspace.
            </p>
          </div>

          {/* Profile dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowProfile((previous) => !previous)}
              aria-expanded={showProfile}
              aria-label="Toggle profile menu"
              className="flex items-center gap-3 rounded-xl px-3 py-2 transition hover:bg-gray-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-700">
                {initials}
              </div>

              <div className="hidden text-left sm:block">
                <p className="text-sm font-semibold text-gray-800">
                  {fullName}
                </p>

                <p className="text-xs text-gray-500">{role}</p>
              </div>

              <ChevronDown
                size={16}
                className={`text-gray-500 transition-transform ${
                  showProfile ? "rotate-180" : ""
                }`}
              />
            </button>

            {showProfile && (
              <>
                {/* Close menu when clicking outside */}
                <button
                  type="button"
                  aria-label="Close profile menu"
                  onClick={() => setShowProfile(false)}
                  className="fixed inset-0 z-10 cursor-default"
                />

                <div className="absolute right-0 top-full z-20 mt-2 w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
                  <div className="flex items-center gap-3 border-b border-gray-100 pb-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700">
                      {initials}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-800">
                        {fullName}
                      </p>

                      <p className="text-sm text-gray-500">{role}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 py-4">
                    <Mail
                      size={18}
                      className="mt-0.5 shrink-0 text-gray-400"
                    />

                    <p className="break-all text-sm text-gray-600">
                      {email || "No email available"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut size={18} />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Current page renders here */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default EmployeeLayout;