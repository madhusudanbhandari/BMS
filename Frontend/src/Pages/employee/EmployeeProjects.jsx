
import { useCallback, useEffect, useState } from "react";
import { FolderKanban, AlertCircle } from "lucide-react";
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
  return project.name ?? project.Name ?? project.projectName ??
    project.ProjectName ?? "Untitled project";
}

function getProjectId(project) {
  return project.id ?? project.Id ?? project.projectId ??
    project.ProjectId ?? "";
}

export default function EmployeeProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  return (
    <EmployeePage
      title="My Projects"
      description="Review the projects available to you."
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
          <FolderKanban size={32} className="mx-auto text-slate-400" />
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
            {projects.map((project, index) => (
              <article
                key={getProjectId(project) || index}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
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
                    {project.status ??
                      project.Status ??
                      "Not specified"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )
      )}
    </EmployeePage>
  );
}
