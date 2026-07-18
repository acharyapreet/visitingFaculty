import api from "./axiosInstance";

const adminApi = {
  // Faculty approval flow
  getPendingFaculty: () => api.get("/admin/pendingFaculty").then((r) => r.data),
  approveFaculty: (userId, status, remarks) =>
    api.put(`/admin/faculty/${userId}/approve`, { status, remarks }).then((r) => r.data),
  getApprovedFaculty: () => api.get("/admin/approvedFaculty").then((r) => r.data),
  getRejectedFaculty: () => api.get("/admin/rejectedFaculty").then((r) => r.data),
  getAllFaculty: () => api.get("/admin/allFaculty").then((r) => r.data),
  getFacultyById: (userId) => api.get(`/admin/faculty/${userId}`).then((r) => r.data),

  // Subject allocation
  getSubjectAllocations: () => api.get("/admin/subjectAllocations").then((r) => r.data),
  allocateSubject: (data) => api.post("/admin/allocateSubject", data).then((r) => r.data),

  // Attendance
  getAttendanceByFaculty: (userId, params) =>
    api.get(`/admin/attendance/${userId}`, { params }).then((r) => r.data),

  // Billing
  generateBill: (data) => api.post("/admin/generateBill", data).then((r) => r.data),
  getBillHistory: (params) => api.get("/admin/bills", { params }).then((r) => r.data),
};

export default adminApi;