import api from "./axios";

const leaveApi = {
  applyLeave: async (leaveData) => {
    const response = await api.post("Leave/apply-leave", leaveData);
    return response.data;
  },

  getLeaveById: async (leaveId) => {
    const response = await api.get("Leave/view-leave-byId", {
      params: { leaveId },
    });
    return response.data;
  },

  getEmployeeLeaves: async (empId) => {
    const response = await api.get("Leave/view-employee-leaves", {
      params: { empId },
    });
    return response.data;
  },

  updateLeave: async (leaveId, leaveData) => {
    const response = await api.patch("Leave/Update-leave", leaveData, {
      params: { leaveId },
    });
    return response.data;
  },
};

export default leaveApi;