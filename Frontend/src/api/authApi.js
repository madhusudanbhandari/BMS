import api from "./axios";

export const registerUser=async(data)=>{
    const response=await api.post("Auth/register-user",data);
    return response.data;
}

export const loginUser=async(credentials)=>{
    const response=await api.post("Auth/login-user",credentials);
    return response.data;
}

export const registerOrganization = async (data) => {
  const response = await api.post(
    "/Org/register-organization",
    data
  );
  return response.data;
};