const {DataTypes} = require('sequelize');
const sequelize = require('../config/database');

const AdminApproval = sequelize.define('AdminApproval', {
    approval_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'users', key: 'user_id' }
    },
    approved_by: {
        type: DataTypes.INTEGER,
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
    rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true
    }
},{
    tableName: 'admin_approvals',
    timestamps: false
});

module.exports = AdminApproval;