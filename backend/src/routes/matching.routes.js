const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const { getStudentMatches } = require("../controllers/matching.controller");

const router = express.Router();

router.get("/student", authenticate, authorizeRoles("STUDENT"), getStudentMatches);

module.exports = router;
