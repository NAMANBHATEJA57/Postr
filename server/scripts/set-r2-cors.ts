/**
 * Sets CORS policy on the R2 bucket for browser uploads.
 * Run: npx tsx scripts/set-r2-cors.ts
 */
import { config } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { S3Client, PutBucketCorsCommand } from "@aws-sdk/client-s3";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "../.env") });

const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const bucket = process.env.R2_BUCKET_NAME;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:3000";

if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
  console.error("Missing R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, or R2_BUCKET_NAME");
  process.exit(1);
}

const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

async function main() {
  const origins = [clientOrigin];
  if (clientOrigin === "http://localhost:3000") {
    origins.push("http://127.0.0.1:3000");
  }

  await client.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ["Content-Type"],
            AllowedMethods: ["GET", "PUT", "HEAD"],
            AllowedOrigins: origins,
            ExposeHeaders: ["ETag"],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    })
  );
  console.log("CORS policy applied successfully.");
  console.log("Allowed origins:", origins);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
