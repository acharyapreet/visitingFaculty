const {
    getMonthlySummary,
    getAllCoursesMonthlySummary,
    downloadMonthlySummaryPDF
} = require("../service/monthlySummaryService");

// =================================================================
// GET /api/monthly-summary?month=July&year=2026&courseId=1
// Returns: Summary grouped by Semester → Faculty for ONE course
// courseId is optional — if omitted, returns all courses combined
// =================================================================
const getMonthlySummaryController = async (req, res) => {
    try {
        const { month, year, courseId } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: "Query params 'month' and 'year' are required."
            });
        }

        const data = await getMonthlySummary(month, year, courseId || null);

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        console.error("getMonthlySummaryController:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// =================================================================
// GET /api/monthly-summary/all?month=July&year=2026
// Returns: Summary for ALL active courses for that month/year
// =================================================================
const getAllCoursesSummaryController = async (req, res) => {
    try {
        const { month, year } = req.query;

        if (!month || !year) {
            return res.status(400).json({
                success: false,
                message: "Query params 'month' and 'year' are required."
            });
        }

        const data = await getAllCoursesMonthlySummary(month, year);

        return res.status(200).json({
            success: true,
            data
        });

    } catch (error) {
        console.error("getAllCoursesSummaryController:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// =================================================================
// GET /api/monthly-summary/download?month=July&year=2026&courseId=1
// Returns: PDF file (binary download)
// courseId is required for PDF (one course per report like the screenshot)
// =================================================================
const downloadSummaryPDFController = async (req, res) => {
    try {
        const { month, year, courseId } = req.query;

        if (!month || !year || !courseId) {
            return res.status(400).json({
                success: false,
                message: "Query params 'month', 'year', and 'courseId' are required for PDF download."
            });
        }

        const pdfPath = await downloadMonthlySummaryPDF(month, year, courseId);

        return res.download(pdfPath);

    } catch (error) {
        console.error("downloadSummaryPDFController:", error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    getMonthlySummaryController,
    getAllCoursesSummaryController,
    downloadSummaryPDFController
};
