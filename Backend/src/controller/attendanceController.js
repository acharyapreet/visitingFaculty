const {
    markAttendance,
    getDailyAttendance,
    getWeeklyAttendance,
    getMonthlyAttendance,
    getAttendanceHistory
} = require("../service/attendanceService");

 //mark Attendance

 const markAttendanceController = async(req,res) => {
    try{
        const{
            user_id,
            allocation_id,
            attendance_date,
            hours,
            month,
            year
        } =req.body;

        if(
            !user_id ||
            !allocation_id ||
            !attendance_date ||
            !hours ||
            !month ||
            !year
        ){
            return res.status(400).json({
                success:false,
                message:"All fieds are required."
            });
        }
        const attendance = await markAttendance(req.body);

        return res.status(201).json({
            success:true,
            message:"Attendances submitted succefully",
            data: attendance
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:error.message
        });
    }
 };

 //Daily Attendance

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

//Weekly Attendance
const getWeeklyAttendanceController = async (req, res) => {
    try {

        const { facultyId } = req.params;

        const result = await getWeeklyAttendance(facultyId);

        return res.status(200).json({
            success: true,
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

//  Monthly Attendance
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

//Attemdance History 
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


module.exports = {
    markAttendanceController,
    getDailyAttendanceController,
    getWeeklyAttendanceController,
    getMonthlyAttendanceController,
    attendanceHistoryController
};