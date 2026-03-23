const express = require("express");
const cors = require("cors");
const prisma = require("./config/prisma");
const authRoutes = require("./routes/auth.routes");
const authenticate = require("./middlewares/auth.middleware");
const authorizeRoles = require("./middlewares/role.middleware");
const profileRoutes = require("./routes/profile.routes");
const offerRoutes = require("./routes/offer.routes");
const applicationRoutes = require("./routes/application.routes");
const companyRoutes = require("./routes/company.routes");
const path = require("path");
const uploadRoutes = require("./routes/upload.routes");
const internshipRoutes = require("./routes/internship.routes");
const deliverableRoutes = require("./routes/deliverable.routes");
const schoolRoutes = require("./routes/school.routes");
const adminRoutes = require("./routes/admin.routes");
const matchingRoutes = require("./routes/matching.routes");



const app = express();

const configuredOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_ALT,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

const normalizeOrigin = (origin) => origin?.replace(/\/+$/, "");

const allowedOrigins = configuredOrigins.map(normalizeOrigin);

const isAllowedOrigin = (origin) => {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = normalizeOrigin(origin);

  if (allowedOrigins.includes(normalizedOrigin)) {
    return true;
  }

  try {
    const { hostname, protocol } = new URL(normalizedOrigin);

    if (
      protocol === "https:" &&
      (hostname.endsWith(".vercel.app") || hostname.endsWith(".railway.app"))
    ) {
      return true;
    }
  } catch (error) {
    return false;
  }

  return false;
};

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/applications", applicationRoutes);
app.use("/api/company", companyRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/upload", uploadRoutes);
app.use("/api/internships", internshipRoutes);
app.use("/api/deliverables", deliverableRoutes);
app.use("/api/school", schoolRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/matching", matchingRoutes);




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

app.get("/", (req, res) => {
  res.json({
    message: "Interna API is running",
    health: "/api/health",
  });
});

app.get("/api/auth/me", authenticate, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        role: true,
        active: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.json({
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
});


app.get("/api/admin/test", authenticate, authorizeRoles("ADMIN"), (req, res) => {
  res.json({ message: "Admin access granted" });
});

app.use((error, req, res, next) => {
  if (error) {
    return res.status(400).json({
      message: error.message || "Request error",
    });
  }

  next();
});

module.exports = app;
