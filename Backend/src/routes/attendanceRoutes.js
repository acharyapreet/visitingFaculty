const express = require("express");
const router  = express.Router();

const {
    markAttendanceController,
    getDailyAttendanceController,
    getWeeklyAttendanceController,
    getMonthlyAttendanceController,
    attendanceHistoryController,
    getAdminAttendanceController,
    verifyAttendanceController,
    getFacultyAllocationsController,
    getAttendanceByIdStrictController,
    getAttendanceByIdController
} = require("../controller/attendanceController");

// ============================================================
// Faculty Routes
// ============================================================

// POST   /attendance/         — Mark attendance (with start_time, end_time, remarks, status)
router.post(
    "/",
    markAttendanceController
);

// GET    /attendance/daily/:facultyId
router.get(
    "/daily/:facultyId",
    getDailyAttendanceController
);

// GET    /attendance/weekly/:facultyId
router.get(
    "/weekly/:facultyId",
    getWeeklyAttendanceController
);

// GET    /attendance/monthly/:facultyId?month=&year=
router.get(
    "/monthly/:facultyId",
    getMonthlyAttendanceController
);

// GET    /attendance/history/:facultyId
router.get(
    "/history/:facultyId",
    attendanceHistoryController
);

// GET    /attendance/my-allocations/:facultyId
// Returns all active subjects allocated to this faculty
// (with Course, Semester, Section, Subject details)
// Use this to populate the Mark Attendance form dropdown
router.get(
    "/my-allocations/:facultyId",
    getFacultyAllocationsController
);

// ============================================================
// Admin Routes
// ============================================================

// GET    /attendance/admin?facultyId=&month=&year=&status=
// Admin can filter all attendance records
router.get(
    "/admin",
    getAdminAttendanceController
);

// GET    /attendance/record/:attendanceId
// Fetch a single attendance record by its numeric attendance_id
// Example: GET /api/attendance/record/42
router.get(
    "/record/:attendanceId",
    getAttendanceByIdStrictController
);

// PATCH  /attendance/verify/:attendanceId
// Admin verifies/updates an attendance record's status
// IMPORTANT: must be registered BEFORE the wildcard /:attendanceId
router.patch(
    "/verify/:attendanceId",
    verifyAttendanceController
);

// GET    /attendance/:attendanceId
// Generic lookup: numeric  => single attendance record
//                 non-numeric => faculty attendance history (by uvfin / user_id)
router.get(
    "/:attendanceId",
    getAttendanceByIdController
);

module.exports = router;