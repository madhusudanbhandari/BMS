
// src/api/managerApi.js
import api from "./axios";

// Projects
export const getProjects = (orgId) =>
  api.get("/Project/view-all-projects", { params: { orgId } });

export const createProject = (data) =>
  api.post("/Project/create-project", data);

export const updateProject = (projId, data) =>
  api.patch("/Project/update-project", data, { params: { projId } });

export const deleteProject = (projId) =>
  api.delete("/Project/delete-project", { params: { projId } });

export const assignTeamToProject = (data) =>
  api.post("/Project/assign-team", data);

// Tasks
export const getTasks = (projId) =>
  api.get("/TaskItem/taskItems", { params: { projId } });

export const getTask = (id) =>
  api.get(`/TaskItem/taskItem/${id}`);

export const createTask = (data) =>
  api.post("/TaskItem/create-taskItem", data);

export const updateTask = (id, data) =>
  api.patch("/TaskItem/update-taskItem", data, { params: { id } });

export const updateTaskStatus = (id, data) =>
  api.patch("/TaskItem/update-taskItemStatus", data, { params: { id } });

export const deleteTask = (id) =>
  api.delete("/TaskItem/delete-taskItems", { params: { id } });

// Teams
export const getTeams = () =>
  api.get("/Team/view-teams");

export const createTeam = (data) =>
  api.post("/Team/create-team", data);

export const addTeamMember = (data) =>
  api.post("/Team/add-member", data);

export const removeTeamMember = (teamId, userId) =>
  api.post("/Team/remove-member", null, {
    params: { teamId, userId },
  });

export const deleteTeam = (teamId) =>
  api.delete("/Team/delete-team", { params: { teamId } });

// Employees
export const getOrganizationEmployees = () =>
  api.get("/Auth/organization-employees");
