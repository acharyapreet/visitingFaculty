const { User, FacultyApproval } = require('../Schema');
const { generateFacultyId } = require('../utils/helper');
const sendEmail = require('../utils/emailService');

async function approveFaculty(params, Details, currentUser) {
    try {
        const {user_id} = params;
        const {status, uvfin, rejection_reason} = Details;
        const user = await User.findByPk(user_id);
        if(!user || user.role !== 'faculty'){
            throw new Error("Faculty not found");
        }

        let resultUser = user;
        const approval = await FacultyApproval.findOne({
            where: {user_id, status: 'pending'}
        });
        if (!approval) {
            throw new Error("no pending approval found");
        }

        if (status === 'approved') {
            if (!uvfin) {
                throw new Error('UVFIN is required for faculty approval');
            }

            // Check if UVFIN already exists
            const existingUVFIN = await User.findOne({
                where: { uvfin }
            });

            if (existingUVFIN) {
                throw new Error('UVFIN already exists. Please use a unique UVFIN');
            }

            // ✅ Generate Faculty ID: VF-2k26-005
            const facultyId = await generateFacultyId();

            // ✅ Get current user data
            const oldUserId = user.user_id;

            // ✅ Update user with new user_id and uvfin using class-level update (since instance.update cannot alter primary keys in Sequelize)
            await User.update(
                { is_approved: true, user_id: facultyId, uvfin: uvfin },
                { where: { user_id: oldUserId } }
            );

            // Fetch the updated user instance
            resultUser = await User.findByPk(facultyId);

            // Update status, approved_by, approval_date and uvfin in FacultyApproval
            await FacultyApproval.update(
                {
                    status: 'approved',
                    approved_by: currentUser.user_id,
                    approval_date: new Date(),
                    uvfin: uvfin
                },
                { where: { user_id: facultyId } }
            );

           
            await sendEmail({
                to: resultUser.email,
                subject: 'Faculty Account Approved - DAVV',
                html: `
                    <h2>Faculty Account Approved</h2>
                    <p>Dear ${resultUser.full_name},</p>
                    <p>Your faculty account has been approved.</p>
                    <p><strong>User ID:</strong> ${facultyId}</p>
                    <p><strong>UVFIN:</strong> ${uvfin}</p>
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
                subject: 'Faculty Account Rejected - DAVV',
                html: `
                    <h2>Faculty Account Rejected</h2>
                    <p>Dear ${user.full_name},</p>
                    <p>Your faculty registration has been rejected.</p>
                    <p><strong>Reason:</strong> ${rejection_reason}</p>
                    <p>Please contact the administration.</p>
                    <p>Thank you,<br>DAVV Administration</p>
                `
            });
        }

        return resultUser;
    } catch (error) {
        console.error('Approve Faculty Error:', error);
       throw error;
    }
};
async function getPendingFaculty(){
    try {
        const pendingFaculty = await User.findAll({
            where: { 
                role: 'faculty', 
                is_approved: false 
            },
            include: [{
                model: FacultyApproval,
                where: { status: 'pending' },
                required: true
            }],
            attributes: { exclude: ['password_hash'] },
            order: [['created_at', 'ASC']]
        });

        return pendingFaculty;

    } catch (error) {
        console.error('Get Pending Faculty Error:', error);
        throw new Error('Failed to fetch pending faculty');
    }
};

async function getRejectedFaculty() {
    try {
        const RejectedFaculty = await User.findAll({
            where: {
                role: 'faculty',
                is_approved: false
            },
            include: [{
                model: FacultyApproval,
                where:{status: 'rejected'},
                required: true
            }],
            attributes:{exclude: ['password_hash']},
            order:[['created_at', 'ASC']]
        });
        return RejectedFaculty;
    } catch (error) {
        console.error('Get Rejected Faculty Error:', error);
        throw new Error('Failed to fetch rejected faculty');
    }
}
async function getApprovedFaculty() {
    try {
        const ApprovedFaculty = await User.findAll({
            where: {
                role: 'faculty',
                is_approved: true
            },
            include: [{
                model: FacultyApproval,
                where:{status: 'approved'},
                required: true
            }],
            attributes:{exclude: ['password_hash']},
            order:[['created_at', 'ASC']]
        });
        return ApprovedFaculty;
    } catch (error) {
        console.error('Get Approved faculty Error:', error);
        throw new Error('Failed to fetch approved faculty');
    }
}

async function getAllFaculty() {
    try {
        const facultys = await User.findAll({
            where: { role: 'faculty' },
            attributes: { exclude: ['password_hash'] },
            include: [{
                model: FacultyApproval,
                required: false
            }],
            order: [['created_at', 'DESC']]
        });

        return facultys;

    } catch (error) {
        console.error('Get All Faculty Error:', error);
        throw new Error('Failed to fetch facultys');
    }
}

async function getFacultyById(user_id) {
    try {
        const faculty = await User.findByPk(user_id, {
            attributes: { exclude: ['password_hash'] }
        });
        if(!faculty || faculty.role !== 'faculty'){
            throw new Error('Faculty not found');
        }
        return faculty;
    } catch (error) {
        console.error('Get Faculty By Id Error:', error);
        throw new Error('Failed to fetch faculty by id');
    }
}

module.exports = {
    approveFaculty,
    getAllFaculty,
    getApprovedFaculty,
    getPendingFaculty,
    getRejectedFaculty,
    getFacultyById
};