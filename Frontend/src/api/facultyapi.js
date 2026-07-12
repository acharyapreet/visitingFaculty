import api from "./axiosInstance";

// Attendance mark karna
export const markAttendance = (data) => 
  api.post("/faculty/attendance/mark", data);

// Apni attendance history dekhna
export const getAttendanceHistory = (month, year) => 
  api.get(`/faculty/attendance?month=${month}&year=${year}`); 

// Apni salary dekhna
export const getSalary = (month, year) => 
  api.get(`/faculty/salary?month=${month}&year=${year}`); 