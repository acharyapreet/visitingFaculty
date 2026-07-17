const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Bill = sequelize.define('Bill', {
    bill_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER(30),
        allowNull: false,
        references: { model: 'users', key: 'user_id' }
    },
    month: {
        type: DataTypes.STRING(10),
        allowNull: false
    },
    year: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    total_hours: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    amount_in_words: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    bill_date: {
        type: DataTypes.DATEONLY,
        allowNull: false
    },
    pdf_path: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    generated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'bills',
    timestamps: false
});

module.exports = Bill;