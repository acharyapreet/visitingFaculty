const {DataTypes} = require('sequelize');
const sequelize = require('../config/database');

const FacultyApproval = sequelize.define('FacultyApproval',{
    approval_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER(30),
        allowNull: false,
        references: { model: 'users', key: 'user_id' }
    },
    approved_by: {
        type: DataTypes.INTEGER(30),
        allowNull: true,
        references: { model: 'users', key: 'user_id' }
    },
    approval_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending'
    },
    uvfin: {
        type: DataTypes.STRING(20),
        allowNull: true,
        defaultValue: null
    },
    rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    }
},{
    tableName: 'faculty_approvals',
    timestamps: false
});

module.exports = FacultyApproval;