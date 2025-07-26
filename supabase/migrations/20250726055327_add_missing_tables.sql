-- Create container_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.container_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    container_id TEXT NOT NULL,
    status TEXT,
    location TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    eta TIMESTAMPTZ,
    delay_hours INTEGER,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_preferences table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY,
    email_alerts BOOLEAN NOT NULL DEFAULT true,
    sms_alerts BOOLEAN NOT NULL DEFAULT false,
    slack_webhook_url TEXT,
    delay_threshold_hours INTEGER NOT NULL DEFAULT 6,
    high_risk_threshold INTEGER NOT NULL DEFAULT 24,
    timezone TEXT NOT NULL DEFAULT 'UTC',
    date_format TEXT NOT NULL DEFAULT 'YYYY-MM-DD',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for container_history
CREATE INDEX IF NOT EXISTS idx_container_history_container_id ON container_history(container_id);
CREATE INDEX IF NOT EXISTS idx_container_history_recorded_at ON container_history(recorded_at);

-- Create indexes for user_preferences
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Enable RLS for container_history
ALTER TABLE container_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for container_history
CREATE POLICY "Users can view container history for their containers" ON container_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM containers 
            WHERE containers.container_id = container_history.container_id 
            AND containers.user_id = auth.uid()
        )
    );

CREATE POLICY "System can insert container history" ON container_history
    FOR INSERT WITH CHECK (true);

-- Enable RLS for user_preferences
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_preferences
CREATE POLICY "Users can view their own preferences" ON user_preferences
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON user_preferences
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON user_preferences
    FOR UPDATE USING (auth.uid() = user_id);

-- Create trigger to update updated_at timestamp for user_preferences
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();