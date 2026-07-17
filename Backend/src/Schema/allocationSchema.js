const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Allocation = sequelize.define('Allocation', {
    allocation_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    user_id: {
        type: DataTypes.INTEGER(30),
        allowNull: false,
        references: { model: 'users', key: 'user_id' }
    },
    course_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'courses', key: 'course_id' }
    },
    semester_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'semesters', key: 'semester_id' }
    },
    section_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'sections', key: 'section_id' }
    },
    subject_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'subjects', key: 'subject_id' }
    },
    session_type: {
        type: DataTypes.ENUM('Theory', 'Practical'),
        allowNull: false
    },
    rate_per_hour: {
        type: DataTypes.ENUM('200', '400', '800'),
        allowNull: false
    },
    academic_year: {
        type: DataTypes.STRING(20),
        allowNull: false
    },
    created_by: {
        type: DataTypes.INTEGER(30),
        allowNull: false,
        references: { model: 'users', key: 'user_id' }  
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'allocations',
    timestamps: false
});

module.exports = Allocation;