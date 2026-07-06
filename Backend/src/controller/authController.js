const registerFaculty = require("../service/userService");

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

module.exports = facultyRegistration;