
import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  RefreshCw,
  Pencil,
  Trash2,
  ListTodo,
  Save,
  X,
} from "lucide-react";
import {
  getProjects,
  getTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  getOrganizationEmployees,
} from "../../api/managerApi";
import {
  field,
  listFromResponse,
  getOrganizationId,
  errorMessage,
  StatusBadge,
} from "./managerUtils";

const blankTask = {
  title: "",
  description: "",
  status: "1",
  priority: "2",
  dueDate: "",
  projectId: "",
  assignedToUserId: "",
};

// Update these options to match the actual C# enums in your project.
const TASK_STATUSES = [
  { value: "1", label: "Pending" },
  { value: "2", label: "In Progress" },
  { value: "3", label: "Completed" },
];

const TASK_PRIORITIES = [
  { value: "1", label: "Low" },
  { value: "2", label: "Medium" },
  { value: "3", label: "High" },
];

function taskStatusLabel(value) {
  if (value == null || value === "") return "Unknown";

  const found = TASK_STATUSES.find(
    (option) => Number(option.value) === Number(value)
  );

  return found?.label ?? String(value);
}

function taskPriorityLabel(value) {
  if (value == null || value === "") return "Unknown";

  const found = TASK_PRIORITIES.find(
    (option) => Number(option.value) === Number(value)
  );

  return found?.label ?? String(value);
}

function toDateInput(value) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const localDate = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return localDate.toISOString().slice(0, 16);
}

export default function ManagerTasks() {
  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState(blankTask);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const orgId = getOrganizationId();
      if (orgId == null) {
        throw new Error("Organization ID is missing from your login data.");
      }

      const [projectResponse, employeeResponse] = await Promise.all([
        getProjects(orgId),
        getOrganizationEmployees(),
      ]);

      const projectList = listFromResponse(projectResponse);
      setProjects(projectList);
      setEmployees(listFromResponse(employeeResponse));

      setSelectedProjectId((current) => {
        if (
          current &&
          projectList.some(
            (project) =>
              String(field(project, "id", "Id")) === String(current)
          )
        ) {
          return current;
        }

        return projectList.length
          ? String(field(projectList[0], "id", "Id"))
          : "";
      });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTasks = useCallback(async () => {
    if (!selectedProjectId) {
      setTasks([]);
      return;
    }

    setTasksLoading(true);
    setError("");

    try {
      const response = await getTasks(Number(selectedProjectId));
      setTasks(listFromResponse(response));
    } catch (err) {
      setError(errorMessage(err));
      setTasks([]);
    } finally {
      setTasksLoading(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  function resetForm() {
    setForm({ ...blankTask, projectId: selectedProjectId });
    setEditingId(null);
  }

  function startEdit(task) {
    setEditingId(field(task, "id", "Id"));

    const dueDate = field(task, "dueDate", "DueDate");
    const assignedId = field(
      task,
      "assignedToUserId",
      "AssignedToUserId"
    );

    setForm({
      title: field(task, "title", "Title") ?? "",
      description: field(task, "description", "Description") ?? "",
      status: String(field(task, "status", "Status") ?? 1),
      priority: String(field(task, "priority", "Priority") ?? 2),
      dueDate: toDateInput(dueDate),
      projectId: String(
        field(task, "projectId", "ProjectId") ?? selectedProjectId
      ),
      assignedToUserId:
        assignedId == null ? "" : String(assignedId),
    });

    setNotice("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      if (!form.title.trim()) {
        throw new Error("Task title is required.");
      }

      if (!form.projectId) {
        throw new Error("Choose a project.");
      }

      if (!form.assignedToUserId) {
        throw new Error("Choose an employee to assign this task to.");
      }

      const payload = {
        Title: form.title.trim(),
        Description: form.description.trim(),
        Status: Number(form.status),
        Priority: Number(form.priority),
        DueDate: form.dueDate
          ? new Date(form.dueDate).toISOString()
          : null,
        ProjectId: Number(form.projectId),
        AssignedToUserId: Number(form.assignedToUserId),
      };

      if (editingId != null) {
        await updateTask(editingId, payload);
        setNotice("Task updated successfully.");
      } else {
        await createTask(payload);
        setNotice("Task created successfully.");
      }

      setSelectedProjectId(String(form.projectId));
      resetForm();

      const response = await getTasks(Number(form.projectId));
      setTasks(listFromResponse(response));
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(task, value) {
    const id = field(task, "id", "Id");

    setError("");
    setNotice("");

    try {
      // Dedicated status endpoint expects UpdateStatusDto: { Status: ... }
      await updateTaskStatus(id, { Status: Number(value) });
      setNotice("Task status updated.");
      await loadTasks();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  async function handleDelete(task) {
    const id = field(task, "id", "Id");
    const title = field(task, "title", "Title") ?? "this task";

    if (!window.confirm(`Delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setError("");
    setNotice("");

    try {
      await deleteTask(id);
      setNotice("Task deleted successfully.");
      await loadTasks();
    } catch (err) {
      setError(errorMessage(err));
    }
  }

  const employeeName = (employee) =>
    field(employee, "name", "Name", "fullName", "FullName") ??
    field(employee, "email", "Email") ??
    `User ${field(employee, "id", "Id", "userId", "UserId")}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Tasks</h1>
          <p className="mt-1 text-sm text-slate-500">
            Create tasks, assign employees, and track task progress.
          </p>
        </div>

        <button
          onClick={loadTasks}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-50"
        >
          <RefreshCw size={16} /> Refresh tasks
        </button>
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

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Select project
        </label>

        <select
          value={selectedProjectId}
          onChange={(event) => {
            setSelectedProjectId(event.target.value);
            setForm({ ...blankTask, projectId: event.target.value });
            setEditingId(null);
          }}
          disabled={loading}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500"
        >
          <option value="">Choose a project</option>
          {projects.map((project, index) => {
            const id = field(project, "id", "Id");

            return (
              <option key={id ?? index} value={id}>
                {field(project, "name", "Name") ?? `Project ${id}`}
              </option>
            );
          })}
        </select>

        {!loading && projects.length === 0 && (
          <p className="mt-2 text-sm text-amber-700">
            Create a project before creating tasks.
          </p>
        )}
      </section>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-bold text-slate-900">
          {editingId == null ? "Create task" : `Edit task #${editingId}`}
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <input
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Task title"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
          />

          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Task description"
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-indigo-500"
          />

          <label className="text-sm text-slate-600">
            Status
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-3"
            >
              {TASK_STATUSES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-600">
            Priority
            <select
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-3"
            >
              {TASK_PRIORITIES.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm text-slate-600">
            Due date
            <input
              type="datetime-local"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3"
            />
          </label>

          <label className="text-sm text-slate-600">
            Assign employee
            <select
              required
              value={form.assignedToUserId}
              onChange={(e) =>
                setForm({ ...form, assignedToUserId: e.target.value })
              }
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-3"
            >
              <option value="">Choose employee</option>
              {employees.map((employee, index) => {
                const id = field(employee, "id", "Id", "userId", "UserId");

                return (
                  <option key={id ?? index} value={id}>
                    {employeeName(employee)}
                  </option>
                );
              })}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            disabled={saving || !selectedProjectId}
            className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            <Save size={16} />
            {saving ? "Saving..." : editingId == null ? "Create task" : "Save changes"}
          </button>

          {editingId != null && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              <X size={16} /> Cancel
            </button>
          )}
        </div>
      </form>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h2 className="font-bold text-slate-900">Project tasks</h2>
            <p className="mt-1 text-sm text-slate-500">
              {tasks.length} task(s)
            </p>
          </div>
          <ListTodo className="text-indigo-600" size={21} />
        </div>

        {tasksLoading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-slate-500">
            <RefreshCw size={18} className="animate-spin" /> Loading tasks...
          </div>
        ) : !selectedProjectId ? (
          <p className="p-10 text-center text-sm text-slate-500">
            Select a project to view its tasks.
          </p>
        ) : tasks.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500">
            No tasks found for this project.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {tasks.map((task, index) => {
              const id = field(task, "id", "Id");
              const title = field(task, "title", "Title") ?? "Untitled task";
              const description = field(task, "description", "Description");
              const status = field(task, "status", "Status");
              const priority = field(task, "priority", "Priority");
              const dueDate = field(task, "dueDate", "DueDate");
              const assignedId = field(
                task,
                "assignedToUserId",
                "AssignedToUserId"
              );

              return (
                <article key={id ?? index} className="space-y-3 p-5">
                  <div className="flex flex-col justify-between gap-3 sm:flex-row">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-slate-900">{title}</h3>
                        <StatusBadge value={taskStatusLabel(status)} />
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {description || "No description"}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        Priority: {taskPriorityLabel(priority)} · Assigned user ID: {assignedId ?? "Unassigned"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Due: {dueDate ? new Date(dueDate).toLocaleString() : "No due date"}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <button
                        onClick={() => startEdit(task)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
                      >
                        <Pencil size={14} /> Edit
                      </button>

                      <button
                        onClick={() => handleDelete(task)}
                        className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <label className="text-xs font-semibold text-slate-500">
                      Update status
                    </label>
                    <select
                      value={String(status ?? "")}
                      onChange={(e) => handleStatusChange(task, e.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      <option value="" disabled>
                        Current status unknown
                      </option>
                      {TASK_STATUSES.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
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
