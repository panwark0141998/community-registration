-- 0. Disable RLS for migration
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Family" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Member" DISABLE ROW LEVEL SECURITY;

-- 1. Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Update User Table
-- Add missing columns
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "name" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'pending';
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
-- Set default ID generation
ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
-- Update default role to match API
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'family_rep';

-- 3. Update Family Table
-- Set default ID generation
ALTER TABLE "Family" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
-- Add missing columns from previous patches (Safety)
ALTER TABLE "Family" ADD COLUMN IF NOT EXISTS "fatherPincode" TEXT;
ALTER TABLE "Family" ADD COLUMN IF NOT EXISTS "fatherPincodeVillages" TEXT;
ALTER TABLE "Family" ADD COLUMN IF NOT EXISTS "pincodeVillages" TEXT;
ALTER TABLE "Family" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 4. Update Member Table
-- Set default ID generation
ALTER TABLE "Member" ALTER COLUMN "id" SET DEFAULT gen_random_uuid()::text;
-- Add missing columns from previous patches (Safety)
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "fatherState" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "fatherDistrict" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "fatherSubDistrict" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "fatherVillage" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "fatherPincode" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "fatherPincodeVillages" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "maritalStatus" TEXT DEFAULT 'Single';
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "education" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "occupation" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "bloodGroup" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "memberPhoto" TEXT;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "isAlive" BOOLEAN DEFAULT true;
ALTER TABLE "Member" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- 5. Finalize Triggers (Ensure they exist and work)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

DO $$ BEGIN
    CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    CREATE TRIGGER update_family_updated_at BEFORE UPDATE ON "Family" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    CREATE TRIGGER update_member_updated_at BEFORE UPDATE ON "Member" FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION WHEN others THEN NULL; END $$;

-- 6. Essential Performance Indexes
CREATE INDEX IF NOT EXISTS "idx_member_familyId" ON "Member"("familyId");
