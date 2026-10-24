
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
} from "lucide-react"; "lucide-react";

const EmployeeLayout = () => {
  const navigate = useNavigate();

  const navigation = [
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
    name:"My Attendence",
    path:"/employee/attendance",
    icon:CalendarCheck
    },
    {
      name:"My Leaves",
      path:"/employee/leaves",
      icon:CalendarDays
    },
    {
      name:"Chat",
      path:"/employee/chat",
      icon:MessageCircle
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-6">
          <h1 className="text-2xl font-bold text-indigo-600">
            WorkSphere
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Employee Workspace
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-5">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Workspace
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`
                }
              >
                <Icon size={19} />
                {item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-gray-100 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-gray-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
          <p className="text-sm font-medium text-gray-600">
            Employee Portal
          </p>
          <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
            Employee
          </span>
        </header>

        <div className="p-5 sm:p-7">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default EmployeeLayout;
