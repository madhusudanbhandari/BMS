import api from "./axios";

export const createTask = async (data) => {
const response = await api.post("/TaskItem/create-taskItem", data);
return response.data;
};

export const getTask = async (id) => {
const response = await api.get(`/TaskItem/taskItem/${id}`);
return response.data;
};

export const getProjectTasks = async (projId) => {
const response = await api.get("/TaskItem/taskItems", {
params: { projId },
});
return response.data;
};

export const updateTask = async (id, data) => {
const response = await api.patch("/TaskItem/update-taskItem", data, {
params: { id },
});
return response.data;
};

export const deleteTask = async (id) => {
const response = await api.delete("/TaskItem/delete-taskItems", {
params: { id },
});
return response.data;
};
