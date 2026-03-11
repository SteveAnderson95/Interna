const express = require("express");
const cors = require("cors");
const prisma = require("./config/prisma");
const authRoutes = require("./routes/auth.routes");
const authenticate = require("./middlewares/auth.middleware");
const authorizeRoles = require("./middlewares/role.middleware");
const profileRoutes = require("./routes/profile.routes");
const offerRoutes = require("./routes/offer.routes");
const applicationRoutes = require("./routes/application.routes");



const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/applications", applicationRoutes);




app.get("/api/health", async (req, res) => {
  try {
    const usersCount = await prisma.user.count();

    res.json({
      message: "API Interna OK",
      database: "connected",
      usersCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Database connection error",
    });
  }
});

app.get("/api/auth/me", authenticate, (req, res) => {
  res.json({
    message: "Authenticated user",
    user: req.user,
  });
});

app.get("/api/admin/test", authenticate, authorizeRoles("ADMIN"), (req, res) => {
  res.json({ message: "Admin access granted" });
});


module.exports = app;
