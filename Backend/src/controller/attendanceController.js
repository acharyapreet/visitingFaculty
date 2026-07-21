const {
    markAttendance,
    getDailyAttendance,
    getWeeklyAttendance,
    getMonthlyAttendance,
    getAttendanceHistory,
    getAdminAttendance,
    verifyAttendance,
    getFacultyAllocations,
    getAttendanceByIdService
} = require("../service/attendanceService");

// ==========================
// Mark Attendance
// POST /api/attendance/
// Required: user_id, course_id, semester_id, subject_id,
//           attendance_date, start_time, end_time, hours, month, year
// Optional: status (default: "Pending"), remarks
// ==========================
const markAttendanceController = async (req, res) => {
    try {
        const isArray = Array.isArray(req.body);
        const items = isArray ? req.body : [req.body];

        // 1. Validate all records first
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const {
                user_id,
                course_id,
                semester_id,
                subject_id,
                attendance_date,
                start_time,
                end_time,
                hours,
                month,
                year
            } = item;

            const missing = [];
            if (!user_id)         missing.push('user_id');
            if (!course_id)       missing.push('course_id');
            if (!semester_id)     missing.push('semester_id');
            if (!subject_id)      missing.push('subject_id');
            if (!attendance_date) missing.push('attendance_date');
            if (!start_time)      missing.push('start_time');
            if (!end_time)        missing.push('end_time');
            if (!hours)           missing.push('hours');
            if (!month)           missing.push('month');
            if (!year)            missing.push('year');

            if (missing.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Missing required fields in record at index ${i}: ${missing.join(', ')}`,
                    record: item
                });
            }
        }

        // 2. Insert all records
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
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



// ==========================
// Daily Attendance
// ==========================
const getDailyAttendanceController = async (req, res) => {
    try {

        const { facultyId } = req.params;

        const result = await getDailyAttendance(facultyId);

        return res.status(200).json({
            success: true,
            attendanceDate: result.attendanceDate,
            totalClasses: result.totalClasses,
            totalHours: result.totalHours,
            data: result.data
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// ==========================
// Weekly Attendance
// ==========================
const getWeeklyAttendanceController = async (req, res) => {
    try {

        const { facultyId } = req.params;

        const result = await getWeeklyAttendance(facultyId);

        return res.status(200).json({
            success: true,
            weekStart: result.weekStart,
            weekEnd: result.weekEnd,
            workingDays: result.workingDays,
            daysPresent: result.daysPresent,
            daysAbsent: result.daysAbsent,
            totalClasses: result.totalClasses,
            totalHours: result.totalHours,
            data: result.data
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// ==========================
// Monthly Attendance
// ==========================
const getMonthlyAttendanceController = async (req, res) => {
    try {

        const { facultyId } = req.params;
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: "Month and Year are required."
            });
        }

        const result = await getMonthlyAttendance(facultyId, month, year);

        return res.status(200).json({
            success: true,
            month: result.month,
            year: result.year,
            workingDays: result.workingDays,
            daysPresent: result.daysPresent,
            daysAbsent: result.daysAbsent,
            totalClasses: result.totalClasses,
            totalHours: result.totalHours,
            data: result.data
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// ==========================
// Attendance History
// ==========================
const attendanceHistoryController = async (req, res) => {
    try {

        const { facultyId } = req.params;

        const result = await getAttendanceHistory(facultyId);

        return res.status(200).json({
            success: true,
            totalClasses: result.totalClasses,
            totalHours: result.totalHours,
            daysPresent: result.daysPresent,
            data: result.data
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// ==========================
// Admin: Get All Faculty Attendance
// Supports ?facultyId=, ?month=, ?year=, ?status=
// ==========================
const getAdminAttendanceController = async (req, res) => {
    try {

        const filters = req.query;

        const result = await getAdminAttendance(filters);

        return res.status(200).json({
            success: true,
            totalRecords: result.totalRecords,
            data: result.data
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// ==========================
// Admin: Verify / Update Attendance Status
// PATCH /attendance/verify/:attendanceId
// body: { status: 'Present' | 'Absent' | 'Pending', remarks }
// ==========================
const verifyAttendanceController = async (req, res) => {
    try {

        const { attendanceId } = req.params;
        const { status, remarks } = req.body;

        if (!status) {
            return res.status(400).json({
                success: false,
                message: "Status is required (Present | Absent | Pending)."
            });
        }

        const updated = await verifyAttendance(attendanceId, status, remarks);

        return res.status(200).json({
            success: true,
            message: "Attendance status updated successfully.",
            data: updated
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// ==========================
// Get Faculty Allocations (My Subjects)
// GET /attendance/my-allocations/:facultyId
// Returns all active subjects assigned to this faculty
// with full Course, Semester, Section, Subject info.
// ==========================
const getFacultyAllocationsController = async (req, res) => {
    try {

        const { facultyId } = req.params;

        const result = await getFacultyAllocations(facultyId);

        return res.status(200).json({
            success: true,
            faculty_id: result.faculty_id,
            total: result.total,
            allocations: result.allocations
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// ==========================
// GET /attendance/record/:attendanceId
// Strict: only fetches by numeric attendance_id.
// Returns 400 if non-numeric, 404 if not found.
// ==========================
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

        return res.status(200).json({
            success: true,
            data: attendance
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

// ==========================
// GET /attendance/:attendanceId  (legacy / smart lookup)
// numeric  => single attendance record by attendance_id
// non-numeric => falls back to faculty attendance history (by uvfin or user_id)
// ==========================
const getAttendanceByIdController = async (req, res) => {
    try {
        const { attendanceId } = req.params;

        // 1. Try numeric attendance_id lookup first
        if (!isNaN(attendanceId) && Number.isInteger(Number(attendanceId))) {
            const attendance = await getAttendanceByIdService(Number(attendanceId));
            if (attendance) {
                return res.status(200).json({
                    success: true,
                    type: "single_attendance_record",
                    data: attendance
                });
            }
        }

        // 2. Fall back to faculty attendance history (uvfin or user_id)
        try {
            const history = await getAttendanceHistory(attendanceId);
            if (history && history.data) {
                return res.status(200).json({
                    success: true,
                    type: "faculty_attendance_history",
                    totalClasses: history.totalClasses,
                    totalHours: history.totalHours,
                    daysPresent: history.daysPresent,
                    data: history.data
                });
            }
        } catch (historyErr) {
            // Swallow — faculty not found, fall through to 404
        }

        return res.status(404).json({
            success: false,
            message: "No record found. The ID does not match any attendance_id or active faculty."
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
};

module.exports = {
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
};