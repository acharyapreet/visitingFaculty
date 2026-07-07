const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Semester = sequelize.define('Semester', {
    semester_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'courses', key: 'course_id' }
    },
    semester_number: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'semesters',
    timestamps: false
});

module.exports = Semester;