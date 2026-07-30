const express = require("express");
const router = express.Router();

const {
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
} = require("../controller/billController");

// ─── Generate (manual, single faculty) ───────────────────────────────────────
// POST /api/bills/generate
router.post("/generate", generateBillController);

// ─── Auto-Generate (manually trigger the end-of-month cron job) ──────────────
// POST /api/bills/auto-generate
router.post("/auto-generate", autoGenerateBillsController);

// ─── All Bills (admin) ────────────────────────────────────────────────────────
// GET /api/bills/
router.get("/", getAllBillsController);

// ─── Bills by Month/Year (admin filter) ──────────────────────────────────────
// GET /api/bills/by-month?month=July&year=2026
router.get("/by-month", getBillsByMonthController);

// ─── Bill History — All Months Grouped (admin view) ──────────────────────────
// GET /api/bills/history/all-months
// NOTE: Must be declared BEFORE /history/:facultyId to avoid route conflict
router.get("/history/all-months", getBillHistoryAllMonthsController);

// ─── Bill History for a Faculty ──────────────────────────────────────────────
// GET /api/bills/history/:facultyId
router.get("/history/:facultyId", getBillHistoryController);

// ─── Bill Summary / Stats for a Faculty ──────────────────────────────────────
// GET /api/bills/summary/:facultyId
router.get("/summary/:facultyId", getBillSummaryController);

// ─── Single Bill Details (header + line items) ────────────────────────────────
// GET /api/bills/details/:billId
router.get("/details/:billId", getBillDetailsController);

// ─── Download Bill PDF ────────────────────────────────────────────────────────
// GET /api/bills/download/:billId
router.get("/download/:billId", downloadBillController);

// ─── Regenerate Bill PDF ──────────────────────────────────────────────────────
// PATCH /api/bills/regenerate/:billId
router.patch("/regenerate/:billId", regenerateBillPDFController);

// ─── Delete Bill ──────────────────────────────────────────────────────────────
// DELETE /api/bills/:billId
router.delete("/:billId", deleteBillController);

module.exports = router;