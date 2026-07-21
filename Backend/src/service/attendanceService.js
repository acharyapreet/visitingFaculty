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
// Helper: Flatten a raw Attendance Sequelize record
// Extracts Subject, Course, Semester, Section from nested Allocation
// ==========================
const flattenAttendance = (item) => {
    const alloc = item.Allocation || {};
    const user  = item.User  || null;
    return {
        // --- Core attendance fields ---
        attendance_id:   item.attendance_id,
        attendance_date: item.attendance_date,
        start_time:      item.start_time,
        end_time:        item.end_time,
        hours:           item.hours,
        status:          item.status,
        remarks:         item.remarks,
        month:           item.month,
        year:            item.year,

        // --- Faculty (only present in admin queries) ---
        ...(user ? {
            user_id:   user.user_id,
            full_name: user.full_name,
            email:     user.email,
            uvfin:     user.uvfin
        } : {}),

        // --- Allocation ---
        allocation_id:   alloc.allocation_id   ?? null,
        session_type:    alloc.session_type    ?? null,
        rate_per_hour:   alloc.rate_per_hour   ?? null,

        // --- Course ---
        course_id:       alloc.Course?.course_id       ?? null,
        course_name:     alloc.Course?.course_name     ?? null,
        course_code:     alloc.Course?.course_code     ?? null,

        // --- Semester ---
        semester_id:     alloc.Semester?.semester_id   ?? null,
        semester_number: alloc.Semester?.semester_number ?? null,

        // --- Section ---
        section_id:      alloc.Section?.section_id     ?? null,
        section_name:    alloc.Section?.section_name   ?? null,

        // --- Subject ---
        subject_id:      alloc.Subject?.subject_id     ?? null,
        subject_code:    alloc.Subject?.subject_code   ?? null,
        subject_name:    alloc.Subject?.subject_name   ?? null
    };
};

// ==========================
// Mark Attendance
// ==========================

const markAttendance = async (attendanceData) => {

    try {

        const {
            user_id,
            course_id,
            semester_id,
            subject_id,
            attendance_date,
            start_time,
            end_time,
            hours,
            remarks,
            status,
            month,
            year
        } = attendanceData;

        const numericUserId = await resolveUserId(user_id);

        // ==========================
        // Find Allocation from course + semester + subject
        // The frontend sends course_id, semester_id, subject_id
        // We look up the matching allocation for this faculty
        // ==========================

        const whereClause = {
            user_id: numericUserId,
            is_active: true
        };

        if (subject_id)  whereClause.subject_id  = subject_id;
        if (course_id)   whereClause.course_id    = course_id;
        if (semester_id) whereClause.semester_id  = semester_id;

        const allocation = await Allocation.findOne({

            where: whereClause,

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
                        "course_name",
                        "course_code"
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

        });

        if (!allocation) {
            throw new Error(
                "No active allocation found for this faculty with the given course, semester, and subject."
            );
        }

        const resolvedAllocationId = allocation.allocation_id;

        // ==========================
        // Duplicate Attendance Check
        // (allow multiple sessions on same date if start_time differs)
        // ==========================

        const existingAttendance = await Attendance.findOne({

            where: {
                allocation_id: resolvedAllocationId,
                attendance_date,
                start_time
            }

        });

        if (existingAttendance) {
            throw new Error(
                "Attendance already submitted for this subject at this time on this date."
            );
        }

        // ==========================
        // Save Attendance
        // ==========================

        const newAttendance = await Attendance.create({

            user_id: numericUserId,
            allocation_id: resolvedAllocationId,
            attendance_date,
            start_time,
            end_time,
            hours,
            remarks: remarks || null,
            status: status || 'Pending',
            month,
            year

        });

        // ==========================
        // Return flat, enriched response
        // ==========================

        return {
            attendance_id:   newAttendance.attendance_id,
            attendance_date: newAttendance.attendance_date,
            start_time:      newAttendance.start_time,
            end_time:        newAttendance.end_time,
            hours:           newAttendance.hours,
            status:          newAttendance.status,
            remarks:         newAttendance.remarks,
            month:           newAttendance.month,
            year:            newAttendance.year,

            // Allocation details — flat for easy frontend use
            allocation_id:   resolvedAllocationId,
            session_type:    allocation.session_type,
            rate_per_hour:   allocation.rate_per_hour,

            // Course
            course_id:       allocation.Course   ? allocation.Course.course_id       : null,
            course_name:     allocation.Course   ? allocation.Course.course_name     : null,
            course_code:     allocation.Course   ? allocation.Course.course_code     : null,

            // Semester
            semester_id:     allocation.Semester ? allocation.Semester.semester_id   : null,
            semester_number: allocation.Semester ? allocation.Semester.semester_number : null,

            // Section
            section_id:      allocation.Section  ? allocation.Section.section_id     : null,
            section_name:    allocation.Section  ? allocation.Section.section_name   : null,

            // Subject
            subject_id:      allocation.Subject  ? allocation.Subject.subject_id     : null,
            subject_code:    allocation.Subject  ? allocation.Subject.subject_code   : null,
            subject_name:    allocation.Subject  ? allocation.Subject.subject_name   : null
        };

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
                                "course_name",
                                "course_code"
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
            data: attendance.map(flattenAttendance)
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
                                "course_name",
                                "course_code"
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
            data: attendance.map(flattenAttendance)
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
                                "course_name",
                                "course_code"
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
            data: attendance.map(flattenAttendance)
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
                                "course_name",
                                "course_code"
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
            data: attendance.map(flattenAttendance)
        };

    } catch (error) {

        throw error;

    }

};

// ==========================
// Admin: Get All Attendance (with filters)
// filters: { facultyId, month, year, status }
// ==========================
const getAdminAttendance = async (filters = {}) => {

    try {

        const whereClause = {};

        if (filters.month)  whereClause.month  = filters.month;
        if (filters.year)   whereClause.year   = filters.year;
        if (filters.status) whereClause.status = filters.status;

        if (filters.facultyId) {
            const numericUserId = await resolveUserId(filters.facultyId);
            whereClause.user_id = numericUserId;
        }

        const attendance = await Attendance.findAll({

            where: whereClause,

            include: [
                {
                    model: User,
                    attributes: [
                        "user_id",
                        "full_name",
                        "email",
                        "uvfin"
                    ]
                },
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
                ["attendance_date", "DESC"],
                ["start_time", "DESC"]
            ]

        });

        return {
            totalRecords: attendance.length,
            data: attendance.map(flattenAttendance)
        };

    } catch (error) {

        throw error;

    }

};

// ==========================
// Admin: Verify / Update Attendance Status
// ==========================
const verifyAttendance = async (attendanceId, status, remarks) => {

    try {

        const attendance = await Attendance.findByPk(attendanceId);

        if (!attendance) {
            throw new Error("Attendance record not found.");
        }

        const validStatuses = ['Present', 'Absent', 'Pending'];
        if (!validStatuses.includes(status)) {
            throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}.`);
        }

        await attendance.update({
            status,
            remarks: remarks !== undefined ? remarks : attendance.remarks
        });

        return attendance;

    } catch (error) {

        throw error;

    }

};

// ==========================
// Get Faculty Allocations
// Returns all active subjects assigned to the faculty with
// full Course, Semester, Section, Subject info.
// Used by the frontend to populate the "Mark Attendance" form.
// ==========================
const getFacultyAllocations = async (facultyId) => {

    try {

        const numericUserId = await resolveUserId(facultyId);

        const allocations = await Allocation.findAll({

            where: {
                user_id: numericUserId,
                is_active: true
            },

            include: [
                {
                    model: Course,
                    attributes: [
                        "course_id",
                        "course_name",
                        "course_code"
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
                },
                {
                    model: Subject,
                    attributes: [
                        "subject_id",
                        "subject_code",
                        "subject_name"
                    ]
                }
            ],

            order: [
                ["allocation_id", "ASC"]
            ]

        });

        // Flatten into a clean, easy-to-use shape for the frontend
        const result = allocations.map(a => ({
            allocation_id:   a.allocation_id,
            session_type:    a.session_type,
            rate_per_hour:   a.rate_per_hour,
            academic_year:   a.academic_year,
            course_id:       a.Course   ? a.Course.course_id       : null,
            course_name:     a.Course   ? a.Course.course_name     : null,
            course_code:     a.Course   ? a.Course.course_code     : null,
            semester_id:     a.Semester ? a.Semester.semester_id   : null,
            semester_number: a.Semester ? a.Semester.semester_number : null,
            section_id:      a.Section  ? a.Section.section_id     : null,
            section_name:    a.Section  ? a.Section.section_name   : null,
            subject_id:      a.Subject  ? a.Subject.subject_id     : null,
            subject_code:    a.Subject  ? a.Subject.subject_code   : null,
            subject_name:    a.Subject  ? a.Subject.subject_name   : null
        }));

        return {
            faculty_id: numericUserId,
            total: result.length,
            allocations: result
        };

    } catch (error) {

        throw error;

    }

};
const getAttendanceByIdService = async (attendanceId) => {

    const record = await Attendance.findByPk(attendanceId, {
        include: [
            {
                model: User,
                attributes: ["user_id", "full_name", "email", "uvfin"]
            },
            {
                model: Allocation,
                attributes: ["allocation_id", "session_type", "rate_per_hour"],
                include: [
                    { model: Course, attributes: ["course_id", "course_name", "course_code"] },
                    { model: Semester, attributes: ["semester_id", "semester_number"] },
                    { model: Section, attributes: ["section_id", "section_name"] },
                    { model: Subject, attributes: ["subject_id", "subject_code", "subject_name"] }
                ]
            }
        ]
    });

    if (!record) return null;

    // Flatten for consistent output
    return {
        attendance_id:   record.attendance_id,
        attendance_date: record.attendance_date,
        start_time:      record.start_time,
        end_time:        record.end_time,
        hours:           record.hours,
        status:          record.status,
        remarks:         record.remarks,
        month:           record.month,
        year:            record.year,

        // User
        user_id:         record.User ? record.User.user_id : null,
        full_name:       record.User ? record.User.full_name : null,
        email:           record.User ? record.User.email : null,
        uvfin:           record.User ? record.User.uvfin : null,

        // Allocation details
        allocation_id:   record.Allocation ? record.Allocation.allocation_id : null,
        session_type:    record.Allocation ? record.Allocation.session_type : null,
        rate_per_hour:   record.Allocation ? record.Allocation.rate_per_hour : null,

        // Course
        course_id:       record.Allocation?.Course ? record.Allocation.Course.course_id : null,
        course_name:     record.Allocation?.Course ? record.Allocation.Course.course_name : null,
        course_code:     record.Allocation?.Course ? record.Allocation.Course.course_code : null,

        // Semester
        semester_id:     record.Allocation?.Semester ? record.Allocation.Semester.semester_id : null,
        semester_number: record.Allocation?.Semester ? record.Allocation.Semester.semester_number : null,

        // Section
        section_id:      record.Allocation?.Section ? record.Allocation.Section.section_id : null,
        section_name:    record.Allocation?.Section ? record.Allocation.Section.section_name : null,

        // Subject
        subject_id:      record.Allocation?.Subject ? record.Allocation.Subject.subject_id : null,
        subject_code:    record.Allocation?.Subject ? record.Allocation.Subject.subject_code : null,
        subject_name:    record.Allocation?.Subject ? record.Allocation.Subject.subject_name : null
    };

};


module.exports = {
    markAttendance,
    getDailyAttendance,
    getWeeklyAttendance,
    getMonthlyAttendance,
    getAttendanceHistory,
    getAdminAttendance,
    verifyAttendance,
    getFacultyAllocations,
    getAttendanceByIdService
};