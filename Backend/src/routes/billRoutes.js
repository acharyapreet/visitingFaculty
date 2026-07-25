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
    downloadBillController
} = require("../controller/billController");

// ─── Generate ─────────────────────────────────────────────────
// POST /api/bills/generate
router.post("/generate", generateBillController);

// ─── All Bills (admin) ────────────────────────────────────────
// GET /api/bills/
router.get("/", getAllBillsController);

// ─── Bills by Month/Year (admin filter) ───────────────────────
// GET /api/bills/by-month?month=December&year=2024
router.get("/by-month", getBillsByMonthController);

// ─── Bill History for a Faculty ───────────────────────────────
// GET /api/bills/history/:facultyId
router.get("/history/:facultyId", getBillHistoryController);

// ─── Bill Summary / Stats for a Faculty ───────────────────────
// GET /api/bills/summary/:facultyId
router.get("/summary/:facultyId", getBillSummaryController);

// ─── Single Bill Details (header + line items) ────────────────
// GET /api/bills/details/:billId
router.get("/details/:billId", getBillDetailsController);

// ─── Download Bill PDF ────────────────────────────────────────
// GET /api/bills/download/:billId
router.get("/download/:billId", downloadBillController);

// ─── Regenerate Bill PDF ──────────────────────────────────────
// PATCH /api/bills/regenerate/:billId
router.patch("/regenerate/:billId", regenerateBillPDFController);

// ─── Delete Bill ──────────────────────────────────────────────
// DELETE /api/bills/:billId
router.delete("/:billId", deleteBillController);

module.exports = router;