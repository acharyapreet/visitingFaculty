const request = require('supertest');
const app = require('../src/app');
const { User } = require('../src/Schema');

async function testAuthFlow() {
    console.log('=== STARTING COMPLETE AUTH ROUTES TEST FLOW ===\n');

    const timestamp = Date.now();
    const facultyEmail = `test_faculty_${timestamp}@example.com`;
    const adminEmail = `test_admin_${timestamp}@example.com`;
    const initialPassword = 'Password123!';
    const resetPassword = 'ResetPassword123!';
    const changedPassword = 'ChangedPassword123!';

    try {
        // Step 1: Register Faculty
        console.log('1. Testing POST /api/auth/register/faculty ...');
        const facultyRegRes = await request(app)
            .post('/api/auth/register/faculty')
            .send({
                email: facultyEmail,
                password: initialPassword,
                full_name: 'Test Faculty User',
                phone_number: '9876543210',
                address: '123 Faculty St',
                qualification: 'Ph.D.'
            });
        console.log('   Response Status:', facultyRegRes.status);
        console.log('   Response Body:', JSON.stringify(facultyRegRes.body, null, 2));
        if (facultyRegRes.status !== 201) throw new Error('Faculty registration failed');
        const facultyUserId = facultyRegRes.body.data.user_id;

        // Step 2: Register Admin
        console.log('\n2. Testing POST /api/auth/register/admin ...');
        const adminRegRes = await request(app)
            .post('/api/auth/register/admin')
            .send({
                email: adminEmail,
                password: initialPassword,
                full_name: 'Test Admin User',
                phone_number: '9876543211'
            });
        console.log('   Response Status:', adminRegRes.status);
        console.log('   Response Body:', JSON.stringify(adminRegRes.body, null, 2));
        if (adminRegRes.status !== 201) throw new Error('Admin registration failed');

        // Note: Approve Faculty user in DB so login can succeed
        console.log('\n[DB Helper] Approving faculty account in DB for login test...');
        await User.update({ is_approved: true }, { where: { user_id: facultyUserId } });

        // Step 3: Login User
        console.log('\n3. Testing POST /api/auth/login ...');
        const loginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: facultyEmail,
                password: initialPassword
            });
        console.log('   Response Status:', loginRes.status);
        console.log('   Response Body:', JSON.stringify(loginRes.body, null, 2));
        if (loginRes.status !== 200) throw new Error('Login failed');
        const jwtToken = loginRes.body.data.token;

        // Step 4: Logout User
        console.log('\n4. Testing POST /api/auth/logout ...');
        const logoutRes = await request(app)
            .post('/api/auth/logout')
            .set('Authorization', `Bearer ${jwtToken}`);
        console.log('   Response Status:', logoutRes.status);
        console.log('   Response Body:', JSON.stringify(logoutRes.body, null, 2));
        if (logoutRes.status !== 200) throw new Error('Logout failed');

        // Step 5: Forgot Password
        console.log('\n5. Testing POST /api/auth/forgotPassword/ ...');
        const forgotRes = await request(app)
            .post('/api/auth/forgotPassword/')
            .send({
                email: facultyEmail
            });
        console.log('   Response Status:', forgotRes.status);
        console.log('   Response Body:', JSON.stringify(forgotRes.body, null, 2));
        if (forgotRes.status !== 200) throw new Error('Forgot password failed');

        // Retrieve token directly from DB for reset step
        const userDb = await User.findByPk(facultyUserId);
        const resetToken = userDb.reset_password_token;
        console.log('   [DB Helper] Retrieved reset token:', resetToken);

        // Step 6: Reset Password
        console.log('\n6. Testing POST /api/auth/resetPassword ...');
        const resetRes = await request(app)
            .post('/api/auth/resetPassword')
            .send({
                token: resetToken,
                newPassword: resetPassword
            });
        console.log('   Response Status:', resetRes.status);
        console.log('   Response Body:', JSON.stringify(resetRes.body, null, 2));
        if (resetRes.status !== 200) throw new Error('Reset password failed');

        // Login with reset password to get fresh token for changePassword & update
        console.log('\n[Helper] Logging in with reset password to obtain fresh auth token...');
        const postResetLoginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: facultyEmail,
                password: resetPassword
            });
        const freshToken = postResetLoginRes.body.data.token;

        // Step 7: Change Password
        console.log('\n7. Testing PUT /api/auth/changePassword ...');
        const changePwdRes = await request(app)
            .put('/api/auth/changePassword')
            .set('Authorization', `Bearer ${freshToken}`)
            .send({
                user_id: facultyUserId,
                oldPassword: resetPassword,
                newPassword: changedPassword
            });
        console.log('   Response Status:', changePwdRes.status);
        console.log('   Response Body:', JSON.stringify(changePwdRes.body, null, 2));
        if (changePwdRes.status !== 200) throw new Error('Change password failed');

        // Step 8: Update Profile
        console.log(`\n8. Testing PUT /api/auth/update/${facultyUserId} ...`);
        const updateProfileRes = await request(app)
            .put(`/api/auth/update/${facultyUserId}`)
            .set('Authorization', `Bearer ${freshToken}`)
            .send({
                full_name: 'Dr. Test Faculty (Updated)',
                phone_number: '9998887770',
                address: '456 Updated University Rd'
            });
        console.log('   Response Status:', updateProfileRes.status);
        console.log('   Response Body:', JSON.stringify(updateProfileRes.body, null, 2));
        if (updateProfileRes.status !== 200) throw new Error('Update profile failed');

        // Step 9: Login again after Change Password
        console.log('\n9. Testing POST /api/auth/login (again after change password) ...');
        const finalLoginRes = await request(app)
            .post('/api/auth/login')
            .send({
                email: facultyEmail,
                password: changedPassword
            });
        console.log('   Response Status:', finalLoginRes.status);
        console.log('   Response Body:', JSON.stringify(finalLoginRes.body, null, 2));
        if (finalLoginRes.status !== 200) throw new Error('Final login after password change failed');

        console.log('\n=== ALL AUTH ROUTES TESTED AND PASSED SUCCESSFULLY! ===');
        process.exit(0);

    } catch (err) {
        console.error('\n❌ AUTH TEST FLOW FAILED:', err.message);
        process.exit(1);
    }
}

testAuthFlow();
