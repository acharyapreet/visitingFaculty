const {DataTypes} = require('sequelize');
const sequelize = require('../config/database');

const Allocation = sequelize.define('Allocation', {
    allocation_id : {
        type: DataTypes.INTEGER,
        primaryKey : true,
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
    rate_per_hour: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    session_type: {
        type: DataTypes.ENUM('Theory', 'Practical'),
        allowNull: false
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'user_id'
        }
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
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
