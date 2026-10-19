
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  ListTodo,
  Users,
  Wallet,
  ArrowUpRight,
  Clock3,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import api from "../../api/axios";
import NotificationBell from "../../components/NotificationBell";

const getItems = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const formatStatus = (status) => {
  if (status === undefined || status === null || status === "") {
    return "Not specified";
  }

  return String(status).replace(/([a-z])([A-Z])/g, "$1 $2");
};

const getStatusStyle = (status) => {
  const value = String(status ?? "").toLowerCase();

  if (value.includes("complete") || value.includes("released")) {
    return "bg-green-100 text-green-700";
  }

  if (value.includes("pending") || value.includes("progress")) {
    return "bg-amber-100 text-amber-700";
  }

  if (value.includes("reject") || value.includes("cancel")) {
    return "bg-red-100 text-red-700";
  }

  return "bg-gray-100 text-gray-700";
};

const EmployeeOverview = () => {
  const [teams, setTeams] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [salaries, setSalaries] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setLoading(true);
    setError("");

    try {
      const storedUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      const organizationId =
        storedUser.organizationId ?? storedUser.OrganizationId;

      if (!organizationId) {
        throw new Error(
          "Organization information is missing. Please sign in again."
        );
      }

      const [teamResponse, projectResponse, salaryResponse] =
        await Promise.all([
          api.get("/Team/view-my-teams"),
          api.get("/Project/view-all-projects", {
            params: { orgId: organizationId },
          }),
          api.get("/Salary/get-my-salaries", {
            params: { page: 1, pageSize: 100 },
          }),
        ]);

      const teamItems = getItems(teamResponse.data);
      const projectItems = getItems(projectResponse.data);
      const salaryItems = getItems(salaryResponse.data);

      setTeams(teamItems);
      setProjects(projectItems);
      setSalaries(salaryItems);

      const taskResponses = await Promise.all(
        projectItems.map((project) => {
          const projectId = project.id ?? project.Id;

          if (!projectId) return Promise.resolve([]);

          return api
            .get("/TaskItem/taskItems", {
              params: { projId: projectId },
            })
            .then((response) => getItems(response.data))
            .catch(() => []);
        })
      );

      setTasks(taskResponses.flat());
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load your dashboard."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const employeeName = (() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      return (
        user.firstName ??
        user.FirstName ??
        user.fullName ??
        user.name ??
        "Employee"
      );
    } catch {
      return "Employee";
    }
  })();

  const completedTasks = tasks.filter((task) => {
    const status = String(
      task.status ?? task.taskStatus ?? task.Status ?? ""
    ).toLowerCase();

    return status.includes("complete") || status === "done";
  }).length;

  const pendingSalaries = salaries.filter((salary) => {
    const status = String(
      salary.salaryStatus ?? salary.status ?? ""
    ).toLowerCase();

    return status.includes("pending");
  }).length;

  const stats = [
    {
      label: "My Teams",
      value: teams.length,
      description: "Teams you belong to",
      icon: Users,
      iconStyle: "bg-emerald-50 text-emerald-600",
      path: "/employee/teams",
    },
    {
      label: "My Projects",
      value: projects.length,
      description: "Projects in your organization",
      icon: FolderKanban,
      iconStyle: "bg-indigo-50 text-indigo-600",
      path: "/employee/projects",
    },
    {
      label: "My Tasks",
      value: tasks.length,
      description: `${completedTasks} completed`,
      icon: ListTodo,
      iconStyle: "bg-blue-50 text-blue-600",
      path: "/employee/tasks",
    },
    {
      label: "Salary Requests",
      value: salaries.length,
      description: `${pendingSalaries} pending`,
      icon: Wallet,
      iconStyle: "bg-amber-50 text-amber-600",
      path: "/employee/salary",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-96 items-center justify-center">
        <div className="flex items-center gap-3 text-gray-500">
          <RefreshCw className="h-5 w-5 animate-spin" />
          Loading your dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-indigo-600">
              EMPLOYEE WORKSPACE
            </p>

            <h1 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
              Welcome back, {employeeName}!
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Here is an overview of your work and salary requests.
            </p>
          </div>

        <div className="flex items-center gap-3 self-start">
            <NotificationBell />

            <button
              onClick={loadDashboard}
              className="inline-flex items-center justify-center gap-2 rounded-lg
                border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium
                text-gray-700 shadow-sm transition hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">
                Couldn't load all dashboard data
              </p>
              <p className="mt-1">{error}</p>
              <button
                onClick={loadDashboard}
                className="mt-2 font-semibold underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Link
                key={stat.label}
                to={stat.path}
                className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`rounded-xl p-3 ${stat.iconStyle}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <ArrowUpRight className="h-5 w-5 text-gray-400 transition group-hover:text-indigo-600" />
                </div>

                <p className="mt-5 text-sm font-medium text-gray-500">
                  {stat.label}
                </p>

                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {stat.value}
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  {stat.description}
                </p>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* Tasks */}
          <section className="rounded-2xl border border-gray-200 bg-white xl:col-span-2">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="font-semibold text-gray-900">
                  My Tasks
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Tasks associated with your projects
                </p>
              </div>

              <Link
                to="/employee/tasks"
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View all
              </Link>
            </div>

            {tasks.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <ListTodo className="mx-auto h-10 w-10 text-gray-300" />
                <p className="mt-3 font-medium text-gray-700">
                  No tasks to display
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  Tasks will appear here when available.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {tasks.slice(0, 5).map((task, index) => {
                  const taskId = task.id ?? task.Id ?? index;
                  const taskName =
                    task.title ??
                    task.name ??
                    task.taskName ??
                    task.Title ??
                    `Task ${index + 1}`;

                  const status =
                    task.status ?? task.taskStatus ?? task.Status;

                  return (
                    <div
                      key={taskId}
                      className="flex items-center justify-between gap-4 px-5 py-4 sm:px-6"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="rounded-lg bg-gray-100 p-2.5">
                          <ListTodo className="h-5 w-5 text-gray-600" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-800">
                            {taskName}
                          </p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                            <Clock3 className="h-3.5 w-3.5" />
                            {task.dueDate
                              ? `Due ${new Date(
                                  task.dueDate
                                ).toLocaleDateString()}`
                              : "No due date"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${getStatusStyle(status)}`}
                      >
                        {formatStatus(status)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Salary summary */}
          <section className="rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Salary Requests
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Your recent requests
                </p>
              </div>

              <Wallet className="h-5 w-5 text-amber-500" />
            </div>

            <div className="p-5">
              {salaries.length === 0 ? (
                <div className="py-7 text-center">
                  <Wallet className="mx-auto h-9 w-9 text-gray-300" />
                  <p className="mt-3 text-sm font-medium text-gray-700">
                    No salary requests yet
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {salaries.slice(0, 4).map((salary, index) => {
                    const salaryId = salary.id ?? salary.Id ?? index;
                    const status =
                      salary.salaryStatus ?? salary.status;

                    return (
                      <div
                        key={salaryId}
                        className="flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-gray-800">
                            Salary request #{salaryId}
                          </p>
                          <p className="mt-1 text-xs text-gray-500">
                            {salary.requestedAt
                              ? new Date(
                                  salary.requestedAt
                                ).toLocaleDateString()
                              : "Request date unavailable"}
                          </p>
                        </div>

                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-medium ${getStatusStyle(status)}`}
                        >
                          {formatStatus(status)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <Link
                to="/employee/salary"
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
              >
                <Wallet className="h-4 w-4" />
                Manage my salary
              </Link>
            </div>
          </section>
        </div>

        {/* Teams and projects */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">
                  My Teams
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Teams you are a member of
                </p>
              </div>

              <Users className="h-5 w-5 text-emerald-600" />
            </div>

            {teams.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                You haven't been assigned to a team yet.
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                {teams.slice(0, 4).map((team, index) => {
                  const teamId = team.id ?? team.Id ?? index;

                  return (
                    <div
                      key={teamId}
                      className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 font-semibold text-emerald-700">
                        {String(team.name ?? team.Name ?? "T")
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-gray-800">
                          {team.name ?? team.Name ?? `Team ${teamId}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          Team member
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Link
              to="/employee/teams"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View teams <ArrowUpRight className="h-4 w-4" />
            </Link>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">
                  My Projects
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Projects in your workspace
                </p>
              </div>

              <FolderKanban className="h-5 w-5 text-indigo-600" />
            </div>

            {projects.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No projects are available.
              </p>
            ) : (
              <div className="mt-5 space-y-3">
                {projects.slice(0, 4).map((project, index) => {
                  const projectId =
                    project.id ?? project.Id ?? index;

                  return (
                    <div
                      key={projectId}
                      className="flex items-center gap-3 rounded-xl bg-gray-50 p-3"
                    >
                      <div className="rounded-lg bg-indigo-100 p-2.5">
                        <FolderKanban className="h-5 w-5 text-indigo-600" />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-gray-800">
                          {project.name ??
                            project.Name ??
                            project.title ??
                            `Project ${projectId}`}
                        </p>
                        <p className="text-xs text-gray-500">
                          {project.description ??
                            "View project tasks and details"}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <Link
              to="/employee/projects"
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View projects <ArrowUpRight className="h-4 w-4" />
            </Link>
          </section>
        </div>

        {/* Quick actions */}
        <section>
          <h2 className="mb-4 font-semibold text-gray-900">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Link
              to="/employee/tasks"
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm"
            >
              <ListTodo className="h-5 w-5 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">
                View my tasks
              </span>
              <ArrowUpRight className="ml-auto h-4 w-4 text-gray-400" />
            </Link>

            <Link
              to="/employee/salary"
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm"
            >
              <Wallet className="h-5 w-5 text-amber-600" />
              <span className="text-sm font-medium text-gray-700">
                Request salary
              </span>
              <ArrowUpRight className="ml-auto h-4 w-4 text-gray-400" />
            </Link>

            <Link
              to="/employee/teams"
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-indigo-200 hover:shadow-sm"
            >
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-medium text-gray-700">
                Explore my teams
              </span>
              <ArrowUpRight className="ml-auto h-4 w-4 text-gray-400" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EmployeeOverview;
