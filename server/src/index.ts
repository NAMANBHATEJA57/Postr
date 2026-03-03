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

const app = express();
const PORT = process.env.PORT || 4000;

const isProd = process.env.NODE_ENV === "production";
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: isProd
      ? clientOrigin
      : (origin, callback) => {
        // In development, allow any localhost origin (port 3000, 3001, etc.)
        if (!origin || /^http:\/\/localhost:\d+$/.test(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));

app.use("/api/upload", uploadRouter);
app.use("/api/auth", authRouter);
app.use("/api/conversations", conversationsRouter);
app.use("/api/postcards", unlockRouter);
app.use("/api/postcards", postcardByIdRouter);
app.use("/api/postcards", postcardsRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`postr server running on http://localhost:${PORT}`);
});
