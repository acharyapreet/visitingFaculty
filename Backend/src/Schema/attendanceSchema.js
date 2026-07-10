const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Attendance = sequelize.define('Attendance', {
    attendance_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.STRING,
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
    hours: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    },
    month: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
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