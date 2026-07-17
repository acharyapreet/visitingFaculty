const express = require('express');
const authMiddleware = require('../middleware/auth');
const { AdminApprovalController, getPendingAdminsController, getApprovedAdminsController, getRejectedAdminsController, getAllAdminsController, getAdminController } = require('../controller/superAdminApprovalController');
const SuperAdminApprovalRouter = express.Router();

SuperAdminApprovalRouter.put('/admin/:user_id/approve', authMiddleware(['super_admin']), AdminApprovalController);
SuperAdminApprovalRouter.get('/pendingAdmin', authMiddleware(['super_admin']), getPendingAdminsController);
SuperAdminApprovalRouter.get('/approvedAdmin', authMiddleware(['super_admin']), getApprovedAdminsController);
SuperAdminApprovalRouter.get('/rejectedAdmin', authMiddleware(['super_admin']), getRejectedAdminsController);
SuperAdminApprovalRouter.get('/allAdmin', authMiddleware(['super_admin']), getAllAdminsController);
SuperAdminApprovalRouter.get('/admin/:user_id', authMiddleware(['super_admin', 'admin']), getAdminController);

module.exports = SuperAdminApprovalRouter;