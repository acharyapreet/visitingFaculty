const sequelize = require('../config/database');
const User = require('./userSchema');
const AdminApproval = require('./adminApprovalSchema');
const FacultyApproval = require('./facultyApprovalSchema');
const Allocation = require('./allocationSchema');
const Attendance = require('./attendanceSchema');
const Bill = require('./billSchema');
const BillDetail = require('./billDetailSchema');

// define association
User.hasOne(AdminApproval, { foreignKey: 'user_id'});
AdminApproval.belongsTo(User, {foreignKey: 'user_id'});
AdminApproval.belongsTo(User,{foreignKey: 'approved_by', as: 'Approver'});

User.hasOne(FacultyApproval, {foreignKey: 'user_id'});
FacultyApproval.belongsTo(User, {foreignKey: 'user_id'});
FacultyApproval.belongsTo(User, {foreignKey: 'approved_by', as: 'Approver'});

User.hasMany(Allocation, {foreignKey: 'user_id'});
Allocation.belongsTo(User, {foreignKey: 'user_id'});
Allocation.belongsTo(User, {foreignKey: 'created_by', as: 'Creator'});

User.hasMany(Attendance, {foreignKey: 'user_id'});
Attendance.belongsTo(User, {foreignKey: 'user_id'});
Attendance.belongsTo(User,{foreignKey: 'entered_by', as: 'EnteredBy'});
Attendance.belongsTo(User, {foreignKey: 'verified_by', as: 'VerifiedBy'});
Attendance.belongsTo(User, {foreignKey: 'approved_by', as: 'ApprovedBy'});

Allocation.hasMany(Attendance,{
    foreignKey: 'allocation_id'
});
Attendance.belongsTo(Allocation, {foreignKey: 'allocation_id'});

User.hasMany(Bill, {foreignKey: 'user_id'});
Bill.belongsTo(User, {foreignKey: 'user_id'});
Bill.belongsTo(User, {foreignKey: 'generated_by', as: 'Generator'});
Bill.belongsTo(User, {foreignKey: 'approved_by', as: 'Approver'});

Bill.hasMany(BillDetail, {foreignKey: 'bill_id'});
BillDetail.belongsTo(Bill, {foreignKey: 'bill_id'});

module.exports = {
    sequelize,
    User,
    AdminApproval,
    FacultyApproval,
    Allocation,
    Attendance,
    Bill,
    BillDetail
};
