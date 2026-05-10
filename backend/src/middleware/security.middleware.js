import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

export const createSecurityMiddleware = () => [
  helmet(),
  cors({
    origin:
      process.env.FRONTEND_URL ||
      process.env.CLIENT_URL ||
      "http://localhost:3000",
    credentials: true,
  }),
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      success: false,
      message: "Too many requests. Please try again later.",
    },
  }),
];
