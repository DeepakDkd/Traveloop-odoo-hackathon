import authRoutes from "./src/routes/auth.route.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import express from "express";
import prisma from "./src/lib/prisma.js";
import checklistRoutes from "./src/routes/checklist.route.js";
import tripRoutes from "./src/routes/trip.route.js";
import activityRoutes from "./src/routes/activity.route.js";
import cityRoutes from "./src/routes/city.route.js";
import communityRoutes from "./src/routes/community.route.js";
import expenseRootRoutes from "./src/routes/expense-root.route.js";
import publicRoutes from "./src/routes/public.route.js";
import stopRootRoutes from "./src/routes/stop-root.route.js";
import userRoutes from "./src/routes/user.route.js";
import { createSecurityMiddleware } from "./src/middleware/security.middleware.js";

const app = express();
dotenv.config();

app.use(cookieParser());
app.use(createSecurityMiddleware());

const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use("/uploads", express.static("uploads"));

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
app.use("/api/activities", activityRoutes);
app.use("/api/cities", cityRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/expenses", expenseRootRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/stops", stopRootRoutes);
app.use("/api/users", userRoutes);

app.use((error, _req, res, next) => {
  if (!error) {
    return next();
  }

  return res.status(400).json({
    success: false,
    message: error.message,
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
