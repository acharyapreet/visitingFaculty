const express = require('express');
const {facultyRegistration, adminRegisteration, loginUser} = require('../controller/authController');
const authRouter = express.Router();

authRouter.post('/register/faculty', facultyRegistration);
authRouter.post('/register/admin', adminRegisteration);
authRouter.post('/login', loginUser);

module.exports = authRouter;