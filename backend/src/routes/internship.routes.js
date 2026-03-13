const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const {
  getCompanyInternships,
  getMyInternship,
} = require("../controllers/internship.controller");

const router = express.Router();

router.get("/me", authenticate, authorizeRoles("STUDENT"), getMyInternship);
router.get("/company", authenticate, authorizeRoles("COMPANY"), getCompanyInternships);

module.exports = router;
