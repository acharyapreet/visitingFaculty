const { User, AdminApproval } = require('../Schema');
const sendEmail  = require('../utils/emailService');
const { generateAdminId } = require('../utils/helper');

// ============================================
// APPROVE ADMIN
// ============================================
const approveAdmin = async (params, Details, currentUser) => {
    try {
        const { user_id } = params;
        const { status, rejection_reason } = Details;

        console.log('approveAdmin called with user_id:', user_id);
        const user = await User.findOne({ where: { user_id: user_id } });
        console.log('User found in DB:', user ? user.toJSON() : null);

        if (!user || user.role !== 'admin') {
            throw new Error('Admin not found');
        }

        let resultUser = user;

        const approval = await AdminApproval.findOne({
            where: { user_id, status: 'pending' }
        });

        if (!approval) {
            throw new Error('No pending approval found');
        }

        if (status === 'approved') {
            // ✅ Generate Admin ID: AD-2k26-001
            const adminId = await generateAdminId();

            // ✅ Get current user data
            const oldUserId = user.user_id;
            
            // ✅ Update user with new user_id using class-level update (since instance.update cannot alter primary keys in Sequelize)
            await User.update(
                { is_approved: true, user_id: adminId },
                { where: { user_id: oldUserId } }
            );

            // Fetch the updated user instance
            resultUser = await User.findByPk(adminId);

            // Update status, approved_by, and approval_date in AdminApproval
            await AdminApproval.update(
                {
                    status: 'approved',
                    approved_by: currentUser.user_id,
                    approval_date: new Date()
                },
                { where: { user_id: adminId } }
            );

            await sendEmail({
                to: resultUser.email,
                subject: 'Admin Account Approved - DAVV',
                html: `
                    <h2>Admin Account Approved</h2>
                    <p>Dear ${resultUser.full_name},</p>
                    <p>Your admin account has been approved.</p>
                    <p><strong>User ID:</strong> ${adminId}</p>
                    <p>You can now login to the system.</p>
                    <p>Thank you,<br>DAVV Administration</p>
                `
            });

        } else if (status === 'rejected') {
            if (!rejection_reason) {
                throw new Error('Rejection reason is required');
            }

            await approval.update({
                status: 'rejected',
                approved_by: currentUser.user_id,
                approval_date: new Date(),
                rejection_reason
            });

            await user.update({
                is_approved: false,
                is_active: false
            });

            await sendEmail({
                to: user.email,
                subject: 'Admin Account Rejected - DAVV',
                html: `
                    <h2>Admin Account Rejected</h2>
                    <p>Dear ${user.full_name},</p>
                    <p>Your admin registration has been rejected.</p>
                    <p><strong>Reason:</strong> ${rejection_reason}</p>
                    <p>Please contact the system administrator.</p>
                    <p>Thank you,<br>DAVV Administration</p>
                `
            });
        }

        return resultUser;

    } catch (error) {
        console.error('Approve Admin Error:', error);
        throw error;
    }
};
async function getPendingAdmins(){
    try {
        const pendingAdmins = await User.findAll({
            where: { 
                role: 'admin', 
                is_approved: false 
            },
            include: [{
                model: AdminApproval,
                where: { status: 'pending' },
                required: true
            }],
            attributes: { exclude: ['password_hash'] },
            order: [['created_at', 'ASC']]
        });

        return pendingAdmins;

    } catch (error) {
        console.error('Get Pending Admins Error:', error);
        throw new Error('Failed to fetch pending admins');
    }
};

async function getRejectedAdmin() {
    try {
        const RejectedAdmin = await User.findAll({
            where: {
                role: 'admin',
                is_approved: false
            },
            include: [{
                model: AdminApproval,
                where:{status: 'rejected'},
                required: true
            }],
            attributes:{exclude: ['password_hash']},
            order:[['created_at', 'ASC']]
        });
        return RejectedAdmin;
    } catch (error) {
        console.error('Get Rejected Admins Error:', error);
        throw new Error('Failed to fetch rejected admins');
    }
}
async function getApprovedAdmin() {
    try {
        const ApprovedAdmin = await User.findAll({
            where: {
                role: 'admin',
                is_approved: true
            },
            include: [{
                model: AdminApproval,
                where:{status: 'approved'},
                required: true
            }],
            attributes:{exclude: ['password_hash']},
            order:[['created_at', 'ASC']]
        });
        return ApprovedAdmin;
    } catch (error) {
        console.error('Get Approved Admins Error:', error);
        throw new Error('Failed to fetch approved admins');
    }
}

async function getAllAdmins() {
    try {
        const admins = await User.findAll({
            where: { role: 'admin' },
            attributes: { exclude: ['password_hash'] },
            include: [{
                model: AdminApproval,
                required: false
            }],
            order: [['created_at', 'DESC']]
        });

        return admins;

    } catch (error) {
        console.error('Get All Admins Error:', error);
        throw new Error('Failed to fetch admins');
    }
}

module.exports = {
    approveAdmin,
    getPendingAdmins,
    getRejectedAdmin,
    getApprovedAdmin,
    getAllAdmins
};