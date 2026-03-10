const express = require("express");
const cors = require("cors");
const prisma = require("./config/prisma");

const app = express();

app.use(cors());
app.use(express.json());

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

module.exports = app;
