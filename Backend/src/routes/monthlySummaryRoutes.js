const express = require("express");
const router = express.Router();

const {
    getMonthlySummaryController,
    getAllCoursesSummaryController,
    downloadSummaryPDFController,
    generateSummaryPDFController,
    triggerMonthlySummaryNow
} = require("../controller/monthlySummaryController");

// ─── All Courses Summary (must be before /) ──────────────────────
// GET /api/monthly-summary/all?month=July&year=2026
router.get("/all", getAllCoursesSummaryController);

// ─── Download Summary PDF ────────────────────────────────────────
// GET /api/monthly-summary/download?month=July&year=2026&courseId=1
router.get("/download", downloadSummaryPDFController);

// ─── Super Admin — Full Monthly Summary PDF ──────────────────────
// GET /api/monthly-summary/super-admin-pdf?month=July&year=2026
// Returns: PDF with S.No./UVFIN/Name/Total Amount table,
//          all Program Incharge blocks, Director signature
// Accessible by Super Admin only
router.get("/super-admin-pdf", generateSummaryPDFController);

// ─── Manually trigger the cron job (testing / emergency re-run) ─────
// POST /api/monthly-summary/trigger-now
router.post("/trigger-now", triggerMonthlySummaryNow);

// ─── Single Course (or all) Summary ─────────────────────────────
// GET /api/monthly-summary?month=July&year=2026&courseId=1
// GET /api/monthly-summary?month=July&year=2026          (no courseId = all combined)
router.get("/", getMonthlySummaryController);

module.exports = router;
