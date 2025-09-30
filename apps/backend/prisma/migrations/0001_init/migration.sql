CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE "User" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "email" TEXT NOT NULL UNIQUE,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "googleId" TEXT UNIQUE,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "freeEditsUsedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "Purchase" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "packageType" TEXT NOT NULL,
    "creditsPurchased" INTEGER NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "stripeSessionId" TEXT UNIQUE,
    "status" TEXT NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "UsageEvent" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "creditsUsed" INTEGER NOT NULL,
    "isFreeCredit" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "VerificationToken" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "token" TEXT NOT NULL UNIQUE,
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "PasswordResetToken" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "token" TEXT NOT NULL UNIQUE,
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "expiresAt" TIMESTAMP NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE "AuditLog" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "actorId" UUID REFERENCES "User"("id"),
    "action" TEXT NOT NULL,
    "metadata" JSONB NOT NULL,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "User_email_idx" ON "User" ("email");
CREATE INDEX "UsageEvent_userId_type_idx" ON "UsageEvent" ("userId", "type");
CREATE INDEX "Purchase_userId_idx" ON "Purchase" ("userId");
