DO $$
BEGIN
    CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "role" "UserRole" NOT NULL DEFAULT 'USER';

UPDATE "User" SET "role" = 'ADMIN' WHERE email = 'joeleboube@gmail.com';

DO $$
BEGIN
    CREATE TYPE "UsageMode" AS ENUM ('ALGORITHM', 'AI');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "UsageEvent"
ADD COLUMN IF NOT EXISTS "mode" "UsageMode" NOT NULL DEFAULT 'ALGORITHM';

UPDATE "UsageEvent" SET "mode" = 'ALGORITHM' WHERE "mode" IS NULL;
