import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  ListTodo,
  LogOut,
  BriefcaseBusiness,
} from "lucide-react";

const links = [
  { to: "/manager", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/manager/projects", label: "Projects", icon: FolderKanban },
  { to: "/manager/tasks", label: "Tasks", icon: ListTodo },
];

export default function ManagerLayout() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 md:flex">
      <aside className="flex w-full flex-col bg-slate-950 px-4 py-5 text-slate-200 md:min-h-screen md:w-64 md:shrink-0 md:px-5 md:py-7">
        <div className="flex items-center gap-3 px-2 pb-5 md:pb-10">
          <div className="rounded-xl bg-indigo-600 p-2.5 text-white">
            <BriefcaseBusiness size={23} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">
              WorkSphere
            </h1>
            <p className="text-xs text-slate-400">Manager workspace</p>
          </div>
        </div>

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
          Workspace
        </p>

        <nav className="grid grid-cols-3 gap-2 md:grid-cols-1">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center justify-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition md:justify-start ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/30"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`
              }
            >
              <Icon size={19} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="mt-5 border-t border-slate-800 pt-4 md:mt-auto">
          <button
            onClick={logout}
            className="flex w-full items-center justify-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-white md:justify-start"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-5 sm:px-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600">
              Workspace management
            </p>
            <h2 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              Manager Portal
            </h2>
          </div>

          <span className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
            Manager
          </span>
        </header>

        <div className="mx-auto max-w-7xl p-5 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}