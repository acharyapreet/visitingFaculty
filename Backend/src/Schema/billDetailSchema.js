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
        references: {
            model: 'bills',
            key: 'bill_id'
        }
    },
    attendance_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    subject_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    subject_code: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    class_name: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    session: {
        type: DataTypes.STRING(20),
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