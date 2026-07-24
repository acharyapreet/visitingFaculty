const {
    markAttendance,
    markDailyAttendance,
    markWeeklyAttendance,
    markMonthlyAttendance,
    getDailyAttendance,
    getWeeklyAttendance,
    getMonthlyAttendance,
    getAttendanceHistory,
    getAdminAttendance,
    verifyAttendance,
    getFacultyAllocations,
    getAttendanceByIdService
} = require("../service/attendanceService");

// ============================================================
// ■  HELPERS
// ============================================================

// ── Required fields for GENERIC POST /api/attendance/ ─────────────────────
// attendance_date is required for generic + weekly + monthly;
// hours is now OPTIONAL (auto-calculated in service from start_time / end_time).
const REQUIRED_MARK_FIELDS = [
    'user_id', 'course_id', 'semester_id', 'subject_id',
    'attendance_date', 'start_time', 'end_time'
    // hours  → optional; auto-calculated from start_time / end_time
    // section_id → optional; used for precise allocation lookup
];

const validateMarkBody = (item, index = null) => {
    const missing = REQUIRED_MARK_FIELDS.filter(f => !item[f]);
    if (missing.length > 0) {
        const prefix = index !== null ? `record[${index}]: ` : '';
        return `${prefix}Missing required fields: ${missing.join(', ')}`;
    }
    return null;
};

// ============================================================
// ■  GENERIC: POST /api/attendance/
//    Mark attendance — single OR bulk array.
//    Accepts optional `attendance_period` in body.
// ============================================================
const markAttendanceController = async (req, res) => {
    try {
        const isArray = Array.isArray(req.body);
        const items   = isArray ? req.body : [req.body];

        // 1. Validate all records first
        for (let i = 0; i < items.length; i++) {
            const err = validateMarkBody(items[i], isArray ? i : null);
            if (err) return res.status(400).json({ success: false, message: err });
        }

        // 2. Insert all
        const results = [];
        for (const item of items) {
            const attendance = await markAttendance(item);
            results.push(attendance);
        }

        return res.status(201).json({
            success: true,
            message: isArray
                ? `Successfully marked ${results.length} attendance records.`
                : "Attendance submitted successfully.",
            data: isArray ? results : results[0]
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// ■  DAILY: POST /api/attendance/mark/daily
//    Faculty marks attendance for today (or a specific date).
//    `attendance_date` is optional — defaults to today (pre-filled in Figma List View).
//
//    Required body fields:
//      user_id
//      course_id, semester_id, subject_id
//        └─ OR ─┘ allocation_id  (direct, skips lookup)
//      start_time, end_time
//    Optional:
//      attendance_date  (defaults to today)
//      section_id       (for precise lookup when faculty has multiple sections)
//      hours            (auto-calculated from start_time / end_time if omitted)
//      month, year      (auto-derived from date if omitted)
//      status           ('Marked' default | 'Cancelled')
//      remarks
// ============================================================
const markDailyAttendanceController = async (req, res) => {
    try {
        const isArray = Array.isArray(req.body);
        const items   = isArray ? req.body : [req.body];

        // Required fields for daily (attendance_date optional — defaults to today)
        const DAILY_REQUIRED = ['user_id', 'start_time', 'end_time'];
        // Must have EITHER allocation_id OR (course_id + semester_id + subject_id)
        const needsLookup = (item) => !item.allocation_id;

        for (let i = 0; i < items.length; i++) {
            const item    = items[i];
            const missing = DAILY_REQUIRED.filter(f => !item[f]);

            // If no allocation_id, also require course/semester/subject for lookup
            if (needsLookup(item)) {
                ['course_id', 'semester_id', 'subject_id'].forEach(f => {
                    if (!item[f]) missing.push(f);
                });
            }

            if (missing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `${isArray ? `record[${i}]: ` : ''}Missing required fields: ${missing.join(', ')}`
                });
            }
        }

        const results = [];
        for (const item of items) {
            results.push(await markDailyAttendance(item));
        }

        return res.status(201).json({
            success:           true,
            attendance_period: 'daily',
            message:           isArray
                                 ? `${results.length} daily attendance record(s) submitted.`
                                 : "Daily attendance submitted successfully.",
            data: isArray ? results : results[0]
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// ■  WEEKLY: POST /api/attendance/mark/weekly
//    Faculty marks a class session for a date within a specific week.
//    The calendar panel on the Figma Grid View sends this when the faculty
//    clicks a date, fills the right-panel form, and hits Submit Attendance.
//
//    Required body fields:
//      user_id
//      course_id, semester_id, subject_id
//        └─ OR ─┘ allocation_id  (direct, skips lookup)
//      attendance_date  (the date clicked on the Figma calendar)
//      start_time, end_time
//    Optional:
//      section_id     (Section A / B toggle in Figma right-panel)
//      hours          (auto-calculated from start_time / end_time)
//      week_number    (auto-calculated from attendance_date if omitted)
//      month, year    (auto-derived from attendance_date if omitted)
//      status         ('Marked' default | 'Cancelled')
//      remarks
// ============================================================
const markWeeklyAttendanceController = async (req, res) => {
    try {
        const isArray = Array.isArray(req.body);
        const items   = isArray ? req.body : [req.body];

        // attendance_date is required for weekly (it is the clicked calendar date)
        const WEEKLY_REQUIRED = ['user_id', 'attendance_date', 'start_time', 'end_time'];
        const needsLookup = (item) => !item.allocation_id;

        for (let i = 0; i < items.length; i++) {
            const item    = items[i];
            const missing = WEEKLY_REQUIRED.filter(f => !item[f]);

            if (needsLookup(item)) {
                ['course_id', 'semester_id', 'subject_id'].forEach(f => {
                    if (!item[f]) missing.push(f);
                });
            }

            if (missing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `${isArray ? `record[${i}]: ` : ''}Missing required fields: ${missing.join(', ')}`
                });
            }
        }

        const results = [];
        for (const item of items) {
            results.push(await markWeeklyAttendance(item));
        }

        return res.status(201).json({
            success:           true,
            attendance_period: 'weekly',
            message:           isArray
                                 ? `${results.length} weekly attendance record(s) submitted.`
                                 : "Weekly attendance submitted successfully.",
            data: isArray ? results : results[0]
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// ■  MONTHLY: POST /api/attendance/mark/monthly
//    Faculty marks a class session for a date within a month.
//    This is the Figma Grid/Calendar View — faculty clicks a date on the
//    monthly calendar, fills the right-panel form, and hits Submit Attendance.
//
//    Required body fields:
//      user_id
//      course_id, semester_id, subject_id
//        └─ OR ─┘ allocation_id  (direct, skips lookup)
//      attendance_date  (the date clicked on the Figma calendar)
//      start_time, end_time
//      month            (e.g. "December"  — drives calendar grouping)
//      year             (e.g. 2024)
//    Optional:
//      section_id     (Section A / B toggle in Figma right-panel)
//      hours          (auto-calculated from start_time / end_time)
//      status         ('Marked' default | 'Cancelled')
//      remarks
// ============================================================
const markMonthlyAttendanceController = async (req, res) => {
    try {
        const isArray = Array.isArray(req.body);
        const items   = isArray ? req.body : [req.body];

        // attendance_date, month and year are required for monthly
        const MONTHLY_REQUIRED = ['user_id', 'attendance_date', 'start_time', 'end_time', 'month', 'year'];
        const needsLookup = (item) => !item.allocation_id;

        for (let i = 0; i < items.length; i++) {
            const item    = items[i];
            const missing = MONTHLY_REQUIRED.filter(f => !item[f]);

            if (needsLookup(item)) {
                ['course_id', 'semester_id', 'subject_id'].forEach(f => {
                    if (!item[f]) missing.push(f);
                });
            }

            if (missing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `${isArray ? `record[${i}]: ` : ''}Missing required fields: ${missing.join(', ')}`
                });
            }
        }

        const results = [];
        for (const item of items) {
            results.push(await markMonthlyAttendance(item));
        }

        return res.status(201).json({
            success:           true,
            attendance_period: 'monthly',
            message:           isArray
                                 ? `${results.length} monthly attendance record(s) submitted.`
                                 : "Monthly attendance submitted successfully.",
            data: isArray ? results : results[0]
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// ■  VIEW: GET /api/attendance/daily/:facultyId?date=YYYY-MM-DD
//    Returns attendance records for a single day.
//    date defaults to today if not supplied.
// ============================================================
const getDailyAttendanceController = async (req, res) => {
    try {
        const { facultyId } = req.params;
        const dateStr       = req.query.date || null;   // optional ?date=YYYY-MM-DD

        const result = await getDailyAttendance(facultyId, dateStr);

        return res.status(200).json({
            success:        true,
            attendanceDate: result.attendanceDate,
            totalClasses:   result.totalClasses,
            totalHours:     result.totalHours,
            data:           result.data
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// ■  VIEW: GET /api/attendance/weekly/:facultyId?date=YYYY-MM-DD
//    Returns attendance for the ISO week containing `date`.
//    Defaults to the current week if `date` is omitted.
// ============================================================
const getWeeklyAttendanceController = async (req, res) => {
    try {
        const { facultyId } = req.params;
        const dateStr       = req.query.date || null;   // optional ?date=YYYY-MM-DD

        const result = await getWeeklyAttendance(facultyId, dateStr);

        return res.status(200).json({
            success:      true,
            weekStart:    result.weekStart,
            weekEnd:      result.weekEnd,
            weekNumber:   result.weekNumber,
            workingDays:  result.workingDays,
            daysPresent:  result.daysPresent,
            daysAbsent:   result.daysAbsent,
            totalClasses: result.totalClasses,
            totalHours:   result.totalHours,
            data:         result.data
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// ■  VIEW: GET /api/attendance/monthly/:facultyId?month=July&year=2026
// ============================================================
const getMonthlyAttendanceController = async (req, res) => {
    try {
        const { facultyId }   = req.params;
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: "month and year query params are required."
            });
        }

        const result = await getMonthlyAttendance(facultyId, month, year);

        return res.status(200).json({
            success:      true,
            month:        result.month,
            year:         result.year,
            workingDays:  result.workingDays,
            daysPresent:  result.daysPresent,
            daysAbsent:   result.daysAbsent,
            totalClasses: result.totalClasses,
            totalHours:   result.totalHours,
            data:         result.data
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// ■  VIEW: GET /api/attendance/history/:facultyId
// ============================================================
const attendanceHistoryController = async (req, res) => {
    try {
        const { facultyId } = req.params;

        const result = await getAttendanceHistory(facultyId);

        return res.status(200).json({
            success:      true,
            totalClasses: result.totalClasses,
            totalHours:   result.totalHours,
            daysPresent:  result.daysPresent,
            data:         result.data
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// ■  ADMIN: GET /api/attendance/admin
//    Supports ?facultyId=, ?month=, ?year=, ?status=, ?attendance_period=
// ============================================================
const getAdminAttendanceController = async (req, res) => {
    try {
        const result = await getAdminAttendance(req.query);

        return res.status(200).json({
            success:      true,
            totalRecords: result.totalRecords,
            data:         result.data
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// ■  ADMIN: PATCH /api/attendance/verify/:attendanceId
// ============================================================
const verifyAttendanceController = async (req, res) => {
    try {
        const { attendanceId }   = req.params;
        const { status, remarks } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "status is required. Allowed values: Present | Absent | Pending | Marked | Cancelled"
            });
        }

        const updated = await verifyAttendance(attendanceId, status, remarks);

        return res.status(200).json({
            success: true,
            message: "Attendance status updated successfully.",
            data:    updated
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// ■  GET /api/attendance/my-allocations/:facultyId
// ============================================================
const getFacultyAllocationsController = async (req, res) => {
    try {
        const { facultyId } = req.params;

        const result = await getFacultyAllocations(facultyId);

        return res.status(200).json({
            success:    true,
            faculty_id: result.faculty_id,
            total:      result.total,
            allocations: result.allocations
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================================
// ■  GET /api/attendance/record/:attendanceId  (strict)
// ============================================================
const getAttendanceByIdStrictController = async (req, res) => {
    try {
        const { attendanceId } = req.params;

        if (isNaN(attendanceId) || !Number.isInteger(Number(attendanceId))) {
            return res.status(400).json({
                success: false,
                message: "attendance_id must be a valid integer."
            });
        }

        const attendance = await getAttendanceByIdService(Number(attendanceId));

        if (!attendance) {
            return res.status(404).json({
                success: false,
                message: `No attendance record found with attendance_id = ${attendanceId}.`
            });
        }

        return res.status(200).json({ success: true, data: attendance });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

// ============================================================
// ■  GET /api/attendance/:attendanceId  (smart lookup)
// ============================================================
const getAttendanceByIdController = async (req, res) => {
    try {
        const { attendanceId } = req.params;

        // Numeric → single record
        if (!isNaN(attendanceId) && Number.isInteger(Number(attendanceId))) {
            const attendance = await getAttendanceByIdService(Number(attendanceId));
            if (attendance) {
                return res.status(200).json({
                    success: true,
                    type:    "single_attendance_record",
                    data:    attendance
                });
            }
        }

        // Non-numeric → faculty history
        try {
            const history = await getAttendanceHistory(attendanceId);
            if (history && history.data) {
                return res.status(200).json({
                    success:      true,
                    type:         "faculty_attendance_history",
                    totalClasses: history.totalClasses,
                    totalHours:   history.totalHours,
                    daysPresent:  history.daysPresent,
                    data:         history.data
                });
            }
        } catch (_) {
            // swallow — not a valid faculty ID either
        }

        return res.status(404).json({
            success: false,
            message: "No record found. The ID does not match any attendance_id or active faculty."
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    markAttendanceController,
    markDailyAttendanceController,
    markWeeklyAttendanceController,
    markMonthlyAttendanceController,
    getDailyAttendanceController,
    getWeeklyAttendanceController,
    getMonthlyAttendanceController,
    attendanceHistoryController,
    getAdminAttendanceController,
    verifyAttendanceController,
    getFacultyAllocationsController,
    getAttendanceByIdStrictController,
    getAttendanceByIdController
};