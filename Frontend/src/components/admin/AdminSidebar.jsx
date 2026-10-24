
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  UsersRound,
  FolderKanban,
  CheckCircle2,
  Building2,
  X,
  MessageCircle,
  
} from "lucide-react";

const navigation = [
  { label: "Overview", path: "/admin", icon: LayoutDashboard, end: true },
  {
    label: "User Approvals",
    path: "/admin/pending-users",
    icon: CheckCircle2,
  },
  { label: "Team Management", path: "/admin/teams", icon: UsersRound },
  { label: "Projects", path: "/admin/projects", icon: FolderKanban },
  { label: "Tasks", path: "/admin/task-management", icon: Users },
  {label:"Chat", path:"/admin/chat",icon:MessageCircle}
];

export default function AdminSidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <button
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-gray-900/30 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white transition-transform duration-200 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-gray-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700">
              <Building2 size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">WorkSphere</h1>
              <p className="text-xs text-gray-500">Admin workspace</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-4 pt-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map(({ label, path, icon: Icon, end }) => (
              <NavLink
                key={path}
                to={path}
                end={end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <Icon size={19} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="mt-auto border-t border-gray-100 p-5">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-800">
              Organization Admin
            </p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              Manage your organization, teams, and user access.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}