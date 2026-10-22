import api from "./axios";

const attendanceApi = {
  attend: async () => {
    const response = await api.post("/Attendence/attend");
    return response.data;
  },

  getMyAttendance: async () => {
    const response = await api.get("/Attendence/attendence/me");
    return response.data;
  },

  getEmployeeAttendance: async (empId) => {
    const response = await api.get("/Attendence/attendence/employee", {
      params: { empId },
    });
    return response.data;
  },

  getOrganizationAttendance: async (orgId) => {
    const response = await api.get(
      "/Attendence/attendence-orgEmployees",
      { params: { orgId } }
    );
    return response.data;
  },
};

export default attendanceApi;