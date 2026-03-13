const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const { createReportDeliverable } = require("../controllers/deliverable.controller");

const router = express.Router();

router.post("/report", authenticate, authorizeRoles("STUDENT"), createReportDeliverable);

module.exports = router;
