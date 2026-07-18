const express = require("express");
const router = express.Router();

const {
    generateBillController,
    getBillDetailsController,
    getBillHistoryController,
    getAllBillsController,
    deleteBillController,
    downloadBillController
} = require("../controller/billController");

router.post("/generate", generateBillController);

router.get("/", getAllBillsController);

router.get("/history/:facultyId", getBillHistoryController);

router.get("/details/:billId", getBillDetailsController);

// Uncomment only after implementing downloadBillController
// router.get("/download/:billId", downloadBillController);

router.delete("/:billId", deleteBillController);

router.get(
    "/download/:billId",
    downloadBillController
);
module.exports = router;