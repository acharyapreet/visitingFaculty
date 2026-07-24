import api from "./axiosInstance";

const facultyApi = {
  // -----------------------------------------------
  // Mark Attendance
  // POST /api/attendance/
  // body: { user_id, allocation_id, attendance_date, start_time, end_time, hours, remarks, status, month, year }
  // -----------------------------------------------
  markAttendance: (data) =>
    api.post("/attendance/", data).then((r) => r.data),

  // -----------------------------------------------
  // Daily Attendance
  // GET /api/attendance/daily/:facultyId
  // -----------------------------------------------
  getDailyAttendance: (facultyId) =>
    api.get(`/attendance/daily/${facultyId}`).then((r) => r.data),

  // -----------------------------------------------
  // Weekly Attendance
  // GET /api/attendance/weekly/:facultyId
  // -----------------------------------------------
  getWeeklyAttendance: (facultyId) =>
    api.get(`/attendance/weekly/${facultyId}`).then((r) => r.data),

  // -----------------------------------------------
  // Monthly Attendance
  // GET /api/attendance/monthly/:facultyId?month=&year=
  // -----------------------------------------------
  getMonthlyAttendance: (facultyId, month, year) =>
    api
      .get(`/attendance/monthly/${facultyId}`, { params: { month, year } })
      .then((r) => r.data),

  // -----------------------------------------------
  // Attendance History
  // GET /api/attendance/history/:facultyId
  // -----------------------------------------------
  getAttendanceHistory: (facultyId) =>
    api.get(`/attendance/history/${facultyId}`).then((r) => r.data),

  // -----------------------------------------------
  // My Allocations (Subjects assigned to this faculty)
  // GET /api/attendance/my-allocations/:facultyId
  // Returns: { allocations: [{ allocation_id, course_name, semester_number,
  //             section_name, subject_code, subject_name, session_type, ... }] }
  // Use to populate the dropdown when marking attendance
  // -----------------------------------------------
  getMyAllocations: (facultyId) =>
    api.get(`/attendance/my-allocations/${facultyId}`).then((r) => r.data),

  // -----------------------------------------------
  // Salary / Bill History
  // GET /api/bills/history/:facultyId  (or similar)
  // -----------------------------------------------
  getSalary: (month, year) =>
    api.get(`/faculty/salary`, { params: { month, year } }).then((r) => r.data),
};

// Legacy named exports kept for backwards compatibility
export const markAttendance = (data) => facultyApi.markAttendance(data);
export const getAttendanceHistory = (facultyId) =>
  facultyApi.getAttendanceHistory(facultyId);
export const getSalary = (month, year) => facultyApi.getSalary(month, year);

export default facultyApi;