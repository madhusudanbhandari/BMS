
import { useCallback, useEffect, useState } from "react";
import {
  FolderKanban,
  Plus,
  Trash2,
  RefreshCw,
  CircleAlert,
  X,
} from "lucide-react";
import { createProject, deleteProject, getProjects } from "../../api/managerApi";

function getOrganizationId() {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.organizationId != null) return user.organizationId;
    if (user.OrganizationId != null) return user.OrganizationId;
  } catch {}

  try {
    const token = localStorage.getItem("token");
    const claims = JSON.parse(
      atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))
    );
    return claims.organizationId ?? claims.OrganizationId ?? claims.organization_id ?? null;
  } catch {
    return null;
  }
}

function field(item, camel, pascal) {
  return item?.[camel] ?? item?.[pascal];
}

export default function ManagerProjects() {
  const [projects, setProjects] = useState([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const orgId = getOrganizationId();
      if (orgId == null) {
        throw new Error("Organization ID is missing from your login session.");
      }

      const response = await getProjects(orgId);
      setProjects(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  async function handleCreate(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    try {
      await createProject({
        name: name.trim(),
        description: description.trim(),
      });

      setName("");
      setDescription("");
      setShowForm(false);
      setMessage("Project created successfully.");
      await loadProjects();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create the project.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    setDeletingId(id);
    setError("");
    setMessage("");

    try {
      await deleteProject(id);
      setProjects((current) =>
        current.filter((project) => field(project, "id", "Id") !== id)
      );
      setMessage("Project deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete the project.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
            <FolderKanban size={17} /> Workspace
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Projects
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Organize initiatives and manage project delivery.
          </p>
        </div>

        <button
          onClick={() => setShowForm((current) => !current)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? "Close form" : "New project"}
        </button>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {message}
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <CircleAlert size={18} className="mt-0.5 shrink-0" />
          <div>
            <p>{error}</p>
            <button onClick={loadProjects} className="mt-2 font-semibold underline">
              Try again
            </button>
          </div>
        </div>
      )}

      {showForm && (
        <section className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-bold text-slate-900">Create a project</h2>
          <p className="mt-1 text-sm text-slate-500">
            Enter the details for your new project.
          </p>

          <form onSubmit={handleCreate} className="mt-6 space-y-5">
            <div>
              <label htmlFor="project-name" className="mb-2 block text-sm font-semibold text-slate-700">
                Project name
              </label>
              <input
                id="project-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={150}
                placeholder="e.g. Customer Portal"
                className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label htmlFor="project-description" className="mb-2 block text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea
                id="project-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                maxLength={2000}
                rows={4}
                placeholder="Describe the project's goals..."
                className="w-full resize-y rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Creating..." : "Create project"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h2 className="font-bold text-slate-900">All projects</h2>
            <p className="mt-1 text-sm text-slate-500">
              {projects.length} project{projects.length === 1 ? "" : "s"} found
            </p>
          </div>
          <button
            onClick={loadProjects}
            disabled={loading}
            title="Refresh projects"
            className="rounded-lg border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 py-14 text-sm text-slate-500">
            <RefreshCw size={18} className="animate-spin" /> Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <FolderKanban className="mx-auto text-slate-300" size={38} />
            <h3 className="mt-3 font-semibold text-slate-800">No projects found</h3>
            <p className="mt-1 text-sm text-slate-500">
              Create a project to start managing your team's work.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3 sm:p-6">
            {projects.map((project) => {
              const id = field(project, "id", "Id");
              const status = field(project, "projectStatus", "ProjectStatus");

              return (
                <article
                  key={id}
                  className="flex min-w-0 flex-col rounded-xl border border-slate-200 p-5 transition hover:border-indigo-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600">
                      <FolderKanban size={20} />
                    </div>
                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      {status ?? "Pending"}
                    </span>
                  </div>

                  <h3 className="mt-4 break-words font-bold text-slate-900">
                    {field(project, "name", "Name")}
                  </h3>
                  <p className="mt-2 flex-1 break-words text-sm leading-6 text-slate-500">
                    {field(project, "description", "Description")}
                  </p>

                  <div className="mt-5 border-t border-slate-100 pt-4">
                    <button
                      onClick={() => handleDelete(id)}
                      disabled={deletingId === id}
                      className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={16} />
                      {deletingId === id ? "Deleting..." : "Delete project"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}