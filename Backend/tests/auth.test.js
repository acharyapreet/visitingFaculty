const request = require('supertest');
const jwt = require('jsonwebtoken');

// Set up environment variables for testing
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.JWT_EXPIRE = '1h';

// Mock User schema/model
const mockUserInstance = {
  user_id: 1,
  email: 'test@example.com',
  full_name: 'Test User',
  role: 'faculty',
  is_approved: true,
  is_active: true,
  comparePassword: jest.fn(),
  update: jest.fn(),
};

const mockUserModel = {
  findOne: jest.fn(),
  findByPk: jest.fn(),
};

jest.mock('../src/Schema/userSchema', () => mockUserModel);

jest.mock('../src/Schema', () => ({
  User: mockUserModel,
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(),
    sync: jest.fn().mockResolvedValue(),
  },
}));

// Mock userService
const mockUserService = {
  registerFaculty: jest.fn(),
  registerAdmin: jest.fn(),
  login: jest.fn(),
  logout: jest.fn(),
  generatePasswordResetToken: jest.fn(),
  resetUserPassword: jest.fn(),
};

jest.mock('../src/service/userService', () => mockUserService);

// Import the app
const app = require('../src/app');

describe('Auth Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register/faculty', () => {
    it('should register a new faculty user successfully', async () => {
      const mockResult = {
        user_id: 1,
        email: 'faculty@example.com',
        full_name: 'Faculty Member',
      };
      mockUserService.registerFaculty.mockResolvedValue(mockResult);

      const res = await request(app)
        .post('/api/auth/register/faculty')
        .send({
          email: 'faculty@example.com',
          full_name: 'Faculty Member',
          phone_number: '1234567890',
          password: 'password123',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        success: true,
        message: 'Registration successful',
        data: {
          user_id: 1,
          email: 'faculty@example.com',
          full_name: 'Faculty Member',
        },
      });
      expect(mockUserService.registerFaculty).toHaveBeenCalledWith({
        email: 'faculty@example.com',
        full_name: 'Faculty Member',
        phone_number: '1234567890',
        password: 'password123',
      });
    });

    it('should return 400 when registration fails', async () => {
      mockUserService.registerFaculty.mockRejectedValue(new Error('Email already exist'));

      const res = await request(app)
        .post('/api/auth/register/faculty')
        .send({
          email: 'faculty@example.com',
          full_name: 'Faculty Member',
          phone_number: '1234567890',
          password: 'password123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: 'Registration Failed',
        data: 'Email already exist',
      });
    });
  });

  describe('POST /api/auth/register/admin', () => {
    it('should register a new admin user successfully', async () => {
      const mockResult = {
        user_id: 2,
        email: 'admin@example.com',
        full_name: 'Admin User',
      };
      mockUserService.registerAdmin.mockResolvedValue(mockResult);

      const res = await request(app)
        .post('/api/auth/register/admin')
        .send({
          email: 'admin@example.com',
          full_name: 'Admin User',
          phone_number: '9876543210',
          password: 'adminpassword',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
        success: true,
        message: 'Registration Successfull',
        data: {
          user_id: 2,
          email: 'admin@example.com',
          full_name: 'Admin User',
        },
      });
      expect(mockUserService.registerAdmin).toHaveBeenCalledWith({
        email: 'admin@example.com',
        full_name: 'Admin User',
        phone_number: '9876543210',
        password: 'adminpassword',
      });
    });

    it('should return 400 when admin registration fails', async () => {
      mockUserService.registerAdmin.mockRejectedValue(new Error('Email already exist'));

      const res = await request(app)
        .post('/api/auth/register/admin')
        .send({
          email: 'admin@example.com',
          full_name: 'Admin User',
          phone_number: '9876543210',
          password: 'adminpassword',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: 'Registration Failed',
        data: 'Email already exist',
      });
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user successfully', async () => {
      const mockResult = {
        user: {
          user_id: 1,
          role: 'faculty',
          full_name: 'Test User',
          email: 'test@example.com',
          uvfin: 'UV123',
        },
        token: 'mocked_jwt_token',
      };
      mockUserService.login.mockResolvedValue(mockResult);

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'Login Successfull',
        data: {
          user_id: 1,
          role: 'faculty',
          full_name: 'Test User',
          email: 'test@example.com',
          uvfin: 'UV123',
          token: 'mocked_jwt_token',
        },
      });
      expect(mockUserService.login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });

    it('should return 401 for invalid credentials', async () => {
      mockUserService.login.mockRejectedValue(new Error('Invalid credentials'));

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        success: false,
        message: 'Login Failed',
        data: 'Invalid credentials',
      });
    });

    it('should return 401 when account is pending approval', async () => {
      mockUserService.login.mockRejectedValue(new Error('account is pending approval'));

      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        success: false,
        message: 'Login Failed',
        data: 'account is pending approval',
      });
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should return 401 if request does not contain token', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Authentication required');
    });

    it('should logout a user successfully when authenticated', async () => {
      // Generate a valid JWT token
      const token = jwt.sign({ user_id: 1, role: 'faculty' }, process.env.JWT_SECRET);
      
      // Mock User.findOne for authMiddleware validation
      mockUserModel.findOne.mockResolvedValue({
        user_id: 1,
        role: 'faculty',
        is_approved: true,
        is_active: true,
      });

      mockUserService.logout.mockResolvedValue({ success: true });

      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'Logout successful',
      });
      expect(mockUserService.logout).toHaveBeenCalledWith(1);
    });
  });

  describe('POST /api/auth/forgotPassword', () => {
    it('should request password reset successfully', async () => {
      mockUserService.generatePasswordResetToken.mockResolvedValue({
        message: 'Reset link has been sent to your email.',
      });

      const res = await request(app)
        .post('/api/auth/forgotPassword')
        .send({ email: 'test@example.com' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'Reset link has been sent to your email.',
      });
      expect(mockUserService.generatePasswordResetToken).toHaveBeenCalledWith('test@example.com');
    });

    it('should return 400 if email is missing', async () => {
      const res = await request(app)
        .post('/api/auth/forgotPassword')
        .send({});

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: 'Email is required.',
      });
    });

    it('should return 500 when generating token fails', async () => {
      mockUserService.generatePasswordResetToken.mockRejectedValue(new Error('User not found with this email.'));

      const res = await request(app)
        .post('/api/auth/forgotPassword')
        .send({ email: 'unknown@example.com' });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        success: false,
        message: 'User not found with this email.',
      });
    });
  });

  describe('POST /api/auth/resetPassword', () => {
    it('should reset password successfully', async () => {
      mockUserService.resetUserPassword.mockResolvedValue({
        message: 'Your password has been successfully reset.',
      });

      const res = await request(app)
        .post('/api/auth/resetPassword')
        .send({
          token: 'mocked_reset_token',
          newPassword: 'newpassword123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'Your password has been successfully reset.',
      });
      expect(mockUserService.resetUserPassword).toHaveBeenCalledWith('mocked_reset_token', 'newpassword123');
    });

    it('should return 400 if token or password is missing', async () => {
      const res = await request(app)
        .post('/api/auth/resetPassword')
        .send({ token: 'mocked_reset_token' }); // missing password

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: 'Token and new password are required.',
      });
    });

    it('should return 500 if token is invalid or expired', async () => {
      mockUserService.resetUserPassword.mockRejectedValue(new Error('Password reset token is invalid or has expired.'));

      const res = await request(app)
        .post('/api/auth/resetPassword')
        .send({
          token: 'expired_token',
          newPassword: 'newpassword123',
        });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        success: false,
        message: 'Password reset token is invalid or has expired.',
      });
    });
  });

  describe('POST /api/auth/changePassword', () => {
    it('should return 401 if not authenticated', async () => {
      const res = await request(app).post('/api/auth/changePassword');
      expect(res.statusCode).toBe(401);
    });

    it('should change password successfully', async () => {
      const token = jwt.sign({ user_id: 1, role: 'faculty' }, process.env.JWT_SECRET);
      
      const mockComparePassword = jest.fn().mockResolvedValue(true);
      const mockUpdate = jest.fn().mockResolvedValue({});
      
      // Mock User.findOne for authMiddleware
      mockUserModel.findOne.mockResolvedValue({
        user_id: 1,
        role: 'faculty',
        is_approved: true,
        is_active: true,
      });

      // Mock User.findByPk for changePasswordController
      mockUserModel.findByPk.mockResolvedValue({
        user_id: 1,
        comparePassword: mockComparePassword,
        update: mockUpdate,
      });

      const res = await request(app)
        .post('/api/auth/changePassword')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'oldpassword123',
          newPassword: 'newpassword123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'Password changed successfully.',
      });
      expect(mockComparePassword).toHaveBeenCalledWith('oldpassword123');
      expect(mockUpdate).toHaveBeenCalledWith({ password_hash: 'newpassword123' });
    });

    it('should return 400 if currentPassword or newPassword is missing', async () => {
      const token = jwt.sign({ user_id: 1, role: 'faculty' }, process.env.JWT_SECRET);
      
      mockUserModel.findOne.mockResolvedValue({
        user_id: 1,
        role: 'faculty',
        is_approved: true,
        is_active: true,
      });

      const res = await request(app)
        .post('/api/auth/changePassword')
        .set('Authorization', `Bearer ${token}`)
        .send({ currentPassword: 'oldpassword123' });

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: 'Current password and new password are required.',
      });
    });

    it('should return 401 if currentPassword is incorrect', async () => {
      const token = jwt.sign({ user_id: 1, role: 'faculty' }, process.env.JWT_SECRET);
      
      const mockComparePassword = jest.fn().mockResolvedValue(false);
      
      mockUserModel.findOne.mockResolvedValue({
        user_id: 1,
        role: 'faculty',
        is_approved: true,
        is_active: true,
      });

      mockUserModel.findByPk.mockResolvedValue({
        user_id: 1,
        comparePassword: mockComparePassword,
      });

      const res = await request(app)
        .post('/api/auth/changePassword')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toEqual({
        success: false,
        message: 'Current password is incorrect.',
      });
      expect(mockComparePassword).toHaveBeenCalledWith('wrongpassword');
    });
  });
});
