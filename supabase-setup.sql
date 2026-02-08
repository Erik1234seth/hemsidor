-- Skapa bookings-tabellen i Supabase
-- Kör detta i Supabase SQL Editor (https://supabase.com/dashboard/project/xklttbborrdoettifjak/sql)

CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    business_type TEXT NOT NULL,
    has_website TEXT NOT NULL,
    goals TEXT[] DEFAULT '{}',
    booking_date DATE NOT NULL,
    booking_time TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'pending'
);

-- Aktivera Row Level Security
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Tillåt anonyma inserts (för bokningsformuläret)
CREATE POLICY "Allow anonymous inserts" ON bookings
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Tillåt authenticated users att läsa alla bokningar
CREATE POLICY "Allow authenticated read" ON bookings
    FOR SELECT
    TO authenticated
    USING (true);

-- Index för snabbare sökningar
CREATE INDEX idx_bookings_date ON bookings(booking_date);
CREATE INDEX idx_bookings_email ON bookings(email);
