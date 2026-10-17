import api from "./axios";

export const createProject = async (data) => {
  const response = await api.post("/Project/create-project", data);
  return response.data;
};

export const getProject = async (projId) => {
  const response = await api.get("/Project/view-project", {
    params: { projId },
  });
  return response.data;
};

export const getAllProjects = async (orgId) => {
  const response = await api.get("/Project/view-all-projects", {
    params: { orgId },
  });
  return response.data;
};

export const updateProject = async (projId, data) => {
  const response = await api.patch("/Project/update-project", data, {
    params: { projId },
  });
  return response.data;
};

export const deleteProject = async (projId) => {
  const response = await api.delete("/Project/delete-project", {
    params: { projId },
  });
  return response.data;
};

export const assignTeam = async (projectId, teamId) => {
  const response = await api.post("/Project/assign-team", {
    projectId: Number(projectId),
    teamId: Number(teamId),
  });

  return response.data;
};