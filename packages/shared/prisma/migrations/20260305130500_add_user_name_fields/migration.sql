-- Add optional identity fields for staff/admin users
ALTER TABLE "users"
ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT;
