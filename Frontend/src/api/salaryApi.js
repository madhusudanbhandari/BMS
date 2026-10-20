
import api from "./axios";

export const getSalaryRequests = async ({
  page = 1,
  pageSize = 10,
  status,
} = {}) => {
  const response = await api.get("/Salary/view-all-requests", {
    params: {
      page,
      pageSize,
      ...(status ? { status } : {}),
    },
  });

  return response.data;
};

export const updateSalary = async (empId, salaryId, data) => {
  const response = await api.patch("/Salary/update-salary", data, {
    params: { empId, salaryId },
  });

  return response.data;
};

export const requestSalary = async (data) => {
  const response = await api.post("/Salary/request-salary", data);
  return response.data;
};
