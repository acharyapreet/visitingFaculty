const express = require('express');
const authMiddleware = require('../middleware/auth');
const {FacultyApprovalController, getPendingFacultysController, getApprovedFacultyController, getRejectedFacultyController, getAllFacultyController} = require('../controller/adminApprovalController');
const AdminApprovalRouter = express.Router();

AdminApprovalRouter.put('/faculty/:user_id/approve', authMiddleware(['admin']), FacultyApprovalController);
AdminApprovalRouter.get('/pendingFaculty', authMiddleware(['admin']), getPendingFacultysController);
AdminApprovalRouter.get('/approvedFaculty', authMiddleware(['admin']), getApprovedFacultyController);
AdminApprovalRouter.get('/rejectedFaculty', authMiddleware(['admin']), getRejectedFacultyController);
AdminApprovalRouter.get('/allFaculty', authMiddleware(['admin']), getAllFacultyController);

module.exports = AdminApprovalRouter;