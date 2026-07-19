import api from "./axiosInstance";

const adminApi = {
  // --- Faculty Approval Flow ---
  getPendingFaculty: () => api.get("/admin/pendingFaculty").then((r) => r.data),
  getApprovedFaculty: () => api.get("/admin/approvedFaculty").then((r) => r.data),
  getRejectedFaculty: () => api.get("/admin/rejectedFaculty").then((r) => r.data),
  getAllFaculty: () => api.get("/admin/allFaculty").then((r) => r.data),
  
  // FIX: Swapped email for userId to match GET /api/admin/faculty/:user_id
  getFacultyById: (userId) => 
    api.get(`/admin/faculty/${userId}`).then((r) => r.data),

  approveFaculty: (userId, uvfin) =>
    api.put(`/admin/faculty/${userId}/approve`, { 
      status: "approved", 
      uvfin: uvfin ? uvfin.trim() : null // Safely handles empty optional inputs
    }).then((r) => r.data),
  
  rejectFaculty: (userId, rejection_reason) =>
    api.put(`/admin/faculty/${userId}/approve`, { 
      status: "rejected", 
      rejection_reason 
    }).then((r) => r.data),

  // FIX: Swapped email for userId to match PUT /api/admin/updateFaculty/:user_id
  updateFacultyUvfin: (userId, uvfin) => 
    api.put(`/admin/updateFaculty/${userId}`, { uvfin }).then((r) => r.data),

  // --- Subject Allocation ---
  getSubjectAllocations: () => api.get("/admin/subjectAllocations").then((r) => r.data),
  allocateSubject: (data) => api.post("/admin/allocateSubject", data).then((r) => r.data),

  // --- Attendance ---
  getAttendanceByFaculty: (query) =>
    api.get(`/admin/attendance/${query}`).then((r) => r.data),

  // --- Billing ---
  generateBill: (data) => api.post("/admin/generateBill", data).then((r) => r.data),
  getBillHistory: (params) => api.get("/admin/bills", { params }).then((r) => r.data),
};

export default adminApi;