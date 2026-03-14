const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const {
  createOffer,
  deleteOffer,
  getAllOffers,
  getOfferById,
  updateOffer,
} = require("../controllers/offer.controller");

const router = express.Router();

router.get("/", getAllOffers);
router.get("/:id", getOfferById);
router.post("/", authenticate, authorizeRoles("COMPANY"), createOffer);
router.patch("/:id", authenticate, authorizeRoles("COMPANY"), updateOffer);
router.delete("/:id", authenticate, authorizeRoles("COMPANY"), deleteOffer);

module.exports = router;
