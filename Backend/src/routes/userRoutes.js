const express = require('express');
const {facultyRegistration, adminRegisteration, loginUser, logoutUser, forgotPasswordController, resetPasswordController, changePasswordController} = require('../controller/authController');
const authMiddleware = require('../middleware/auth');
const authRouter = express.Router();

authRouter.post('/register/faculty', facultyRegistration);
authRouter.post('/register/admin', adminRegisteration);
authRouter.post('/login', loginUser);
authRouter.post('/logout', authMiddleware(), logoutUser);
authRouter.post('/forgotPassword/', forgotPasswordController);
authRouter.post('/resetPassword', resetPasswordController);
authRouter.post('/changePassword', authMiddleware(),changePasswordController);

module.exports = authRouter;