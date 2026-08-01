const request = require('supertest');
const jwt = require('jsonwebtoken');

// Set up environment variables for testing
process.env.JWT_SECRET = 'test_jwt_secret';
process.env.JWT_EXPIRE = '1h';

// Mock User schema/model for authMiddleware
const mockUserModel = {
  findOne: jest.fn(),
};

jest.mock('../src/Schema/userSchema', () => mockUserModel);

jest.mock('../src/Schema', () => ({
  User: mockUserModel,
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(),
    sync: jest.fn().mockResolvedValue(),
  },
}));

// Mock coursesService
const mockCoursesService = {
  deleteSection: jest.fn(),
  deleteCourse: jest.fn(),
  deleteSemester: jest.fn(),
  addSemester: jest.fn(),
  addCourse: jest.fn(),
};

jest.mock('../src/service/coursesService', () => mockCoursesService);

// Import the app
const app = require('../src/app');

describe('SuperAdmin Approval / Course Management Routes', () => {
  let superAdminToken;
  let nonSuperAdminToken;

  beforeAll(() => {
    // Generate valid tokens
    superAdminToken = jwt.sign({ user_id: 1, role: 'super_admin' }, process.env.JWT_SECRET);
    nonSuperAdminToken = jwt.sign({ user_id: 2, role: 'faculty' }, process.env.JWT_SECRET);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper helper to mock user lookup inside authMiddleware
  const mockUserRole = (userId, role, isApproved = true, isActive = true) => {
    mockUserModel.findOne.mockImplementation(({ where }) => {
      if (where.user_id === userId && where.is_active === isActive) {
        return Promise.resolve({
          user_id: userId,
          role: role,
          is_approved: isApproved,
          is_active: isActive,
        });
      }
      return Promise.resolve(null);
    });
  };

  describe('Authentication and Authorization Checks', () => {
    it('should return 401 when no token is provided', async () => {
      const res = await request(app).delete('/api/super_admin/deleteCourse/1');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Authentication required');
    });

    it('should return 403 when user is not super_admin', async () => {
      mockUserRole(2, 'faculty');
      const res = await request(app)
        .delete('/api/super_admin/deleteCourse/1')
        .set('Authorization', `Bearer ${nonSuperAdminToken}`);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Insufficient permissions');
    });

    it('should return 403 when account is pending approval', async () => {
      const pendingToken = jwt.sign({ user_id: 3, role: 'super_admin' }, process.env.JWT_SECRET);
      mockUserRole(3, 'super_admin', false); // isApproved = false
      
      const res = await request(app)
        .delete('/api/super_admin/deleteCourse/1')
        .set('Authorization', `Bearer ${pendingToken}`);
      
      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('pending approval');
    });
  });

  describe('DELETE /api/super_admin/deleteSection/:course_id/:section_id', () => {
    it('should delete section successfully for super_admin', async () => {
      mockUserRole(1, 'super_admin');
      mockCoursesService.deleteSection.mockResolvedValue({ section_id: 10, course_id: 1 });

      const res = await request(app)
        .delete('/api/super_admin/deleteSection/1/10')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'section deleted',
        data: { section_id: 10, course_id: 1 },
      });
      expect(mockCoursesService.deleteSection).toHaveBeenCalledWith('1', '10');
    });

    it('should handle service error during section deletion', async () => {
      mockUserRole(1, 'super_admin');
      const serviceError = new Error('not able to delete section');
      serviceError.statusCode = 400;
      mockCoursesService.deleteSection.mockRejectedValue(serviceError);

      const res = await request(app)
        .delete('/api/super_admin/deleteSection/1/10')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({
        success: false,
        message: 'not able to delete section',
      });
    });
  });

  describe('DELETE /api/super_admin/deleteCourse/:course_id', () => {
    it('should delete course successfully for super_admin', async () => {
      mockUserRole(1, 'super_admin');
      mockCoursesService.deleteCourse.mockResolvedValue({ course_id: 1, course_name: 'BCA' });

      const res = await request(app)
        .delete('/api/super_admin/deleteCourse/1')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'course deleted',
        data: { course_id: 1, course_name: 'BCA' },
      });
      expect(mockCoursesService.deleteCourse).toHaveBeenCalledWith('1');
    });

    it('should handle service error during course deletion', async () => {
      mockUserRole(1, 'super_admin');
      const serviceError = new Error('not able to delete Course');
      serviceError.statusCode = 500;
      mockCoursesService.deleteCourse.mockRejectedValue(serviceError);

      const res = await request(app)
        .delete('/api/super_admin/deleteCourse/1')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        success: false,
        message: 'not able to delete Course',
      });
    });
  });

  describe('DELETE /api/super_admin/deleteSemester/:course_id/:semester_id', () => {
    it('should delete semester successfully for super_admin', async () => {
      mockUserRole(1, 'super_admin');
      mockCoursesService.deleteSemester.mockResolvedValue({ course_id: 1, semester_id: 2 });

      const res = await request(app)
        .delete('/api/super_admin/deleteSemester/1/2')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'semester deleted',
        data: { course_id: 1, semester_id: 2 },
      });
      expect(mockCoursesService.deleteSemester).toHaveBeenCalledWith('1', '2');
    });

    it('should handle service error during semester deletion', async () => {
      mockUserRole(1, 'super_admin');
      const serviceError = new Error('not able to delete semester');
      serviceError.statusCode = 404;
      mockCoursesService.deleteSemester.mockRejectedValue(serviceError);

      const res = await request(app)
        .delete('/api/super_admin/deleteSemester/1/2')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.statusCode).toBe(404);
      expect(res.body).toEqual({
        success: false,
        message: 'not able to delete semester',
      });
    });
  });

  describe('POST /api/super_admin/addSemester/:course_id', () => {
    it('should add semester successfully for super_admin', async () => {
      mockUserRole(1, 'super_admin');
      mockCoursesService.addSemester.mockResolvedValue({ course_id: 1, semester_id: 3 });

      const res = await request(app)
        .post('/api/super_admin/addSemester/1')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ semester_id: 3 });

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'semester added',
        data: { course_id: 1, semester_id: 3 },
      });
      expect(mockCoursesService.addSemester).toHaveBeenCalledWith('1', 3);
    });

    it('should handle service error during semester addition', async () => {
      mockUserRole(1, 'super_admin');
      const serviceError = new Error('not able to add semester');
      mockCoursesService.addSemester.mockRejectedValue(serviceError);

      const res = await request(app)
        .post('/api/super_admin/addSemester/1')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ semester_id: 3 });

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        success: false,
        message: 'not able to add semester',
      });
    });
  });

  describe('POST /api/super_admin/addCourse', () => {
    it('should add course successfully for super_admin', async () => {
      mockUserRole(1, 'super_admin');
      const courseDetails = {
        course_name: 'MTech',
        program_incharge: 'Dr. Smith',
        total_semesters: 4,
        year: 2026,
      };
      mockCoursesService.addCourse.mockResolvedValue({ course_id: 5, ...courseDetails });

      const res = await request(app)
        .post('/api/super_admin/addCourse')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(courseDetails);

      expect(res.statusCode).toBe(200);
      expect(res.body).toEqual({
        success: true,
        message: 'course added',
        data: { course_id: 5, ...courseDetails },
      });
      expect(mockCoursesService.addCourse).toHaveBeenCalledWith(courseDetails);
    });

    it('should handle service error during course addition', async () => {
      mockUserRole(1, 'super_admin');
      const courseDetails = {
        course_name: 'MTech',
        program_incharge: 'Dr. Smith',
        total_semesters: 4,
        year: 2026,
      };
      const serviceError = new Error('not able to add Course');
      mockCoursesService.addCourse.mockRejectedValue(serviceError);

      const res = await request(app)
        .post('/api/super_admin/addCourse')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send(courseDetails);

      expect(res.statusCode).toBe(500);
      expect(res.body).toEqual({
        success: false,
        message: 'not able to add Course',
      });
    });
  });
});
