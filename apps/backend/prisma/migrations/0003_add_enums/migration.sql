DO $$
BEGIN
    CREATE TYPE "UsageType" AS ENUM ('ENCODE', 'DECODE');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "UsageEvent"
    ALTER COLUMN "type" TYPE "UsageType" USING "type"::"UsageType";

DO $$
BEGIN
    CREATE TYPE "PackageType" AS ENUM ('PACK_25', 'PACK_50', 'PACK_100');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Purchase"
    ALTER COLUMN "packageType" TYPE "PackageType" USING "packageType"::"PackageType";

DO $$
BEGIN
    CREATE TYPE "PurchaseStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELED', 'DISABLED');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Purchase"
    ALTER COLUMN "status" TYPE "PurchaseStatus" USING "status"::"PurchaseStatus";
