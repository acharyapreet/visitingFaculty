const {approveFaculty, getPendingFaculty, getApprovedFaculty, getRejectedFaculty, getAllFaculty} = require("../service/adminApprovalService");
const { getAllAdminsController } = require("./superAdminApprovalController");

async function FacultyApprovalController(req, res) {
    try{
        const result = await approveFaculty(req.params, req.body, req.user);
        return res.json({
            success: true,
            message: `Faculty ${req.body.status === 'approved' ? 'approved' : 'rejected'} successfully`
        });
    }catch(error){
        console.log('Faculty Approval failed', error);
        return res.status(error.statusCode ||500).json({
            success: false,
            message: 'Failed to process faculty approval',
            error: error.message
        });
    }
};
async function getPendingFacultysController(req, res) {
    try{
        const pendingFaculty = await getPendingFaculty();
        return res.json({
            success: true,
            count: pendingFaculty.length,
            data: pendingFaculty
        });
    }catch(error){
        console.log('Faculty pending show failed', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch pending Faculty',
            error: error.message
        });
    }
};

async function getApprovedFacultyController(req, res) {
    try{
        const ApprovedFaculty = await getApprovedFaculty();
        return res.json({
            success: true,
            count: ApprovedFaculty.length,
            data: ApprovedFaculty
        });
    }catch(error){
        console.log('Faculty Approval failed', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch approved faculty',
            error: error.message
        });
    }
};

async function getRejectedFacultyController(req, res) {
    try{
        const RejectedFaculty = await getRejectedFaculty();
        return res.json({
            success: true,
            count: RejectedFaculty.length,
            data: RejectedFaculty
        });
    }catch(error){
        console.log('Faculty Rejection failed', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch rejected Faculty',
            error: error.message
        });
    }
};

async function getAllFacultyController(req, res) {
    try{
        const Faculty = await getAllFaculty();
        return res.json({
            success: true,
            count: Faculty.length,
            data: Faculty
        });
    }catch(error){
        console.log('Faculty show failed', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch all Faculty',
            error: error.message
        });
    }
};

module.exports = {
    FacultyApprovalController,
    getAllFacultyController,
    getApprovedFacultyController,
    getRejectedFacultyController,
    getPendingFacultysController
};