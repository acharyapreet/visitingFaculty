const {registerFaculty, registerAdmin, login, logout, generatePasswordResetToken, resetUserPassword} = require("../service/userService");

async function facultyRegistration(req, res) {
    try{
        const result = await registerFaculty(req.body);
        return res.status(201).json({
            success : true,
            message : "Registration successful",
            data :{ user_id: result.user_id,
                email: result.email,
                full_name: result.full_name }
        });
    }catch(error){
        console.log('Faculty Registration failed', error);
        return res.status(error.statusCode ||400).json({
            success : false,
            message : "Registration Failed",
            data : error.message
        });
    }
};

async function adminRegisteration(req, res) {
    try {
        const result = await registerAdmin(req.body);
        return res.status(201).json({
            success: true,
            message: 'Registration Successfull',
            data: {
               user_id: result.user_id,
                email: result.email,
                full_name: result.full_name 
            }
        })
    } catch (error) {
        console.log('Admin Registration failed', error);
        return res.status(error.statusCode ||400).json({
            success : false,
            message : "Registration Failed",
            data : error.message
        });
    }
}

async function loginUser(req, res) {
    try {
        const result = await login(req.body);
    
        return res.status(200).json({
            success: true,
            message: 'Login Successfull',
            data: {
               user_id: result.user.user_id,
                role: result.user.role,
                full_name: result.user.full_name,
                email: result.user.email,
                uvfin: result.user.uvfin || null,
                token: result.token 
            }
        })
    } catch (error) {
        console.log('Login failed', error);
        return res.status(error.statusCode ||401).json({
            success : false,
            message : "Login Failed",
            data : error.message
        });
    }
}

async function logoutUser(req, res) {
    try {
        await logout(req.user_id);
        return res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    } catch (error) {
        console.log('Logout failed', error);
        return res.status(error.statusCode || 400).json({
            success: false,
            message: 'Logout failed',
            data: error.message
        });
    }
}

async function forgotPasswordController(req, res) {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required.'
            });
        }
        const result = await generatePasswordResetToken(email);
        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Forgot Password Controller Error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Something went wrong while sending reset link.'
        });
    }
}

async function resetPasswordController(req, res) {
    try {
        const { token, newPassword } = req.body;
        if (!token || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Token and new password are required.'
            });
        }
        const result = await resetUserPassword(token, newPassword);
        return res.status(200).json({
            success: true,
            message: result.message
        });
    } catch (error) {
        console.error('Reset Password Controller Error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to reset password.'
        });
    }
}

module.exports = {
    facultyRegistration,
    adminRegisteration,
    loginUser,
    logoutUser,
    forgotPasswordController,
    resetPasswordController
};