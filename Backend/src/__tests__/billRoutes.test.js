const request = require('supertest');
const app = require('../app');
const billService = require('../service/billService');
const path = require('path');

// Mock the bill service
jest.mock('../service/billService');

describe('Bill Routes Integration Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('POST /api/bills/generate', () => {
        it('should generate a bill successfully', async () => {
            const mockResult = {
                success: true,
                message: "Bill generated successfully.",
                billId: 1,
                totalHours: 10,
                totalAmount: 5000,
                amountInWords: "five thousand Rupees Only",
                billDetails: []
            };
            billService.generateBill.mockResolvedValue(mockResult);

            const res = await request(app)
                .post('/api/bills/generate')
                .send({ facultyId: 'TEMP-123456', month: 'July', year: 2026 });

            expect(res.status).toBe(201);
            expect(res.body.success).toBe(true);
            expect(res.body.message).toBe("Bill generated successfully.");
            expect(res.body.data).toEqual(mockResult);
            expect(billService.generateBill).toHaveBeenCalledWith('TEMP-123456', 'July', 2026);
        });

        it('should return 400 if required fields are missing', async () => {
            const res = await request(app)
                .post('/api/bills/generate')
                .send({ facultyId: 'TEMP-123456' });

            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe("Faculty ID, Month and Year are required.");
            expect(billService.generateBill).not.toHaveBeenCalled();
        });

        it('should handle service errors with 500 status', async () => {
            billService.generateBill.mockRejectedValue(new Error('No attendance found for this month.'));

            const res = await request(app)
                .post('/api/bills/generate')
                .send({ facultyId: 'TEMP-123456', month: 'July', year: 2026 });

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('No attendance found for this month.');
        });
    });

    describe('GET /api/bills', () => {
        it('should return all bills', async () => {
            const mockBills = [
                { bill_id: 1, user_id: 'TEMP-123456', month: 'July', year: 2026 }
            ];
            billService.getAllBills.mockResolvedValue(mockBills);

            const res = await request(app).get('/api/bills');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.count).toBe(1);
            expect(res.body.data).toEqual(mockBills);
            expect(billService.getAllBills).toHaveBeenCalled();
        });

        it('should return 500 on database error', async () => {
            billService.getAllBills.mockRejectedValue(new Error('Database error'));

            const res = await request(app).get('/api/bills');

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Database error');
        });
    });

    describe('GET /api/bills/details/:billId', () => {
        it('should return bill details', async () => {
            const mockBill = { bill_id: 1, user_id: 'TEMP-123456', month: 'July', year: 2026, BillDetails: [] };
            billService.getBillDetails.mockResolvedValue(mockBill);

            const res = await request(app).get('/api/bills/details/1');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data).toEqual(mockBill);
            expect(billService.getBillDetails).toHaveBeenCalledWith('1');
        });

        it('should return 500 if bill is not found', async () => {
            billService.getBillDetails.mockRejectedValue(new Error('Bill Not Found'));

            const res = await request(app).get('/api/bills/details/999');

            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('Bill Not Found');
        });
    });

    describe('GET /api/bills/history/:facultyId', () => {
        it('should return bill history for a faculty member', async () => {
            const mockHistory = [
                { bill_id: 1, user_id: 'TEMP-123456', month: 'July', year: 2026 }
            ];
            billService.getBillHistory.mockResolvedValue(mockHistory);

            const res = await request(app).get('/api/bills/history/TEMP-123456');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.count).toBe(1);
            expect(res.body.data).toEqual(mockHistory);
            expect(billService.getBillHistory).toHaveBeenCalledWith('TEMP-123456');
        });
    });

    describe('DELETE /api/bills/:billId', () => {
        it('should delete the bill successfully', async () => {
            const mockResult = { success: true, message: "Bill deleted Successfully." };
            billService.deleteBill.mockResolvedValue(mockResult);

            const res = await request(app).delete('/api/bills/1');

            expect(res.status).toBe(200);
            expect(res.body).toEqual(mockResult);
            expect(billService.deleteBill).toHaveBeenCalledWith('1');
        });
    });

    describe('GET /api/bills/download/:billId', () => {
        it('should trigger path download for existing pdf', async () => {
            const realFile = path.resolve(__dirname, '../../package.json');
            billService.downloadBill.mockResolvedValue(realFile);

            const res = await request(app).get('/api/bills/download/1');
            expect(res.status).toBe(200);
            expect(res.header['content-type']).toContain('json');
            expect(billService.downloadBill).toHaveBeenCalledWith('1');
        });

        it('should return 500 if pdf download fails', async () => {
            billService.downloadBill.mockRejectedValue(new Error('PDF not generated.'));

            const res = await request(app).get('/api/bills/download/1');
            expect(res.status).toBe(500);
            expect(res.body.success).toBe(false);
            expect(res.body.message).toBe('PDF not generated.');
        });
    });
});
