const approveFaculty = require("../service/adminApprovalService");

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

module.exports = FacultyApprovalController;