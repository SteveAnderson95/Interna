const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const {
  getCompanyProfileById,
  getMyCompanyOffers,
} = require("../controllers/company.controller");

const router = express.Router();

router.get("/offers", authenticate, authorizeRoles("COMPANY"), getMyCompanyOffers);
router.get("/:id", authenticate, getCompanyProfileById);

module.exports = router;
