import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  UsersRound,
  UserCheck,
  ArrowUpRight,
  FolderKanban,
  ListTodo,
} from "lucide-react";

import {
  getTeams,
  getPendingUsers,
} from "../../api/adminApi";

import { getAllProjects } from "../../api/projectApi";
import { getProjectTasks } from "../../api/taskApi";

const cards = [
  {
    title: "Teams",
    key: "teams",
    icon: UsersRound,
    path: "/admin/teams",
    description: "Manage your organization's teams",
  },
  {
    title: "Pending Approvals",
    key: "pending",
    icon: UserCheck,
    path: "/admin/pending-users",
    description: "Review new user requests",
  },
  {
    title: "Projects",
    key: "projects",
    icon: FolderKanban,
    path: "/admin/projects",
    description: "Manage your organization's projects",
  },
  {
    title: "Tasks",
    key: "tasks",
    icon: ListTodo,
    path: "/admin/task-management",
    description: "Manage and track tasks",
  },
];

export default function AdminOverview() {
  const [stats, setStats] = useState({
    teams: null,
    pending: null,
    projects: null,
    tasks: null,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOverview() {
      setLoading(true);
      setError("");

      const failures = [];

      try {
        // Read the logged-in user's organization ID.
        const savedUser = JSON.parse(
          localStorage.getItem("user") || "{}"
        );

        const organizationId = Number(
          savedUser.organizationId ?? savedUser.OrganizationId
        );

        if (!Number.isInteger(organizationId) || organizationId <= 0) {
          throw new Error("A valid organization ID was not found.");
        }

        // Load teams, pending users, and projects.
        const [teamsResult, pendingResult, projectsResult] =
          await Promise.allSettled([
            getTeams(),
            getPendingUsers(),
            getAllProjects(organizationId),
          ]);

        if (!active) return;

        const getArray = (result, label) => {
          if (
            result.status === "fulfilled" &&
            Array.isArray(result.value)
          ) {
            return result.value;
          }

          failures.push(label);
          console.error(
            `${label} request failed:`,
            result.status === "rejected"
              ? result.reason
              : "Expected an array response."
          );

          return null;
        };

        const teams = getArray(teamsResult, "Teams");
        const pending = getArray(pendingResult, "Pending approvals");
        const projects = getArray(projectsResult, "Projects");

        let taskCount = null;

        // Fetch tasks for each project, then add their counts.
        if (projects !== null) {
          const taskResults = await Promise.allSettled(
            projects.map((project) => {
              const projectId = project.id ?? project.Id;

              if (!projectId) {
                throw new Error("A project is missing its ID.");
              }

              return getProjectTasks(projectId);
            })
          );

          if (!active) return;

          const taskLists = taskResults.map((result) => {
            if (
              result.status === "fulfilled" &&
              Array.isArray(result.value)
            ) {
              return result.value;
            }

            failures.push("Task items");

            if (result.status === "rejected") {
              console.error("Task items request failed:", result.reason);
            } else {
              console.error("Task items API did not return an array.");
            }

            return null;
          });

          // Only display a total if every project's task request succeeded.
          if (taskLists.every((tasks) => tasks !== null)) {
            taskCount = taskLists.reduce(
              (total, tasks) => total + tasks.length,
              0
            );
          }
        } else {
          failures.push("Task items");
        }

        setStats({
          teams: teams?.length ?? null,
          pending: pending?.length ?? null,
          projects: projects?.length ?? null,
          tasks: taskCount,
        });

        if (failures.length > 0) {
          setError(
            `Unable to load: ${[...new Set(failures)].join(", ")}.`
          );
        }
      } catch (err) {
        console.error("Dashboard statistics error:", err);

        if (active) {
          setError(
            err.message || "Unable to load dashboard statistics."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadOverview();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="flex flex-col gap-6 p-6 sm:p-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600">
              YOUR WORKSPACE
            </p>

            <h1 className="mt-2 text-3xl font-bold text-gray-900">
              Welcome to WorkSphere
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
              Manage your organization, review new registrations,
              and keep your teams organized from one place.
            </p>
          </div>

          <Link
            to="/admin/teams"
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Manage teams
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {error}
        </div>
      )}

      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900">
            Workspace overview
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            An overview of your organization's management tools.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            const value = stats[card.key];

            return (
              <Link
                key={card.key}
                to={card.path}
                className="block h-full"
              >
                <div className="h-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Icon size={22} />
                    </div>

                    <ArrowUpRight
                      size={18}
                      className="text-gray-400"
                    />
                  </div>

                  <p className="mt-5 text-sm font-medium text-gray-500">
                    {card.title}
                  </p>

                  <p className="mt-1 text-3xl font-bold text-gray-900">
                    {loading
                      ? "—"
                      : value !== null
                        ? value
                        : "N/A"}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-gray-500">
                    {card.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-gray-900">
          Quick actions
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Link
            to="/admin/pending-users"
            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-indigo-200 hover:shadow-sm"
          >
            <div>
              <h3 className="font-semibold text-gray-900">
                Review registrations
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Approve or reject people requesting to join.
              </p>
            </div>

            <ArrowUpRight className="shrink-0 text-indigo-600" />
          </Link>

          <Link
            to="/admin/teams"
            className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-indigo-200 hover:shadow-sm"
          >
            <div>
              <h3 className="font-semibold text-gray-900">
                Organize your teams
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Create teams and manage team membership.
              </p>
            </div>

            <ArrowUpRight className="shrink-0 text-indigo-600" />
          </Link>
        </div>
      </section>
    </div>
  );
}