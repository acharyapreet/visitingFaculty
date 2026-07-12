import api from "./axiosInstance";

export const loginUser = (data) => api.post("/auth/login", data);
export const registerFaculty = (data) => api.post("/auth/register/faculty", data);
export const registerAdmin = (data) => api.post("/auth/register/admin", data);