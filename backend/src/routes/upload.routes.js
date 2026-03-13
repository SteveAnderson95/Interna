const express = require("express");
const { createUploader } = require("../config/multer");
const authenticate = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const {
  uploadConventionFile,
  uploadCvFile,
  uploadMotivationLetterFile,
  uploadReportFile,
} = require("../controllers/upload.controller");

const router = express.Router();

router.post(
  "/cv",
  authenticate,
  authorizeRoles("STUDENT"),
  createUploader("cvs").single("file"),
  uploadCvFile
);

router.post(
  "/motivation-letter",
  authenticate,
  authorizeRoles("STUDENT"),
  createUploader("motivation_letters").single("file"),
  uploadMotivationLetterFile
);

router.post(
  "/convention",
  authenticate,
  authorizeRoles("STUDENT"),
  createUploader("conventions").single("file"),
  uploadConventionFile
);

router.post(
  "/report",
  authenticate,
  authorizeRoles("STUDENT"),
  createUploader("reports").single("file"),
  uploadReportFile
);

module.exports = router;
