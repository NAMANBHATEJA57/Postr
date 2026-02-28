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

const app = express();
const PORT = process.env.PORT || 4000;

const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "10kb" }));

app.use("/api/upload", uploadRouter);
app.use("/api/postcards", unlockRouter);
app.use("/api/postcards", postcardByIdRouter);
app.use("/api/postcards", postcardsRouter);

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`postr server running on http://localhost:${PORT}`);
});
