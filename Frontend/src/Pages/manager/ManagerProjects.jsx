
import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Plus, Pencil, Trash2, Users } from "lucide-react";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  assignTeamToProject,
  getTeams,
} from "../../api/managerApi";
import {
  field,
  listFromResponse,
  getOrganizationId,
  errorMessage,
  StatusBadge,
} from "./managerUtils";

const emptyForm = { name: "", description: "" };

export default function ManagerProjects() {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [teamIds, setTeamIds] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const orgId = getOrganizationId();
      if (orgId == null) {
        throw new Error("Organization ID was not found in your login data.");
      }

      const [projectResponse, teamResponse] = await Promise.all([
        getProjects(orgId),
        getTeams(),
      ]);

      setProjects(listFromResponse(projectResponse));
      setTeams(listFromResponse(teamResponse));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function startEdit(project) {
    setEditingId(field(project, "id", "Id"));
    setForm({
      name: field(project, "name", "Name") ?? "",
      description: field(project, "description", "Description") ?? "",
    });
    setNotice("");
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const data = {
        Name: form.name.trim(),
        Description: form.description.trim(),
      };

      if (!data.Name) throw new Error("Project name is required.");

      if (editingId != null) {
        const current = projects.find(
          (p) => String(field(p, "id", "Id")) === String(editingId)
        );

        // Keep the existing enum value unless you choose a different
        // status using a separate enum-aware editor.
        data.projectStatus =
          field(current, "projectStatus", "ProjectStatus") ?? 1;

        await updateProject(editingId, data);
        setNotice("Project updated successfully.");
      } else {
        await createProject(data);
        setNotice("Project created successfully.");
      }

      resetForm();
      await load();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(project) {
    const id = field(project, "id", "Id");
    const name = field(project, "name", "Name") ?? "this project";

    if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    setError("");
    setNotice("");

    try {
      await deleteProject(id);
      setNotice("Project deleted successfully.");
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function handleAssignTeam(project) {
    const projectId = field(project, "id", "Id");
    const teamId = teamIds[projectId];

    if (!teamId) {
      setError("Choose a team before assigning it.");
      return;
    }

    setError("");
    setNotice("");

    try {
      await assignTeamToProject({
        ProjectId: Number(projectId),
        TeamId: Number(teamId),
      });

      setNotice("Team assigned to the project successfully.");
      await load();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Projects</h1>
        <p className="mt-1 text-sm text-slate-500">
          Create projects, update details, assign teams, and manage existing work.
        </p>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
          {notice}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-900">
          {editingId == null ? "Create project" : "Edit project"}
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            required
            maxLength={150}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Project name"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
          />
          <input
            required
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Project description"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            <Plus size={16} />
            {saving ? "Saving..." : editingId == null ? "Create project" : "Save changes"}
          </button>

          {editingId != null && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel edit
            </button>
          )}
        </div>
      </form>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h2 className="font-bold text-slate-900">All projects</h2>
          <button onClick={load} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" title="Refresh">
            <RefreshCw size={17} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-slate-500">
            <RefreshCw size={18} className="animate-spin" /> Loading projects...
          </div>
        ) : projects.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">No projects found.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {projects.map((project, index) => {
              const id = field(project, "id", "Id");
              const name = field(project, "name", "Name") ?? "Unnamed project";
              const description = field(project, "description", "Description") ?? "No description";
              const status = field(project, "projectStatus", "ProjectStatus", "status", "Status");
              const assignedTeamId = field(project, "teamId", "TeamId");

              return (
                <article key={id ?? index} className="space-y-4 p-5">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{name}</h3>
                        <StatusBadge value={status} />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{description}</p>
                      <p className="mt-2 text-xs text-slate-400">
                        Project ID: {id ?? "—"} · Assigned team ID: {assignedTeamId ?? "Not assigned"}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button onClick={() => startEdit(project)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-50">
                        <Pencil size={15} /> Edit
                      </button>
                      <button onClick={() => handleDelete(project)} className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
                        <Trash2 size={15} /> Delete
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <select
                      value={teamIds[id] ?? ""}
                      onChange={(e) => setTeamIds((prev) => ({ ...prev, [id]: e.target.value }))}
                      className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
                    >
                      <option value="">Choose team to assign</option>
                      {teams.map((team, teamIndex) => {
                        const teamId = field(team, "id", "Id");
                        return (
                          <option key={teamId ?? teamIndex} value={teamId}>
                            {field(team, "name", "Name") ?? `Team ${teamId}`}
                          </option>
                        );
                      })}
                    </select>
                    <button
                      onClick={() => handleAssignTeam(project)}
                      type="button"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 hover:bg-indigo-100"
                    >
                      <Users size={16} /> Assign team
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