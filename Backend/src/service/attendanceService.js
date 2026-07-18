// const {Op} = require("sequelize");
// const Attendance = require("../Schema/attendanceSchema");

const { Op } = require("sequelize");

const {
    Attendance,
    Allocation,
    Subject,
    Course,
    Semester,
    Section,
    User
} = require("../Schema");

const resolveUserId = async (facultyId) => {

    const user =
        await User.findOne({
            where: {
                uvfin: String(facultyId)
            }
        }) ||
        (!isNaN(facultyId)
            ? await User.findByPk(Number(facultyId))
            : null);

    if (!user) {
        throw new Error("Faculty not found");
    }

    return user.user_id;
};
// ==========================
// Mark Attendance
// ==========================

const markAttendance = async (attendanceData) => {

    try {

        const {
            user_id,
            allocation_id,
            attendance_date,
            hours,
            month,
            year
        } = attendanceData;

        const numericUserId = await resolveUserId(user_id);

        // ==========================
        // Check Allocation Exists
        // ==========================

        const allocation = await Allocation.findOne({

            where: {
                allocation_id,
                user_id: numericUserId
            },

            include: [
                {
                    model: Subject,
                    attributes: [
                        "subject_id",
                        "subject_code",
                        "subject_name"
                    ]
                },
                {
                    model: Course,
                    attributes: [
                        "course_name"
                    ]
                },
                {
                    model: Semester,
                    attributes: [
                        "semester_number"
                    ]
                },
                {
                    model: Section,
                    attributes: [
                        "section_name"
                    ]
                }
            ]

        });

        if (!allocation) {
            throw new Error(
                "Invalid allocation. Subject is not assigned to this faculty."
            );
        }

        // ==========================
        // Duplicate Attendance Check
        // ==========================

        const existingAttendance = await Attendance.findOne({

            where: {
                allocation_id,
                attendance_date
            }

        });

        if (existingAttendance) {
            throw new Error(
                "Attendance already submitted for this subject on this date."
            );
        }

        // ==========================
        // Save Attendance
        // ==========================

        const newAttendance = await Attendance.create({

            user_id: numericUserId,
            allocation_id,
            attendance_date,
            hours,
            month,
            year

        });

        return newAttendance;

    } catch (error) {

        throw error;

    }

};

//Daily Attendance

const getDailyAttendance = async (facultyId) => {
    try {

        const numericUserId = await resolveUserId(facultyId);

        const today = new Date().toISOString().split("T")[0];

        const attendance = await Attendance.findAll({

            where: {
                user_id: numericUserId,
                attendance_date: today
            },

            include: [
                {
                    model: Allocation,
                    attributes: [
                        "allocation_id",
                        "session_type",
                        "rate_per_hour"
                    ],
                    include: [
                        {
                            model: Subject,
                            attributes: [
                                "subject_id",
                                "subject_code",
                                "subject_name"
                            ]
                        },
                        {
                            model: Course,
                            attributes: [
                                "course_id",
                                "course_name"
                            ]
                        },
                        {
                            model: Semester,
                            attributes: [
                                "semester_id",
                                "semester_number"
                            ]
                        },
                        {
                            model: Section,
                            attributes: [
                                "section_id",
                                "section_name"
                            ]
                        }
                    ]
                }
            ],

            order: [
                ["attendance_date", "DESC"]
            ]

        });

        const totalHours = attendance.reduce(
            (sum, item) => sum + Number(item.hours),
            0
        );

        const totalClasses = attendance.length;

        return {
            attendanceDate: today,
            totalClasses,
            totalHours,
            data: attendance
        };

    } catch (error) {
        throw error;
    }
};
//Weekly Attendance
const getWeeklyAttendance = async (facultyId) => {
    try {

        const numericUserId = await resolveUserId(facultyId);

        const today = new Date();
        const lastWeek = new Date();

        lastWeek.setDate(today.getDate() - 6);

        const attendance = await Attendance.findAll({

            where: {
                user_id: numericUserId,
                attendance_date: {
                    [Op.between]: [
                        lastWeek.toISOString().split("T")[0],
                        today.toISOString().split("T")[0]
                    ]
                }
            },

            include: [
                {
                    model: Allocation,
                    attributes: [
                        "allocation_id",
                        "session_type",
                        "rate_per_hour"
                    ],
                    include: [
                        {
                            model: Subject,
                            attributes: [
                                "subject_id",
                                "subject_code",
                                "subject_name"
                            ]
                        },
                        {
                            model: Course,
                            attributes: [
                                "course_id",
                                "course_name"
                            ]
                        },
                        {
                            model: Semester,
                            attributes: [
                                "semester_id",
                                "semester_number"
                            ]
                        },
                        {
                            model: Section,
                            attributes: [
                                "section_id",
                                "section_name"
                            ]
                        }
                    ]
                }
            ],

            order: [
                ["attendance_date", "DESC"]
            ]

        });

        const totalHours = attendance.reduce(
            (sum, item) => sum + Number(item.hours),
            0
        );

        const totalClasses = attendance.length;

        const daysPresent = new Set(
            attendance.map(item => item.attendance_date)
        ).size;

        const workingDays = 6;

        const daysAbsent = Math.max(workingDays - daysPresent, 0);

        return {
            weekStart: lastWeek.toISOString().split("T")[0],
            weekEnd: today.toISOString().split("T")[0],
            workingDays,
            daysPresent,
            daysAbsent,
            totalClasses,
            totalHours,
            data: attendance
        };

    } catch (error) {
        throw error;
    }
};
 //Monthly Attendance
// ==========================
// Monthly Attendance
// ==========================

const getMonthlyAttendance = async (
    facultyId,
    month,
    year
) => {

    try {

        const numericUserId = await resolveUserId(facultyId);

        const attendance = await Attendance.findAll({

            where: {
                user_id: numericUserId,
                month,
                year
            },

            include: [
                {
                    model: Allocation,
                    attributes: [
                        "allocation_id",
                        "session_type",
                        "rate_per_hour"
                    ],

                    include: [
                        {
                            model: Subject,
                            attributes: [
                                "subject_id",
                                "subject_code",
                                "subject_name"
                            ]
                        },
                        {
                            model: Course,
                            attributes: [
                                "course_id",
                                "course_name"
                            ]
                        },
                        {
                            model: Semester,
                            attributes: [
                                "semester_id",
                                "semester_number"
                            ]
                        },
                        {
                            model: Section,
                            attributes: [
                                "section_id",
                                "section_name"
                            ]
                        }
                    ]
                }
            ],

            order: [
                ["attendance_date", "DESC"]
            ]

        });

        const totalHours = attendance.reduce(
            (sum, item) => sum + Number(item.hours),
            0
        );

        const totalClasses = attendance.length;

        const daysPresent = new Set(
            attendance.map(item => item.attendance_date)
        ).size;

        // Change according to your college working days
        const workingDays = 26;

        const daysAbsent = Math.max(
            workingDays - daysPresent,
            0
        );

        return {

            month,
            year,

            workingDays,

            daysPresent,

            daysAbsent,

            totalClasses,

            totalHours,

            data: attendance

        };

    } catch (error) {

        throw error;

    }

};

//Attendace History
// ==========================
// Attendance History
// ==========================

const getAttendanceHistory = async (facultyId) => {

    try {

        const numericUserId = await resolveUserId(facultyId);

        const attendance = await Attendance.findAll({

            where: {
                user_id: numericUserId
            },

            include: [
                {
                    model: Allocation,

                    attributes: [
                        "allocation_id",
                        "session_type",
                        "rate_per_hour"
                    ],

                    include: [
                        {
                            model: Subject,
                            attributes: [
                                "subject_id",
                                "subject_code",
                                "subject_name"
                            ]
                        },
                        {
                            model: Course,
                            attributes: [
                                "course_id",
                                "course_name"
                            ]
                        },
                        {
                            model: Semester,
                            attributes: [
                                "semester_id",
                                "semester_number"
                            ]
                        },
                        {
                            model: Section,
                            attributes: [
                                "section_id",
                                "section_name"
                            ]
                        }
                    ]
                }
            ],

            order: [
                ["attendance_date", "DESC"]
            ]

        });

        const totalHours = attendance.reduce(
            (sum, item) => sum + Number(item.hours),
            0
        );

        const totalClasses = attendance.length;

        const daysPresent = new Set(
            attendance.map(item => item.attendance_date)
        ).size;

        return {

            totalClasses,

            totalHours,

            daysPresent,

            data: attendance

        };

    } catch (error) {

        throw error;

    }

};

module.exports = {
    markAttendance,
    getDailyAttendance,
    getWeeklyAttendance,
    getMonthlyAttendance,
    getAttendanceHistory
};