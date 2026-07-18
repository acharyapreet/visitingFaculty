const express = require("express");

const router  = express.Router();

const {
    markAttendanceController,
    getDailyAttendanceController,
    getWeeklyAttendanceController,
    getMonthlyAttendanceController,
    attendanceHistoryController
} = require("../controller/attendanceController");
//Faculty Attendance Apis

router.post(
    "/",
    markAttendanceController
);

router.get(
    "/daily/:facultyId",
    getDailyAttendanceController
);

//Get Weekly
router.get(
    "/weekly/:facultyId",
    getWeeklyAttendanceController
);
//Get Monthly Attendance

router.get(
    "/monthly/:facultyId",
    getMonthlyAttendanceController
);

router.get(
    "/history/:facultyId",
    attendanceHistoryController
);
// router.get(
//     "/faculty/:facultyId",
//     getFacultyAllocationsController
// );

module.exports = router;