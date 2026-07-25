const express = require("express");
const router = express.Router();

const {
    getMonthlySummaryController,
    getAllCoursesSummaryController,
    downloadSummaryPDFController
} = require("../controller/monthlySummaryController");

// ─── All Courses Summary (must be before /) ──────────────────────
// GET /api/monthly-summary/all?month=July&year=2026
router.get("/all", getAllCoursesSummaryController);

// ─── Download Summary PDF ────────────────────────────────────────
// GET /api/monthly-summary/download?month=July&year=2026&courseId=1
router.get("/download", downloadSummaryPDFController);

// ─── Single Course (or all) Summary ─────────────────────────────
// GET /api/monthly-summary?month=July&year=2026&courseId=1
// GET /api/monthly-summary?month=July&year=2026          (no courseId = all combined)
router.get("/", getMonthlySummaryController);

module.exports = router;
