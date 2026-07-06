const jwt = require('jsonwebtoken');
const User = require('../Schema/userSchema');

//faculty registration logic
async function registerFaculty(facultyData) {
    const existingUser = await User.findOne({where: {
        email : facultyData.email
    }});
    if(existingUser){
        throw new Error('Email already exist'); 
    }
    const user = await User.create({
        role : 'faculty',
        password_hash: facultyData.password,
        is_approved: false,
        is_active: true,
        ...facultyData
    });

    return user;
}

module.exports = registerFaculty;