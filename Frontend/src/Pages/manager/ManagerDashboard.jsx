
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderKanban,
  ListTodo,
  ArrowUpRight,
  CircleAlert,
  RefreshCw,
} from "lucide-react";
import { getProjects, getTasks } from "../../api/managerApi";

function getOrganizationId() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");

    if (user.organizationId != null) return user.organizationId;
    if (user.OrganizationId != null) return user.OrganizationId;
  } catch {
    // Fall back to the JWT.
  }

  try {
    const token = localStorage.getItem("token");
    if (!token) return null;

    const claims = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );

    return (
      claims.organizationId ??
      claims.OrganizationId ??
      claims.organization_id ??
      null
    );
  } catch {
    return null;
  }
}

function StatCard({ title, value, icon: Icon, description }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>

        <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
          <Icon size={23} />
        </div>
      </div>
    </div>
  );
}

function projectValue(project, camel, pascal) {
  return project?.[camel] ?? project?.[pascal];
}

export default function ManagerDashboard() {
  const [projects, setProjects] = useState([]);
  const [taskCount, setTaskCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadDashboard() {
    setLoading(true);
    setError("");

    try {
      const orgId = getOrganizationId();

      if (orgId == null) {
        throw new Error(
          "Organization ID is missing. Check your login response or JWT claims."
        );
      }

      const response = await getProjects(orgId);
      const list = Array.isArray(response.data) ? response.data : [];

      setProjects(list);

      const taskResponses = await Promise.all(
        list.map((project) =>
          getTasks(Number(projectValue(project, "id", "Id")))
        )
      );

      const total = taskResponses.reduce(
        (sum, result) =>
          sum + (Array.isArray(result.data) ? result.data.length : 0),
        0
      );

      setTaskCount(total);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load the dashboard."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-64 items-center justify-center gap-3 text-slate-500">
        <RefreshCw className="animate-spin" size={20} />
        Loading your workspace...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-indigo-600">Your workspace</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Overview
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Monitor your projects and keep work moving.
          </p>
        </div>

        <Link
          to="/manager/projects"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          <FolderKanban size={17} />
          Manage projects
        </Link>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <CircleAlert className="mt-0.5 shrink-0" size={18} />
          <div>
            <p className="font-semibold">Dashboard could not load</p>
            <p className="mt-1">{error}</p>
            <button
              onClick={loadDashboard}
              className="mt-3 font-semibold underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Total projects"
          value={projects.length}
          icon={FolderKanban}
          description="Projects in your organization"
        />
        <StatCard
          title="Total tasks"
          value={taskCount}
          icon={ListTodo}
          description="Tasks across your projects"
        />
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-sm">
          <p className="text-sm font-medium text-indigo-100">Quick action</p>
          <h3 className="mt-3 text-xl font-bold">Plan your next project</h3>
          <p className="mt-2 text-sm leading-6 text-indigo-100">
            Create a project and start organizing work for your team.
          </p>
          <Link
            to="/manager/projects"
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
          >
            Open projects <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="font-bold text-slate-900">Recent projects</h2>
            <p className="mt-1 text-sm text-slate-500">
              An overview of your latest projects.
            </p>
          </div>
          <Link
            to="/manager/projects"
            className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            View all <ArrowUpRight size={16} />
          </Link>
        </div>

        {projects.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FolderKanban className="mx-auto text-slate-300" size={35} />
            <h3 className="mt-3 font-semibold text-slate-800">
              No projects yet
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Create your first project to get started.
            </p>
            <Link
              to="/manager/projects"
              className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Create project
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Project</th>
                  <th className="px-6 py-4 font-semibold">Description</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.slice(0, 5).map((project) => (
                  <tr
                    key={projectValue(project, "id", "Id")}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-800">
                      {projectValue(project, "name", "Name")}
                    </td>
                    <td className="max-w-sm truncate px-6 py-4 text-slate-500">
                      {projectValue(project, "description", "Description")}
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                        {projectValue(project, "projectStatus", "projectStatus") ??
                          project.ProjectStatus ??
                          "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}