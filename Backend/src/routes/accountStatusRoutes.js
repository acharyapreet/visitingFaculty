console.log("Account Status Routes Loaded...");
const express = require("express");

const router = express.Router();

const {
    activateFacultyController,
    deactivateFacultyController,
    activateAdminController,
    deactivateAdminController
} = require("../controller/accountStatusController");

// Admin -> Faculty
router.put("/admin/faculty/:id/activate", activateFacultyController);
router.put("/admin/faculty/:id/deactivate", deactivateFacultyController);

// Super Admin -> Faculty
router.put("/super_admin/faculty/:id/activate", activateFacultyController);
router.put("/super_admin/faculty/:id/deactivate", deactivateFacultyController);

// Super Admin -> Admin
router.put("/super_admin/admin/:id/activate", activateAdminController);
router.put("/super_admin/admin/:id/deactivate", deactivateAdminController);

module.exports = router;