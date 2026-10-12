
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  UsersRound,
  UserCheck,
  ArrowUpRight,
  FolderKanban,
  ListTodo,
} from "lucide-react";
import { getTeams, getPendingUsers } from "../../api/adminApi";

const cards = [
  {
    title: "Teams",
    key: "teams",
    icon: UsersRound,
    path: "/admin/teams",
    description: "Manage your organization’s teams",
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
    path:"/admin/projects",
    description: "Project management coming next",
  },
  {
    title: "Tasks",
    key: "tasks",
    icon: ListTodo,
    path: null,
    description: "Task management coming next",
  },
];

export default function AdminOverview() {
  const [stats, setStats] = useState({ teams: null, pending: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOverview() {
      setLoading(true);
      setError("");

      const results = await Promise.allSettled([
        getTeams(),
        getPendingUsers(),
      ]);

      if (!active) return;

      const [teamsResult, pendingResult] = results;

      setStats({
        teams:
          teamsResult.status === "fulfilled" &&
          Array.isArray(teamsResult.value)
            ? teamsResult.value.length
            : null,
        pending:
          pendingResult.status === "fulfilled" &&
          Array.isArray(pendingResult.value)
            ? pendingResult.value.length
            : null,
      });

      if (results.some((result) => result.status === "rejected")) {
        setError("Some dashboard statistics could not be loaded.");
      }

      setLoading(false);
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
              Manage your organization, review new registrations, and keep
              your teams organized from one place.
            </p>
          </div>

          <Link
            to="/admin/teams"
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Manage teams <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>

      {error && (
        <div
          role="status"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          {error} Check your API connection and try again.
        </div>
      )}

      <section>
        <div className="mb-5">
          <h2 className="text-xl font-bold text-gray-900">
            Workspace overview
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            An overview of your organization’s management tools.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;
            const value =
              card.key === "teams"
                ? stats.teams
                : card.key === "pending"
                  ? stats.pending
                  : null;

            const content = (
              <div
                className={`h-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition ${
                  card.path ? "hover:-translate-y-0.5 hover:shadow-md" : ""
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <Icon size={22} />
                  </div>
                  {card.path && (
                    <ArrowUpRight size={18} className="text-gray-400" />
                  )}
                </div>

                <p className="mt-5 text-sm font-medium text-gray-500">
                  {card.title}
                </p>

                <p className="mt-1 text-3xl font-bold text-gray-900">
                  {loading
                    ? "—"
                    : value !== null
                      ? value
                      : "—"}
                </p>

                <p className="mt-2 text-xs leading-5 text-gray-500">
                  {card.description}
                </p>
              </div>
            );

            return card.path ? (
              <Link key={card.key} to={card.path}>
                {content}
              </Link>
            ) : (
              <div key={card.key}>{content}</div>
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