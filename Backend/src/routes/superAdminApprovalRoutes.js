const express = require('express');
const authMiddleware = require('../middleware/auth');
const { AdminApprovalController, getPendingAdminsController, getApprovedAdminsController, getRejectedAdminsController, getAllAdminsController, getAdminController } = require('../controller/superAdminApprovalController');
const { showDashboardController, showDashboardOfCourseController, addSectionsController, updateInchargeController, showSubjectController, deleteSubjectController, addSubjectController } = require('../controller/courseController');
const SuperAdminApprovalRouter = express.Router();

SuperAdminApprovalRouter.put('/admin/:user_id/approve', authMiddleware(['super_admin']), AdminApprovalController);
SuperAdminApprovalRouter.get('/pendingAdmin', authMiddleware(['super_admin']), getPendingAdminsController);
SuperAdminApprovalRouter.get('/approvedAdmin', authMiddleware(['super_admin']), getApprovedAdminsController);
SuperAdminApprovalRouter.get('/rejectedAdmin', authMiddleware(['super_admin']), getRejectedAdminsController);
SuperAdminApprovalRouter.get('/allAdmin', authMiddleware(['super_admin']), getAllAdminsController);
SuperAdminApprovalRouter.get('/admin/:user_id', authMiddleware(['super_admin', 'admin']), getAdminController);
SuperAdminApprovalRouter.get('/courseDashboard', authMiddleware(['super_admin']), showDashboardController);
SuperAdminApprovalRouter.get('/courseDashboard/:course_id', authMiddleware(['super_admin']), showDashboardOfCourseController);
SuperAdminApprovalRouter.post('/addSection/:course_id', authMiddleware(['super_admin']), addSectionsController);
SuperAdminApprovalRouter.put('/updateIncharge/:course_id', authMiddleware(['super_admin']), updateInchargeController);
SuperAdminApprovalRouter.get('/subjects/:course_id/:semester_id', authMiddleware(['super_admin']), showSubjectController);
SuperAdminApprovalRouter.delete('/deleteSubject/:course_id/:semester_id/:subject_id', authMiddleware(['super_admin']), deleteSubjectController);
SuperAdminApprovalRouter.post('/addSubject/:course_id/:semester_id', authMiddleware(['super_admin']), addSubjectController);


module.exports = SuperAdminApprovalRouter;