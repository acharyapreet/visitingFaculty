const approveAdmin = require("../service/superAdminService");

async function AdminApprovalController(req, res) {
    try{
        const result = await approveAdmin(req.params, req.body, req.user);
        return res.json({
            success: true,
            message: `Admin ${req.body.status === 'approved' ? 'approved' : 'rejected'} successfully`
        });
    }catch(error){
        console.log('Admin Approval failed', error);
        return res.status(error.statusCode ||500).json({
            success: false,
            message: 'Failed to process Admin approval',
            error: error.message
        });
    }
};

module.exports = AdminApprovalController;