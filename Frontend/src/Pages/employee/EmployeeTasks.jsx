
import { useCallback, useEffect, useState } from "react";
import {
  ListTodo,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";

import {
  getEmployeeTasks,
  updateTaskStatus,
} from "../../api/taskApi";

import EmployeePage from "./EmployeePage";

const TASK_STATUSES = [
  { value: 1, label: "Todo" },
  { value: 2, label: "In Progress" },
  { value: 3, label: "Completed" },
  { value: 4, label: "Cancelled" },
];

const field = (item, camel, pascal) =>
  item?.[camel] ?? item?.[pascal];

const getItems = (data) => {
  if (Array.isArray(data)) return data;
  if (!data) return [];

  const collection =
    data.items ??
    data.Items ??
    data.data ??
    data.Data;

  if (Array.isArray(collection)) return collection;

  if (
    typeof data === "object" &&
    (data.id != null || data.Id != null) &&
    (data.title != null || data.Title != null)
  ) {
    return [data];
  }

  return [];
};

const getTaskStatusCode = (status) => {
  if (typeof status === "number") return status;

  if (typeof status === "string" && /^\d+$/.test(status)) {
    return Number(status);
  }

  const normalized = String(status ?? "")
    .replace(/[\s_-]/g, "")
    .toLowerCase();

  const statusMap = {
    todo: 1,
    inprogress: 2,
    completed: 3,
    cancelled: 4,
    canceled: 4,
  };

  return statusMap[normalized] ?? 1;
};

const getStatusLabel = (status) =>
  TASK_STATUSES.find(
    (item) => item.value === getTaskStatusCode(status)
  )?.label ?? "Unknown";

const getStatusStyle = (status) => {
  switch (getTaskStatusCode(status)) {
    case 1:
      return "bg-slate-100 text-slate-700";
    case 2:
      return "bg-blue-100 text-blue-700";
    case 3:
      return "bg-emerald-100 text-emerald-700";
    case 4:
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const getError = (error, fallback) => {
  const data = error?.response?.data;

  if (typeof data === "string") {
    return fallback;
  }

  const message = data?.message ?? data?.detail ?? data?.title;

  if (
    typeof message === "string" &&
    message.length < 250 &&
    !/System\.| at .+\(|\.cs:line \d+/i.test(message)
  ) {
    return message;
  }

  switch (error?.response?.status) {
    case 400:
      return "The request was rejected. Check the task status and assignment.";
    case 401:
      return "Your session may have expired. Please sign in again.";
    case 403:
      return "You are not authorized to update this task.";
    case 404:
      return "The task was not found. Refresh your task list and try again.";
    case 500:
      return "The server encountered an error while updating the task. Check the backend logs.";
    default:
      return fallback;
  }
};

const getLoggedInEmployeeId = () => {
  try {
    const storedUser = JSON.parse(
      localStorage.getItem("user") || "{}"
    );

    return (
      storedUser.userId ??
      storedUser.UserId ??
      storedUser.id ??
      storedUser.Id ??
      null
    );
  } catch {
    return null;
  }
};

export default function EmployeeTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [updatingTasks, setUpdatingTasks] = useState({});

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const employeeId = getLoggedInEmployeeId();

      if (employeeId == null || employeeId === "") {
        throw new Error(
          "Employee information is missing. Please sign in again."
        );
      }

      const response = await getEmployeeTasks(employeeId);
      setTasks(getItems(response));
    } catch (err) {
      setTasks([]);

      setError(
        err.message ===
          "Employee information is missing. Please sign in again."
          ? err.message
          : getError(
              err,
              "Unable to load your tasks. Please try again."
            )
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleStatusChange = async (task, newStatus) => {
    const taskId = field(task, "id", "Id");

    if (getLoggedInEmployeeId() == null) {
      setError("Please sign in again to update your task.");
      return;
    }

    if (taskId == null) {
      setError("Cannot update this task because its ID is missing.");
      return;
    }

    const statusCode = Number(newStatus);
    const previousStatus = getTaskStatusCode(
      field(task, "status", "Status")
    );

    if (
      !TASK_STATUSES.some((item) => item.value === statusCode)
    ) {
      setError("Please select a valid task status.");
      return;
    }

    if (statusCode === previousStatus) return;

    setError("");
    setMessage("");

    setUpdatingTasks((previous) => ({
      ...previous,
      [taskId]: true,
    }));

    try {
      // IMPORTANT: Pass taskId first and the numeric status second.
      // Do not pass employeeId as the task ID.
      await updateTaskStatus(taskId, statusCode);

      setTasks((previousTasks) =>
        previousTasks.map((item) => {
          const itemId = field(item, "id", "Id");

          if (String(itemId) !== String(taskId)) {
            return item;
          }

          return {
            ...item,
            status: statusCode,
            Status: statusCode,
          };
        })
      );

      setMessage("Task status updated successfully.");
    } catch (err) {
      setError(
        getError(
          err,
          "Unable to update task status. Make sure the task is assigned to you."
        )
      );
    } finally {
      setUpdatingTasks((previous) => {
        const next = { ...previous };
        delete next[taskId];
        return next;
      });
    }
  };

  const completedTasks = tasks.filter(
    (task) =>
      getTaskStatusCode(field(task, "status", "Status")) === 3
  ).length;

  return (
    <EmployeePage>
      <div className="mx-auto w-full max-w-7xl space-y-6 p-4 sm:p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
              <ListTodo className="h-7 w-7 text-indigo-600" />
              My Tasks
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              View your assigned tasks and update their status.
            </p>
          </div>

          <button
            type="button"
            onClick={loadTasks}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Tasks
            </p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {tasks.length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Completed
            </p>
            <p className="mt-2 text-3xl font-bold text-emerald-600">
              {completedTasks}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Remaining
            </p>
            <p className="mt-2 text-3xl font-bold text-indigo-600">
              {tasks.length - completedTasks}
            </p>
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1">{error}</div>
          </div>
        )}

        {message && (
          <div
            role="status"
            className="flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            <CheckCircle2 className="h-5 w-5 shrink-0" />
            {message}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-12">
            <RefreshCw className="mr-3 h-5 w-5 animate-spin text-indigo-600" />
            <span className="text-sm text-slate-500">
              Loading your tasks...
            </span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <ListTodo className="mx-auto h-10 w-10 text-slate-400" />
            <h2 className="mt-4 text-lg font-semibold text-slate-800">
              No tasks found
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              You currently have no assigned tasks.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    {[
                      "Task",
                      "Priority",
                      "Due Date",
                      "Status",
                      "Update Status",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {tasks.map((task, index) => {
                    const taskId = field(task, "id", "Id");
                    const title =
                      field(task, "title", "Title") || "Untitled task";
                    const description =
                      field(task, "description", "Description") || "";
                    const status = getTaskStatusCode(
                      field(task, "status", "Status")
                    );
                    const priority =
                      field(task, "priority", "Priority") ?? "—";
                    const dueDate = field(task, "dueDate", "DueDate");
                    const isUpdating = Boolean(updatingTasks[taskId]);

                    return (
                      <tr
                        key={taskId ?? index}
                        className="transition-colors hover:bg-slate-50"
                      >
                        <td className="max-w-xs px-5 py-4">
                          <p className="font-medium text-slate-900">
                            {title}
                          </p>

                          {description && (
                            <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                              {description}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {String(priority)}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {dueDate
                            ? new Date(dueDate).toLocaleDateString()
                            : "—"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(status)}`}
                          >
                            {getStatusLabel(status)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <select
                            aria-label={`Update status for ${title}`}
                            value={status}
                            disabled={isUpdating || taskId == null}
                            onChange={(event) =>
                              handleStatusChange(task, event.target.value)
                            }
                            className="w-36 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:bg-slate-100"
                          >
                            {TASK_STATUSES.map((option) => (
                              <option
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </option>
                            ))}
                          </select>

                          {isUpdating && (
                            <p className="mt-1 text-xs text-indigo-600">
                              Updating...
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </EmployeePage>
  );
}
