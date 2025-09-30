CREATE TABLE "ApiKey" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "userId" UUID NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "keyHash" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "name" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
    "lastUsedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX "ApiKey_userId_idx" ON "ApiKey" ("userId");
CREATE INDEX "ApiKey_keyPrefix_idx" ON "ApiKey" ("keyPrefix");
