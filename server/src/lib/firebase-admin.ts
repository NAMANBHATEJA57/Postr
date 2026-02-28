import { createRequire } from "node:module";
import { initializeApp, getApps, cert, type ServiceAccount } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";

const require = createRequire(import.meta.url);

function getCredentials(): ServiceAccount {
  const json = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (json) {
    return JSON.parse(json) as ServiceAccount;
  }
  const path = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (path) {
    return require(path) as ServiceAccount;
  }
  throw new Error("Set FIREBASE_SERVICE_ACCOUNT_PATH or GOOGLE_APPLICATION_CREDENTIALS_JSON");
}

export function getFirebaseApp() {
  if (getApps().length > 0) {
    return getApps()[0] as ReturnType<typeof initializeApp>;
  }
  return initializeApp({
    credential: cert(getCredentials()),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

export function getStorageBucket() {
  const app = getFirebaseApp();
  const bucket = process.env.FIREBASE_STORAGE_BUCKET;
  if (!bucket) throw new Error("FIREBASE_STORAGE_BUCKET is not set");
  return getStorage(app).bucket(bucket);
}
