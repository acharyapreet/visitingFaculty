const express = require('express');
const authMiddleware = require('../middleware/auth');
const FacultyApprovalController = require('../controller/adminApprovalController');
const AdminApprovalRouter = express.Router();

AdminApprovalRouter.put('/faculty/:user_id/approve', authMiddleware(['admin']), FacultyApprovalController);

module.exports = AdminApprovalRouter;