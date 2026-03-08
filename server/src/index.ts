import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "../.env") });
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import uploadRouter from "./routes/upload.js";
import postcardsRouter from "./routes/postcards.js";
import postcardByIdRouter from "./routes/postcardById.js";
import unlockRouter from "./routes/unlock.js";
import authRouter from "./routes/auth.js";
import conversationsRouter from "./routes/conversations.js";
import { requestLogger } from "./middleware/logger.js";

const app = express();
app.use(requestLogger);
const PORT = process.env.PORT || 4000;

const isProd = process.env.NODE_ENV === "production";

const getAllowedOrigins = () => {
  const originsStr = process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || "http://localhost:3000";
  return originsStr.split(",").map((o) => o.trim()).filter(Boolean);
};

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // In development, allow localhost matching
      if (!isProd && /^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }

      // Allow any Vercel preview environments
      if (origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }

      const allowedOrigins = getAllowedOrigins();
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));

// ── Global: never let CDN/browser cache API responses ──
app.use("/api", (_req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

app.use("/api/upload", uploadRouter);
app.use("/api/auth", authRouter);
app.use("/api/conversations", conversationsRouter);
app.use("/api/postcards", unlockRouter);
app.use("/api/postcards", postcardByIdRouter);
app.use("/api/postcards", postcardsRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

if (process.env.NODE_ENV !== "production" || process.env.RUN_LOCAL === "true") {
  app.listen(PORT, () => {
    console.log(`postr server running on http://localhost:${PORT}`);
  });
}

export default app;
