const {DataTypes} = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcrypt');

const User = sequelize.define('User', {
    user_id : {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement: true
    },
    role : {
        type : DataTypes.ENUM('super_admin', 'admin', 'faculty'),
        allowNull: false
    },
    email : {
        type : DataTypes.STRING(100),
        allowNull : false,
        unique : true,
        validate :{
            isEmail : true
        }
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    full_name: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    phone_number: {
        type: DataTypes.STRING(15),
        allowNull: false
    },
    address: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    qualification: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    aadhaar_no: {
        type: DataTypes.STRING(12),
        allowNull: true,
        unique: true
    },
    account_no: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    bank_name: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    ifsc_code: {
        type: DataTypes.STRING(11),
        allowNull: true
    },
    pan_card_no: {
        type: DataTypes.STRING(10),
        allowNull: true,
        unique: true
    },
    is_approved: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'users',
    timestamps: false,
    hooks :{
        beforeCreate : async (user) =>{
            if(user.password_hash){
                user.password_hash = await bcrypt.hash(user.password_hash, 10);
            }
        },
        beforeUpdate: async(user) =>{
            if(user.changed('password_hash')){
                user.password_hash = await bcrypt.hash(user.password_hash, 10);
            }
        }
    }
});

// Instance method to compare password
User.prototype.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password_hash);
};

module.exports = User;