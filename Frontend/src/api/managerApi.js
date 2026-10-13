
import api from "./axios";

export const getProjects = (orgId) =>
  api.get(`/Project/view-all-projects`, {
    params: { orgId },
  });

export const createProject = (data) =>
  api.post("/Project/create-project", data);

export const updateProject = (projId, data) =>
  api.patch("/Project/update-project", data, {
    params: { projId },
  });

export const deleteProject = (projId) =>
  api.delete("/Project/delete-project", {
    params: { projId },
  });

export const assignTeamToProject = (data) =>
  api.post("/Project/assign-team", data);

export const getTasks = (projId) =>
  api.get("/TaskItem/taskItems", {
    params: { projId },
  });

export const createTask = (data) =>
  api.post("/TaskItem/create-taskItem", data);

export const updateTask = (id, data) =>
  api.patch("/TaskItem/update-taskItem", data, {
    params: { id },
  });

export const deleteTask = (id) =>
  api.delete("/TaskItem/delete-taskItems", {
    params: { id },
  });
  
export const getTeams = () =>
  api.get("/Team/view-teams");