const {registerFaculty, registerAdmin, login} = require("../service/userService");

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

module.exports = {
    facultyRegistration,
    adminRegisteration,
    loginUser
};