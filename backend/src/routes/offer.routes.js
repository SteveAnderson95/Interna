const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const {
  createOffer,
  getAllOffers,
  getOfferById,
} = require("../controllers/offer.controller");

const router = express.Router();

router.get("/", getAllOffers);
router.get("/:id", getOfferById);
router.post("/", authenticate, authorizeRoles("COMPANY"), createOffer);

module.exports = router;
