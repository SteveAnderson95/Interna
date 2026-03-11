const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const {
  createApplication,
  getMyApplications,
  getCompanyApplications,
  updateApplicationStatus,
} = require("../controllers/application.controller");

const router = express.Router();

router.post("/", authenticate, authorizeRoles("STUDENT"), createApplication);
router.get("/my", authenticate, authorizeRoles("STUDENT"), getMyApplications);
router.get("/company", authenticate, authorizeRoles("COMPANY"), getCompanyApplications);
router.patch("/:id/status", authenticate, authorizeRoles("COMPANY"), updateApplicationStatus);

module.exports = router;
