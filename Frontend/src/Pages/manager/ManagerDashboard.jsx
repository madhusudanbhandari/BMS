import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  ListTodo,
  Users,
  UsersRound,
  ArrowRight,
  RefreshCw,
  CircleAlert,
  CheckCircle2,
  Clock3,
  PlayCircle,
  CalendarDays,
  ClipboardList,
} from "lucide-react";

import {
  getProjects,
  getTasks,
  getTeams,
} from "../../api/managerApi";
import { getOrganizationEmployees } from "../../api/managerApi";

/* -------------------- Helpers -------------------- */

function getOrganizationId() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    const storedOrgId =
      user.organizationId ??
      user.OrganizationId ??
      user.organization?.id ??
      user.Organization?.Id;

    if (storedOrgId != null) return storedOrgId;
  } catch {
    // Try the JWT claims below.
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const payload = token.split(".")[1];
    if (!payload) return null;

    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(base64);

    const claims = JSON.parse(
      decodeURIComponent(
        Array.from(decoded)
          .map((character) => {
            const hex = character.charCodeAt(0).toString(16).padStart(2, "0");
            return `%${hex}`;
          })
          .join("")
      )
    );

    return (
      claims.organizationId ??
      claims.OrganizationId ??
      claims.organization_id ??
      claims["organization:id"] ??
      null
    );
  } catch {
    return null;
  }
}

function unwrapResponse(response) {
  return response?.data ?? response;
}

function listFromResponse(response) {
  const data = unwrapResponse(response);

  if (Array.isArray(data)) return data;

  const possibleLists = [
    data?.items,
    data?.Items,
    data?.data,
    data?.Data,
    data?.results,
    data?.Results,
    data?.projects,
    data?.Projects,
    data?.tasks,
    data?.Tasks,
    data?.teams,
    data?.Teams,
    data?.employees,
    data?.Employees,
  ];

  for (const value of possibleLists) {
    if (Array.isArray(value)) return value;

    if (value && typeof value === "object") {
      const nested = value.items ?? value.Items;
      if (Array.isArray(nested)) return nested;
    }
  }

  return [];
}

function field(object, ...names) {
  for (const name of names) {
    if (object?.[name] !== undefined && object?.[name] !== null) {
      return object[name];
    }
  }

  return undefined;
}

function errorMessage(error) {
  return (
    error?.response?.data?.message ??
    error?.response?.data?.title ??
    error?.response?.data?.detail ??
    error?.message ??
    "Something went wrong while loading the dashboard."
  );
}

function projectStatusLabel(value) {
  if (value == null || value === "") return "Unknown";

  const statuses = {
    1: "Pending",
    2: "Assigned",
    3: "In Progress",
    4: "Completed",
  };

  return statuses[value] ?? String(value);
}

function taskStatusLabel(value) {
  if (value == null || value === "") return "Unknown";

  // Supports common string values and numeric enum responses.
  const normalized = String(value).toLowerCase();

  const textStatuses = {
    pending: "Pending",
    todo: "To Do",
    inprogress: "In Progress",
    "in progress": "In Progress",
    completed: "Completed",
    complete: "Completed",
    done: "Completed",
    cancelled: "Cancelled",
    canceled: "Cancelled",
  };

  if (textStatuses[normalized]) return textStatuses[normalized];

  // Adjust these numeric mappings to your actual TaskStat enum.
  const numericStatuses = {
    1: "Pending",
    2: "In Progress",
    3: "Completed",
  };

  return numericStatuses[value] ?? String(value);
}

function statusClasses(status) {
  switch (String(status).toLowerCase()) {
    case "completed":
    case "done":
      return "bg-emerald-50 text-emerald-700 ring-emerald-100";

    case "in progress":
      return "bg-blue-50 text-blue-700 ring-blue-100";

    case "assigned":
      return "bg-violet-50 text-violet-700 ring-violet-100";

    case "pending":
    case "to do":
      return "bg-amber-50 text-amber-700 ring-amber-100";

    case "cancelled":
    case "canceled":
    case "rejected":
      return "bg-red-50 text-red-700 ring-red-100";

    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusClasses(
        status
      )}`}
    >
      {status}
    </span>
  );
}

function StatCard({ title, value, description, icon: Icon, iconStyle }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${iconStyle}`}>
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, count, icon: Icon, iconStyle }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className={`rounded-lg p-2 ${iconStyle}`}>
          <Icon size={17} />
        </div>
        <span className="truncate text-sm font-medium text-slate-600">
          {label}
        </span>
      </div>

      <span className="text-sm font-bold tabular-nums text-slate-900">
        {count}
      </span>
    </div>
  );
}

/* -------------------- Dashboard -------------------- */

export default function ManagerDashboard() {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const orgId = getOrganizationId();

      if (orgId == null || orgId === "") {
        throw new Error(
          "Your organization ID is missing. Check the user object returned by login or the organization ID claim in your JWT."
        );
      }

      // Load the organization projects first.
      const projectResponse = await getProjects(orgId);
      const projectList = listFromResponse(projectResponse);

      setProjects(projectList);

      // Load tasks for each project because there is no all-tasks endpoint
      // in the TaskItemController shown in your backend.
      const taskResults = await Promise.all(
        projectList.map(async (project) => {
          const projectId = field(project, "id", "Id", "projectId", "ProjectId");

          if (projectId == null) return [];

          const response = await getTasks(Number(projectId));
          return listFromResponse(response);
        })
      );

      // Flatten the tasks and avoid duplicate IDs if the API returns them.
      const allTasks = taskResults.flat();
      const uniqueTasks = [];
      const seenTaskIds = new Set();

      for (const task of allTasks) {
        const taskId = field(task, "id", "Id");

        if (taskId == null) {
          uniqueTasks.push(task);
        } else if (!seenTaskIds.has(String(taskId))) {
          seenTaskIds.add(String(taskId));
          uniqueTasks.push(task);
        }
      }

      setTasks(uniqueTasks);

      // These endpoints are already present in the supplied controllers.
      // If either fails, the main projects/tasks overview can still display.
      const [teamResult, employeeResult] = await Promise.allSettled([
        getTeams(),
        getOrganizationEmployees(),
      ]);

      setTeams(
        teamResult.status === "fulfilled"
          ? listFromResponse(teamResult.value)
          : []
      );

      setEmployees(
        employeeResult.status === "fulfilled"
          ? listFromResponse(employeeResult.value)
          : []
      );
    } catch (err) {
      setError(errorMessage(err));
      setProjects([]);
      setTasks([]);
      setTeams([]);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const projectCounts = useMemo(() => {
    const counts = {
      Pending: 0,
      Assigned: 0,
      "In Progress": 0,
      Completed: 0,
      Other: 0,
    };

    for (const project of projects) {
      const rawStatus = field(
        project,
        "projectStatus",
        "ProjectStatus",
        "status",
        "Status"
      );

      const status = projectStatusLabel(rawStatus);

      if (Object.prototype.hasOwnProperty.call(counts, status)) {
        counts[status] += 1;
      } else {
        counts.Other += 1;
      }
    }

    return counts;
  }, [projects]);

  const taskCounts = useMemo(() => {
    const counts = {
      Pending: 0,
      "In Progress": 0,
      Completed: 0,
      Other: 0,
    };

    for (const task of tasks) {
      const rawStatus = field(task, "status", "Status");
      const status = taskStatusLabel(rawStatus);

      if (Object.prototype.hasOwnProperty.call(counts, status)) {
        counts[status] += 1;
      } else {
        counts.Other += 1;
      }
    }

    return counts;
  }, [tasks]);

  const recentProjects = useMemo(() => {
    return [...projects]
      .sort((a, b) => {
        const aDate = new Date(
          field(a, "createdAt", "CreatedAt", "createdDate", "CreatedDate") ?? 0
        ).getTime();

        const bDate = new Date(
          field(b, "createdAt", "CreatedAt", "createdDate", "CreatedDate") ?? 0
        ).getTime();

        // Projects without creation dates retain an approximate original order.
        if (!Number.isFinite(aDate) || !Number.isFinite(bDate)) return 0;

        return bDate - aDate;
      })
      .slice(0, 5);
  }, [projects]);

  if (loading) {
    return (
      <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-slate-500">
        <RefreshCw className="animate-spin text-indigo-600" size={25} />
        <p className="text-sm font-medium">Loading your workspace...</p>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-indigo-600">
            Your workspace
          </p>

          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Overview
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor your organization projects, teams, employees, and tasks.
          </p>
        </div>

        <button
          type="button"
          onClick={loadDashboard}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw size={16} />
          Refresh dashboard
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <CircleAlert className="mt-0.5 shrink-0" size={19} />

          <div className="min-w-0 flex-1">
            <p className="font-semibold">Dashboard could not load</p>
            <p className="mt-1 break-words">{error}</p>

            <button
              type="button"
              onClick={loadDashboard}
              className="mt-3 font-semibold underline underline-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Main statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total projects"
          value={projects.length}
          description="Projects returned for your organization"
          icon={FolderKanban}
          iconStyle="bg-indigo-50 text-indigo-600"
        />

        <StatCard
          title="Total tasks"
          value={tasks.length}
          description="Tasks across the projects loaded"
          icon={ListTodo}
          iconStyle="bg-blue-50 text-blue-600"
        />

        <StatCard
          title="Teams"
          value={teams.length}
          description="Teams visible to your account"
          icon={UsersRound}
          iconStyle="bg-violet-50 text-violet-600"
        />

        <StatCard
          title="Employees"
          value={employees.length}
          description="Employees returned by your organization endpoint"
          icon={Users}
          iconStyle="bg-emerald-50 text-emerald-600"
        />
      </div>

      {/* Project and task summaries */}
      <div className="grid gap-5 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900">Project status</h2>
              <p className="mt-1 text-sm text-slate-500">
                Current distribution of project statuses
              </p>
            </div>

            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600">
              <FolderKanban size={20} />
            </div>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            <SummaryRow
              label="Pending"
              count={projectCounts.Pending}
              icon={Clock3}
              iconStyle="bg-amber-50 text-amber-600"
            />

            <SummaryRow
              label="Assigned"
              count={projectCounts.Assigned}
              icon={ClipboardList}
              iconStyle="bg-violet-50 text-violet-600"
            />

            <SummaryRow
              label="In Progress"
              count={projectCounts["In Progress"]}
              icon={PlayCircle}
              iconStyle="bg-blue-50 text-blue-600"
            />

            <SummaryRow
              label="Completed"
              count={projectCounts.Completed}
              icon={CheckCircle2}
              iconStyle="bg-emerald-50 text-emerald-600"
            />

            {projectCounts.Other > 0 && (
              <SummaryRow
                label="Other / unrecognized"
                count={projectCounts.Other}
                icon={FolderKanban}
                iconStyle="bg-slate-100 text-slate-600"
              />
            )}
          </div>

          <Link
            to="/manager/projects"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Manage projects <ArrowRight size={16} />
          </Link>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-slate-900">Task status</h2>
              <p className="mt-1 text-sm text-slate-500">
                Progress of tasks across your projects
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
              <ListTodo size={20} />
            </div>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            <SummaryRow
              label="Pending"
              count={taskCounts.Pending}
              icon={Clock3}
              iconStyle="bg-amber-50 text-amber-600"
            />

            <SummaryRow
              label="In Progress"
              count={taskCounts["In Progress"]}
              icon={PlayCircle}
              iconStyle="bg-blue-50 text-blue-600"
            />

            <SummaryRow
              label="Completed"
              count={taskCounts.Completed}
              icon={CheckCircle2}
              iconStyle="bg-emerald-50 text-emerald-600"
            />

            {taskCounts.Other > 0 && (
              <SummaryRow
                label="Other / unrecognized"
                count={taskCounts.Other}
                icon={ListTodo}
                iconStyle="bg-slate-100 text-slate-600"
              />
            )}
          </div>

          <Link
            to="/manager/tasks"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Manage tasks <ArrowRight size={16} />
          </Link>
        </section>
      </div>

      {/* Quick actions */}
      <section>
        <div className="mb-4">
          <h2 className="font-bold text-slate-900">Quick actions</h2>
          <p className="mt-1 text-sm text-slate-500">
            Go directly to the area you need to manage.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Projects",
              description: "Create projects and assign teams.",
              to: "/manager/projects",
              icon: FolderKanban,
            },
            {
              title: "Employees",
              description: "View employees and their account status.",
              to: "/manager/employees",
              icon: Users,
            },
            {
              title: "Teams",
              description: "Create teams and manage membership.",
              to: "/manager/teams",
              icon: UsersRound,
            },
            {
              title: "Tasks",
              description: "Create tasks and assign employees.",
              to: "/manager/tasks",
              icon: ListTodo,
            },
          ].map(({ title, description, to, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 transition group-hover:bg-indigo-100">
                  <Icon size={21} />
                </div>

                <ArrowRight
                  size={17}
                  className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-indigo-600"
                />
              </div>

              <h3 className="mt-4 font-bold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent projects */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="font-bold text-slate-900">Recent projects</h2>
            <p className="mt-1 text-sm text-slate-500">
              The latest projects available in your organization.
            </p>
          </div>

          <Link
            to="/manager/projects"
            className="inline-flex items-center gap-1 self-start text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View all <ArrowRight size={16} />
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <FolderKanban size={26} />
            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              No projects yet
            </h3>

            <p className="mx-auto mt-1 max-w-sm text-sm leading-6 text-slate-500">
              Create your first project to organize work and start assigning tasks.
            </p>

            <Link
              to="/manager/projects"
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              <FolderKanban size={16} />
              Create project
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[650px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold sm:px-6">
                    Project
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Team
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Status
                  </th>
                  <th className="px-5 py-4 font-semibold">
                    Description
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {recentProjects.map((project, index) => {
                  const projectId = field(
                    project,
                    "id",
                    "Id",
                    "projectId",
                    "ProjectId"
                  );

                  const projectName =
                    field(project, "name", "Name") ?? "Untitled project";

                  const description =
                    field(project, "description", "Description") ??
                    "No description provided";

                  const rawStatus = field(
                    project,
                    "projectStatus",
                    "ProjectStatus",
                    "status",
                    "Status"
                  );

                  const teamName =
                    field(project, "teamName", "TeamName") ??
                    field(project?.team ?? project?.Team, "name", "Name") ??
                    (field(project, "teamId", "TeamId") != null
                      ? `Team #${field(project, "teamId", "TeamId")}`
                      : "Not assigned");

                  return (
                    <tr
                      key={projectId ?? index}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 sm:px-6">
                        <p className="font-semibold text-slate-900">
                          {projectName}
                        </p>
                        {projectId != null && (
                          <p className="mt-1 text-xs text-slate-400">
                            Project #{projectId}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {teamName}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge
                          status={projectStatusLabel(rawStatus)}
                        />
                      </td>

                      <td className="max-w-xs px-5 py-4 text-slate-500">
                        <p className="line-clamp-2">{description}</p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3 sm:px-6">
          <p className="flex items-center gap-2 text-xs text-slate-500">
            <CalendarDays size={14} />
            Statuses are based on the project data returned by your backend.
          </p>
        </div>
      </section>
    </div>
  );
}