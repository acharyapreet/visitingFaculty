const {
    generateBill,
    getBillDetails,
    getBillHistory,
    getBillSummary,
    getBillsByMonth,
    regenerateBillPDF,
    getAllBills,
    deleteBill,
    downloadBill
} = require("../service/billService");

const { runBillAutoGenerationJob } = require("../scheduler/billAutoGenerationScheduler");
const { Bill, User } = require("../Schema");

// ==========================================
// Generate Bill
// ==========================================
const generateBillController = async (req, res) => {

    try {

        const { facultyId, month, year } = req.body;

        if (
            facultyId === undefined ||
            month === undefined ||
            year === undefined
        ) {
            return res.status(400).json({
                success: false,
                message: "Faculty ID, Month and Year are required."
            });
        }

        const result = await generateBill(facultyId, month, year);

        return res.status(201).json({
            success: true,
            message: "Bill generated successfully.",
            data: result
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ==========================================
// Get Bill Details (single bill + line items)
// ==========================================
const getBillDetailsController = async (req, res) => {
    try {
        const { billId } = req.params;

        const bill = await getBillDetails(billId);

        return res.status(200).json({
            success: true,
            data: bill
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==========================================
// Get Bill History (all bills for a faculty)
// ==========================================
const getBillHistoryController = async (req, res) => {
    try {
        const { facultyId } = req.params;

        const bills = await getBillHistory(facultyId);

        return res.status(200).json({
            success: true,
            count: bills.length,
            data: bills
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==========================================
// Get Bill Summary (stats per faculty)
// ==========================================
const getBillSummaryController = async (req, res) => {
    try {
        const { facultyId } = req.params;

        const summary = await getBillSummary(facultyId);

        return res.status(200).json({
            success: true,
            data: summary
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==========================================
// Get Bills By Month (admin filter)
// ==========================================
const getBillsByMonthController = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: "Query params 'month' and 'year' are required."
            });
        }

        const result = await getBillsByMonth(month, Number(year));

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==========================================
// Regenerate Bill PDF
// ==========================================
const regenerateBillPDFController = async (req, res) => {
    try {
        const { billId } = req.params;

        const result = await regenerateBillPDF(billId);

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==========================================
// Get All Bills (admin view)
// ==========================================
const getAllBillsController = async (req, res) => {
    try {
        const bills = await getAllBills();

        return res.status(200).json({
            success: true,
            count: bills.length,
            data: bills
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==========================================
// Delete Bill
// ==========================================
const deleteBillController = async (req, res) => {
    try {
        const { billId } = req.params;

        const result = await deleteBill(billId);

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// ==========================================
// Download Bill PDF
// ==========================================
const downloadBillController = async (req, res) => {

    try {

        const { billId } = req.params;

        const pdfPath = await downloadBill(billId);

        return res.download(pdfPath);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            success: false,
            message: error.message
        });

    }

};

// ==========================================
// Manually Trigger Auto-Generation Job
// POST /api/bills/auto-generate
// ==========================================
const autoGenerateBillsController = async (req, res) => {
    try {
        // Respond immediately so the HTTP request doesn't time out
        res.status(202).json({
            success: true,
            message: "Bill auto-generation job triggered. Check server logs for progress."
        });

        // Run AFTER responding
        runBillAutoGenerationJob();

    } catch (error) {
        console.error("autoGenerateBillsController:", error);
        // Headers already sent — just log, don't respond again
    }
};

// ==========================================
// Get All Bills Grouped By Month/Year
// GET /api/bills/history/all-months
// ==========================================
const getBillHistoryAllMonthsController = async (req, res) => {
    try {
        // Fetch all bills with faculty info, newest first
        const bills = await Bill.findAll({
            include: [
                {
                    model: User,
                    attributes: ["user_id", "full_name", "email", "uvfin"]
                }
            ],
            order: [["year", "DESC"], ["generated_at", "DESC"]]
        });

        // Group by "Month Year" key
        const grouped = {};
        const MONTH_ORDER = [
            "January","February","March","April","May","June",
            "July","August","September","October","November","December"
        ];

        for (const bill of bills) {
            const key = `${bill.month} ${bill.year}`;
            if (!grouped[key]) {
                grouped[key] = {
                    month:        bill.month,
                    year:         bill.year,
                    count:        0,
                    totalAmount:  0,
                    totalHours:   0,
                    bills:        []
                };
            }
            grouped[key].count++;
            grouped[key].totalAmount += Number(bill.total_amount);
            grouped[key].totalHours  += Number(bill.total_hours);
            grouped[key].bills.push(bill);
        }

        // Sort by year DESC then month DESC
        const history = Object.values(grouped).sort((a, b) => {
            if (b.year !== a.year) return b.year - a.year;
            return MONTH_ORDER.indexOf(b.month) - MONTH_ORDER.indexOf(a.month);
        }).map(g => ({
            ...g,
            totalAmount: Number(g.totalAmount.toFixed(2)),
            totalHours:  Number(g.totalHours.toFixed(2))
        }));

        return res.status(200).json({
            success:      true,
            totalMonths:  history.length,
            totalBills:   bills.length,
            history
        });

    } catch (error) {
        console.error("getBillHistoryAllMonthsController:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    generateBillController,
    getBillDetailsController,
    getBillHistoryController,
    getBillSummaryController,
    getBillsByMonthController,
    regenerateBillPDFController,
    getAllBillsController,
    deleteBillController,
    downloadBillController,
    autoGenerateBillsController,
    getBillHistoryAllMonthsController
};