import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  LogOut,
  BriefcaseBusiness,
  Users,
  UsersRound,
} from "lucide-react";

const links = [
  { to: "/manager", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/manager/projects", label: "Projects", icon: FolderKanban },
  { to: "/manager/employees", label: "Employees", icon: Users },
  { to: "/manager/teams", label: "Teams", icon: UsersRound },
  { to: "/manager/tasks", label: "Tasks", icon: ListTodo },
];

export default function ManagerLayout() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Clear any other common auth keys if your app uses them.
    localStorage.removeItem("authToken");
    localStorage.removeItem("jwtToken");

    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:flex">
      {/* Sidebar */}
      <aside className="flex w-full shrink-0 flex-col border-b border-slate-200 bg-white px-4 py-4 md:min-h-screen md:w-64 md:border-b-0 md:border-r md:px-5 md:py-7">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 pb-5 md:pb-9">
          <div className="rounded-xl bg-indigo-600 p-2.5 text-white shadow-sm">
            <BriefcaseBusiness size={23} />
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900">
              WorkSphere
            </h1>
            <p className="mt-0.5 text-xs text-slate-500">
              Manager workspace
            </p>
          </div>
        </div>

        {/* Navigation */}
        <p className="mb-3 hidden px-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400 md:block">
          Workspace
        </p>

        <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex min-w-0 items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-medium transition sm:gap-3 md:justify-start ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-100"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`
              }
            >
              <Icon size={19} className="shrink-0" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="mt-4 border-t border-slate-100 pt-4 md:mt-auto md:pt-5">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 transition hover:bg-red-50 hover:text-red-600 md:justify-start"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur sm:px-8">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
              Workspace management
            </p>
            <h2 className="mt-1 truncate text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
              Manager Portal
            </h2>
          </div>

          <div className="flex shrink-0 items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5">
            <span className="h-2 w-2 rounded-full bg-indigo-600" />
            <span className="text-xs font-semibold text-indigo-700">
              Manager
            </span>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1600px] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}