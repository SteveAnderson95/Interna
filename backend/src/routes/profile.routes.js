const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const {
  createStudentProfile,
  createCompanyProfile,
  createSchoolProfile,
  getMyProfile,
  updateStudentProfile,
} = require("../controllers/profile.controller");

const router = express.Router();

router.get("/me", authenticate, getMyProfile);

router.post(
  "/student",
  authenticate,
  authorizeRoles("STUDENT"),
  createStudentProfile
);

router.post(
  "/company",
  authenticate,
  authorizeRoles("COMPANY"),
  createCompanyProfile
);

router.post(
  "/school",
  authenticate,
  authorizeRoles("SCHOOL"),
  createSchoolProfile
);

router.patch(
  "/student",
  authenticate,
  authorizeRoles("STUDENT"),
  updateStudentProfile
);


module.exports = router;
