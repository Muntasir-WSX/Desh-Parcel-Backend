-- Add security and approval fields used by the application.
ALTER TYPE "ParcelStatus" ADD VALUE IF NOT EXISTS 'APPROVED';
ALTER TYPE "ParcelStatus" ADD VALUE IF NOT EXISTS 'AT_HUB';
ALTER TYPE "ParcelStatus" ADD VALUE IF NOT EXISTS 'TRANSFER_TO_HUB';

ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "isBanned" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "RiderProfile"
ADD COLUMN IF NOT EXISTS "nidNumber" TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS "totalBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "withdrawn" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "isApproved" BOOLEAN NOT NULL DEFAULT false;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WithdrawalStatus') THEN
    CREATE TYPE "WithdrawalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "WithdrawalRequest" (
    "id" TEXT NOT NULL,
    "riderId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "bkashNo" TEXT NOT NULL,
    "status" "WithdrawalStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WithdrawalRequest_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "WithdrawalRequest_riderId_idx"
ON "WithdrawalRequest"("riderId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'WithdrawalRequest_riderId_fkey'
  ) THEN
    ALTER TABLE "WithdrawalRequest"
    ADD CONSTRAINT "WithdrawalRequest_riderId_fkey"
    FOREIGN KEY ("riderId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
