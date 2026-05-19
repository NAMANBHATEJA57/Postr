DROP TABLE IF EXISTS "conversations";

CREATE TABLE IF NOT EXISTS "private_spaces" (
    "id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "private_spaces_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "postcards"
    DROP COLUMN IF EXISTS "conversation_id",
    ADD COLUMN IF NOT EXISTS "visibility" TEXT NOT NULL DEFAULT 'public',
    ADD COLUMN IF NOT EXISTS "space_id" TEXT;

ALTER TABLE "postcards"
    ADD CONSTRAINT "postcards_space_id_fkey"
    FOREIGN KEY ("space_id") REFERENCES "private_spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS "postcards_visibility_created_at_idx" ON "postcards"("visibility", "created_at");
CREATE INDEX IF NOT EXISTS "postcards_space_id_created_at_idx" ON "postcards"("space_id", "created_at");
