import api from "./axiosInstance";

export const loginUser = (data) => api.post("/auth/login", data);
export const registerFaculty = (data) => api.post("/auth/register/faculty", data);
export const registerAdmin = (data) => api.post("/auth/register/admin", data);

export const forgotPassword = (email) => api.post("/auth/forgotPassword/", { email });
export const resetPassword = (token, newPassword) => api.post("/auth/resetPassword", { token, newPassword });
export const logoutUser = () => api.post("/auth/logout");