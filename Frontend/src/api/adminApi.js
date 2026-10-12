import api from "./axios";

//TEams
export const createTeam = async (data) => {
  const response = await api.post("/Team/create-team", data);
  return response.data;
};

export const getTeams = async () => {
  const response = await api.get("/Team/view-teams");
  return response.data;
};

export const addTeamMembers = async (data) => {
  const response = await api.post("/Team/add-member", data);
  return response.data;
};

export const removeTeamMember = async (teamId, userId) => {
  const response = await api.post("/Team/remove-member", null, {
    params: { teamId, userId },
  });
  return response.data;
};

export const deleteTeam = async (teamId) => {
  const response = await api.delete("/Team/delete-team", {
    params: { teamId },
  });
  return response.data;
};

// User approvals
export const getPendingUsers = async () => {
  const response = await api.get("/Admin/view-pending-users");
  return response.data;
};

export const verifyUser = async (data) => {
  const response = await api.patch("/Admin/verify-users", data);
  return response.data;
};