const express = require('express');
const {facultyRegistration, adminRegisteration, loginUser, logoutUser} = require('../controller/authController');
const authMiddleware = require('../middleware/auth');
const authRouter = express.Router();

authRouter.post('/register/faculty', facultyRegistration);
authRouter.post('/register/admin', adminRegisteration);
authRouter.post('/login', loginUser);
authRouter.post('/logout', authMiddleware(), logoutUser);

module.exports = authRouter;