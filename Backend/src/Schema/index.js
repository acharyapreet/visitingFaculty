const sequelize = require('../config/database');

// Import all models
const User = require('./userSchema');
const AdminApproval = require('./adminApprovalSchema');
const FacultyApproval = require('./facultyApprovalSchema');
const Course = require('./courseSchema');
const Semester = require('./semesterSchema');
const Section = require('./sectionSchema');
const Subject = require('./subjectSchema');
const Allocation = require('./allocationSchema');
const Attendance = require('./attendanceSchema');
const Bill = require('./billSchema');
const BillDetail = require('./billDetailsSchema'); // Missing schemas will map here cleanly

// 1. USER ASSOCIATIONS
User.hasOne(AdminApproval, { foreignKey: 'user_id' });
AdminApproval.belongsTo(User, { foreignKey: 'user_id' });
AdminApproval.belongsTo(User, { foreignKey: 'approved_by', as: 'Approver' });

User.hasOne(FacultyApproval, { foreignKey: 'user_id' });
FacultyApproval.belongsTo(User, { foreignKey: 'user_id' });
FacultyApproval.belongsTo(User, { foreignKey: 'approved_by', as: 'Approver' });

// 2. COURSE ASSOCIATIONS
Course.hasMany(Semester, { foreignKey: 'course_id' });
Semester.belongsTo(Course, { foreignKey: 'course_id' });

Course.hasMany(Section, { foreignKey: 'course_id' });
Section.belongsTo(Course, { foreignKey: 'course_id' });

Course.hasMany(Subject, { foreignKey: 'course_id' });
Subject.belongsTo(Course, { foreignKey: 'course_id' });

Semester.hasMany(Subject, { foreignKey: 'semester_id' });
Subject.belongsTo(Semester, { foreignKey: 'semester_id' });

// 3. ALLOCATION ASSOCIATIONS
Allocation.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Allocation, { foreignKey: 'user_id' });

Allocation.belongsTo(User, { foreignKey: 'created_by', as: 'Admin' });
User.hasMany(Allocation, { foreignKey: 'created_by', as: 'CreatedAllocations' });

Allocation.belongsTo(Course, { foreignKey: 'course_id' });
Course.hasMany(Allocation, { foreignKey: 'course_id' });

Allocation.belongsTo(Semester, { foreignKey: 'semester_id' });
Semester.hasMany(Allocation, { foreignKey: 'semester_id' });

Allocation.belongsTo(Section, { foreignKey: 'section_id' });
Section.hasMany(Allocation, { foreignKey: 'section_id' });

Allocation.belongsTo(Subject, { foreignKey: 'subject_id' });
Subject.hasMany(Allocation, { foreignKey: 'subject_id' });

// 4. ATTENDANCE ASSOCIATIONS
Attendance.belongsTo(Allocation, { foreignKey: 'allocation_id' });
Allocation.hasMany(Attendance, { foreignKey: 'allocation_id' });

Attendance.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Attendance, { foreignKey: 'user_id' });

// 5. BILL ASSOCIATIONS
Bill.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Bill, { foreignKey: 'user_id' });

Bill.hasMany(BillDetail, { foreignKey: 'bill_id' });
BillDetail.belongsTo(Bill, { foreignKey: 'bill_id' });

module.exports = {
    sequelize,
    User,
    AdminApproval,
    FacultyApproval,
    Course,
    Semester,
    Section,
    Subject,
    Allocation,
    Attendance,
    Bill,
    BillDetail
};