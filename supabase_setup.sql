-- 1. Create Extensions and Tables
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Drop existing tables to ensure clean state (Warning: This deletes existing data)
-- DROP TABLE IF EXISTS "Member";
-- DROP TABLE IF EXISTS "Family";
-- DROP TABLE IF EXISTS "User";

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "email" TEXT UNIQUE NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT DEFAULT 'family_rep',
    "phone" TEXT,
    "status" TEXT DEFAULT 'pending',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Family" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "familyId" TEXT UNIQUE NOT NULL,
    "headOfFamily" TEXT NOT NULL,
    "headGender" TEXT,
    "headDob" TIMESTAMP WITH TIME ZONE,
    "fatherName" TEXT,
    "fatherState" TEXT,
    "fatherDistrict" TEXT,
    "fatherSubDistrict" TEXT,
    "fatherVillage" TEXT,
    "fatherPincode" TEXT,
    "fatherPincodeVillages" TEXT,
    "motherName" TEXT,
    "caste" TEXT NOT NULL,
    "contactNumber" TEXT NOT NULL,
    "street" TEXT,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "subDistrict" TEXT,
    "village" TEXT NOT NULL,
    "pincode" TEXT,
    "pincodeVillages" TEXT,
    "familyPhoto" TEXT,
    "representativeId" TEXT REFERENCES "User"("id"),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Member" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    "fullName" TEXT NOT NULL,
    "relationshipToHead" TEXT NOT NULL,
    "fatherName" TEXT,
    "motherName" TEXT,
    "fatherState" TEXT,
    "fatherDistrict" TEXT,
    "fatherSubDistrict" TEXT,
    "fatherVillage" TEXT,
    "fatherPincode" TEXT,
    "fatherPincodeVillages" TEXT,
    "gender" TEXT NOT NULL,
    "dob" TIMESTAMP WITH TIME ZONE NOT NULL,
    "maritalStatus" TEXT DEFAULT 'Single',
    "spouseName" TEXT,
    "education" TEXT,
    "occupation" TEXT,
    "bloodGroup" TEXT,
    "memberPhoto" TEXT,
    "isAlive" BOOLEAN DEFAULT true,
    "familyId" TEXT REFERENCES "Family"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger for updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_user_updated_at
    BEFORE UPDATE ON "User"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_family_updated_at
    BEFORE UPDATE ON "Family"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_member_updated_at
    BEFORE UPDATE ON "Member"
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Location table for search
CREATE TABLE IF NOT EXISTS "Location" (
    "id" SERIAL PRIMARY KEY,
    "state" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "subDistrict" TEXT, -- Tehsil
    "village" TEXT NOT NULL
);

-- Create indexes for fast searching
CREATE INDEX IF NOT EXISTS idx_location_village ON "Location" USING GIN (village gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_location_district ON "Location" (district);

-- Disable RLS for easier migration (User should enable/config policies for production)
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Family" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Member" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Location" DISABLE ROW LEVEL SECURITY;

-- 2. Seed Initial Major Locations (Expandable)

INSERT INTO "Location" (state, district, subDistrict, village) VALUES
-- Madhya Pradesh
('Madhya Pradesh', 'Ratlam', 'Jaora', 'Bhatkhedi'),
('Madhya Pradesh', 'Ratlam', 'Jaora', 'Kalukheda'),
('Madhya Pradesh', 'Ratlam', 'Jaora', 'Pingrala'),
('Madhya Pradesh', 'Ratlam', 'Jaora', 'Upalai'),
('Madhya Pradesh', 'Ratlam', 'Jaora', 'Nawayar'),
('Madhya Pradesh', 'Ratlam', 'Jaora', 'Gudur'),
('Madhya Pradesh', 'Ratlam', 'Alot', 'Dudhwa'),
('Madhya Pradesh', 'Ratlam', 'Alot', 'Khejadiya'),
('Madhya Pradesh', 'Ratlam', 'Alot', 'Vikramgarh'),
('Madhya Pradesh', 'Ratlam', 'Alot', 'Guran'),
-- Rajasthan
('Rajasthan', 'Jaipur', 'Jaipur', 'Amer'),
('Rajasthan', 'Jaipur', 'Jaipur', 'Sanganer'),
('Rajasthan', 'Jaipur', 'Jaipur', 'Chomu'),
('Rajasthan', 'Jodhpur', 'Jodhpur', 'Luni'),
('Rajasthan', 'Jodhpur', 'Jodhpur', 'Shergarh'),
-- Uttar Pradesh
('Uttar Pradesh', 'Lucknow', 'Lucknow', 'Bakshi Ka Talab'),
('Uttar Pradesh', 'Lucknow', 'Lucknow', 'Malihabad'),
('Uttar Pradesh', 'Varanasi', 'Varanasi', 'Pindra'),
-- Bihar
('Bihar', 'Patna', 'Patna', 'Phulwari Sharif'),
('Bihar', 'Patna', 'Patna', 'Danapur');

-- Note: To add ALL 600,000 villages, we will use a dedicated script after the table is created.
