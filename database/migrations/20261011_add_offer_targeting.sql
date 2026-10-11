-- Run once against the existing D1 database to enable category/location-targeted offers.
ALTER TABLE offers ADD COLUMN category TEXT
  CHECK (category IN ('domestik', 'inter', 'cruise') OR category IS NULL);
ALTER TABLE offers ADD COLUMN province TEXT;
ALTER TABLE offers ADD COLUMN country TEXT;
ALTER TABLE offers ADD COLUMN city TEXT;

CREATE INDEX IF NOT EXISTS idx_offers_category ON offers(category);
