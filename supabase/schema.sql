-- SCHEMA INITIALIZATION FOR LNI MESSINA WEB APP
-- Versione 1.0 - Initial Schema

-- 1. ENUMS
CREATE TYPE user_type AS ENUM ('pre_member', 'active_member');
CREATE TYPE member_status AS ENUM ('active', 'expired', 'revoked');
CREATE TYPE admin_role AS ENUM ('checkin_operator', 'admin_monitor', 'admin_full');

-- 2. TABLES

-- HOUSEHOLDS (Nuclei Familiari)
CREATE TABLE IF NOT EXISTS households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT,
    phone TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- USERS (Soci e Pre-aderenti)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    user_type user_type NOT NULL DEFAULT 'pre_member',
    status member_status NOT NULL DEFAULT 'active',
    gdpr_consent BOOLEAN DEFAULT FALSE,
    marketing_consent BOOLEAN DEFAULT FALSE,
    registration_date TIMESTAMPTZ DEFAULT NOW(),
    expiration_date TIMESTAMPTZ,
    household_id UUID REFERENCES households(id) ON DELETE SET NULL,
    created_by UUID, -- Can be linked to auth.users if created by admin
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR_TOKENS
CREATE TABLE IF NOT EXISTS qr_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    revoked_at TIMESTAMPTZ,
    CONSTRAINT one_active_token_per_user UNIQUE (user_id, is_active) -- Logic: only one active token
);

-- ADMIN_USERS (Mappatura ruoli utenti Supabase Auth)
CREATE TABLE IF NOT EXISTS admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role admin_role NOT NULL DEFAULT 'checkin_operator',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CHECKIN_LOGS
CREATE TABLE IF NOT EXISTS checkin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    operator_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    checkin_result TEXT, -- e.g., 'SUCCESS', 'EXPIRED', 'REVOKED', 'NOT_FOUND'
    device_info TEXT,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUDIT_LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL, -- e.g., 'USER_CREATE', 'QR_REVOKE', 'EXPORT_CSV'
    target_type TEXT, -- e.g., 'users', 'qr_tokens'
    target_id TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. FUNCTIONS & TRIGGERS

-- Automatically update updated_at
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION handle_updated_at();

-- 4. INDEXES
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_token ON qr_tokens(token);
CREATE INDEX IF NOT EXISTS idx_checkin_logs_user_id ON checkin_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_checkin_logs_created_at ON checkin_logs(created_at);

-- 5. RLS (ROW LEVEL SECURITY)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkin_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;

-- Policy examples (simplified, to be refined based on auth roles)
-- Admin Full can do everything
-- Checkin Operator can read basic user info and write checkin logs

-- Example policy for admin_users (only admins can see this table)
CREATE POLICY "Admins can view admin roles" ON admin_users
    FOR SELECT USING (auth.uid() IN (SELECT id FROM admin_users WHERE role = 'admin_full'));
