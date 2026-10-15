
import { useCallback, useEffect, useState } from "react";
import { ListTodo, AlertCircle } from "lucide-react";
import api from "../../api/axios";
import EmployeePage from "./EmployeePage";

function getItems(response) {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.Items)) return data.Items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.Data)) return data.Data;

  return [];
}

function readUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}");
  } catch {
    return {};
  }
}

function getProjectId(project) {
  return project.id ?? project.Id ?? project.projectId ??
    project.ProjectId ?? "";
}

function getTaskId(task) {
  return task.id ?? task.Id ?? task.taskItemId ??
    task.TaskItemId ?? "";
}

function getTaskName(task) {
  return task.title ?? task.Title ?? task.name ??
    task.Name ?? task.taskName ?? task.TaskName ?? "Untitled task";
}

function getTaskStatus(task) {
  return task.status ?? task.Status ?? "Not specified";
}

export default function EmployeeTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTasks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const user = readUser();
      const orgId =
        user.organizationId ??
        user.OrganizationId ??
        user.organization?.id ??
        user.organization?.Id;

      if (!orgId) {
        throw new Error(
          "Organization information is missing. Please sign in again."
        );
      }

      const projectResponse = await api.get("/Project/view-all-projects", {
        params: { orgId },
      });

      const projects = getItems(projectResponse);

      const results = await Promise.all(
        projects.map(async (project) => {
          const projectId = getProjectId(project);

          if (!projectId) return [];

          const response = await api.get("/TaskItem/taskItems", {
            params: { projId: projectId },
          });

          return getItems(response).map((task) => ({
            ...task,
            _projectName:
              project.name ??
              project.Name ??
              project.projectName ??
              project.ProjectName ??
              "Project",
          }));
        })
      );

      setTasks(results.flat());
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Your session could not be authenticated. Please sign in again."
          : err.response?.data?.message ||
              err.response?.data?.title ||
              err.message ||
              "Unable to load tasks."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  return (
    <EmployeePage
      title="My Tasks"
      description="Track tasks associated with your projects."
      onRefresh={loadTasks}
      refreshing={loading}
    >
      {error && (
        <div className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={20} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-slate-500">
          Loading tasks...
        </div>
      ) : !error && tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <ListTodo size={32} className="mx-auto text-slate-400" />
          <h2 className="mt-3 font-semibold text-slate-800">
            No tasks found
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Tasks available to your account will appear here.
          </p>
        </div>
      ) : (
        !error && (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="divide-y divide-slate-100">
              {tasks.map((task, index) => (
                <article
                  key={getTaskId(task) || index}
                  className="flex flex-col justify-between gap-3 p-5 sm:flex-row sm:items-center"
                >
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      {getTaskName(task)}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Project: {task._projectName}
                    </p>
                    {(task.description ?? task.Description) && (
                      <p className="mt-2 text-sm text-slate-600">
                        {task.description ?? task.Description}
                      </p>
                    )}
                  </div>

                  <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {getTaskStatus(task)}
                  </span>
                </article>
              ))}
            </div>
          </div>
        )
      )}
    </EmployeePage>
  );
}
