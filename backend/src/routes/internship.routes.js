const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const {
  downloadAttestationPdf,
  downloadEvaluationPdf,
  getCompanyInternships,
  getMyInternship,
} = require("../controllers/internship.controller");

const router = express.Router();

router.get("/me", authenticate, authorizeRoles("STUDENT"), getMyInternship);
router.get("/company", authenticate, authorizeRoles("COMPANY"), getCompanyInternships);
router.get(
  "/company/:id/attestation",
  authenticate,
  authorizeRoles("COMPANY"),
  downloadAttestationPdf
);
router.get(
  "/company/:id/evaluation",
  authenticate,
  authorizeRoles("COMPANY"),
  downloadEvaluationPdf
);

module.exports = router;
