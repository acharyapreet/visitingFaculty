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

module.exports = {
    generateBillController,
    getBillDetailsController,
    getBillHistoryController,
    getBillSummaryController,
    getBillsByMonthController,
    regenerateBillPDFController,
    getAllBillsController,
    deleteBillController,
    downloadBillController
};