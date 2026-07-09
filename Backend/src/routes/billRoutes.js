const express = require("express");

const router = express.Router();

const{
    generateBillController
} = require("../controller/billController");

router.post(
    "/generate",
    generateBillController
);
 module.exports = router;