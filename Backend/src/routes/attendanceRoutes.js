const express = require("express");
const router  = express.Router();

const {
    // ── Mark (write) controllers ────────────────────────────────
    markAttendanceController,          // POST /               (generic / legacy)
    markDailyAttendanceController,     // POST /mark/daily
    markWeeklyAttendanceController,    // POST /mark/weekly
    markMonthlyAttendanceController,   // POST /mark/monthly

    // ── View (read) controllers ─────────────────────────────────
    getDailyAttendanceController,      // GET  /daily/:facultyId?date=
    getWeeklyAttendanceController,     // GET  /weekly/:facultyId?date=
    getMonthlyAttendanceController,    // GET  /monthly/:facultyId?month=&year=
    attendanceHistoryController,       // GET  /history/:facultyId

    // ── Faculty utility ─────────────────────────────────────────
    getFacultyAllocationsController,   // GET  /my-allocations/:facultyId

    // ── Admin ────────────────────────────────────────────────────
    getAdminAttendanceController,      // GET  /admin
    verifyAttendanceController,        // PATCH /verify/:attendanceId

    // ── Record lookup ────────────────────────────────────────────
    getAttendanceByIdStrictController, // GET  /record/:attendanceId
    getAttendanceByIdController        // GET  /:attendanceId  (smart)
} = require("../controller/attendanceController");

// ============================================================
// ■  FACULTY — MARK ATTENDANCE  (Write / POST)
// ============================================================

// Generic mark (supports attendance_period in body; defaults to 'daily')
// POST /api/attendance/
router.post("/", markAttendanceController);

// ── Period-specific mark endpoints ──────────────────────────
//
// POST /api/attendance/mark/daily
//   Mark attendance for a single day.
//   attendance_date defaults to today if omitted.
//
// POST /api/attendance/mark/weekly
//   Mark attendance for a date within a week.
//   week_number is auto-calculated from attendance_date if omitted.
//
// POST /api/attendance/mark/monthly
//   Mark attendance for a date within a month.
//   month + year are REQUIRED.
//
router.post("/mark/daily",   markDailyAttendanceController);
router.post("/mark/weekly",  markWeeklyAttendanceController);
router.post("/mark/monthly", markMonthlyAttendanceController);

// ============================================================
// ■  FACULTY — VIEW ATTENDANCE  (Read / GET)
// ============================================================

// GET /api/attendance/daily/:facultyId?date=YYYY-MM-DD
//   date optional — defaults to today
router.get("/daily/:facultyId",   getDailyAttendanceController);

// GET /api/attendance/weekly/:facultyId?date=YYYY-MM-DD
//   date optional — defaults to the current week
router.get("/weekly/:facultyId",  getWeeklyAttendanceController);

// GET /api/attendance/monthly/:facultyId?month=July&year=2026
//   month + year REQUIRED
router.get("/monthly/:facultyId", getMonthlyAttendanceController);

// GET /api/attendance/history/:facultyId
//   Full attendance history (all dates, all subjects)
router.get("/history/:facultyId", attendanceHistoryController);

// GET /api/attendance/my-allocations/:facultyId
//   Returns all active subjects allocated to this faculty.
//   Use to populate the Mark Attendance form dropdown.
router.get("/my-allocations/:facultyId", getFacultyAllocationsController);

// ============================================================
// ■  ADMIN  (Read + Verify)
// ============================================================

// GET /api/attendance/admin
//   Filters: ?facultyId=  ?month=  ?year=  ?status=  ?attendance_period=
router.get("/admin", getAdminAttendanceController);

// GET /api/attendance/record/:attendanceId
//   Strict numeric lookup — 400 if non-numeric, 404 if not found
// NOTE: must be registered BEFORE /:attendanceId (wildcard) to avoid conflict
router.get("/record/:attendanceId", getAttendanceByIdStrictController);

// PATCH /api/attendance/verify/:attendanceId
//   Admin verifies/updates a record's status
// NOTE: must be registered BEFORE /:attendanceId (wildcard)
router.patch("/verify/:attendanceId", verifyAttendanceController);

// ============================================================
// ■  SMART LOOKUP  (must be LAST — wildcard catch-all)
// ============================================================

// GET /api/attendance/:attendanceId
//   numeric  → single attendance record
//   text     → faculty attendance history (uvfin or user_id string)
router.get("/:attendanceId", getAttendanceByIdController);

module.exports = router;