import { useCallback, useEffect, useState } from "react";
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
status: "Todo",
priority: "Medium",
dueDate: "",
projectId: "",
};

const getError = (error) =>
error.response?.data?.message ||
error.response?.data?.title ||
error.message ||
"Something went wrong.";

const field = (item, camel, pascal) =>
item?.[camel] ?? item?.[pascal] ?? "";

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
if (!projectId || Number(projectId) <= 0) {
setTasks([]);
setError("Enter a valid Project ID.");
return;
}


setLoading(true);
setError("");

try {
  const result = await getProjectTasks(Number(projectId));
  setTasks(Array.isArray(result) ? result : []);
} catch (err) {
  setError(getError(err));
} finally {
  setLoading(false);
}


}, [projectId]);

useEffect(() => {
// Load tasks when a project ID has been entered and submitted.
}, []);

const startCreate = () => {
setEditingId(null);
setForm({ ...emptyForm, projectId });
setError("");
setMessage("");
setFormOpen(true);
};

const startEdit = (task) => {
setEditingId(field(task, "id", "Id"));
setForm({
title: field(task, "title", "Title"),
description: field(task, "description", "Description"),
status: String(field(task, "status", "Status") || "Todo"),
priority: String(field(task, "priority", "Priority") || "Medium"),
dueDate: field(task, "dueDate", "DueDate")
? String(field(task, "dueDate", "DueDate")).slice(0, 10)
: "",
projectId: String(
field(task, "projectId", "ProjectId") || projectId
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
    Title: form.title.trim(),
    Description: form.description.trim(),
    Status: form.status,
    Priority: form.priority,
    DueDate: form.dueDate || null,
    ProjectId: Number(form.projectId),
  };

  if (editingId !== null) {
    await updateTask(editingId, payload);
    setMessage("Task updated successfully.");
  } else {
    await createTask(payload);
    setMessage("Task created successfully.");
  }

  setFormOpen(false);
  await loadTasks();
} catch (err) {
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

return ( <div className="space-y-6"> <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"> <div> <p className="text-sm font-medium text-indigo-600">Workspace</p> <h1 className="mt-1 text-2xl font-bold text-gray-900">
Task Management </h1> <p className="mt-1 text-sm text-gray-500">
Track tasks belonging to a project. </p> </div>


    <button
      onClick={startCreate}
      className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700"
    >
      <Plus size={18} /> New task
    </button>
  </div>

  <section className="rounded-xl border border-gray-200 bg-white p-4">
    <label
      htmlFor="projectId"
      className="block text-sm font-medium text-gray-700"
    >
      Project ID
    </label>
    <div className="mt-2 flex flex-col gap-2 sm:flex-row">
      <input
        id="projectId"
        type="number"
        min="1"
        value={projectId}
        onChange={(event) => setProjectId(event.target.value)}
        placeholder="Enter project ID"
        className="rounded-lg border border-gray-300 px-3 py-2 sm:max-w-xs"
      />
      <button
        onClick={loadTasks}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
      >
        <RefreshCw size={16} /> Load tasks
      </button>
    </div>
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
          {editingId !== null ? "Edit task" : "Create task"}
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
          <label htmlFor="taskTitle" className="mb-1 block text-sm font-medium text-gray-700">
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
          <label htmlFor="taskDescription" className="mb-1 block text-sm font-medium text-gray-700">
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
            <label htmlFor="taskStatus" className="mb-1 block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="taskStatus"
              value={form.status}
              onChange={(event) =>
                setForm({ ...form, status: event.target.value })
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
            >
              <option value="Todo">To do</option>
              <option value="InProgress">In progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div>
            <label htmlFor="taskPriority" className="mb-1 block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              id="taskPriority"
              value={form.priority}
              onChange={(event) =>
                setForm({ ...form, priority: event.target.value })
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="dueDate" className="mb-1 block text-sm font-medium text-gray-700">
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

        <div>
          <label htmlFor="taskProjectId" className="mb-1 block text-sm font-medium text-gray-700">
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
            className="w-full rounded-lg border border-gray-300 px-3 py-2 sm:max-w-xs"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : editingId !== null ? "Save changes" : "Create task"}
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
              {["Task", "Status", "Priority", "Due date", "Actions"].map((heading) => (
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
            {tasks.map((task) => {
              const id = field(task, "id", "Id");
              const title = field(task, "title", "Title") || "Untitled task";
              const status = field(task, "status", "Status") || "Not set";
              const priority = field(task, "priority", "Priority") || "Not set";
              const dueDate = field(task, "dueDate", "DueDate");

              return (
                <tr key={id} className="hover:bg-gray-50">
                  <td className="max-w-sm px-5 py-4">
                    <p className="font-medium text-gray-900">{title}</p>
                    <p className="mt-1 text-sm text-gray-500">
                      {field(task, "description", "Description")}
                    </p>
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">{String(status)}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">{String(priority)}</td>
                  <td className="whitespace-nowrap px-5 py-4 text-sm text-gray-700">
                    {dueDate ? String(dueDate).slice(0, 10) : "—"}
                  </td>
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <button
                      onClick={() => startEdit(task)}
                      aria-label={`Edit ${title}`}
                      className="mr-2 rounded-md p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
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
