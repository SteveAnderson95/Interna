const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const authorizeRoles = require("../middlewares/role.middleware");
const {
  deleteOffer,
  deleteUser,
  getAdminDashboard,
  getAllApplications,
  getAllDeliverables,
  getAllInternships,
  getAllOffers,
  getAllUsers,
  updateUserStatus,
} = require("../controllers/admin.controller");

const router = express.Router();

router.use(authenticate, authorizeRoles("ADMIN"));

router.get("/dashboard", getAdminDashboard);
router.get("/users", getAllUsers);
router.patch("/users/:id/status", updateUserStatus);
router.get("/offers", getAllOffers);
router.get("/applications", getAllApplications);
router.get("/internships", getAllInternships);
router.get("/deliverables", getAllDeliverables);
router.delete("/users/:id", deleteUser);
router.delete("/offers/:id", deleteOffer);

module.exports = router;
