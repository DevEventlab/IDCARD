CREATE TYPE "SchoolVerificationStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REJECTED');
CREATE TYPE "CardFont" AS ENUM ('TEMPLATE', 'SANS', 'SERIF');

ALTER TABLE "User"
ADD COLUMN "isPlatformAdmin" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "Session" (
    "tokenHash" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_pkey" PRIMARY KEY ("tokenHash")
);

ALTER TABLE "School"
ADD COLUMN "cardHeader" TEXT,
ADD COLUMN "cardBackText" TEXT,
ADD COLUMN "signatoryName" TEXT,
ADD COLUMN "signatoryTitle" TEXT,
ADD COLUMN "cardFont" "CardFont" NOT NULL DEFAULT 'TEMPLATE',
ADD COLUMN "cardHeaderSize" INTEGER NOT NULL DEFAULT 16,
ADD COLUMN "verificationStatus" "SchoolVerificationStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
ADD COLUMN "verificationNote" TEXT;

CREATE TABLE "SchoolDocument" (
    "id" TEXT NOT NULL,
    "schoolId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SchoolDocument_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SchoolDocument_storageKey_key" ON "SchoolDocument"("storageKey");
CREATE INDEX "SchoolDocument_schoolId_createdAt_idx" ON "SchoolDocument"("schoolId", "createdAt");
CREATE INDEX "Session_userId_idx" ON "Session"("userId");
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SchoolDocument" ADD CONSTRAINT "SchoolDocument_schoolId_fkey"
FOREIGN KEY ("schoolId") REFERENCES "School"("id") ON DELETE CASCADE ON UPDATE CASCADE;
