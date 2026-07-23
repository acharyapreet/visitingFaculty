/**
 * attendanceRoutes.test.js
 *
 * Full Jest + Supertest test suite for the Attendance Module.
 * All service functions are mocked so no database is required.
 *
 * Run:  cd Backend && npm test -- --testPathPattern=attendanceRoutes
 */

const request = require('supertest');
const app     = require('../app');

// ── Mock the entire attendanceService module ──────────────────────────────
jest.mock('../service/attendanceService');

const attendanceService = require('../service/attendanceService');

// ── Shared mock data ──────────────────────────────────────────────────────

const mockAttendanceRecord = {
    attendance_id:     1,
    attendance_date:   '2026-07-23',
    start_time:        '09:00:00',
    end_time:          '10:00:00',
    hours:             1,
    status:            'Pending',
    remarks:           'Regular lecture',
    month:             'July',
    year:              2026,
    attendance_period: 'daily',
    week_number:       null,
    allocation_id:     10,
    session_type:      'Theory',
    rate_per_hour:     500,
    course_id:         1,
    course_name:       'BSc CS',
    course_code:       'BSC-CS',
    semester_id:       2,
    semester_number:   2,
    section_id:        1,
    section_name:      'A',
    subject_id:        5,
    subject_code:      'CS201',
    subject_name:      'Data Structures'
};

const mockWeeklyRecord = {
    ...mockAttendanceRecord,
    attendance_id:     2,
    attendance_period: 'weekly',
    week_number:       30
};

const mockMonthlyRecord = {
    ...mockAttendanceRecord,
    attendance_id:     3,
    attendance_period: 'monthly'
};

const mockDailyView = {
    attendanceDate: '2026-07-23',
    totalClasses:   1,
    totalHours:     1,
    data:           [mockAttendanceRecord]
};

const mockWeeklyView = {
    weekStart:    '2026-07-20',
    weekEnd:      '2026-07-26',
    weekNumber:   30,
    workingDays:  6,
    daysPresent:  1,
    daysAbsent:   5,
    totalClasses: 1,
    totalHours:   1,
    data:         [mockWeeklyRecord]
};

const mockMonthlyView = {
    month:        'July',
    year:         2026,
    workingDays:  26,
    daysPresent:  5,
    daysAbsent:   21,
    totalClasses: 5,
    totalHours:   5,
    data:         [mockMonthlyRecord]
};

const mockHistory = {
    totalClasses: 10,
    totalHours:   10,
    daysPresent:  8,
    data:         [mockAttendanceRecord, mockWeeklyRecord, mockMonthlyRecord]
};

const mockAllocations = {
    faculty_id:  3,
    total:       2,
    allocations: [
        {
            allocation_id:   10,
            session_type:    'Theory',
            rate_per_hour:   500,
            academic_year:   '2025-2026',
            course_id:       1,
            course_name:     'BSc CS',
            course_code:     'BSC-CS',
            semester_id:     2,
            semester_number: 2,
            section_id:      1,
            section_name:    'A',
            subject_id:      5,
            subject_code:    'CS201',
            subject_name:    'Data Structures'
        },
        {
            allocation_id:   11,
            session_type:    'Theory',
            rate_per_hour:   500,
            academic_year:   '2025-2026',
            course_id:       1,
            course_name:     'BSc CS',
            course_code:     'BSC-CS',
            semester_id:     2,
            semester_number: 2,
            section_id:      1,
            section_name:    'A',
            subject_id:      6,
            subject_code:    'CS202',
            subject_name:    'Algorithms'
        }
    ]
};

const mockAdminData = {
    totalRecords: 3,
    data: [
        { ...mockAttendanceRecord, user_id: 3, full_name: 'Test Faculty', email: 'tf@test.com', uvfin: 'VF-2024-001' },
        { ...mockWeeklyRecord,     user_id: 3, full_name: 'Test Faculty', email: 'tf@test.com', uvfin: 'VF-2024-001' },
        { ...mockMonthlyRecord,    user_id: 3, full_name: 'Test Faculty', email: 'tf@test.com', uvfin: 'VF-2024-001' }
    ]
};

// Valid body for marking attendance
const validMarkBody = {
    user_id:         3,
    course_id:       1,
    semester_id:     2,
    subject_id:      5,
    attendance_date: '2026-07-23',
    start_time:      '09:00:00',
    end_time:        '10:00:00',
    hours:           1,
    month:           'July',
    year:            2026,
    status:          'Pending',
    remarks:         'Test lecture'
};

// ─────────────────────────────────────────────────────────────────────────────

beforeEach(() => {
    jest.clearAllMocks();
});

// ============================================================
// ■  SECTION 1 — GENERIC MARK  POST /api/attendance/
// ============================================================

describe('POST /api/attendance/ (generic mark)', () => {

    it('should mark a single attendance record (daily)', async () => {
        attendanceService.markAttendance.mockResolvedValue(mockAttendanceRecord);

        const res = await request(app)
            .post('/api/attendance/')
            .send({ ...validMarkBody, attendance_period: 'daily' });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Attendance submitted successfully.');
        expect(res.body.data).toEqual(mockAttendanceRecord);
        expect(attendanceService.markAttendance).toHaveBeenCalledTimes(1);
    });

    it('should mark a bulk array of attendance records', async () => {
        attendanceService.markAttendance
            .mockResolvedValueOnce(mockAttendanceRecord)
            .mockResolvedValueOnce({ ...mockAttendanceRecord, attendance_id: 99 });

        const body = [validMarkBody, { ...validMarkBody, subject_id: 6, start_time: '11:00:00', end_time: '12:00:00' }];

        const res = await request(app)
            .post('/api/attendance/')
            .send(body);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain('2 attendance records');
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(res.body.data).toHaveLength(2);
    });

    it('should return 400 when required fields are missing', async () => {
        const res = await request(app)
            .post('/api/attendance/')
            .send({ user_id: 3 });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/Missing required fields/i);
        expect(attendanceService.markAttendance).not.toHaveBeenCalled();
    });

    it('should return 500 when service throws', async () => {
        attendanceService.markAttendance.mockRejectedValue(new Error('Allocation not found.'));

        const res = await request(app)
            .post('/api/attendance/')
            .send(validMarkBody);

        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe('Allocation not found.');
    });

    it('should return 500 when duplicate attendance is detected', async () => {
        attendanceService.markAttendance.mockRejectedValue(
            new Error('Attendance already submitted for this subject at this time on this date.')
        );

        const res = await request(app)
            .post('/api/attendance/')
            .send(validMarkBody);

        expect(res.status).toBe(500);
        expect(res.body.message).toMatch(/already submitted/i);
    });
});

// ============================================================
// ■  SECTION 2 — DAILY MARK  POST /api/attendance/mark/daily
// ============================================================

describe('POST /api/attendance/mark/daily', () => {

    const dailyBody = {
        user_id:    3,
        course_id:  1,
        semester_id: 2,
        subject_id: 5,
        start_time: '09:00:00',
        end_time:   '10:00:00',
        hours:      1
    };

    it('should mark daily attendance (attendance_date defaults to today)', async () => {
        attendanceService.markDailyAttendance.mockResolvedValue(mockAttendanceRecord);

        const res = await request(app)
            .post('/api/attendance/mark/daily')
            .send(dailyBody);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.attendance_period).toBe('daily');
        expect(res.body.message).toBe('Daily attendance submitted successfully.');
        expect(res.body.data).toEqual(mockAttendanceRecord);
    });

    it('should mark daily attendance with explicit attendance_date', async () => {
        attendanceService.markDailyAttendance.mockResolvedValue(mockAttendanceRecord);

        const res = await request(app)
            .post('/api/attendance/mark/daily')
            .send({ ...dailyBody, attendance_date: '2026-07-22', month: 'July', year: 2026 });

        expect(res.status).toBe(201);
        expect(attendanceService.markDailyAttendance).toHaveBeenCalledWith(
            expect.objectContaining({ attendance_date: '2026-07-22' })
        );
    });

    it('should mark bulk daily records (array)', async () => {
        attendanceService.markDailyAttendance
            .mockResolvedValueOnce(mockAttendanceRecord)
            .mockResolvedValueOnce({ ...mockAttendanceRecord, attendance_id: 2 });

        const res = await request(app)
            .post('/api/attendance/mark/daily')
            .send([dailyBody, { ...dailyBody, subject_id: 6, start_time: '11:00:00', end_time: '12:00:00' }]);

        expect(res.status).toBe(201);
        expect(res.body.data).toHaveLength(2);
        expect(res.body.message).toContain('2 daily attendance record(s)');
    });

    it('should return 400 if required fields are missing', async () => {
        const res = await request(app)
            .post('/api/attendance/mark/daily')
            .send({ user_id: 3, course_id: 1 });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/Missing required fields/i);
    });

    it('should return 500 if service fails', async () => {
        attendanceService.markDailyAttendance.mockRejectedValue(new Error('Faculty not found'));

        const res = await request(app)
            .post('/api/attendance/mark/daily')
            .send(dailyBody);

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Faculty not found');
    });
});

// ============================================================
// ■  SECTION 3 — WEEKLY MARK  POST /api/attendance/mark/weekly
// ============================================================

describe('POST /api/attendance/mark/weekly', () => {

    const weeklyBody = {
        user_id:         3,
        course_id:       1,
        semester_id:     2,
        subject_id:      5,
        attendance_date: '2026-07-21',
        start_time:      '09:00:00',
        end_time:        '10:00:00',
        hours:           1
    };

    it('should mark weekly attendance (week_number auto-calculated)', async () => {
        attendanceService.markWeeklyAttendance.mockResolvedValue(mockWeeklyRecord);

        const res = await request(app)
            .post('/api/attendance/mark/weekly')
            .send(weeklyBody);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.attendance_period).toBe('weekly');
        expect(res.body.message).toBe('Weekly attendance submitted successfully.');
        expect(res.body.data.week_number).toBe(30);
    });

    it('should mark weekly attendance with explicit week_number', async () => {
        attendanceService.markWeeklyAttendance.mockResolvedValue({ ...mockWeeklyRecord, week_number: 30 });

        const res = await request(app)
            .post('/api/attendance/mark/weekly')
            .send({ ...weeklyBody, week_number: 30, month: 'July', year: 2026 });

        expect(res.status).toBe(201);
        expect(res.body.data.week_number).toBe(30);
    });

    it('should mark bulk weekly records (array)', async () => {
        attendanceService.markWeeklyAttendance
            .mockResolvedValueOnce(mockWeeklyRecord)
            .mockResolvedValueOnce({ ...mockWeeklyRecord, attendance_id: 4 });

        const res = await request(app)
            .post('/api/attendance/mark/weekly')
            .send([weeklyBody, { ...weeklyBody, subject_id: 6, start_time: '11:00:00', end_time: '12:00:00' }]);

        expect(res.status).toBe(201);
        expect(res.body.data).toHaveLength(2);
    });

    it('should return 400 for missing attendance_date', async () => {
        const { attendance_date, ...body } = weeklyBody;
        const res = await request(app)
            .post('/api/attendance/mark/weekly')
            .send(body);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Missing required fields/i);
    });

    it('should return 500 if service throws duplicate error', async () => {
        attendanceService.markWeeklyAttendance.mockRejectedValue(
            new Error('Attendance already submitted for this subject at 09:00:00 on 2026-07-21.')
        );

        const res = await request(app)
            .post('/api/attendance/mark/weekly')
            .send(weeklyBody);

        expect(res.status).toBe(500);
        expect(res.body.message).toMatch(/already submitted/i);
    });
});

// ============================================================
// ■  SECTION 4 — MONTHLY MARK  POST /api/attendance/mark/monthly
// ============================================================

describe('POST /api/attendance/mark/monthly', () => {

    const monthlyBody = {
        user_id:         3,
        course_id:       1,
        semester_id:     2,
        subject_id:      5,
        attendance_date: '2026-07-10',
        start_time:      '09:00:00',
        end_time:        '10:00:00',
        hours:           1,
        month:           'July',
        year:            2026
    };

    it('should mark monthly attendance', async () => {
        attendanceService.markMonthlyAttendance.mockResolvedValue(mockMonthlyRecord);

        const res = await request(app)
            .post('/api/attendance/mark/monthly')
            .send(monthlyBody);

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.attendance_period).toBe('monthly');
        expect(res.body.message).toBe('Monthly attendance submitted successfully.');
        expect(res.body.data.attendance_period).toBe('monthly');
    });

    it('should mark bulk monthly records (array)', async () => {
        attendanceService.markMonthlyAttendance
            .mockResolvedValueOnce(mockMonthlyRecord)
            .mockResolvedValueOnce({ ...mockMonthlyRecord, attendance_id: 5 })
            .mockResolvedValueOnce({ ...mockMonthlyRecord, attendance_id: 6 });

        const bulk = [
            monthlyBody,
            { ...monthlyBody, subject_id: 6, attendance_date: '2026-07-11', start_time: '11:00:00', end_time: '12:00:00' },
            { ...monthlyBody, subject_id: 5, attendance_date: '2026-07-12', start_time: '14:00:00', end_time: '15:00:00' }
        ];

        const res = await request(app)
            .post('/api/attendance/mark/monthly')
            .send(bulk);

        expect(res.status).toBe(201);
        expect(res.body.data).toHaveLength(3);
        expect(res.body.message).toContain('3 monthly attendance record(s)');
    });

    it('should return 400 if month is missing', async () => {
        const { month, ...body } = monthlyBody;

        const res = await request(app)
            .post('/api/attendance/mark/monthly')
            .send(body);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/month and year are required/i);
    });

    it('should return 400 if year is missing', async () => {
        const { year, ...body } = monthlyBody;

        const res = await request(app)
            .post('/api/attendance/mark/monthly')
            .send(body);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/month and year are required/i);
    });

    it('should return 400 if attendance_date is missing', async () => {
        const { attendance_date, ...body } = monthlyBody;

        const res = await request(app)
            .post('/api/attendance/mark/monthly')
            .send(body);

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/Missing required fields/i);
    });

    it('should return 500 if service fails', async () => {
        attendanceService.markMonthlyAttendance.mockRejectedValue(new Error('Faculty not found'));

        const res = await request(app)
            .post('/api/attendance/mark/monthly')
            .send(monthlyBody);

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Faculty not found');
    });
});

// ============================================================
// ■  SECTION 5 — VIEW DAILY  GET /api/attendance/daily/:facultyId
// ============================================================

describe('GET /api/attendance/daily/:facultyId', () => {

    it('should return today\'s attendance for numeric facultyId', async () => {
        attendanceService.getDailyAttendance.mockResolvedValue(mockDailyView);

        const res = await request(app).get('/api/attendance/daily/3');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.attendanceDate).toBe('2026-07-23');
        expect(res.body.totalClasses).toBe(1);
        expect(res.body.totalHours).toBe(1);
        expect(Array.isArray(res.body.data)).toBe(true);
        expect(attendanceService.getDailyAttendance).toHaveBeenCalledWith('3', null);
    });

    it('should return attendance for uvfin facultyId', async () => {
        attendanceService.getDailyAttendance.mockResolvedValue(mockDailyView);

        const res = await request(app).get('/api/attendance/daily/VF-2024-001');

        expect(res.status).toBe(200);
        expect(attendanceService.getDailyAttendance).toHaveBeenCalledWith('VF-2024-001', null);
    });

    it('should accept ?date= query param', async () => {
        attendanceService.getDailyAttendance.mockResolvedValue({
            ...mockDailyView, attendanceDate: '2026-07-21'
        });

        const res = await request(app).get('/api/attendance/daily/3?date=2026-07-21');

        expect(res.status).toBe(200);
        expect(attendanceService.getDailyAttendance).toHaveBeenCalledWith('3', '2026-07-21');
    });

    it('should return empty data if no attendance found for the day', async () => {
        attendanceService.getDailyAttendance.mockResolvedValue({
            attendanceDate: '2026-07-23', totalClasses: 0, totalHours: 0, data: []
        });

        const res = await request(app).get('/api/attendance/daily/3');

        expect(res.status).toBe(200);
        expect(res.body.totalClasses).toBe(0);
        expect(res.body.data).toHaveLength(0);
    });

    it('should return 500 if faculty not found', async () => {
        attendanceService.getDailyAttendance.mockRejectedValue(new Error('Faculty not found'));

        const res = await request(app).get('/api/attendance/daily/999');

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Faculty not found');
    });
});

// ============================================================
// ■  SECTION 6 — VIEW WEEKLY  GET /api/attendance/weekly/:facultyId
// ============================================================

describe('GET /api/attendance/weekly/:facultyId', () => {

    it('should return current week attendance (no date param)', async () => {
        attendanceService.getWeeklyAttendance.mockResolvedValue(mockWeeklyView);

        const res = await request(app).get('/api/attendance/weekly/3');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.weekStart).toBe('2026-07-20');
        expect(res.body.weekEnd).toBe('2026-07-26');
        expect(res.body.weekNumber).toBe(30);
        expect(res.body.workingDays).toBe(6);
        expect(res.body.daysPresent).toBe(1);
        expect(res.body.daysAbsent).toBe(5);
        expect(attendanceService.getWeeklyAttendance).toHaveBeenCalledWith('3', null);
    });

    it('should return weekly attendance for uvfin', async () => {
        attendanceService.getWeeklyAttendance.mockResolvedValue(mockWeeklyView);

        await request(app).get('/api/attendance/weekly/VF-2024-001');
        expect(attendanceService.getWeeklyAttendance).toHaveBeenCalledWith('VF-2024-001', null);
    });

    it('should accept ?date= query param for a specific week', async () => {
        attendanceService.getWeeklyAttendance.mockResolvedValue(mockWeeklyView);

        const res = await request(app).get('/api/attendance/weekly/3?date=2026-07-21');

        expect(res.status).toBe(200);
        expect(attendanceService.getWeeklyAttendance).toHaveBeenCalledWith('3', '2026-07-21');
    });

    it('should return 500 if faculty not found', async () => {
        attendanceService.getWeeklyAttendance.mockRejectedValue(new Error('Faculty not found'));

        const res = await request(app).get('/api/attendance/weekly/INVALID');
        expect(res.status).toBe(500);
    });
});

// ============================================================
// ■  SECTION 7 — VIEW MONTHLY  GET /api/attendance/monthly/:facultyId
// ============================================================

describe('GET /api/attendance/monthly/:facultyId', () => {

    it('should return monthly attendance with month + year params', async () => {
        attendanceService.getMonthlyAttendance.mockResolvedValue(mockMonthlyView);

        const res = await request(app).get('/api/attendance/monthly/3?month=July&year=2026');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.month).toBe('July');
        expect(res.body.year).toBe(2026);
        expect(res.body.workingDays).toBe(26);
        expect(res.body.daysPresent).toBe(5);
        expect(attendanceService.getMonthlyAttendance).toHaveBeenCalledWith('3', 'July', '2026');
    });

    it('should return monthly attendance for uvfin', async () => {
        attendanceService.getMonthlyAttendance.mockResolvedValue(mockMonthlyView);

        await request(app).get('/api/attendance/monthly/VF-2024-001?month=July&year=2026');
        expect(attendanceService.getMonthlyAttendance).toHaveBeenCalledWith('VF-2024-001', 'July', '2026');
    });

    it('should return 400 if month is missing', async () => {
        const res = await request(app).get('/api/attendance/monthly/3?year=2026');

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/month and year/i);
    });

    it('should return 400 if year is missing', async () => {
        const res = await request(app).get('/api/attendance/monthly/3?month=July');

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
    });

    it('should return 500 on service error', async () => {
        attendanceService.getMonthlyAttendance.mockRejectedValue(new Error('DB error'));

        const res = await request(app).get('/api/attendance/monthly/3?month=July&year=2026');
        expect(res.status).toBe(500);
    });
});

// ============================================================
// ■  SECTION 8 — HISTORY  GET /api/attendance/history/:facultyId
// ============================================================

describe('GET /api/attendance/history/:facultyId', () => {

    it('should return full attendance history for numeric faculty', async () => {
        attendanceService.getAttendanceHistory.mockResolvedValue(mockHistory);

        const res = await request(app).get('/api/attendance/history/3');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.totalClasses).toBe(10);
        expect(res.body.totalHours).toBe(10);
        expect(res.body.daysPresent).toBe(8);
        expect(res.body.data).toHaveLength(3);
    });

    it('should return history for uvfin', async () => {
        attendanceService.getAttendanceHistory.mockResolvedValue(mockHistory);

        const res = await request(app).get('/api/attendance/history/VF-2024-001');
        expect(res.status).toBe(200);
        expect(attendanceService.getAttendanceHistory).toHaveBeenCalledWith('VF-2024-001');
    });

    it('should return 500 on service error', async () => {
        attendanceService.getAttendanceHistory.mockRejectedValue(new Error('Faculty not found'));

        const res = await request(app).get('/api/attendance/history/999');
        expect(res.status).toBe(500);
    });
});

// ============================================================
// ■  SECTION 9 — MY ALLOCATIONS  GET /api/attendance/my-allocations/:facultyId
// ============================================================

describe('GET /api/attendance/my-allocations/:facultyId', () => {

    it('should return allocations for faculty', async () => {
        attendanceService.getFacultyAllocations.mockResolvedValue(mockAllocations);

        const res = await request(app).get('/api/attendance/my-allocations/3');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.faculty_id).toBe(3);
        expect(res.body.total).toBe(2);
        expect(res.body.allocations).toHaveLength(2);
    });

    it('should return allocations for uvfin', async () => {
        attendanceService.getFacultyAllocations.mockResolvedValue(mockAllocations);

        const res = await request(app).get('/api/attendance/my-allocations/VF-2024-001');
        expect(res.status).toBe(200);
        expect(attendanceService.getFacultyAllocations).toHaveBeenCalledWith('VF-2024-001');
    });

    it('should return 500 on service error', async () => {
        attendanceService.getFacultyAllocations.mockRejectedValue(new Error('Faculty not found'));

        const res = await request(app).get('/api/attendance/my-allocations/INVALID');
        expect(res.status).toBe(500);
    });
});

// ============================================================
// ■  SECTION 10 — ADMIN GET  GET /api/attendance/admin
// ============================================================

describe('GET /api/attendance/admin', () => {

    it('should return all attendance records (no filters)', async () => {
        attendanceService.getAdminAttendance.mockResolvedValue(mockAdminData);

        const res = await request(app).get('/api/attendance/admin');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.totalRecords).toBe(3);
        expect(res.body.data).toHaveLength(3);
        expect(attendanceService.getAdminAttendance).toHaveBeenCalledWith({});
    });

    it('should filter by facultyId', async () => {
        attendanceService.getAdminAttendance.mockResolvedValue(mockAdminData);

        const res = await request(app).get('/api/attendance/admin?facultyId=3');
        expect(res.status).toBe(200);
        expect(attendanceService.getAdminAttendance).toHaveBeenCalledWith({ facultyId: '3' });
    });

    it('should filter by month + year', async () => {
        attendanceService.getAdminAttendance.mockResolvedValue(mockAdminData);

        const res = await request(app).get('/api/attendance/admin?month=July&year=2026');
        expect(res.status).toBe(200);
        expect(attendanceService.getAdminAttendance).toHaveBeenCalledWith({ month: 'July', year: '2026' });
    });

    it('should filter by status=Pending', async () => {
        attendanceService.getAdminAttendance.mockResolvedValue({ totalRecords: 1, data: [mockAttendanceRecord] });

        const res = await request(app).get('/api/attendance/admin?status=Pending');
        expect(res.status).toBe(200);
        expect(res.body.totalRecords).toBe(1);
    });

    it('should filter by attendance_period=daily', async () => {
        attendanceService.getAdminAttendance.mockResolvedValue({ totalRecords: 1, data: [mockAttendanceRecord] });

        const res = await request(app).get('/api/attendance/admin?attendance_period=daily');
        expect(res.status).toBe(200);
        expect(attendanceService.getAdminAttendance).toHaveBeenCalledWith({ attendance_period: 'daily' });
    });

    it('should filter by attendance_period=weekly', async () => {
        attendanceService.getAdminAttendance.mockResolvedValue({ totalRecords: 1, data: [mockWeeklyRecord] });

        const res = await request(app).get('/api/attendance/admin?attendance_period=weekly');
        expect(res.status).toBe(200);
        expect(attendanceService.getAdminAttendance).toHaveBeenCalledWith({ attendance_period: 'weekly' });
    });

    it('should filter by attendance_period=monthly', async () => {
        attendanceService.getAdminAttendance.mockResolvedValue({ totalRecords: 1, data: [mockMonthlyRecord] });

        const res = await request(app).get('/api/attendance/admin?attendance_period=monthly');
        expect(res.status).toBe(200);
        expect(attendanceService.getAdminAttendance).toHaveBeenCalledWith({ attendance_period: 'monthly' });
    });

    it('should support combined filters', async () => {
        attendanceService.getAdminAttendance.mockResolvedValue({ totalRecords: 1, data: [mockAttendanceRecord] });

        const res = await request(app)
            .get('/api/attendance/admin?facultyId=3&month=July&year=2026&status=Pending&attendance_period=daily');

        expect(res.status).toBe(200);
        expect(attendanceService.getAdminAttendance).toHaveBeenCalledWith({
            facultyId:         '3',
            month:             'July',
            year:              '2026',
            status:            'Pending',
            attendance_period: 'daily'
        });
    });

    it('should return 500 on service error', async () => {
        attendanceService.getAdminAttendance.mockRejectedValue(new Error('DB error'));

        const res = await request(app).get('/api/attendance/admin');
        expect(res.status).toBe(500);
    });
});

// ============================================================
// ■  SECTION 11 — ADMIN VERIFY  PATCH /api/attendance/verify/:attendanceId
// ============================================================

describe('PATCH /api/attendance/verify/:attendanceId', () => {

    const verifiedRecord = { ...mockAttendanceRecord, status: 'Present', remarks: 'Verified by admin' };

    it('should update status to Present', async () => {
        attendanceService.verifyAttendance.mockResolvedValue(verifiedRecord);

        const res = await request(app)
            .patch('/api/attendance/verify/1')
            .send({ status: 'Present', remarks: 'Verified by admin' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Attendance status updated successfully.');
        expect(res.body.data.status).toBe('Present');
        expect(attendanceService.verifyAttendance).toHaveBeenCalledWith('1', 'Present', 'Verified by admin');
    });

    it('should update status to Absent', async () => {
        attendanceService.verifyAttendance.mockResolvedValue({ ...mockAttendanceRecord, status: 'Absent' });

        const res = await request(app)
            .patch('/api/attendance/verify/1')
            .send({ status: 'Absent' });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('Absent');
    });

    it('should reset status to Pending', async () => {
        attendanceService.verifyAttendance.mockResolvedValue({ ...mockAttendanceRecord, status: 'Pending' });

        const res = await request(app)
            .patch('/api/attendance/verify/1')
            .send({ status: 'Pending' });

        expect(res.status).toBe(200);
    });

    it('should return 400 if status is missing', async () => {
        const res = await request(app)
            .patch('/api/attendance/verify/1')
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/status is required/i);
        expect(attendanceService.verifyAttendance).not.toHaveBeenCalled();
    });

    it('should return 500 if record not found', async () => {
        attendanceService.verifyAttendance.mockRejectedValue(new Error('Attendance record not found.'));

        const res = await request(app)
            .patch('/api/attendance/verify/999')
            .send({ status: 'Present' });

        expect(res.status).toBe(500);
        expect(res.body.message).toMatch(/not found/i);
    });

    it('should return 500 for invalid status string', async () => {
        attendanceService.verifyAttendance.mockRejectedValue(new Error('Invalid status. Must be one of: Present, Absent, Pending.'));

        const res = await request(app)
            .patch('/api/attendance/verify/1')
            .send({ status: 'Approved' });

        expect(res.status).toBe(500);
        expect(res.body.message).toMatch(/Invalid status/i);
    });
});

// ============================================================
// ■  SECTION 12 — STRICT RECORD LOOKUP  GET /api/attendance/record/:id
// ============================================================

describe('GET /api/attendance/record/:attendanceId (strict)', () => {

    it('should return a single record by numeric ID', async () => {
        attendanceService.getAttendanceByIdService.mockResolvedValue(mockAttendanceRecord);

        const res = await request(app).get('/api/attendance/record/1');

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.attendance_id).toBe(1);
        expect(attendanceService.getAttendanceByIdService).toHaveBeenCalledWith(1);
    });

    it('should return 400 for non-numeric ID', async () => {
        const res = await request(app).get('/api/attendance/record/abc');

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/must be a valid integer/i);
        expect(attendanceService.getAttendanceByIdService).not.toHaveBeenCalled();
    });

    it('should return 404 if record not found', async () => {
        attendanceService.getAttendanceByIdService.mockResolvedValue(null);

        const res = await request(app).get('/api/attendance/record/999999');

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toMatch(/No attendance record found/i);
    });

    it('should return 500 on DB error', async () => {
        attendanceService.getAttendanceByIdService.mockRejectedValue(new Error('DB error'));

        const res = await request(app).get('/api/attendance/record/1');
        expect(res.status).toBe(500);
    });
});

// ============================================================
// ■  SECTION 13 — SMART LOOKUP  GET /api/attendance/:attendanceId
// ============================================================

describe('GET /api/attendance/:attendanceId (smart lookup)', () => {

    it('should return single record for numeric ID', async () => {
        attendanceService.getAttendanceByIdService.mockResolvedValue(mockAttendanceRecord);

        const res = await request(app).get('/api/attendance/1');

        expect(res.status).toBe(200);
        expect(res.body.type).toBe('single_attendance_record');
        expect(res.body.data.attendance_id).toBe(1);
    });

    it('should fall back to faculty history for text ID (uvfin)', async () => {
        attendanceService.getAttendanceByIdService.mockResolvedValue(null);
        attendanceService.getAttendanceHistory.mockResolvedValue(mockHistory);

        const res = await request(app).get('/api/attendance/VF-2024-001');

        expect(res.status).toBe(200);
        expect(res.body.type).toBe('faculty_attendance_history');
        expect(res.body.totalClasses).toBe(10);
    });

    it('should return 404 if neither lookup succeeds', async () => {
        attendanceService.getAttendanceByIdService.mockResolvedValue(null);
        attendanceService.getAttendanceHistory.mockRejectedValue(new Error('Faculty not found'));

        const res = await request(app).get('/api/attendance/INVALID-ID');

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
});
