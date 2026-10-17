
import { useCallback, useEffect, useState } from "react";
import {
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
  X,
  Users,
  UserCheck,
} from "lucide-react";

import {
  createProject,
  getAllProjects,
  updateProject,
  deleteProject,
  assignTeam,
} from "../../api/projectApi";

import { getTeams } from "../../api/adminApi";

const PROJECT_STATUSES = [
  { value: 1, label: "Pending" },
  { value: 2, label: "Assigned" },
  { value: 3, label: "In Progress" },
  { value: 4, label: "Completed" },
];

const getId = (item) => item?.id ?? item?.Id;

const getStatusValue = (status) => {
  if (typeof status === "number") {
    return PROJECT_STATUSES.some((item) => item.value === status)
      ? status
      : 1;
  }

  const normalized = String(status ?? "")
    .replace(/[\s_-]/g, "")
    .toLowerCase();

  const match = PROJECT_STATUSES.find(
    (item) =>
      item.label.replace(/[\s_-]/g, "").toLowerCase() === normalized
  );

  return match?.value ?? 1;
};

const getStatusLabel = (status) => {
  const value = getStatusValue(status);
  return PROJECT_STATUSES.find((item) => item.value === value)?.label
    ?? "Pending";
};

const normalizeList = (response) => {
  let data = response?.data ?? response;

  // Support common API response wrappers.
  if (data && !Array.isArray(data) && Array.isArray(data.data)) {
    data = data.data;
  }

  if (data && !Array.isArray(data) && Array.isArray(data.$values)) {
    data = data.$values;
  }

  return Array.isArray(data) ? data : [];
};

const emptyForm = {
  name: "",
  description: "",
  projectStatus: 1,
  organizationId: "",
};

const getError = (error) => {
  const data = error.response?.data;

  if (data?.errors) {
    return Object.entries(data.errors)
      .map(([field, messages]) => {
        const value = Array.isArray(messages)
          ? messages.join(" ")
          : messages;

        return `${field}: ${value}`;
      })
      .join(" ");
  }

  if (typeof data === "string") return data;

  return (
    data?.message ||
    data?.title ||
    error.message ||
    "Something went wrong."
  );
};

const getSavedOrganizationId = () => {
  try {
    const savedUser = localStorage.getItem("user");

    if (!savedUser) return "";

    const user = JSON.parse(savedUser);

    return String(
      user.organizationId ??
      user.OrganizationId ??
      user.user?.organizationId ??
      ""
    );
  } catch {
    return "";
  }
};

const getTeamId = (project) =>
  project.teamId ??
  project.TeamId ??
  project.team?.id ??
  project.Team?.Id ??
  "";

const getTeamName = (team) =>
  team.name ??
  team.Name ??
  `Team ${getId(team)}`;

export default function ProjectManagement() {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);

  const [organizationId, setOrganizationId] = useState(
    getSavedOrganizationId
  );

  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [formOpen, setFormOpen] = useState(false);

  // Store the selected team separately for every project.
  const [selectedTeams, setSelectedTeams] = useState({});

  const [loading, setLoading] = useState(false);
  const [teamsLoading, setTeamsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [assigningId, setAssigningId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadProjects = useCallback(async () => {
    const orgId = Number(organizationId);

    if (
      !organizationId ||
      !Number.isInteger(orgId) ||
      orgId <= 0
    ) {
      setProjects([]);
      setError("Enter a valid Organization ID.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getAllProjects(orgId);
      const data = normalizeList(response);

      setProjects(data);

      // Initialize each project's dropdown from its current assignment.
      setSelectedTeams((previous) => {
        const next = { ...previous };

        data.forEach((project) => {
          const id = getId(project);
          const teamId = getTeamId(project);

          if (
            id != null &&
            next[id] === undefined &&
            teamId !== ""
          ) {
            next[id] = String(teamId);
          }
        });

        return next;
      });
    } catch (err) {
      setError(getError(err));
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  const loadTeams = useCallback(async () => {
    setTeamsLoading(true);

    try {
      // Reuse your existing teams API function.
      const response = await getTeams();
      const data = normalizeList(response);

      const orgId = Number(organizationId);

      // Filter by organization when the API supplies an organization ID.
      const organizationTeams = data.filter((team) => {
        const teamOrgId =
          team.organizationId ?? team.OrganizationId;

        return (
          !Number.isInteger(orgId) ||
          !teamOrgId ||
          Number(teamOrgId) === orgId
        );
      });

      setTeams(organizationTeams);
    } catch (err) {
      setTeams([]);
      setError(
        `Could not load teams: ${getError(err)}`
      );
    } finally {
      setTeamsLoading(false);
    }
  }, [organizationId]);

  const refreshData = useCallback(async () => {
    setMessage("");
    await Promise.all([loadProjects(), loadTeams()]);
  }, [loadProjects, loadTeams]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const startCreate = () => {
    setEditingId(null);

    setForm({
      ...emptyForm,
      organizationId,
      projectStatus: 1,
    });

    setError("");
    setMessage("");
    setFormOpen(true);
  };

  const startEdit = (project) => {
    setEditingId(getId(project));

    setForm({
      name: project.name ?? project.Name ?? "",
      description:
        project.description ?? project.Description ?? "",
      projectStatus: getStatusValue(
        project.projectStatus ?? project.ProjectStatus
      ),
      organizationId: String(
        project.organizationId ??
        project.OrganizationId ??
        organizationId
      ),
    });

    setError("");
    setMessage("");
    setFormOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const orgId = Number(form.organizationId);

    if (!Number.isInteger(orgId) || orgId <= 0) {
      setError("Enter a valid Organization ID.");
      return;
    }

    if (!form.name.trim()) {
      setError("Project name is required.");
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        Name: form.name.trim(),
        Description: form.description.trim(),
        OrganizationId: orgId,
        ProjectStatus: Number(form.projectStatus),
      };

      if (editingId !== null) {
        await updateProject(editingId, payload);
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

  const handleAssignTeam = async (project) => {
    const projectId = getId(project);
    const teamId = selectedTeams[projectId];

    if (teamId === undefined || teamId === null || teamId === "") {
      setError("Please select a team for this project.");
      return;
    }

    const selectedTeam = teams.find(
      (team) => String(getId(team)) === String(teamId)
    );

    if (!selectedTeam) {
      setError("The selected team is not available. Refresh the teams.");
      return;
    }

    const projectOrg =
      project.organizationId ?? project.OrganizationId;

    const teamOrg =
      selectedTeam.organizationId ?? selectedTeam.OrganizationId;

    if (
      projectOrg != null &&
      teamOrg != null &&
      Number(projectOrg) !== Number(teamOrg)
    ) {
      setError(
        "The selected team and project belong to different organizations."
      );
      return;
    }

    setAssigningId(projectId);
    setError("");
    setMessage("");

    try {
      // Calls POST /api/Project/assign-team
      // Body: { projectId, teamId }
      await assignTeam(projectId, teamId);

      setMessage(
        `${getTeamName(selectedTeam)} assigned to ${
          project.name ?? project.Name ?? "the project"
        } successfully.`
      );

      // Fetch the saved project data again.
      await loadProjects();
    } catch (err) {
      setError(getError(err));
    } finally {
      setAssigningId(null);
    }
  };

  const handleDelete = async (project) => {
    const id = getId(project);
    const name = project.name ?? project.Name ?? "this project";

    if (!window.confirm(`Delete "${name}"?`)) return;

    setDeletingId(id);
    setError("");
    setMessage("");

    try {
      await deleteProject(id);
      setMessage("Project deleted successfully.");

      setSelectedTeams((previous) => {
        const next = { ...previous };
        delete next[id];
        return next;
      });

      await loadProjects();
    } catch (err) {
      setError(getError(err));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-indigo-600">
            Workspace
          </p>

          <h1 className="mt-1 text-2xl font-bold text-gray-900">
            Project Management
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Create projects, manage their status, and assign teams.
          </p>
        </div>

        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={18} />
          New project
        </button>
      </div>

      {/* Organization filter */}
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
            onChange={(event) =>
              setOrganizationId(event.target.value)
            }
            className="rounded-lg border border-gray-300 px-3 py-2 sm:max-w-xs"
            placeholder="Organization ID"
          />

          <button
            type="button"
            onClick={refreshData}
            disabled={loading || teamsLoading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>
        </div>

        <p className="mt-2 text-xs text-gray-500">
          Projects and teams are loaded using your organization's ID.
        </p>
      </section>

      {/* Notifications */}
      {error && (
        <div
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </div>
      )}

      {message && (
        <div
          role="status"
          className="rounded-lg bg-green-50 p-3 text-sm text-green-700"
        >
          {message}
        </div>
      )}

      {/* Create/Edit form */}
      {formOpen && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingId !== null
                ? "Edit project"
                : "Create project"}
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
                htmlFor="name"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Project name
              </label>

              <input
                id="name"
                required
                value={form.name}
                onChange={(event) =>
                  setForm({
                    ...form,
                    name: event.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="e.g. Customer Portal"
              />
            </div>

            <div>
              <label
                htmlFor="description"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Description
              </label>

              <textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm({
                    ...form,
                    description: event.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2"
                placeholder="Describe the project"
              />
            </div>

            <div>
              <label
                htmlFor="projectStatus"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Project status
              </label>

              <select
                id="projectStatus"
                value={form.projectStatus}
                onChange={(event) =>
                  setForm({
                    ...form,
                    projectStatus: Number(event.target.value),
                  })
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 sm:max-w-xs"
              >
                {PROJECT_STATUSES.map((status) => (
                  <option
                    key={status.value}
                    value={status.value}
                  >
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="formOrganizationId"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Organization ID
              </label>

              <input
                id="formOrganizationId"
                type="number"
                min="1"
                required
                value={form.organizationId}
                onChange={(event) =>
                  setForm({
                    ...form,
                    organizationId: event.target.value,
                  })
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

      {/* Projects table */}
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-gray-900">
              Projects
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {projects.length} project
              {projects.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Users size={17} />
            {teamsLoading
              ? "Loading teams..."
              : `${teams.length} available teams`}
          </div>
        </div>

        {loading ? (
          <p className="p-10 text-center text-sm text-gray-500">
            Loading projects...
          </p>
        ) : projects.length === 0 ? (
          <div className="p-10 text-center">
            <p className="font-medium text-gray-900">
              No projects found
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Create a project to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[1050px] divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {[
                    "Project",
                    "Status",
                    "Assigned team",
                    "Assign / Change team",
                    "Actions",
                  ].map((heading) => (
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
                  const id = getId(project);
                  const name =
                    project.name ??
                    project.Name ??
                    "Untitled project";

                  const status =
                    project.projectStatus ??
                    project.ProjectStatus ??
                    1;

                  const currentTeamId = getTeamId(project);

                  const selectedTeamId =
                    selectedTeams[id] !== undefined
                      ? selectedTeams[id]
                      : String(currentTeamId ?? "");

                  const currentTeam = teams.find(
                    (team) =>
                      String(getId(team)) ===
                      String(currentTeamId)
                  );

                  return (
                    <tr key={id} className="hover:bg-gray-50">
                      <td className="max-w-xs px-5 py-4">
                        <p className="font-medium text-gray-900">
                          {name}
                        </p>

                        <p className="mt-1 text-sm text-gray-500">
                          {project.description ??
                            project.Description ??
                            "No description"}
                        </p>

                        <p className="mt-1 text-xs text-gray-400">
                          Project ID: {id}
                        </p>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
                          {getStatusLabel(status)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {currentTeam ? (
                          <span className="inline-flex items-center gap-2 text-sm font-medium text-gray-800">
                            <UserCheck
                              size={16}
                              className="text-green-600"
                            />
                            {getTeamName(currentTeam)}
                          </span>
                        ) : currentTeamId ? (
                          <span className="text-sm text-gray-600">
                            Team ID: {currentTeamId}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-400">
                            Not assigned
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            aria-label={`Select team for ${name}`}
                            value={selectedTeamId}
                            onChange={(event) =>
                              setSelectedTeams((previous) => ({
                                ...previous,
                                [id]: event.target.value,
                              }))
                            }
                            disabled={
                              teamsLoading ||
                              teams.length === 0 ||
                              assigningId === id
                            }
                            className="min-w-40 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm disabled:opacity-50"
                          >
                            <option value="">
                              Select a team
                            </option>

                            {teams.map((team) => (
                              <option
                                key={getId(team)}
                                value={String(getId(team))}
                              >
                                {getTeamName(team)}
                              </option>
                            ))}
                          </select>

                          <button
                            type="button"
                            onClick={() =>
                              handleAssignTeam(project)
                            }
                            disabled={
                              teamsLoading ||
                              teams.length === 0 ||
                              assigningId === id ||
                              !selectedTeamId ||
                              String(selectedTeamId) ===
                                String(currentTeamId ?? "")
                            }
                            className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {assigningId === id
                              ? "Assigning..."
                              : currentTeamId
                                ? "Change"
                                : "Assign"}
                          </button>
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <button
                          type="button"
                          onClick={() => startEdit(project)}
                          aria-label={`Edit ${name}`}
                          className="mr-2 rounded-md p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(project)}
                          disabled={deletingId === id}
                          aria-label={`Delete ${name}`}
                          className="rounded-md p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          {deletingId === id ? (
                            "..."
                          ) : (
                            <Trash2 size={16} />
                          )}
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
