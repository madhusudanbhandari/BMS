import { useCallback, useEffect, useState } from "react";
import {
  FolderKanban,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ListTodo,
  CalendarDays,
  UserRound,
} from "lucide-react";

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

function getProjectName(project) {
  return (
    project.name ??
    project.Name ??
    project.projectName ??
    project.ProjectName ??
    "Untitled project"
  );
}

function getProjectId(project) {
  return (
    project.id ??
    project.Id ??
    project.projectId ??
    project.ProjectId ??
    ""
  );
}

function getTaskTitle(task) {
  return task.title ?? task.Title ?? "Untitled task";
}

function getTaskDescription(task) {
  return task.description ?? task.Description ?? "";
}

function getTaskStatus(task) {
  return task.status ?? task.Status ?? "Not specified";
}

function getTaskPriority(task) {
  return task.priority ?? task.Priority ?? "Not specified";
}

function getTaskDueDate(task) {
  return task.dueDate ?? task.DueDate ?? null;
}

function getTaskAssignee(task) {
  const user =
    task.assignedToUser ??
    task.AssignedToUser ??
    task.assignedUser ??
    task.AssignedUser;

  if (user) {
    const firstName = user.firstName ?? user.FirstName ?? "";
    const lastName = user.lastName ?? user.LastName ?? "";
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || user.email || user.Email || "Assigned user";
  }

  return (
    task.assignedToUserName ??
    task.AssignedToUserName ??
    task.assigneeName ??
    task.AssigneeName ??
    null
  );
}

function formatDate(value) {
  if (!value) return "No due date";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleDateString();
}

export default function EmployeeProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tasks are stored separately for each project.
  const [tasksByProject, setTasksByProject] = useState({});
  const [expandedProjects, setExpandedProjects] = useState({});
  const [taskLoading, setTaskLoading] = useState({});
  const [taskErrors, setTaskErrors] = useState({});

  const loadProjects = useCallback(async () => {
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

      const response = await api.get("/Project/view-all-projects", {
        params: { orgId },
      });

      setProjects(getItems(response));
    } catch (err) {
      setError(
        err.response?.status === 401
          ? "Your session could not be authenticated. Please sign in again."
          : err.response?.data?.message ||
              err.response?.data?.title ||
              err.message ||
              "Unable to load projects."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  async function loadProjectTasks(projectId) {
    setTaskLoading((previous) => ({
      ...previous,
      [projectId]: true,
    }));

    setTaskErrors((previous) => ({
      ...previous,
      [projectId]: "",
    }));

    try {
      const response = await api.get("/TaskItem/taskItems", {
        params: { projId: projectId },
      });

      setTasksByProject((previous) => ({
        ...previous,
        [projectId]: getItems(response),
      }));
    } catch (err) {
      setTaskErrors((previous) => ({
        ...previous,
        [projectId]:
          err.response?.data?.message ||
          err.response?.data?.title ||
          err.message ||
          "Unable to load tasks for this project.",
      }));
    } finally {
      setTaskLoading((previous) => ({
        ...previous,
        [projectId]: false,
      }));
    }
  }

  function toggleProject(projectId) {
    const isExpanded = Boolean(expandedProjects[projectId]);

    setExpandedProjects((previous) => ({
      ...previous,
      [projectId]: !isExpanded,
    }));

    // Load tasks the first time a project is expanded.
    // Cached tasks are reused when the project is collapsed and reopened.
    if (
      !isExpanded &&
      !Object.prototype.hasOwnProperty.call(
        tasksByProject,
        projectId
      ) &&
      !taskLoading[projectId]
    ) {
      loadProjectTasks(projectId);
    }
  }

  return (
    <EmployeePage
      title="My Projects"
      description="Review your projects and the tasks associated with each project."
      onRefresh={loadProjects}
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
          Loading projects...
        </div>
      ) : !error && projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <FolderKanban
            size={32}
            className="mx-auto text-slate-400"
          />

          <h2 className="mt-3 font-semibold text-slate-800">
            No projects found
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Projects available to your account will appear here.
          </p>
        </div>
      ) : (
        !error && (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {projects.map((project, index) => {
              const projectId = getProjectId(project);
              const isExpanded = Boolean(
                expandedProjects[projectId]
              );

              const tasks = tasksByProject[projectId] ?? [];
              const isLoadingTasks = Boolean(
                taskLoading[projectId]
              );
              const taskError = taskErrors[projectId];

              return (
                <article
                  key={projectId || index}
                  className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="p-5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <FolderKanban size={22} />
                    </div>

                    <h2 className="mt-4 font-semibold text-slate-900">
                      {getProjectName(project)}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      {project.description ??
                        project.Description ??
                        "No project description available."}
                    </p>

                    <div className="mt-4 border-t border-slate-100 pt-3">
                      <span className="text-xs font-medium text-slate-500">
                        Status:{" "}
                        {project.projectStatus ??
                          project.ProjectStatus ??
                          project.status ??
                          project.Status ??
                          "Not specified"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleProject(projectId)}
                      disabled={!projectId}
                      aria-expanded={isExpanded}
                      className="mt-4 flex w-full items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="flex items-center gap-2">
                        <ListTodo size={18} />
                        View project tasks
                      </span>

                      {isExpanded ? (
                        <ChevronUp size={18} />
                      ) : (
                        <ChevronDown size={18} />
                      )}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-200 bg-slate-50 p-4">
                      <h3 className="mb-3 font-semibold text-slate-800">
                        Project tasks
                      </h3>

                      {isLoadingTasks ? (
                        <p className="py-4 text-center text-sm text-slate-500">
                          Loading tasks...
                        </p>
                      ) : taskError ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                          <p>{taskError}</p>

                          <button
                            type="button"
                            onClick={() => loadProjectTasks(projectId)}
                            className="mt-2 font-semibold underline"
                          >
                            Try again
                          </button>
                        </div>
                      ) : tasks.length === 0 ? (
                        <p className="rounded-lg border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-500">
                          No tasks found for this project.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {tasks.map((task, taskIndex) => {
                            const taskId =
                              task.id ??
                              task.Id ??
                              task.taskItemId ??
                              task.TaskItemId ??
                              taskIndex;

                            const assignee = getTaskAssignee(task);
                            const dueDate = getTaskDueDate(task);

                            return (
                              <div
                                key={taskId}
                                className="rounded-lg border border-slate-200 bg-white p-4"
                              >
                                <h4 className="font-medium text-slate-900">
                                  {getTaskTitle(task)}
                                </h4>

                                {getTaskDescription(task) && (
                                  <p className="mt-1 text-sm text-slate-500">
                                    {getTaskDescription(task)}
                                  </p>
                                )}

                                <div className="mt-3 flex flex-wrap gap-2">
                                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                    Status: {getTaskStatus(task)}
                                  </span>

                                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                                    Priority: {getTaskPriority(task)}
                                  </span>
                                </div>

                                <div className="mt-3 space-y-2 text-xs text-slate-500">
                                  <p className="flex items-center gap-2">
                                    <CalendarDays size={14} />
                                    {dueDate
                                      ? `Due: ${formatDate(dueDate)}`
                                      : "No due date"}
                                  </p>

                                  {assignee && (
                                    <p className="flex items-center gap-2">
                                      <UserRound size={14} />
                                      Assigned to: {assignee}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )
      )}
    </EmployeePage>
  );
}