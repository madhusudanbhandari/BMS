
import { useCallback, useState } from "react";
import { Plus, Pencil, Trash2, RefreshCw, X } from "lucide-react";
import {
  createTask,
  getProjectTasks,
  updateTask,
  deleteTask,
} from "../../api/taskApi";

const emptyForm = {
  title: "",
  description: "",
  status: "1",
  priority: "2",
  dueDate: "",
  projectId: "",
  assignedToUserId: "",
};

// These values must match the enums in your .NET backend.
const STATUS_OPTIONS = [
  { value: "1", label: "To do" },
  { value: "2", label: "In progress" },
  { value: "3", label: "Completed" },
  { value: "4", label: "Cancelled" },
];

const PRIORITY_OPTIONS = [
  { value: "1", label: "Low" },
  { value: "2", label: "Medium" },
  { value: "3", label: "High" },
];

const getError = (error) => {
  const data = error.response?.data;

  if (data?.errors) {
    return Object.entries(data.errors)
      .map(([field, messages]) => {
        const text = Array.isArray(messages)
          ? messages.join(", ")
          : String(messages);
        return `${field}: ${text}`;
      })
      .join(" | ");
  }

  return (
    data?.message ||
    data?.title ||
    error.message ||
    "Something went wrong."
  );
};

const field = (item, camel, pascal) =>
  item?.[camel] ?? item?.[pascal] ?? "";

const getEnumValue = (value, options, fallback) => {
  // Handles API responses that return either numeric enums or enum names.
  const text = String(value ?? "");

  if (options.some((option) => option.value === text)) {
    return text;
  }

  const matchingOption = options.find(
    (option) =>
      option.label.toLowerCase() === text.toLowerCase() ||
      option.value === text
  );

  return matchingOption?.value ?? fallback;
};

export default function TaskManagement() {
  const [projectId, setProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadTasks = useCallback(async () => {
    const id = Number(projectId);

    if (!projectId || !Number.isInteger(id) || id <= 0) {
      setTasks([]);
      setError("Enter a valid Project ID.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await getProjectTasks(id);
      setTasks(Array.isArray(result) ? result : []);
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const startCreate = () => {
    setEditingId(null);
    setForm({
      ...emptyForm,
      projectId,
    });
    setError("");
    setMessage("");
    setFormOpen(true);
  };

  const startEdit = (task) => {
    setEditingId(field(task, "id", "Id"));

    setForm({
      title: field(task, "title", "Title"),
      description: field(task, "description", "Description"),
      status: getEnumValue(
        field(task, "status", "Status"),
        STATUS_OPTIONS,
        "1"
      ),
      priority: getEnumValue(
        field(task, "priority", "Priority"),
        PRIORITY_OPTIONS,
        "2"
      ),
      dueDate: field(task, "dueDate", "DueDate")
        ? String(field(task, "dueDate", "DueDate")).slice(0, 10)
        : "",
      projectId: String(
        field(task, "projectId", "ProjectId") || projectId
      ),
      assignedToUserId: String(
        field(task, "assignedToUserId", "AssignedToUserId") || ""
      ),
    });

    setError("");
    setMessage("");
    setFormOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    const parsedProjectId = Number(form.projectId);
    const parsedUserId = Number(form.assignedToUserId);
    const parsedStatus = Number(form.status);
    const parsedPriority = Number(form.priority);

    if (!form.title.trim()) {
      setError("Task title is required.");
      return;
    }

    if (!Number.isInteger(parsedProjectId) || parsedProjectId <= 0) {
      setError("Enter a valid Project ID.");
      return;
    }

    if (!Number.isInteger(parsedUserId) || parsedUserId <= 0) {
      setError("Enter a valid Assigned User ID.");
      return;
    }

    if (!Number.isInteger(parsedStatus) || parsedStatus < 1) {
      setError("Select a valid task status.");
      return;
    }

    if (!Number.isInteger(parsedPriority) || parsedPriority < 1) {
      setError("Select a valid task priority.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        Title: form.title.trim(),
        Description: form.description.trim(),
        Status: parsedStatus,
        Priority: parsedPriority,

        // A date input provides YYYY-MM-DD.
        // Send midnight UTC when the backend expects a UTC DateTime.
        DueDate: form.dueDate
          ? `${form.dueDate}T00:00:00Z`
          : null,

        ProjectId: parsedProjectId,
        AssignedToUserId: parsedUserId,
      };

      console.log("Task payload:", payload);

      if (editingId !== null) {
        await updateTask(editingId, payload);
        setMessage("Task updated successfully.");
      } else {
        await createTask(payload);
        setMessage("Task created successfully.");
      }

      setFormOpen(false);
      setForm({ ...emptyForm, projectId: String(parsedProjectId) });
      setProjectId(String(parsedProjectId));

      // Reload using the submitted project ID, even if it changed in the form.
      const result = await getProjectTasks(parsedProjectId);
      setTasks(Array.isArray(result) ? result : []);
    } catch (err) {
      console.error("Task save failed:", err.response?.data ?? err);
      setError(getError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (task) => {
    const id = field(task, "id", "Id");
    const title = field(task, "title", "Title") || "this task";

    if (!window.confirm(`Delete "${title}"?`)) return;

    setError("");
    setMessage("");

    try {
      await deleteTask(id);
      setMessage("Task deleted successfully.");
      await loadTasks();
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
            Task Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Create, assign, and manage project tasks.
          </p>
        </div>

        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={18} />
          New task
        </button>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4">
        <label
          htmlFor="projectFilter"
          className="block text-sm font-medium text-gray-700"
        >
          Project ID
        </label>

        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="projectFilter"
            type="number"
            min="1"
            value={projectId}
            onChange={(event) => setProjectId(event.target.value)}
            placeholder="Enter project ID"
            className="rounded-lg border border-gray-300 px-3 py-2 sm:max-w-xs"
          />

          <button
            type="button"
            onClick={loadTasks}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Load tasks
          </button>
        </div>
      </section>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
        >
          {message}
        </p>
      )}

      {formOpen && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId !== null ? "Edit task" : "Create task"}
            </h2>

            <button
              type="button"
              onClick={() => setFormOpen(false)}
              aria-label="Close form"
              className="rounded-md p-2 text-gray-500 hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="taskTitle"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Task title
              </label>
              <input
                id="taskTitle"
                required
                value={form.title}
                onChange={(event) =>
                  setForm({ ...form, title: event.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="e.g. Implement login API"
              />
            </div>

            <div>
              <label
                htmlFor="taskDescription"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="taskDescription"
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm({ ...form, description: event.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Describe the task"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="taskStatus"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Status
                </label>
                <select
                  id="taskStatus"
                  required
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="taskPriority"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Priority
                </label>
                <select
                  id="taskPriority"
                  required
                  value={form.priority}
                  onChange={(event) =>
                    setForm({ ...form, priority: event.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
                >
                  {PRIORITY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="dueDate"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Due date
              </label>
              <input
                id="dueDate"
                type="date"
                value={form.dueDate}
                onChange={(event) =>
                  setForm({ ...form, dueDate: event.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 sm:max-w-xs"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="taskProjectId"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Project ID
                </label>
                <input
                  id="taskProjectId"
                  type="number"
                  min="1"
                  required
                  value={form.projectId}
                  onChange={(event) =>
                    setForm({ ...form, projectId: event.target.value })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                />
              </div>

              <div>
                <label
                  htmlFor="assignedToUserId"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Assigned User ID
                </label>
                <input
                  id="assignedToUserId"
                  type="number"
                  min="1"
                  required
                  value={form.assignedToUserId}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      assignedToUserId: event.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2"
                  placeholder="Enter user ID"
                />
              </div>
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
                    : "Create task"}
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
          <h2 className="font-semibold text-gray-900">Tasks</h2>
          <p className="mt-1 text-sm text-gray-500">
            {tasks.length} task{tasks.length === 1 ? "" : "s"}
          </p>
        </div>

        {loading ? (
          <p className="p-10 text-center text-sm text-gray-500">
            Loading tasks...
          </p>
        ) : tasks.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-gray-900">No tasks found</p>
            <p className="mt-1 text-sm text-gray-500">
              Enter a project ID and load its tasks, or create a task.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Task", "Status", "Priority", "Due date", "Assigned user", "Actions"].map(
                    (heading) => (
                      <th
                        key={heading}
                        className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                      >
                        {heading}
                      </th>
                    )
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {tasks.map((task) => {
                  const id = field(task, "id", "Id");
                  const title =
                    field(task, "title", "Title") || "Untitled task";
                  const status = field(task, "status", "Status");
                  const priority = field(task, "priority", "Priority");
                  const dueDate = field(task, "dueDate", "DueDate");
                  const assignedUser = field(
                    task,
                    "assignedToUserId",
                    "AssignedToUserId"
                  );

                  const statusLabel =
                    STATUS_OPTIONS.find(
                      (option) => option.value === String(status)
                    )?.label ?? String(status || "Not set");

                  const priorityLabel =
                    PRIORITY_OPTIONS.find(
                      (option) => option.value === String(priority)
                    )?.label ?? String(priority || "Not set");

                  return (
                    <tr key={id} className="hover:bg-gray-50">
                      <td className="max-w-sm px-5 py-4">
                        <p className="font-medium text-gray-900">{title}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          {field(task, "description", "Description")}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                        {statusLabel}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                        {priorityLabel}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                        {dueDate ? String(dueDate).slice(0, 10) : "—"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                        {assignedUser || "—"}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => startEdit(task)}
                          aria-label={`Edit ${title}`}
                          className="mr-2 rounded-md p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(task)}
                          aria-label={`Delete ${title}`}
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