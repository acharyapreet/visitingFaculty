const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Course = sequelize.define('Course', {
    course_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    course_code: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    course_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    program_incharge: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    total_semesters: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    year:{
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0   // allows ALTER TABLE to backfill existing rows safely
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'courses',
    timestamps: false
});

module.exports = Course;