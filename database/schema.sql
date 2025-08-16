-- TapWave Telegram Mini App Database Schema
-- This script creates all necessary tables for the application

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tg_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255),
    referrer_id BIGINT REFERENCES users(tg_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ledger table for tracking all balance changes
CREATE TABLE IF NOT EXISTS ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('earn', 'spend', 'adjust')),
    amount INTEGER NOT NULL CHECK (amount > 0),
    source VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type VARCHAR(50) NOT NULL CHECK (type IN ('social', 'ad_view', 'referral', 'daily_bonus')),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    reward INTEGER NOT NULL CHECK (reward > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'expired')),
    daily_limit INTEGER NOT NULL DEFAULT 1,
    geo_rules JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Withdrawals table
CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL CHECK (amount > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
    method VARCHAR(50) NOT NULL CHECK (method IN ('telegram_stars', 'ton_wallet', 'usdt_trc20', 'telegram', 'crypto', 'manual')),
    address VARCHAR(500) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- Ad events table for tracking ad interactions
CREATE TABLE IF NOT EXISTS ad_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    ad_partner VARCHAR(50) NOT NULL CHECK (ad_partner IN ('adsgram', 'other')),
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('view', 'click', 'completion')),
    trace_id VARCHAR(255) NOT NULL UNIQUE,
    ip_hash VARCHAR(64) NOT NULL,
    reward_amount INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_tg_id ON users(tg_id);
CREATE INDEX IF NOT EXISTS idx_users_referrer_id ON users(referrer_id);
CREATE INDEX IF NOT EXISTS idx_ledger_user_id ON ledger(user_id);
CREATE INDEX IF NOT EXISTS idx_ledger_created_at ON ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_ledger_type ON ledger(type);
CREATE INDEX IF NOT EXISTS idx_ledger_source ON ledger(source);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_created_at ON withdrawals(created_at);
CREATE INDEX IF NOT EXISTS idx_ad_events_user_id ON ad_events(user_id);
CREATE INDEX IF NOT EXISTS idx_ad_events_trace_id ON ad_events(trace_id);
CREATE INDEX IF NOT EXISTS idx_ad_events_created_at ON ad_events(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(type);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_events ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (adjust based on your authentication strategy)
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (true); -- Allow all reads for now

CREATE POLICY "Users can insert their own data" ON users
    FOR INSERT WITH CHECK (true); -- Allow all inserts for now

CREATE POLICY "Users can update their own data" ON users
    FOR UPDATE USING (true); -- Allow all updates for now

CREATE POLICY "Ledger entries are viewable by all" ON ledger
    FOR SELECT USING (true);

CREATE POLICY "Ledger entries can be inserted by all" ON ledger
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Withdrawals are viewable by all" ON withdrawals
    FOR SELECT USING (true);

CREATE POLICY "Withdrawals can be inserted by all" ON withdrawals
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Ad events are viewable by all" ON ad_events
    FOR SELECT USING (true);

CREATE POLICY "Ad events can be inserted by all" ON ad_events
    FOR INSERT WITH CHECK (true);

-- Insert some sample tasks
INSERT INTO tasks (type, title, description, reward, daily_limit) VALUES
    ('daily_bonus', 'Daily Check-in', 'Check in daily to earn bonus coins', 50, 1),
    ('social', 'Follow on Telegram', 'Follow our official Telegram channel', 100, 1),
    ('referral', 'Share with Friends', 'Share TapWave with 3 friends', 200, 3),
    ('ad_view', 'Watch 5 Ads', 'Watch 5 advertisements today', 25, 5)
ON CONFLICT DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get user balance
CREATE OR REPLACE FUNCTION get_user_balance(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    balance INTEGER;
BEGIN
    SELECT COALESCE(
        SUM(CASE WHEN type = 'earn' THEN amount ELSE -amount END), 
        0
    ) INTO balance
    FROM ledger 
    WHERE user_id = user_uuid;
    
    RETURN balance;
END;
$$ LANGUAGE plpgsql;

-- Function to get daily reward count
CREATE OR REPLACE FUNCTION get_daily_reward_count(user_uuid UUID, reward_type VARCHAR, check_date DATE)
RETURNS INTEGER AS $$
DECLARE
    count INTEGER;
BEGIN
    SELECT COUNT(*) INTO count
    FROM ledger 
    WHERE user_id = user_uuid 
    AND source LIKE '%' || reward_type || '%'
    AND DATE(created_at) = check_date;
    
    RETURN count;
END;
$$ LANGUAGE plpgsql;

-- Comments for documentation
COMMENT ON TABLE users IS 'Stores user information from Telegram';
COMMENT ON TABLE ledger IS 'Tracks all balance changes (earnings, spending, adjustments)';
COMMENT ON TABLE tasks IS 'Available tasks users can complete for rewards';
COMMENT ON TABLE withdrawals IS 'User withdrawal requests and their status';
COMMENT ON TABLE ad_events IS 'Logs all ad interactions for fraud prevention';

COMMENT ON COLUMN users.tg_id IS 'Telegram user ID (unique identifier)';
COMMENT ON COLUMN users.referrer_id IS 'Telegram ID of the user who referred this user';
COMMENT ON COLUMN ledger.type IS 'Type of transaction: earn, spend, or adjust';
COMMENT ON COLUMN ledger.amount IS 'Amount in coins (always positive, type determines direction)';
COMMENT ON COLUMN ledger.source IS 'Source of the transaction (ad_view, referral, etc.)';
COMMENT ON COLUMN withdrawals.method IS 'Withdrawal method (telegram_stars, ton_wallet, etc.)';
COMMENT ON COLUMN ad_events.trace_id IS 'Unique identifier from ad network to prevent duplicates';
COMMENT ON COLUMN ad_events.ip_hash IS 'Hashed IP address for fraud detection';
