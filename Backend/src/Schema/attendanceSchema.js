const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
    attendance_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    allocation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'allocations',
            key: 'allocation_id'
        }
    },
    attendance_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    hours: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM('pending', 'verified', 'approved'),
        defaultValue: 'pending'
    },
    entered_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    entered_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    verified_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    verified_date: {
        type: DataTypes.DATE,
        allowNull: true
    },
    approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    approved_date: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'attendance',
    timestamps: false
});

module.exports = Attendance;