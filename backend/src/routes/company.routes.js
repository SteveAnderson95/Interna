const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const { getMyCompanyOffers } = require("../controllers/company.controller");

const router = express.Router();

router.get("/offers", authenticate, authorizeRoles("COMPANY"), getMyCompanyOffers);

module.exports = router;
