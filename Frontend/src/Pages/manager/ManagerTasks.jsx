
import { useCallback, useEffect, useState } from "react";
import {
  ListTodo,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  CircleAlert,
  X,
} from "lucide-react";
import {
  createTask,
  deleteTask,
  getProjects,
  getTasks,
  updateTask,
} from "../../api/managerApi";

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

const emptyForm = {
  title: "",
  description: "",
  status: "0",
  priority: "1",
  dueDate: "",
  assignedToUserId: "",
};

const statusOptions = [
  { value: "0", label: "Pending" },
  { value: "1", label: "In Progress" },
  { value: "2", label: "Completed" },
];

const priorityOptions = [
  { value: "0", label: "Low" },
  { value: "1", label: "Medium" },
  { value: "2", label: "High" },
];

function statusClass(status) {
  const value = String(status).toLowerCase();

  if (value === "2" || value === "completed") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (value === "1" || value === "inprogress" || value === "in progress") {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-amber-50 text-amber-700";
}

function priorityClass(priority) {
  const value = String(priority).toLowerCase();

  if (value === "2" || value === "high") {
    return "bg-red-50 text-red-700";
  }

  if (value === "0" || value === "low") {
    return "bg-slate-100 text-slate-600";
  }

  return "bg-orange-50 text-orange-700";
}

function enumLabel(value, options) {
  const option = options.find((item) => item.value === String(value));
  return option?.label ?? String(value ?? "—");
}

const inputClass =
  "w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100";

export default function ManagerTasks() {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProjects = useCallback(async () => {
    setLoadingProjects(true);
    setError("");

    try {
      const orgId = getOrganizationId();
      if (orgId == null) {
        throw new Error("Organization ID is missing from your login session.");
      }

      const response = await getProjects(orgId);
      const list = Array.isArray(response.data) ? response.data : [];
      setProjects(list);

      setProjectId((current) => {
        if (current && list.some((p) => String(field(p, "id", "Id")) === current)) {
          return current;
        }
        return list.length ? String(field(list[0], "id", "Id")) : "";
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to load projects.");
    } finally {
      setLoadingProjects(false);
    }
  }, []);

  const loadTasks = useCallback(async () => {
    if (!projectId) {
      setTasks([]);
      return;
    }

    setLoadingTasks(true);
    setError("");

    try {
      const response = await getTasks(Number(projectId));
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load project tasks.");
    } finally {
      setLoadingTasks(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  }

  function startCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
    setMessage("");
    setError("");
  }

  function startEdit(task) {
    setEditingId(field(task, "id", "Id"));
    setForm({
      title: field(task, "title", "Title") ?? "",
      description: field(task, "description", "Description") ?? "",
      status: String(field(task, "status", "Status") ?? 0),
      priority: String(field(task, "priority", "Priority") ?? 1),
      dueDate: field(task, "dueDate", "DueDate")
        ? String(field(task, "dueDate", "DueDate")).slice(0, 10)
        : "",
      assignedToUserId:
        field(task, "assignedToUserId", "AssignedToUserId") == null
          ? ""
          : String(field(task, "assignedToUserId", "AssignedToUserId")),
    });

    setShowForm(true);
    setMessage("");
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!projectId) {
      setError("Create or select a project first.");
      return;
    }

    setSaving(true);
    setMessage("");
    setError("");

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: Number(form.status),
      priority: Number(form.priority),
      dueDate: form.dueDate
        ? `${form.dueDate}T00:00:00`
        : null,
      projectId: Number(projectId),
      assignedToUserId: form.assignedToUserId.trim()
        ? Number(form.assignedToUserId)
        : null,
    };

    try {
      if (editingId != null) {
        await updateTask(editingId, payload);
        setMessage("Task updated successfully.");
      } else {
        await createTask(payload);
        setMessage("Task created successfully.");
      }

      resetForm();
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save the task.");
    } finally {
      setSaving(false);
    }
  }

  async function changeStatus(task, status) {
    const id = field(task, "id", "Id");

    const payload = {
      title: field(task, "title", "Title"),
      description: field(task, "description", "Description") ?? "",
      status: Number(status),
      priority: Number(field(task, "priority", "Priority") ?? 0),
      dueDate: field(task, "dueDate", "DueDate") ?? null,
      projectId: Number(field(task, "projectId", "ProjectId") ?? projectId),
      assignedToUserId:
        field(task, "assignedToUserId", "AssignedToUserId") ?? null,
    };

    setError("");
    setMessage("");

    try {
      await updateTask(id, payload);
      setMessage("Task status updated.");
      await loadTasks();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update task status.");
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    setDeletingId(id);
    setError("");
    setMessage("");

    try {
      await deleteTask(id);
      setTasks((current) =>
        current.filter((task) => field(task, "id", "Id") !== id)
      );
      setMessage("Task deleted successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete the task.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
            <ListTodo size={17} /> Work management
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Tasks
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Assign work and track progress across your projects.
          </p>
        </div>

        <button
          onClick={startCreate}
          disabled={!projectId}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={18} /> New task
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
          <div>{error}</div>
        </div>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <label htmlFor="project-select" className="mb-2 block text-sm font-semibold text-slate-700">
          Select project
        </label>
        <select
          id="project-select"
          value={projectId}
          disabled={loadingProjects || projects.length === 0}
          onChange={(event) => {
            setProjectId(event.target.value);
            resetForm();
            setMessage("");
            setError("");
          }}
          className={`${inputClass} sm:max-w-md`}
        >
          {projects.length === 0 && <option value="">No projects available</option>}
          {projects.map((project) => (
            <option
              key={field(project, "id", "Id")}
              value={field(project, "id", "Id")}
            >
              {field(project, "name", "Name")}
            </option>
          ))}
        </select>
      </section>

      {showForm && (
        <section className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {editingId == null ? "Create a task" : "Edit task"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Provide the task details and assignment.
              </p>
            </div>
            <button
              onClick={resetForm}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
              aria-label="Close task form"
            >
              <X size={19} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <div>
              <label htmlFor="task-title" className="mb-2 block text-sm font-semibold text-slate-700">
                Task title
              </label>
              <input
                id="task-title"
                name="title"
                value={form.title}
                onChange={updateForm}
                required
                maxLength={200}
                className={inputClass}
                placeholder="e.g. Build authentication API"
              />
            </div>

            <div>
              <label htmlFor="task-assignee" className="mb-2 block text-sm font-semibold text-slate-700">
                Assigned user ID
              </label>
              <input
                id="task-assignee"
                name="assignedToUserId"
                type="number"
                min="1"
                value={form.assignedToUserId}
                onChange={updateForm}
                className={inputClass}
                placeholder="Optional user ID"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                The backend should verify the user belongs to this organization.
              </p>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="task-description" className="mb-2 block text-sm font-semibold text-slate-700">
                Description
              </label>
              <textarea
                id="task-description"
                name="description"
                value={form.description}
                onChange={updateForm}
                required
                maxLength={4000}
                rows={3}
                className={inputClass}
                placeholder="Describe what needs to be done..."
              />
            </div>

            <div>
              <label htmlFor="task-status" className="mb-2 block text-sm font-semibold text-slate-700">
                Status
              </label>
              <select
                id="task-status"
                name="status"
                value={form.status}
                onChange={updateForm}
                className={inputClass}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-priority" className="mb-2 block text-sm font-semibold text-slate-700">
                Priority
              </label>
              <select
                id="task-priority"
                name="priority"
                value={form.priority}
                onChange={updateForm}
                className={inputClass}
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-due-date" className="mb-2 block text-sm font-semibold text-slate-700">
                Due date
              </label>
              <input
                id="task-due-date"
                type="date"
                name="dueDate"
                value={form.dueDate}
                onChange={updateForm}
                className={inputClass}
              />
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <button
                disabled={saving}
                className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                {saving ? "Saving..." : editingId == null ? "Create task" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={resetForm}
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
            <h2 className="font-bold text-slate-900">Project tasks</h2>
            <p className="mt-1 text-sm text-slate-500">
              {tasks.length} task{tasks.length === 1 ? "" : "s"}
            </p>
          </div>
          <button
            onClick={loadTasks}
            disabled={loadingTasks || !projectId}
            title="Refresh tasks"
            className="rounded-lg border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50 hover:text-indigo-600 disabled:opacity-50"
          >
            <RefreshCw size={17} className={loadingTasks ? "animate-spin" : ""} />
          </button>
        </div>

        {loadingTasks ? (
          <div className="flex items-center justify-center gap-3 py-14 text-sm text-slate-500">
            <RefreshCw size={18} className="animate-spin" /> Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <ListTodo className="mx-auto text-slate-300" size={38} />
            <h3 className="mt-3 font-semibold text-slate-800">No tasks yet</h3>
            <p className="mt-1 text-sm text-slate-500">
              Create a task for this project to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Task</th>
                  <th className="px-5 py-4 font-semibold">Priority</th>
                  <th className="px-5 py-4 font-semibold">Status</th>
                  <th className="px-5 py-4 font-semibold">Assignee</th>
                  <th className="px-5 py-4 font-semibold">Due date</th>
                  <th className="px-5 py-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {tasks.map((task) => {
                  const id = field(task, "id", "Id");
                  const status = field(task, "status", "Status");
                  const priority = field(task, "priority", "Priority");
                  const assignedId = field(task, "assignedToUserId", "AssignedToUserId");
                  const dueDate = field(task, "dueDate", "DueDate");

                  return (
                    <tr key={id} className="align-top transition hover:bg-slate-50/70">
                      <td className="max-w-xs px-5 py-4">
                        <p className="font-semibold text-slate-800">
                          {field(task, "title", "Title")}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">
                          {field(task, "description", "Description")}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${priorityClass(priority)}`}>
                          {enumLabel(priority, priorityOptions)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <select
                          value={String(status ?? 0)}
                          onChange={(event) => changeStatus(task, event.target.value)}
                          aria-label={`Change status for task ${id}`}
                          className={`max-w-36 rounded-lg border-0 px-2.5 py-2 text-xs font-semibold outline-none ring-1 ring-inset ring-transparent focus:ring-indigo-300 ${statusClass(status)}`}
                        >
                          {statusOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {assignedId ?? "Unassigned"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-slate-500">
                        {dueDate ? String(dueDate).slice(0, 10) : "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(task)}
                            title="Edit task"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(id)}
                            disabled={deletingId === id}
                            title="Delete task"
                            className="rounded-lg border border-slate-200 p-2 text-red-600 transition hover:border-red-200 hover:bg-red-50 disabled:opacity-50"
                          >
                            {deletingId === id ? (
                              <RefreshCw size={15} className="animate-spin" />
                            ) : (
                              <Trash2 size={15} />
                            )}
                          </button>
                        </div>
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