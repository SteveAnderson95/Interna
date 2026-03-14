const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const {
  blockApplication,
  getSchoolApplications,
  getSchoolInternships,
  getSchoolsList,
  validateInternship,
} = require("../controllers/school.controller");

const router = express.Router();

router.get("/list", authenticate, getSchoolsList);
router.get("/applications", authenticate, authorizeRoles("SCHOOL"), getSchoolApplications);
router.patch(
  "/applications/:id/block",
  authenticate,
  authorizeRoles("SCHOOL"),
  blockApplication
);
router.get("/internships", authenticate, authorizeRoles("SCHOOL"), getSchoolInternships);
router.patch(
  "/internships/:id/validate",
  authenticate,
  authorizeRoles("SCHOOL"),
  validateInternship
);

module.exports = router;
