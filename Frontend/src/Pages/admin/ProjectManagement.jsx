import { useEffect, useState } from "react";
import { Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import {
createProject,
getAllProjects,
updateProject,
deleteProject,
} from "../../api/projectApi";

const emptyForm = {
name: "",
description: "",
projectStatus: "Planned",
organizationId: "",
};

const getError = (error) =>
error.response?.data?.message ||
error.response?.data?.title ||
error.message ||
"Something went wrong.";

export default function ProjectManagement() {
const [projects, setProjects] = useState([]);
const [organizationId, setOrganizationId] = useState(
localStorage.getItem("organizationId") || ""
);
const [form, setForm] = useState(emptyForm);
const [editingId, setEditingId] = useState(null);
const [formOpen, setFormOpen] = useState(false);
const [loading, setLoading] = useState(false);
const [saving, setSaving] = useState(false);
const [error, setError] = useState("");
const [message, setMessage] = useState("");

const loadProjects = async () => {
if (!organizationId || Number(organizationId) <= 0) {
setProjects([]);
setError("Enter a valid Organization ID.");
return;
}


setLoading(true);
setError("");

try {
  const data = await getAllProjects(Number(organizationId));
  setProjects(Array.isArray(data) ? data : []);
} catch (err) {
  setError(getError(err));
} finally {
  setLoading(false);
}

};

useEffect(() => {
loadProjects();
}, []);

const startCreate = () => {
setEditingId(null);
setForm({ ...emptyForm, organizationId });
setError("");
setMessage("");
setFormOpen(true);
};

const startEdit = (project) => {
setEditingId(project.id ?? project.Id);
setForm({
name: project.name ?? project.Name ?? "",
description: project.description ?? project.Description ?? "",
projectStatus:
project.projectStatus ?? project.ProjectStatus ?? "Planned",
organizationId: String(
project.organizationId ?? project.OrganizationId ?? organizationId
),
});
setError("");
setMessage("");
setFormOpen(true);
};

const handleSubmit = async (event) => {
event.preventDefault();
setSaving(true);
setError("");
setMessage("");


try {
  const payload = {
    Name: form.name.trim(),
    Description: form.description.trim(),
    OrganizationId: Number(form.organizationId),
  };

  if (editingId !== null) {
    await updateProject(editingId, {
      ...payload,
      projectStatus: form.projectStatus,
    });
    setMessage("Project updated successfully.");
  } else {
    await createProject(payload);
    setMessage("Project created successfully.");
  }

  setFormOpen(false);
  await loadProjects();
} catch (err) {
  setError(getError(err));
} finally {
  setSaving(false);
}


};

const handleDelete = async (project) => {
const id = project.id ?? project.Id;
const name = project.name ?? project.Name ?? "this project";


if (!window.confirm(`Delete "${name}"?`)) return;

setError("");
setMessage("");

try {
  await deleteProject(id);
  setMessage("Project deleted successfully.");
  await loadProjects();
} catch (err) {
  setError(getError(err));
}


};

return ( 
<div className="space-y-6"> 
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"> 
        <div> 
            <p className="text-sm font-medium text-indigo-600">Workspace</p>
             <h1 className="mt-1 text-2xl font-bold text-gray-900">
                Project Management </h1>
                 <p className="mt-1 text-sm text-gray-500">
                Manage your organization's projects. </p> 
                </div>


    <button
      onClick={startCreate}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700"
    >
      <Plus size={18} /> New project
    </button>
  </div>

  <section className="rounded-xl border border-gray-200 bg-white p-4">
    <label
      htmlFor="organizationId"
      className="block text-sm font-medium text-gray-700"
    >
      Organization ID
    </label>
    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
      <input
        id="organizationId"
        type="number"
        min="1"
        value={organizationId}
        onChange={(event) => setOrganizationId(event.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 sm:max-w-xs"
        placeholder="Organization ID"
      />
      <button
        onClick={loadProjects}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
      >
        <RefreshCw size={16} /> Refresh
      </button>
    </div>
    <p className="mt-2 text-xs text-gray-500">
      This ID field is temporary. Later, obtain the organization ID from
      the authenticated user's context.
    </p>
  </section>

  {error && (
    <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
      {error}
    </p>
  )}

  {message && (
    <p role="status" className="rounded-lg bg-green-50 p-3 text-sm text-green-700">
      {message}
    </p>
  )}

  {formOpen && (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          {editingId !== null ? "Edit project" : "Create project"}
        </h2>
        <button
          onClick={() => setFormOpen(false)}
          aria-label="Close form"
          className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
            Project name
          </label>
          <input
            id="name"
            required
            value={form.name}
            onChange={(event) =>
              setForm({ ...form, name: event.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            placeholder="e.g. Customer Portal"
          />
        </div>

        <div>
          <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2"
            placeholder="Describe the project"
          />
        </div>

        {editingId !== null && (
          <div>
            <label htmlFor="projectStatus" className="mb-1 block text-sm font-medium text-gray-700">
              Project status
            </label>
            <select
              id="projectStatus"
              value={form.projectStatus}
              onChange={(event) =>
                setForm({ ...form, projectStatus: event.target.value })
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 sm:max-w-xs"
            >
              <option value="Planned">Planned</option>
              <option value="InProgress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="OnHold">On Hold</option>
            </select>
          </div>
        )}

        <div>
          <label htmlFor="formOrganizationId" className="mb-1 block text-sm font-medium text-gray-700">
            Organization ID
          </label>
          <input
            id="formOrganizationId"
            type="number"
            min="1"
            required
            value={form.organizationId}
            onChange={(event) =>
              setForm({ ...form, organizationId: event.target.value })
            }
            className="w-full rounded-lg border border-gray-300 px-3 py-2 sm:max-w-xs"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editingId !== null
                ? "Save changes"
                : "Create project"}
          </button>
          <button
            type="button"
            onClick={() => setFormOpen(false)}
            className="rounded-lg border border-gray-300 px-4 py-2.5 font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </section>
  )}

  <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
    <div className="border-b border-gray-200 px-5 py-4">
      <h2 className="font-semibold text-gray-900">Projects</h2>
      <p className="mt-1 text-sm text-gray-500">
        {projects.length} project{projects.length === 1 ? "" : "s"}
      </p>
    </div>

    {loading ? (
      <p className="p-10 text-center text-sm text-gray-500">
        Loading projects...
      </p>
    ) : projects.length === 0 ? (
      <div className="p-10 text-center">
        <p className="font-medium text-gray-900">No projects found</p>
        <p className="mt-1 text-sm text-gray-500">
          Create a project to get started.
        </p>
      </div>
    ) : (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {["Project", "Status", "Organization", "Actions"].map((heading) => (
                <th
                  key={heading}
                  className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {projects.map((project) => {
              const id = project.id ?? project.Id;
              const name = project.name ?? project.Name ?? "Untitled project";
              const status =
                project.projectStatus ??
                project.ProjectStatus ??
                project.status ??
                "Not set";
              const org =
                project.organizationId ?? project.OrganizationId ?? "—";

              return (
                <tr key={id} className="hover:bg-gray-50">
                  <td className="max-w-md px-5 py-4">
                    <p className="font-medium text-gray-900">{name}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {project.description ?? project.Description ?? "No description"}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                      {status}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-600">
                    {org}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <button
                      onClick={() => startEdit(project)}
                      aria-label={`Edit ${name}`}
                      className="mr-2 rounded-md p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(project)}
                      aria-label={`Delete ${name}`}
                      className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    )}
  </section>
</div>


);
}
