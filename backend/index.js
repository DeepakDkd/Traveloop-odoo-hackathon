import authRoutes from "./src/routes/auth.route.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors";
import prisma from "./src/lib/prisma.js";
import checklistRoutes from "./src/routes/checklist.route.js";
import tripRoutes from "./src/routes/trip.route.js";

const app = express();
dotenv.config();

app.use(cookieParser());
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    message: "Backend is running",
    prisma: "configured",
  });
});

app.get("/health/db", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    
    res.json({
      ok: true,
      database: "connected",
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      database: "disconnected",
      error: error.message,
    });
  }
});

app.use("/api/auth", authRoutes);

app.use("/api/trips", tripRoutes);
app.use("/api/checklist", checklistRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
