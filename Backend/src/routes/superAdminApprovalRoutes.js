const express = require('express');
const authMiddleware = require('../middleware/auth');
const AdminApprovalController = require('../controller/superAdminApprovalController');
const SuperAdminApprovalRouter = express.Router();

SuperAdminApprovalRouter.put('/admin/:user_id/approve', authMiddleware(['super_admin']), AdminApprovalController);

module.exports = SuperAdminApprovalRouter;