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
        references: { model: 'users', key: 'user_id' }
    },
    allocation_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'allocations', key: 'allocation_id' }
    },
    attendance_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    end_time: {
        type: DataTypes.TIME,
        allowNull: false
    },
    hours: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    },
    remarks: {
        type: DataTypes.STRING,
        allowNull: true
    },
    status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'Pending',
        validate: {
            isIn: [['Present', 'Absent', 'Pending']]
        }
    },
    month: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    // ── NEW: attendance period type ────────────────────────────────────────────
    // 'daily'   → faculty marked attendance for a single day
    // 'weekly'  → faculty marked attendance for a week range
    // 'monthly' → faculty marked attendance for an entire month
    attendance_period: {
        type: DataTypes.ENUM('daily', 'weekly', 'monthly'),
        allowNull: false,
        defaultValue: 'daily',
        comment: 'Granularity at which the faculty submitted this attendance record'
    },
    // ── NEW: ISO week number (1-53) — populated only for weekly submissions ────
    week_number: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'ISO week number (1-53) when attendance_period = weekly'
    },
    entered_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'attendance',
    timestamps: false
});

module.exports = Attendance;