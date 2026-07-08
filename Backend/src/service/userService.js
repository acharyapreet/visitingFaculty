const jwt = require('jsonwebtoken');
const User = require('../Schema/userSchema');
const FacultyApproval = require('../Schema/facultyApprovalSchema');
const AdminApproval = require('../Schema/adminApprovalSchema');

// faculty registration logic
async function registerFaculty(facultyData) {
    const existingUser = await User.findOne({
        where: { email: facultyData.email }
    });

    if (existingUser) {
        throw new Error('Email already exist');
    }

    const { password, ...restFacultyData } = facultyData;
    const user = await User.create({
        role: 'faculty',
        password_hash: password,
        is_approved: false,
        is_active: true,
        ...restFacultyData
    });

    await FacultyApproval.create({
        user_id: user.user_id,
        status: 'pending'
    });

    return user;
}

async function registerAdmin(adminData) {
    const existingUser = await User.findOne({
        where: { email: adminData.email }
    });

    if (existingUser) {
        throw new Error('Email already exist');
    }

    const { password, ...restAdminData } = adminData;
    const user = await User.create({
        role: 'admin',
        password_hash: password,
        is_approved: false,
        is_active: true,
        ...restAdminData
    });

    await AdminApproval.create({
        user_id: user.user_id,
        status: 'pending'
    });

    return user;
}

async function login(Details) {
    try {
        const { email, password, role } = Details || {};
        const user = await User.findOne({
            where: { email, role }
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        if (!user.is_approved) {
            throw new Error('account is pending approval');
        }

        if (!user.is_active) {
            throw new Error('account is deactivated');
        }

        const isValid = await user.comparePassword(password);
        if (!isValid) {
            throw new Error('Invalid credentials');
        }

        await user.update({ last_login: new Date() });

        const token = jwt.sign(
            { user_id: user.user_id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        return { user, token };
    } catch (error) {
        console.log('error in login in userService', error);
        throw error;
    }
}

module.exports = {
    registerFaculty,
    registerAdmin,
    login
};