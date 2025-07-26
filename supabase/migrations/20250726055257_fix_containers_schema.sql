-- Fix containers table schema to match TypeScript types
ALTER TABLE containers 
  -- Rename existing columns to match expected names
  RENAME COLUMN last_location TO current_location;

ALTER TABLE containers 
  RENAME COLUMN destination TO destination_port;

-- Add missing columns
ALTER TABLE containers 
  ADD COLUMN IF NOT EXISTS origin_port TEXT,
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS vessel_name TEXT,
  ADD COLUMN IF NOT EXISTS voyage_number TEXT,
  ADD COLUMN IF NOT EXISTS original_eta TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ai_summary TEXT,
  ADD COLUMN IF NOT EXISTS risk_level TEXT DEFAULT 'Low',
  ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Update delay_hours to have a default value and make it NOT NULL
ALTER TABLE containers 
  ALTER COLUMN delay_hours SET DEFAULT 0,
  ALTER COLUMN delay_hours SET NOT NULL;

-- Update the delay_hours column for existing NULL values
UPDATE containers SET delay_hours = 0 WHERE delay_hours IS NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_containers_current_location ON containers(current_location);
CREATE INDEX IF NOT EXISTS idx_containers_origin_port ON containers(origin_port);
CREATE INDEX IF NOT EXISTS idx_containers_destination_port ON containers(destination_port);
CREATE INDEX IF NOT EXISTS idx_containers_risk_level ON containers(risk_level);
CREATE INDEX IF NOT EXISTS idx_containers_last_updated ON containers(last_updated);

-- Fix alerts table schema to match TypeScript types
ALTER TABLE alerts
  -- Rename and add missing columns
  ADD COLUMN IF NOT EXISTS alert_type TEXT,
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS sms_sent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS slack_sent BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS acknowledged_at TIMESTAMPTZ;

-- Update existing data: use 'type' column for 'alert_type' if needed
UPDATE alerts SET alert_type = type WHERE alert_type IS NULL;
UPDATE alerts SET title = LEFT(message, 100) WHERE title IS NULL;

-- Drop the old 'acknowledged' column and use 'acknowledged_at' instead
-- First, update acknowledged_at based on acknowledged boolean
UPDATE alerts 
SET acknowledged_at = created_at 
WHERE acknowledged = true AND acknowledged_at IS NULL;

-- Now we can drop the old column
ALTER TABLE alerts DROP COLUMN IF EXISTS acknowledged;

-- Rename 'type' to match what we expect
ALTER TABLE alerts DROP COLUMN IF EXISTS type;