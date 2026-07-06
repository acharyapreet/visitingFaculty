const express = require('express');
const facultyRegistration = require('../controller/authController');
const authRouter = express.Router();

authRouter.post('/register/faculty', facultyRegistration);

module.exports = authRouter;