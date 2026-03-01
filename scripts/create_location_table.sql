-- 1. Enable pg_trgm extension for full-text search on villages
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. States Table
CREATE TABLE IF NOT EXISTS states (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE
);
CREATE INDEX idx_states_name ON states (name);

-- 3. Districts Table
CREATE TABLE IF NOT EXISTS districts (
    id SERIAL PRIMARY KEY,
    state_id INT REFERENCES states(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    UNIQUE(state_id, name)
);
CREATE INDEX idx_districts_state_id ON districts(state_id);
CREATE INDEX idx_districts_name ON districts (name);

-- 4. Tehsils (Sub-Districts) Table
CREATE TABLE IF NOT EXISTS tehsils (
    id SERIAL PRIMARY KEY,
    district_id INT REFERENCES districts(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    UNIQUE(district_id, name)
);
CREATE INDEX idx_tehsils_district_id ON tehsils(district_id);
CREATE INDEX idx_tehsils_name ON tehsils (name);

-- 5. Villages Table
CREATE TABLE IF NOT EXISTS villages (
    id SERIAL PRIMARY KEY,
    tehsil_id INT REFERENCES tehsils(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    UNIQUE(tehsil_id, name)
);
CREATE INDEX idx_villages_tehsil_id ON villages(tehsil_id);
-- Fast full-text search index for search-as-you-type frontends
CREATE INDEX idx_villages_name_trgm ON villages USING GIN (name gin_trgm_ops);

-- 6. Pincodes Table (Mapping pincodes to administrative units)
-- A pincode might cover multiple villages or cover a tehsil/district
CREATE TABLE IF NOT EXISTS pincodes (
    id SERIAL PRIMARY KEY,
    pincode VARCHAR(6) NOT NULL,
    village_id INT REFERENCES villages(id) ON DELETE CASCADE,
    tehsil_id INT REFERENCES tehsils(id) ON DELETE CASCADE,
    district_id INT REFERENCES districts(id) ON DELETE CASCADE,
    state_id INT REFERENCES states(id) ON DELETE CASCADE
);
CREATE INDEX idx_pincodes_pincode ON pincodes(pincode);
CREATE INDEX idx_pincodes_village_id ON pincodes(village_id);

-- Enable RLS (Row Level Security) for public access
ALTER TABLE states ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tehsils ENABLE ROW LEVEL SECURITY;
ALTER TABLE villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE pincodes ENABLE ROW LEVEL SECURITY;

-- Allow read-only access to everyone for locations (Supabase standard policy)
CREATE POLICY "Allow public read access on states" ON states FOR SELECT USING (true);
CREATE POLICY "Allow public read access on districts" ON districts FOR SELECT USING (true);
CREATE POLICY "Allow public read access on tehsils" ON tehsils FOR SELECT USING (true);
CREATE POLICY "Allow public read access on villages" ON villages FOR SELECT USING (true);
CREATE POLICY "Allow public read access on pincodes" ON pincodes FOR SELECT USING (true);

-- 7. Materialized Views for Accelerated Lookups
-- 7a. District Counts (Accelerates dashboard analytics)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_district_counts AS
SELECT 
    d.id as district_id,
    d.name as district_name,
    s.name as state_name,
    COUNT(t.id) as total_tehsils,
    COUNT(v.id) as total_villages
FROM districts d
JOIN states s ON d.state_id = s.id
LEFT JOIN tehsils t ON t.district_id = d.id
LEFT JOIN villages v ON v.tehsil_id = t.id
GROUP BY d.id, d.name, s.name;

CREATE UNIQUE INDEX idx_mv_district_counts_id ON mv_district_counts(district_id);

-- 7b. Pincode to Full Location Details (Accelerates extreme fast 6-digit Pincode Auto-fill)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_pincode_lookup AS
SELECT 
    p.pincode,
    v.name as village_name,
    t.name as tehsil_name,
    d.name as district_name,
    s.name as state_name
FROM pincodes p
LEFT JOIN villages v ON p.village_id = v.id
LEFT JOIN tehsils t ON p.tehsil_id = t.id
LEFT JOIN districts d ON p.district_id = d.id
LEFT JOIN states s ON p.state_id = s.id;

CREATE INDEX idx_mv_pincode_lookup_pincode ON mv_pincode_lookup(pincode);

-- 8. Functions to Refresh Materialized Views Programmatically
CREATE OR REPLACE FUNCTION refresh_location_mvs()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_district_counts;
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_pincode_lookup;
END;
$$ LANGUAGE plpgsql;
