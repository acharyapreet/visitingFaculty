const { approveFaculty, getPendingFaculty, getApprovedFaculty, getRejectedFaculty, getAllFaculty, getFacultyById, updateUvfin } = require("../service/adminApprovalService");
const { getAllAdminsController } = require("./superAdminApprovalController");

async function FacultyApprovalController(req, res) {
    try {
        const result = await approveFaculty(req.params, req.body, req.user);
        return res.json({
            success: true,
            message: `Faculty ${req.body.status === 'approved' ? 'approved' : 'rejected'} successfully`
        });
    } catch (error) {
        console.log('Faculty Approval failed', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: 'Failed to process faculty approval',
            error: error.message
        });
    }
};
async function getPendingFacultysController(req, res) {
    try {
        const pendingFaculty = await getPendingFaculty();
        return res.json({
            success: true,
            count: pendingFaculty.length,
            data: pendingFaculty
        });
    } catch (error) {
        console.log('Faculty pending show failed', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch pending Faculty',
            error: error.message
        });
    }
};

async function getApprovedFacultyController(req, res) {
    try {
        const ApprovedFaculty = await getApprovedFaculty();
        return res.json({
            success: true,
            count: ApprovedFaculty.length,
            data: ApprovedFaculty
        });
    } catch (error) {
        console.log('Faculty Approval failed', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch approved faculty',
            error: error.message
        });
    }
};

async function getRejectedFacultyController(req, res) {
    try {
        const RejectedFaculty = await getRejectedFaculty();
        return res.json({
            success: true,
            count: RejectedFaculty.length,
            data: RejectedFaculty
        });
    } catch (error) {
        console.log('Faculty Rejection failed', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch rejected Faculty',
            error: error.message
        });
    }
};

async function getFacultyController(req, res) {
    try {
        const Faculty = await getFacultyById(req.params.user_id);
        return res.json({
            success: true,
            data: Faculty
        });
    } catch (error) {
        console.log('Faculty show failed', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch Faculty',
            error: error.message
        });
    }
};
async function getAllFacultyController(req, res) {
    try {
        const Faculty = await getAllFaculty();
        return res.json({
            success: true,
            count: Faculty.length,
            data: Faculty
        });
    } catch (error) {
        console.log('Faculty show failed', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch all Faculty',
            error: error.message
        });
    }
};

async function updateUvfinController(req, res) {
    try {
        // 1. Safely extract the ID whether your route uses :user_id or :id
        const targetId = req.params.user_id || req.params.id;
        const targetUvfin = req.body.uvfin;

        // 2. Validate inputs before hitting the database service to prevent crashes
        if (!targetId) {
            return res.status(400).json({ 
                success: false, 
                message: "User ID parameter is missing from the URL." 
            });
        }
        
        if (!targetUvfin) {
            return res.status(400).json({ 
                success: false, 
                message: "UVFIN is missing from the request body." 
            });
        }

        // 3. Call the service
        const result = await updateUvfin(targetId, targetUvfin);
        
        return res.status(200).json({
            success: true,
            // Fallback message just in case the service doesn't return one
            message: result?.message || "UVFIN updated successfully"
        });
        
    } catch (error) {
        console.error('Change uvfin Controller Error:', error);
        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || 'Failed to change uvfin.'
        });
    }
}
module.exports = {
    FacultyApprovalController,
    getAllFacultyController,
    getApprovedFacultyController,
    getRejectedFacultyController,
    getPendingFacultysController,
    getFacultyController,
    updateUvfinController
};