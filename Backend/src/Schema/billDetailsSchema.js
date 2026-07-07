const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BillDetail = sequelize.define('BillDetail', {
    detail_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    bill_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'bills', key: 'bill_id' }
    },
    attendance_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    course_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    semester_number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    section_name: {
        type: DataTypes.STRING(10),
        allowNull: true
    },
    subject_code: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    subject_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    hours: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false
    },
    rate_per_hour: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    }
}, {
    tableName: 'bill_details',
    timestamps: false
});

module.exports = BillDetail;