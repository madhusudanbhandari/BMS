import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Wallet,
  CalendarDays,
  ClipboardCheck,
  ChartNoAxesCombined,
  LogOut,
  Building2,
  Menu,
  X,
  MessageCircle,
} from "lucide-react";
import { useState } from "react";

const navigation = [
  {
    name: "Overview",
    path: "/hr",
    icon: LayoutDashboard,
    end: true,
  },
  {
    name: "Employees",
    path: "/hr/employees",
    icon: Users,
  },
  {
    name: "Salary Requests",
    path: "/hr/salary-requests",
    icon: Wallet,
  },
  {
    name: "Leave Management",
    path: "/hr/leaves",
    icon: CalendarDays,
  },
  {
    name: "Attendance",
    path: "/hr/attendance",
    icon: ClipboardCheck,
  },
  {
    name:"Chat",
    path:"hr/chat",
    icon:MessageCircle
  }
  
];

export default function HRLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function handleLogout() {
    [
      "token",
      "user",
      "role",
      "orgId",
      "authToken",
    ].forEach((key) => localStorage.removeItem(key));

    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Building2 size={23} />
            </div>

            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-900">
                WorkSphere
              </h1>
              <p className="text-xs font-medium text-slate-500">
                HR Workspace
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Human Resources
          </p>

          <nav className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={19}
                        className={
                          isActive
                            ? "text-indigo-600"
                            : "text-slate-400"
                        }
                      />
                      <span>{item.name}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-8 rounded-2xl border border-indigo-100 bg-indigo-50/70 p-4">
            <p className="text-sm font-semibold text-indigo-950">
              HR Workspace
            </p>
            <p className="mt-1 text-xs leading-5 text-indigo-800/80">
              Manage employees, salary requests, leave applications, and
              attendance from one place.
            </p>
          </div>
        </div>

        {/* Logout */}
        <div className="border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={19} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="min-h-screen lg:pl-72">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                HR Dashboard
              </h2>
              <p className="hidden text-sm text-slate-500 sm:block">
                Human resources management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-slate-800">
                HR Administrator
              </p>
              <p className="text-xs text-slate-500">
                Human Resources
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
              HR
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
