-- CreateTable
CREATE TABLE "postcards" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "media_url" TEXT NOT NULL,
    "media_type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "to_name" TEXT NOT NULL,
    "from_name" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'minimal-light',
    "expiry_at" DATETIME,
    "password_hash" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
